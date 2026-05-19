#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const baseUrl = process.argv[2] || 'http://127.0.0.1:4173';
const samples = Number(process.argv[3] || 5);
const targets = [
  { name: 'index', url: `${baseUrl}/index.html` },
  { name: 'blog', url: `${baseUrl}/blog.html` },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.json();
}

async function launchChrome() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-bench-'));
  const proc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--metrics-recording-only',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  for (let i = 0; i < 100; i++) {
    try {
      await fetchJson('http://127.0.0.1:9222/json/version');
      return { proc, userDataDir };
    } catch {
      await sleep(100);
    }
  }

  proc.kill('SIGKILL');
  throw new Error('Chrome debugging port did not start');
}

async function closeChrome(proc, userDataDir) {
  proc.kill('SIGTERM');
  await sleep(200);
  if (!proc.killed) proc.kill('SIGKILL');
  fs.rmSync(userDataDir, { recursive: true, force: true });
}

async function connectBrowser() {
  const { webSocketDebuggerUrl } = await fetchJson('http://127.0.0.1:9222/json/version');
  const ws = new WebSocket(webSocketDebuggerUrl);
  ws.nextId = 0;
  ws.pending = new Map();
  ws.listeners = new Map();

  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id) {
      const pending = ws.pending.get(msg.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      ws.pending.delete(msg.id);
      if (msg.error) pending.reject(new Error(msg.error.message));
      else pending.resolve(msg.result);
      return;
    }
    if (!msg.method) return;
    const callbacks = ws.listeners.get(msg.method) || [];
    for (const cb of callbacks) cb(msg);
  });

  const send = (method, params = {}, sessionId) => {
    const id = ++ws.nextId;
    const payload = sessionId ? { id, method, params, sessionId } : { id, method, params };
    ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        ws.pending.delete(id);
        reject(new Error(`Timeout waiting for ${method}`));
      }, 15000);
      ws.pending.set(id, { resolve, reject, timer });
    });
  };

  const on = (method, callback) => {
    const arr = ws.listeners.get(method) || [];
    arr.push(callback);
    ws.listeners.set(method, arr);
  };

  const close = () => ws.close();
  return { send, on, close };
}

async function openPage(browser, targetUrl) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params = {}) => browser.send(method, params, sessionId);
  const on = (method, callback) => browser.on(method, (msg) => {
    if (msg.sessionId === sessionId) callback(msg.params || {});
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });

  const loaded = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('loadEventFired timeout')), 30000);
    on('Page.loadEventFired', () => {
      clearTimeout(timer);
      resolve();
    });
  });

  await send('Page.navigate', { url: targetUrl });
  await loaded;
  await sleep(250);

  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      return {
        domContentLoaded: nav?.domContentLoadedEventEnd ?? 0,
        load: nav?.loadEventEnd ?? 0,
        transferSizeKb: (nav?.transferSize ?? 0) / 1024,
        encodedBodySizeKb: (nav?.encodedBodySize ?? 0) / 1024,
        resourceCount: resources.length,
        domNodes: document.getElementsByTagName('*').length,
      };
    })()`,
    returnByValue: true,
  });

  await browser.send('Target.closeTarget', { targetId });
  return evalRes.result.value;
}

const chrome = await launchChrome();
try {
  const browser = await connectBrowser();
  const summary = {};

  for (const target of targets) {
    const runs = [];
    for (let i = 0; i < samples; i++) runs.push(await openPage(browser, target.url));
    summary[target.name] = {
      load_ms: median(runs.map((r) => r.load)),
      dcl_ms: median(runs.map((r) => r.domContentLoaded)),
      transfer_kb: median(runs.map((r) => r.transferSizeKb)),
      body_kb: median(runs.map((r) => r.encodedBodySizeKb)),
      resource_count: median(runs.map((r) => r.resourceCount)),
      dom_nodes: median(runs.map((r) => r.domNodes)),
    };
  }

  browser.close();
  console.log(JSON.stringify({ samples, summary }, null, 2));
  console.log(`METRIC index_load_ms=${summary.index.load_ms.toFixed(2)}`);
  console.log(`METRIC index_dcl_ms=${summary.index.dcl_ms.toFixed(2)}`);
  console.log(`METRIC blog_load_ms=${summary.blog.load_ms.toFixed(2)}`);
  console.log(`METRIC blog_dcl_ms=${summary.blog.dcl_ms.toFixed(2)}`);
  console.log(`METRIC index_transfer_kb=${summary.index.transfer_kb.toFixed(2)}`);
  console.log(`METRIC blog_transfer_kb=${summary.blog.transfer_kb.toFixed(2)}`);
  console.log(`METRIC index_resources=${summary.index.resource_count.toFixed(0)}`);
  console.log(`METRIC blog_resources=${summary.blog.resource_count.toFixed(0)}`);
  console.log(`METRIC index_dom_nodes=${summary.index.dom_nodes.toFixed(0)}`);
  console.log(`METRIC blog_dom_nodes=${summary.blog.dom_nodes.toFixed(0)}`);
} finally {
  await closeChrome(chrome.proc, chrome.userDataDir);
}
