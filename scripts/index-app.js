    // Chrome Browser Simulator
    class ChromeBrowserSimulator {
      constructor() {
        this.history = ['bunchhieng.github.io'];
        this.currentIndex = 0;
        this.isFullscreen = false;
        this.browsingHistory = this.loadBrowsingHistory();
        this.findMatches = [];
        this.currentFindIndex = -1;
        this.contextMenuTab = null;
        this.downloads = null;
        this.bookmarks = this.loadBookmarks();
        this.extensions = this.loadExtensions();
        this.availableExtensions = null;
        this.devToolsDock = 'right'; // 'left', 'right', or 'bottom'
        this.init();
      }

      init() {
        this.attachEventListeners();
        this.updateNavigationButtons();
        this.initializeAnimations();
        // Update extension toolbar
        this.updateExtensionToolbar();
        // Start welcome animation
        this.startWelcomeAnimation();
      }

      attachEventListeners() {
        // Navigation buttons - Desktop
        const backBtn = document.getElementById('back-btn');
        const forwardBtn = document.getElementById('forward-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        const homeBtn = document.getElementById('home-btn');

        backBtn?.addEventListener('click', () => this.navigateBack());
        forwardBtn?.addEventListener('click', () => this.navigateForward());
        refreshBtn?.addEventListener('click', () => this.refresh());
        homeBtn?.addEventListener('click', () => this.goHome());

        // Navigation buttons - Mobile
        const mobileBackBtn = document.getElementById('mobile-back-btn');
        const mobileForwardBtn = document.getElementById('mobile-forward-btn');
        const mobileHomeBtn = document.getElementById('mobile-home-btn');
        const mobileRefreshBtn = document.getElementById('mobile-refresh-btn');

        mobileBackBtn?.addEventListener('click', () => this.navigateBack());
        mobileForwardBtn?.addEventListener('click', () => this.navigateForward());
        mobileHomeBtn?.addEventListener('click', () => this.goHome());
        mobileRefreshBtn?.addEventListener('click', () => this.refresh());

        // Window controls
        const closeBtn = document.querySelector('.chrome-control-btn.close');
        const minimizeBtn = document.querySelector('.chrome-control-btn.minimize');
        const maximizeBtn = document.querySelector('.chrome-control-btn.maximize');

        closeBtn?.addEventListener('click', () => this.closeWindow());
        minimizeBtn?.addEventListener('click', () => this.minimizeWindow());
        maximizeBtn?.addEventListener('click', () => this.toggleMaximize());

        // Menu button
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const menuDropdown = document.getElementById('chrome-menu-dropdown');

        menuBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMenu();
        });

        mobileMenuBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
          if (!menuDropdown?.contains(e.target) &&
              !menuBtn?.contains(e.target) &&
              !mobileMenuBtn?.contains(e.target)) {
            this.closeMenu();
          }
        });

        // Tab switching
        const tabs = document.querySelectorAll('.chrome-tab');
        tabs.forEach(tab => {
          tab.addEventListener('click', (e) => {
            // Don't switch if clicking the close button
            if (e.target.closest('.chrome-tab-close')) return;
            const tabType = tab.dataset.tab;
            if (tabType) {
              this.switchTab(tabType);
            }
          });
        });

        // Tab close button
        const tabCloseBtns = document.querySelectorAll('.chrome-tab-close');
        tabCloseBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tab = e.target.closest('.chrome-tab');
            if (tab) {
              const tabType = tab.dataset.tab;
              if (tabType === 'portfolio' || tabType === 'blog') {
                // Don't allow closing the main tabs
                this.showNotification('Cannot close this tab');
              } else {
                this.closeTab(tabType);
              }
            }
          });
        });

        // New tab button
        const newTabBtn = document.querySelector('.chrome-new-tab-btn');
        newTabBtn?.addEventListener('click', () => this.newTab());

        // Bookmark bar
        const bookmarks = document.querySelectorAll('.chrome-bookmark');
        bookmarks.forEach(bookmark => {
          bookmark.addEventListener('click', (e) => {
            const url = bookmark.dataset.url;
            const tabType = bookmark.dataset.tab;

            if (tabType) {
              // Switch to the specified tab
              this.switchTab(tabType);
            } else if (url) {
              // Open external URL
              if (url.startsWith('mailto:')) {
                window.location.href = url;
              } else {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }
          });
        });

        // Dino game bookmark
        const dinoBookmark = document.getElementById('dino-bookmark');
        dinoBookmark?.addEventListener('click', () => {
          this.openDinoGame();
        });

        // History panel
        const historyMenuItem = document.getElementById('menu-history');
        historyMenuItem?.addEventListener('click', () => this.openHistory());
        document.getElementById('history-close-btn')?.addEventListener('click', () => this.closeHistory());
        document.getElementById('history-search-input')?.addEventListener('input', (e) => this.searchHistory(e.target.value));
        document.getElementById('history-clear-btn')?.addEventListener('click', () => this.clearHistory());

        // Search in page (Ctrl+F / Cmd+F)
        document.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.openFindBar();
          }
          if (e.key === 'Escape' && !document.getElementById('chrome-findbar')?.classList.contains('hidden')) {
            this.closeFindBar();
          }
        });
        document.getElementById('findbar-close')?.addEventListener('click', () => this.closeFindBar());
        document.getElementById('findbar-input')?.addEventListener('input', (e) => this.findInPage(e.target.value));
        document.getElementById('findbar-prev')?.addEventListener('click', () => this.findPrevious());
        document.getElementById('findbar-next')?.addEventListener('click', () => this.findNext());

        // Tab context menu - use event delegation for dynamically created tabs
        document.querySelector('.chrome-tabs')?.addEventListener('contextmenu', (e) => {
          const tab = e.target.closest('.chrome-tab');
          if (tab) {
            e.preventDefault();
            this.showTabContextMenu(e, tab);
          }
        });
        document.getElementById('context-reload')?.addEventListener('click', () => this.contextReload());
        document.getElementById('context-duplicate')?.addEventListener('click', () => this.contextDuplicate());
        document.getElementById('context-pin')?.addEventListener('click', () => this.contextPin());
        document.getElementById('context-mute')?.addEventListener('click', () => this.contextMute());
        document.getElementById('context-close-others')?.addEventListener('click', () => this.contextCloseOthers());
        document.getElementById('context-close-right')?.addEventListener('click', () => this.contextCloseRight());
        document.getElementById('context-close')?.addEventListener('click', () => this.contextClose());
        document.addEventListener('click', (e) => {
          const contextMenu = document.getElementById('chrome-tab-context-menu');
          if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.classList.add('hidden');
          }
        });

        // Settings panel
        const settingsMenuItem = document.getElementById('menu-settings');
        settingsMenuItem?.addEventListener('click', () => this.openSettings());
        document.getElementById('settings-close-btn')?.addEventListener('click', () => this.closeSettings());
        document.querySelectorAll('.chrome-settings-category').forEach(cat => {
          cat.addEventListener('click', () => this.switchSettingsCategory(cat.dataset.category));
        });
        document.querySelectorAll('.chrome-settings-toggle').forEach(toggle => {
          toggle.addEventListener('click', () => this.toggleSetting(toggle.dataset.setting));
        });
        document.getElementById('settings-clear-data')?.addEventListener('click', () => this.clearHistory());

        // Downloads panel
        const downloadsMenuItem = document.getElementById('menu-downloads');
        downloadsMenuItem?.addEventListener('click', () => this.openDownloads());

        // Bookmarks panel
        const bookmarksMenuItem = document.getElementById('menu-bookmarks');
        bookmarksMenuItem?.addEventListener('click', () => this.openBookmarks());

        // Extensions panel
        const extensionsBtn = document.getElementById('extensions-btn');
        extensionsBtn?.addEventListener('click', () => this.openExtensions());
        const extensionsMenuItem = document.getElementById('menu-extensions');
        extensionsMenuItem?.addEventListener('click', () => this.openExtensions());

        // Star/bookmark button
        const starBtn = document.querySelector('.chrome-star-btn');
        starBtn?.addEventListener('click', () => this.toggleBookmark());

        // URL input and Omnibox
        const urlInput = document.getElementById('url-input');
        urlInput?.addEventListener('click', function() {
          this.select();
        });
        urlInput?.addEventListener('input', (e) => this.handleOmniboxInput(e.target.value));
        urlInput?.addEventListener('keydown', (e) => this.handleOmniboxKeydown(e));
        urlInput?.addEventListener('focus', () => this.showOmnibox());
        urlInput?.addEventListener('blur', (e) => {
          // Delay to allow clicking on dropdown items
          setTimeout(() => this.hideOmnibox(), 150);
        });

        // Close omnibox when clicking outside
        document.addEventListener('click', (e) => {
          const omniboxDropdown = document.getElementById('omnibox-dropdown');
          const urlInput = document.getElementById('url-input');
          if (omniboxDropdown && !omniboxDropdown.contains(e.target) && !urlInput?.contains(e.target)) {
            this.hideOmnibox();
          }
        });

        // Page context menu
        const chromeContentArea = document.querySelector('.chrome-content');
        chromeContentArea?.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.showPageContextMenu(e);
        });

        // Page context menu items
        document.getElementById('page-context-back')?.addEventListener('click', () => {
          this.navigateBack();
          this.hidePageContextMenu();
        });
        document.getElementById('page-context-forward')?.addEventListener('click', () => {
          this.navigateForward();
          this.hidePageContextMenu();
        });
        document.getElementById('page-context-reload')?.addEventListener('click', () => {
          this.refresh();
          this.hidePageContextMenu();
        });
        document.getElementById('page-context-save-as')?.addEventListener('click', () => {
          this.showNotification('Save page as...');
          this.hidePageContextMenu();
        });
        document.getElementById('page-context-print')?.addEventListener('click', () => {
          this.showNotification('Print page...');
          this.hidePageContextMenu();
        });
        document.getElementById('page-context-view-source')?.addEventListener('click', () => {
          this.viewPageSource();
          this.hidePageContextMenu();
        });
        document.getElementById('page-context-inspect')?.addEventListener('click', () => {
          this.openDevTools();
          this.hidePageContextMenu();
        });

        // Close page context menu when clicking outside
        document.addEventListener('click', (e) => {
          const contextMenu = document.getElementById('chrome-page-context-menu');
          if (contextMenu && !contextMenu.contains(e.target)) {
            this.hidePageContextMenu();
          }
        });

        // View source modal
        document.getElementById('view-source-close')?.addEventListener('click', () => this.closeViewSource());
        document.getElementById('chrome-view-source-modal')?.addEventListener('click', (e) => {
          if (e.target.id === 'chrome-view-source-modal') {
            this.closeViewSource();
          }
        });

        // Site information popup
        const siteInfoIcon = document.getElementById('site-info-icon');
        const siteInfoPopup = document.getElementById('chrome-site-info-popup');
        const siteInfoClose = document.getElementById('site-info-close');
        
        siteInfoIcon?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showSiteInfo(e);
        });
        
        siteInfoClose?.addEventListener('click', () => {
          this.hideSiteInfo();
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
          if (siteInfoPopup && !siteInfoPopup.contains(e.target) && !siteInfoIcon?.contains(e.target)) {
            this.hideSiteInfo();
          }
        });
        
        // Site info menu items
        document.getElementById('site-info-connection')?.addEventListener('click', () => {
          this.showNotification('Connection is secure');
          this.hideSiteInfo();
        });
        
        document.getElementById('site-info-cookies')?.addEventListener('click', () => {
          this.showNotification('Cookies and site data');
          this.hideSiteInfo();
        });
        
        document.getElementById('site-info-settings')?.addEventListener('click', () => {
          this.openSettings();
          this.hideSiteInfo();
        });
        
        document.getElementById('site-info-about')?.addEventListener('click', () => {
          this.showNotification('About this page');
          this.hideSiteInfo();
        });

        // Keyboard shortcuts
        this.attachKeyboardShortcuts();
      }

      attachKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
          // Don't interfere with input fields
          const target = e.target;
          if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
            return;
          }

          // Cmd/Ctrl + R: Refresh
          if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
            e.preventDefault();
            this.refresh();
          }

          // Cmd/Ctrl + Shift + M: Toggle mobile view
          if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'M') {
            e.preventDefault();
            this.toggleMobileView();
          }

          // Cmd/Ctrl + W: Close tab
          if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
            e.preventDefault();
            this.closeTab();
          }

          // Cmd/Ctrl + T: New tab
          if ((e.metaKey || e.ctrlKey) && e.key === 't') {
            e.preventDefault();
            this.newTab();
          }

          // Cmd/Ctrl + D: Bookmark
          if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleBookmark();
          }

          // Cmd/Ctrl + U: View page source
          if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
            e.preventDefault();
            this.viewPageSource();
          }

          // F11: Fullscreen
          if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
          }
        });
      }

      // Navigation methods
      navigateBack() {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.updateURL();
          this.playNavigationAnimation('back');
        }
      }

      navigateForward() {
        if (this.currentIndex < this.history.length - 1) {
          this.currentIndex++;
          this.updateURL();
          this.playNavigationAnimation('forward');
        }
      }

      refresh() {
        const refreshBtn = document.getElementById('refresh-btn');
        const mobileRefreshBtn = document.getElementById('mobile-refresh-btn');
        const viewport = document.getElementById('viewport');
        const mobileViewport = document.getElementById('mobile-viewport');

        // Rotate refresh icon
        refreshBtn?.classList.add('rotating');
        mobileRefreshBtn?.classList.add('rotating');

        // Add refresh animation to viewport
        viewport?.classList.add('refreshing');
        mobileViewport?.classList.add('refreshing');

        setTimeout(() => {
          refreshBtn?.classList.remove('rotating');
          mobileRefreshBtn?.classList.remove('rotating');
          viewport?.classList.remove('refreshing');
          mobileViewport?.classList.remove('refreshing');
        }, 600);

        this.showNotification('Page refreshed');
      }

      goHome() {
        this.scrollToTop();
        this.showNotification('Scrolled to top');
      }

      scrollToTop() {
        const viewport = document.getElementById('viewport');
        const mobileViewport = document.getElementById('mobile-viewport');
        viewport?.scrollTo({ top: 0, behavior: 'smooth' });
        mobileViewport?.scrollTo({ top: 0, behavior: 'smooth' });
      }

      updateURL() {
        const urlInput = document.getElementById('url-input');
        if (urlInput) {
          urlInput.value = this.history[this.currentIndex];
        }
        this.updateNavigationButtons();
      }

      updateNavigationButtons() {
        const backBtn = document.getElementById('back-btn');
        const forwardBtn = document.getElementById('forward-btn');

        if (backBtn) {
          backBtn.disabled = this.currentIndex === 0;
        }

        if (forwardBtn) {
          forwardBtn.disabled = this.currentIndex === this.history.length - 1;
        }
      }

      // Window control methods
      closeWindow() {
        const chromeWindow = document.getElementById('chrome-window');
        chromeWindow?.classList.add('closing');

        setTimeout(() => {
          this.showClosedMessage();
        }, 300);
      }

      minimizeWindow() {
        const chromeWindow = document.getElementById('chrome-window');
        chromeWindow?.classList.add('minimizing');

        setTimeout(() => {
          chromeWindow?.classList.remove('minimizing');
          chromeWindow?.classList.add('minimized');
        }, 300);

        // Show a "restore" button
        this.showRestoreButton();
      }

      toggleMaximize() {
        const chromeWindow = document.getElementById('chrome-window');
        this.isFullscreen = !this.isFullscreen;

        if (this.isFullscreen) {
          chromeWindow?.classList.add('maximized');
        } else {
          chromeWindow?.classList.remove('maximized');
        }
      }

      toggleFullscreen() {
        const chromeWindow = document.getElementById('chrome-window');
        chromeWindow?.classList.toggle('fullscreen');
      }

      // Menu methods
      toggleMenu() {
        const menuDropdown = document.getElementById('chrome-menu-dropdown');
        const menuBtn = document.getElementById('menu-btn');
        
        if (!menuDropdown || !menuBtn) return;
        
        if (menuDropdown.classList.contains('hidden')) {
          // Calculate position relative to menu button
          const buttonRect = menuBtn.getBoundingClientRect();
          const dropdownWidth = 320; // Menu width
          const dropdownHeight = menuDropdown.offsetHeight || 400; // Approximate height
          
          // Position dropdown below and aligned to the right edge of button
          let left = buttonRect.right - dropdownWidth;
          let top = buttonRect.bottom + 4; // 4px gap
          
          // Ensure dropdown doesn't go off screen
          if (left < 12) {
            left = 12; // Minimum margin from left
          }
          if (left + dropdownWidth > window.innerWidth - 12) {
            left = window.innerWidth - dropdownWidth - 12; // Minimum margin from right
          }
          
          // If dropdown would go off bottom, position above button
          if (top + dropdownHeight > window.innerHeight - 12) {
            top = buttonRect.top - dropdownHeight - 4;
          }
          
          menuDropdown.style.left = `${left}px`;
          menuDropdown.style.top = `${top}px`;
          menuDropdown.classList.remove('hidden');
        } else {
          menuDropdown.classList.add('hidden');
        }
      }

      closeMenu() {
        const menuDropdown = document.getElementById('chrome-menu-dropdown');
        menuDropdown?.classList.add('hidden');
      }

      // Tab methods
      switchTab(tabType) {
        // Update active tab
        document.querySelectorAll('.chrome-tab').forEach(tab => {
          tab.classList.remove('active');
          if (tab.dataset.tab === tabType) {
            tab.classList.add('active');
          }
        });

        // Show/hide content (desktop)
        const portfolioContent = document.getElementById('portfolio-content');
        const blogContent = document.getElementById('blog-content');
        const blogIframe = blogContent?.querySelector('iframe');

        if (tabType === 'blog' && blogIframe && !blogIframe.getAttribute('src')) {
          const deferredSrc = blogIframe.dataset.src;
          if (deferredSrc) {
            blogIframe.src = deferredSrc;
          }
        }

        // Mobile content area
        const contentAreaMobile = document.getElementById('content-area-mobile');
        const viewport = document.getElementById('viewport');
        const isMobileMode = viewport?.classList.contains('mobile-mode');

        if (tabType === 'portfolio') {
          portfolioContent?.classList.remove('hidden');
          blogContent?.classList.add('hidden');
          
          // Update mobile content
          if (isMobileMode && contentAreaMobile && portfolioContent) {
            contentAreaMobile.innerHTML = portfolioContent.innerHTML;
          }
          
          this.updateURL();
          this.addToHistory('bunchhieng.github.io', 'Portfolio - Bunchhieng Soth');
        } else if (tabType === 'blog') {
          portfolioContent?.classList.add('hidden');
          blogContent?.classList.remove('hidden');
          
          // Update mobile content
          if (isMobileMode && contentAreaMobile && blogContent) {
            contentAreaMobile.innerHTML = blogContent.innerHTML;
          }
          
          const urlInput = document.getElementById('url-input');
          if (urlInput) {
            urlInput.value = 'bunchhieng.github.io/blog';
          }
          this.addToHistory('bunchhieng.github.io/blog', 'Blog - Bunchhieng Soth');
        }
      }

      closeTab(tabType) {
        // Prevent closing main tabs (portfolio and blog)
        if (tabType === 'portfolio' || tabType === 'blog') {
          return;
        }

        const tab = document.querySelector(`.chrome-tab[data-tab="${tabType}"]`);
        if (!tab) return;

        tab.classList.add('closing');

        setTimeout(() => {
          tab.remove();
          // Switch to portfolio if a custom tab was closed
          const activeTab = document.querySelector('.chrome-tab.active');
          if (!activeTab) {
            this.switchTab('portfolio');
          }
        }, 200);
      }

      newTab() {
        // Check if blog tab already exists
        const existingBlogTab = document.querySelector('.chrome-tab[data-tab="blog"]');
        if (existingBlogTab) {
          this.switchTab('blog');
          return;
        }

        // Create new blog tab
        const tabsContainer = document.querySelector('.chrome-tabs');
        const newTabBtn = document.querySelector('.chrome-new-tab-btn');
        
        if (!tabsContainer || !newTabBtn) return;

        const blogTab = document.createElement('div');
        blogTab.className = 'chrome-tab';
        blogTab.dataset.tab = 'blog';
        blogTab.innerHTML = `
          <div class="chrome-tab-favicon">
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#8b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/>
              <polyline points='14 2 14 8 20 8'/>
              <line x1='16' y1='13' x2='8' y2='13'/>
              <line x1='16' y1='17' x2='8' y2='17'/>
              <polyline points='10 9 9 9 8 9'/>
            </svg>
          </div>
          <span class="chrome-tab-title">Blog</span>
          <button class="chrome-tab-close" aria-label="Close tab">
            <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
          </button>
        `;

        // Insert before new tab button
        tabsContainer.insertBefore(blogTab, newTabBtn);

        // Add event listeners to new tab
        blogTab.addEventListener('click', (e) => {
          if (e.target.closest('.chrome-tab-close')) return;
          this.switchTab('blog');
        });

        const closeBtn = blogTab.querySelector('.chrome-tab-close');
        closeBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeTab('blog');
        });

        // Switch to the new tab
        this.switchTab('blog');
        this.showNotification('Blog tab opened');
      }

      // Bookmark methods
      toggleBookmark() {
        const starBtn = document.querySelector('.chrome-star-btn');
        const urlInput = document.getElementById('url-input');
        const currentUrl = urlInput?.value || 'bunchhieng.github.io';
        const currentTitle = document.title || 'Portfolio - Bunchhieng Soth';
        
        // Check if already bookmarked
        const existing = this.bookmarks.find(b => b.url === currentUrl);
        
        if (existing) {
          this.removeBookmark(existing.id);
          if (starBtn) {
            starBtn.classList.remove('bookmarked');
          }
        } else {
          this.addBookmark(currentTitle, currentUrl);
          if (starBtn) {
            starBtn.classList.add('bookmarked');
          }
        }
      }

      // Animation methods
      playNavigationAnimation(direction) {
        const viewport = document.getElementById('viewport');
        const mobileViewport = document.getElementById('mobile-viewport');
        viewport?.classList.add(`navigate-${direction}`);
        mobileViewport?.classList.add(`navigate-${direction}`);

        setTimeout(() => {
          viewport?.classList.remove(`navigate-${direction}`);
          mobileViewport?.classList.remove(`navigate-${direction}`);
        }, 300);
      }

      initializeAnimations() {
        const chromeWindow = document.getElementById('chrome-window');

        setTimeout(() => {
          chromeWindow?.classList.remove('entrance-animation');
        }, 600);
      }

      // UI feedback methods
      showNotification(message) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.chrome-notification');
        if (existingNotification) {
          existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'chrome-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.classList.add('show');
        }, 10);

        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
        }, 2000);
      }

      showClosedMessage() {
        const message = document.createElement('div');
        message.className = 'chrome-closed-message';
        message.innerHTML = `
          <h2>Chrome closed</h2>
          <p>Thanks for visiting!</p>
          <button onclick="location.reload()">Reopen</button>
        `;
        document.body.appendChild(message);
      }

      showRestoreButton() {
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'chrome-restore-btn';
        restoreBtn.textContent = 'Restore Window';
        restoreBtn.onclick = () => {
          const chromeWindow = document.getElementById('chrome-window');
          chromeWindow?.classList.remove('minimized');
          restoreBtn.remove();
        };
        document.body.appendChild(restoreBtn);
      }

      // History methods
      loadBrowsingHistory() {
        const saved = localStorage.getItem('chrome-browsing-history');
        if (saved) {
          return JSON.parse(saved);
        }
        return [];
      }

      saveBrowsingHistory() {
        localStorage.setItem('chrome-browsing-history', JSON.stringify(this.browsingHistory));
      }

      addToHistory(url, title) {
        this.browsingHistory.unshift({
          url,
          title: title || url,
          timestamp: Date.now()
        });
        if (this.browsingHistory.length > 100) {
          this.browsingHistory = this.browsingHistory.slice(0, 100);
        }
        this.saveBrowsingHistory();
      }

      openHistory() {
        const panel = document.getElementById('chrome-history-panel');
        panel?.classList.remove('hidden');
        this.renderHistory();
      }

      closeHistory() {
        const panel = document.getElementById('chrome-history-panel');
        panel?.classList.add('hidden');
      }

      renderHistory(filter = '') {
        const content = document.getElementById('history-content');
        if (!content) return;

        let filtered = this.browsingHistory;
        if (filter) {
          const filterLower = filter.toLowerCase();
          filtered = this.browsingHistory.filter(item => 
            item.title.toLowerCase().includes(filterLower) || 
            item.url.toLowerCase().includes(filterLower)
          );
        }

        if (filtered.length === 0) {
          content.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--chrome-text-secondary);">No history found</div>';
          return;
        }

        content.innerHTML = filtered.map(item => {
          const date = new Date(item.timestamp);
          const timeStr = date.toLocaleString();
          return `
            <div class="chrome-history-item" data-url="${item.url}">
              <div class="chrome-history-item-icon">
                <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="chrome-history-item-details">
                <div class="chrome-history-item-title">${item.title}</div>
                <div class="chrome-history-item-url">${item.url}</div>
              </div>
              <div class="chrome-history-item-time">${timeStr}</div>
            </div>
          `;
        }).join('');

        content.querySelectorAll('.chrome-history-item').forEach(item => {
          item.addEventListener('click', () => {
            const url = item.dataset.url;
            if (url.startsWith('http')) {
              window.open(url, '_blank');
            } else if (url.includes('blog')) {
              this.switchTab('blog');
              this.closeHistory();
            } else {
              this.switchTab('portfolio');
              this.closeHistory();
            }
          });
        });
      }

      searchHistory(query) {
        this.renderHistory(query);
      }

      clearHistory() {
        if (confirm('Clear all browsing history?')) {
          this.browsingHistory = [];
          this.saveBrowsingHistory();
          this.renderHistory();
          this.showNotification('History cleared');
        }
      }

      // Search in page methods
      openFindBar() {
        const findbar = document.getElementById('chrome-findbar');
        findbar?.classList.remove('hidden');
        const input = document.getElementById('findbar-input');
        input?.focus();
        input?.select();
      }

      closeFindBar() {
        const findbar = document.getElementById('chrome-findbar');
        findbar?.classList.add('hidden');
        this.clearFindHighlights();
      }

      findInPage(query) {
        if (!query) {
          this.clearFindHighlights();
          document.getElementById('findbar-count').textContent = '';
          return;
        }

        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;

        this.clearFindHighlights();
        this.findMatches = [];
        this.currentFindIndex = -1;

        const walker = document.createTreeWalker(
          contentArea,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        while (node = walker.nextNode()) {
          const text = node.textContent;
          const index = text.toLowerCase().indexOf(query.toLowerCase());
          if (index !== -1) {
            const range = document.createRange();
            range.setStart(node, index);
            range.setEnd(node, index + query.length);
            this.findMatches.push(range);
          }
        }

        if (this.findMatches.length > 0) {
          this.currentFindIndex = 0;
          this.highlightMatch(0);
        }

        const count = document.getElementById('findbar-count');
        if (count) {
          count.textContent = this.findMatches.length > 0 
            ? `${this.currentFindIndex + 1} of ${this.findMatches.length}`
            : 'No matches';
        }
      }

      highlightMatch(index) {
        if (index < 0 || index >= this.findMatches.length) return;
        this.clearFindHighlights();
        const range = this.findMatches[index];
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        range.startContainer.parentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      clearFindHighlights() {
        window.getSelection().removeAllRanges();
      }

      findPrevious() {
        if (this.findMatches.length === 0) return;
        this.currentFindIndex = (this.currentFindIndex - 1 + this.findMatches.length) % this.findMatches.length;
        this.highlightMatch(this.currentFindIndex);
        const count = document.getElementById('findbar-count');
        if (count) {
          count.textContent = `${this.currentFindIndex + 1} of ${this.findMatches.length}`;
        }
      }

      findNext() {
        if (this.findMatches.length === 0) return;
        this.currentFindIndex = (this.currentFindIndex + 1) % this.findMatches.length;
        this.highlightMatch(this.currentFindIndex);
        const count = document.getElementById('findbar-count');
        if (count) {
          count.textContent = `${this.currentFindIndex + 1} of ${this.findMatches.length}`;
        }
      }

      // Tab context menu methods
      showTabContextMenu(e, tab) {
        const menu = document.getElementById('chrome-tab-context-menu');
        if (!menu) return;
        this.contextMenuTab = tab;
        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        menu.classList.remove('hidden');
        const pinBtn = document.getElementById('context-pin');
        if (pinBtn) {
          pinBtn.textContent = tab.classList.contains('pinned') ? 'Unpin tab' : 'Pin tab';
        }
      }

      contextReload() {
        this.refresh();
        this.hideContextMenu();
      }

      contextDuplicate() {
        const tabType = this.contextMenuTab?.dataset.tab;
        if (tabType === 'blog') {
          this.switchTab('blog');
        } else {
          this.switchTab('portfolio');
        }
        this.hideContextMenu();
      }

      contextPin() {
        if (!this.contextMenuTab) return;
        this.contextMenuTab.classList.toggle('pinned');
        this.showNotification(this.contextMenuTab.classList.contains('pinned') ? 'Tab pinned' : 'Tab unpinned');
        this.hideContextMenu();
      }

      contextMute() {
        this.showNotification('Tab muted');
        this.hideContextMenu();
      }

      contextCloseOthers() {
        this.showNotification('Other tabs closed');
        this.hideContextMenu();
      }

      contextCloseRight() {
        this.showNotification('Tabs to the right closed');
        this.hideContextMenu();
      }

      contextClose() {
        const tabType = this.contextMenuTab?.dataset.tab;
        if (tabType && tabType !== 'portfolio' && tabType !== 'blog') {
          this.closeTab(tabType);
        }
        this.hideContextMenu();
      }

      hideContextMenu() {
        const menu = document.getElementById('chrome-tab-context-menu');
        menu?.classList.add('hidden');
        this.contextMenuTab = null;
      }

      // Settings methods
      openSettings() {
        const panel = document.getElementById('chrome-settings-panel');
        panel?.classList.remove('hidden');
        this.closeMenu();
      }

      closeSettings() {
        const panel = document.getElementById('chrome-settings-panel');
        panel?.classList.add('hidden');
      }

      switchSettingsCategory(category) {
        document.querySelectorAll('.chrome-settings-category').forEach(cat => {
          cat.classList.toggle('active', cat.dataset.category === category);
        });
        document.querySelectorAll('.chrome-settings-section').forEach(section => {
          section.classList.toggle('hidden', section.dataset.category !== category);
        });
      }

      toggleSetting(setting) {
        const toggle = document.querySelector(`[data-setting="${setting}"]`);
        if (!toggle) return;
        toggle.classList.toggle('active');
        const isActive = toggle.classList.contains('active');
        switch(setting) {
          case 'show-bookmarks':
            const bookmarkBar = document.getElementById('bookmark-bar');
            if (bookmarkBar) {
              bookmarkBar.style.display = isActive ? 'flex' : 'none';
            }
            this.showNotification(isActive ? 'Bookmarks bar shown' : 'Bookmarks bar hidden');
            break;
          case 'compact-mode':
            this.showNotification(isActive ? 'Compact mode enabled' : 'Compact mode disabled');
            break;
          case 'dev-mode':
            this.showNotification(isActive ? 'Developer mode enabled' : 'Developer mode disabled');
            break;
        }
      }

      // Downloads methods
      loadDownloads() {
        const saved = localStorage.getItem('chrome-downloads');
        if (saved) {
          return JSON.parse(saved);
        }
        return [];
      }

      saveDownloads() {
        localStorage.setItem('chrome-downloads', JSON.stringify(this.downloads));
      }

      ensureDownloadsLoaded() {
        if (this.downloads) return;
        this.downloads = this.loadDownloads();
        if (this.downloads.length === 0) {
          this.downloads = [
            {
              id: Date.now(),
              name: 'project-screenshot.png',
              url: 'https://example.com/screenshot.png',
              size: '1.2 MB',
              timestamp: Date.now(),
              status: 'completed',
              progress: 100
            },
            {
              id: Date.now() - 1,
              name: 'portfolio-resume.pdf',
              url: 'https://example.com/resume.pdf',
              size: '2.4 MB',
              timestamp: Date.now() - 1,
              status: 'completed',
              progress: 100
            }
          ];
          this.saveDownloads();
        }
      }

      ensureAvailableExtensionsLoaded() {
        if (!this.availableExtensions) {
          this.availableExtensions = this.getAvailableExtensions();
        }
      }

      ensureTemplatePanel(templateId, panelId) {
        let panel = document.getElementById(panelId);
        if (panel) return panel;

        const template = document.getElementById(templateId);
        if (!template) return null;

        const fragment = template.content.cloneNode(true);
        document.body.appendChild(fragment);
        return document.getElementById(panelId);
      }

      ensureDownloadsPanel() {
        const panel = this.ensureTemplatePanel('downloads-panel-template', 'chrome-downloads-panel');
        if (!panel || panel.dataset.initialized === 'true') return panel;

        document.getElementById('downloads-close-btn')?.addEventListener('click', () => this.closeDownloads());
        panel.dataset.initialized = 'true';
        return panel;
      }

      ensureBookmarksPanel() {
        const panel = this.ensureTemplatePanel('bookmarks-panel-template', 'chrome-bookmarks-panel');
        if (!panel || panel.dataset.initialized === 'true') return panel;

        document.getElementById('bookmarks-close-btn')?.addEventListener('click', () => this.closeBookmarks());
        document.getElementById('bookmarks-search-input')?.addEventListener('input', (e) => this.searchBookmarks(e.target.value));
        panel.dataset.initialized = 'true';
        return panel;
      }

      ensureExtensionsPanel() {
        const panel = this.ensureTemplatePanel('extensions-panel-template', 'chrome-extensions-panel');
        if (!panel || panel.dataset.initialized === 'true') return panel;

        document.getElementById('extensions-close-btn')?.addEventListener('click', () => this.closeExtensions());
        panel.querySelectorAll('.chrome-extensions-tab').forEach(tab => {
          tab.addEventListener('click', () => this.switchExtensionsTab(tab.dataset.tab));
        });
        panel.dataset.initialized = 'true';
        return panel;
      }

      addDownload(name, url, size) {
        this.ensureDownloadsLoaded();
        this.downloads.unshift({
          id: Date.now(),
          name,
          url,
          size: size || 'Unknown',
          timestamp: Date.now(),
          status: 'completed',
          progress: 100
        });
        if (this.downloads.length > 50) {
          this.downloads = this.downloads.slice(0, 50);
        }
        this.saveDownloads();
        this.renderDownloads();
      }

      openDownloads() {
        this.ensureDownloadsLoaded();
        const panel = this.ensureDownloadsPanel();
        panel?.classList.remove('hidden');
        this.renderDownloads();
        this.closeMenu();
      }

      closeDownloads() {
        const panel = document.getElementById('chrome-downloads-panel');
        panel?.classList.add('hidden');
      }

      renderDownloads() {
        this.ensureDownloadsLoaded();
        const content = document.getElementById('downloads-content');
        if (!content) return;

        if (this.downloads.length === 0) {
          content.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--chrome-text-secondary);">No downloads yet</div>';
          return;
        }

        content.innerHTML = this.downloads.map(download => {
          const date = new Date(download.timestamp);
          const timeStr = date.toLocaleString();
          const fileIcon = this.getFileIcon(download.name);
          return `
            <div class="chrome-download-item" data-url="${download.url}">
              <div class="chrome-download-icon">${fileIcon}</div>
              <div class="chrome-download-details">
                <div class="chrome-download-name">${download.name}</div>
                <div class="chrome-download-info">
                  <span>${download.size}</span>
                  <span>·</span>
                  <span>${timeStr}</span>
                </div>
              </div>
              <div class="chrome-download-actions">
                <button class="chrome-download-btn" title="Open" onclick="event.stopPropagation(); window.open('${download.url}', '_blank')">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </button>
                <button class="chrome-download-btn" title="Remove" onclick="event.stopPropagation(); chromeBrowser.removeDownload(${download.id})">
                  <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          `;
        }).join('');

        content.querySelectorAll('.chrome-download-item').forEach(item => {
          item.addEventListener('click', () => {
            const url = item.dataset.url;
            if (url) {
              window.open(url, '_blank');
            }
          });
        });
      }

      getFileIcon(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const icons = {
          pdf: '<svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
          zip: '<svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/></svg>',
          image: '<svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/></svg>'
        };
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
          return icons.image;
        }
        if (['zip', 'rar', '7z'].includes(ext)) {
          return icons.zip;
        }
        if (ext === 'pdf') {
          return icons.pdf;
        }
        return '<svg fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>';
      }

      removeDownload(id) {
        this.ensureDownloadsLoaded();
        this.downloads = this.downloads.filter(d => d.id !== id);
        this.saveDownloads();
        this.renderDownloads();
        this.showNotification('Download removed');
      }

      // Bookmarks methods
      loadBookmarks() {
        const saved = localStorage.getItem('chrome-bookmarks');
        if (saved) {
          return JSON.parse(saved);
        }
        // Default bookmarks from bookmark bar
        return [
          { id: 1, name: 'GitHub', url: 'https://github.com/Bunchhieng', timestamp: Date.now() },
          { id: 2, name: 'LinkedIn', url: 'https://www.linkedin.com/in/bunchhieng/', timestamp: Date.now() },
          { id: 3, name: 'Email', url: 'mailto:bunchhieng@gmail.com', timestamp: Date.now() },
          { id: 4, name: 'Blog', url: 'bunchhieng.github.io/blog', timestamp: Date.now() },
          { id: 5, name: 'SportsCard360', url: 'https://sportscard360.com', timestamp: Date.now() }
        ];
      }

      saveBookmarks() {
        localStorage.setItem('chrome-bookmarks', JSON.stringify(this.bookmarks));
      }

      addBookmark(name, url) {
        this.bookmarks.unshift({
          id: Date.now(),
          name,
          url,
          timestamp: Date.now()
        });
        this.saveBookmarks();
        this.renderBookmarks();
        this.showNotification('Bookmark added');
      }

      removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.saveBookmarks();
        this.renderBookmarks();
        this.showNotification('Bookmark removed');
      }

      openBookmarks() {
        const panel = this.ensureBookmarksPanel();
        panel?.classList.remove('hidden');
        this.renderBookmarks();
        this.closeMenu();
      }

      closeBookmarks() {
        const panel = document.getElementById('chrome-bookmarks-panel');
        panel?.classList.add('hidden');
      }

      renderBookmarks(filter = '') {
        const content = document.getElementById('bookmarks-content');
        if (!content) return;

        let filtered = this.bookmarks;
        if (filter) {
          const filterLower = filter.toLowerCase();
          filtered = this.bookmarks.filter(bookmark => 
            bookmark.name.toLowerCase().includes(filterLower) || 
            bookmark.url.toLowerCase().includes(filterLower)
          );
        }

        if (filtered.length === 0) {
          content.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--chrome-text-secondary);">No bookmarks found</div>';
          return;
        }

        content.innerHTML = filtered.map(bookmark => {
          const date = new Date(bookmark.timestamp);
          const timeStr = date.toLocaleDateString();
          return `
            <div class="chrome-bookmark-item" data-url="${bookmark.url}">
              <div class="chrome-bookmark-icon">
                <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"/>
                </svg>
              </div>
              <div class="chrome-bookmark-details">
                <div class="chrome-bookmark-name">${bookmark.name}</div>
                <div class="chrome-bookmark-url">${bookmark.url}</div>
              </div>
              <div class="chrome-bookmark-actions">
                <button class="chrome-bookmark-action-btn" title="Open" onclick="event.stopPropagation(); chromeBrowser.openBookmark('${bookmark.url}')">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </button>
                <button class="chrome-bookmark-action-btn" title="Delete" onclick="event.stopPropagation(); chromeBrowser.removeBookmark(${bookmark.id})">
                  <svg fill="currentColor" viewBox="0 0 20 20" width="14" height="14">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          `;
        }).join('');

        content.querySelectorAll('.chrome-bookmark-item').forEach(item => {
          item.addEventListener('click', () => {
            const url = item.dataset.url;
            this.openBookmark(url);
          });
        });
      }

      openBookmark(url) {
        if (url.startsWith('mailto:')) {
          window.location.href = url;
        } else if (url.includes('blog')) {
          this.switchTab('blog');
          this.closeBookmarks();
        } else if (url.startsWith('http')) {
          window.open(url, '_blank');
        } else {
          this.switchTab('portfolio');
          this.closeBookmarks();
        }
      }

      searchBookmarks(query) {
        this.renderBookmarks(query);
      }

      // Extensions methods
      getAvailableExtensions() {
        return [
          {
            id: 'adblock',
            name: 'AdBlock',
            version: '5.2.1',
            description: 'Block ads and pop-ups on websites. Improve your browsing experience.',
            icon: '🚫',
            author: 'AdBlock Inc.',
            category: 'Productivity'
          },
          {
            id: 'grammarly',
            name: 'Grammarly',
            version: '15.0.0',
            description: 'Grammar checker and writing assistant. Get real-time suggestions as you type.',
            icon: '✍️',
            author: 'Grammarly',
            category: 'Productivity'
          },
          {
            id: 'lastpass',
            name: 'LastPass',
            version: '4.120.0',
            description: 'Password manager that secures your passwords and personal information.',
            icon: '🔐',
            author: 'LastPass',
            category: 'Security'
          },
          {
            id: 'darkreader',
            name: 'Dark Reader',
            version: '4.9.63',
            description: 'Dark mode for every website. Care your eyes, use dark theme for night and daily browsing.',
            icon: '🌙',
            author: 'Dark Reader',
            category: 'Accessibility'
          },
          {
            id: 'momentum',
            name: 'Momentum',
            version: '2.0.0',
            description: 'Replace new tab page with a personal dashboard featuring to-do, weather, and inspiration.',
            icon: '⏰',
            author: 'Momentum',
            category: 'Productivity'
          },
          {
            id: 'react-devtools',
            name: 'React Developer Tools',
            version: '5.0.0',
            description: 'Adds React debugging tools to the Chrome Developer Tools.',
            icon: '⚛️',
            author: 'Meta',
            category: 'Developer Tools'
          }
        ];
      }

      loadExtensions() {
        const saved = localStorage.getItem('chrome-extensions');
        if (saved) {
          return JSON.parse(saved);
        }
        return [];
      }

      saveExtensions() {
        localStorage.setItem('chrome-extensions', JSON.stringify(this.extensions));
        this.updateExtensionToolbar();
      }

      openExtensions() {
        const panel = this.ensureExtensionsPanel();
        panel?.classList.remove('hidden');
        this.renderExtensions('installed');
        this.closeMenu();
      }

      closeExtensions() {
        const panel = document.getElementById('chrome-extensions-panel');
        panel?.classList.add('hidden');
      }

      switchExtensionsTab(tab) {
        document.querySelectorAll('.chrome-extensions-tab').forEach(t => {
          t.classList.toggle('active', t.dataset.tab === tab);
        });
        this.renderExtensions(tab);
      }

      renderExtensions(tab = 'installed') {
        this.ensureAvailableExtensionsLoaded();
        const content = document.getElementById('extensions-content');
        if (!content) return;

        if (tab === 'installed') {
          if (this.extensions.length === 0) {
            content.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--chrome-text-secondary);">No extensions installed</div>';
            return;
          }

          content.innerHTML = this.extensions.map(ext => this.renderExtensionCard(ext, true)).join('');
        } else {
          const installedIds = this.extensions.map(e => e.id);
          const available = this.availableExtensions.filter(e => !installedIds.includes(e.id));
          
          if (available.length === 0) {
            content.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--chrome-text-secondary);">All extensions installed</div>';
            return;
          }

          content.innerHTML = available.map(ext => this.renderExtensionCard(ext, false)).join('');
        }

        // Add event listeners
        content.querySelectorAll('.chrome-extension-toggle').forEach(toggle => {
          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const extId = toggle.dataset.extId;
            this.toggleExtension(extId);
          });
        });

        content.querySelectorAll('.chrome-extension-btn.install').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const extId = btn.dataset.extId;
            this.installExtension(extId);
          });
        });

        content.querySelectorAll('.chrome-extension-btn.remove').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const extId = btn.dataset.extId;
            this.removeExtension(extId);
          });
        });
      }

      renderExtensionCard(ext, isInstalled) {
        const isEnabled = isInstalled && this.extensions.find(e => e.id === ext.id)?.enabled !== false;
        return `
          <div class="chrome-extension-card">
            <div class="chrome-extension-icon">${ext.icon}</div>
            <div class="chrome-extension-details">
              <div class="chrome-extension-header-row">
                <div>
                  <div class="chrome-extension-name">${ext.name}</div>
                  <div class="chrome-extension-version">Version ${ext.version}</div>
                </div>
              </div>
              <div class="chrome-extension-description">${ext.description}</div>
              <div class="chrome-extension-actions">
                ${isInstalled ? `
                  <button class="chrome-extension-toggle ${isEnabled ? 'enabled' : ''}" data-ext-id="${ext.id}" title="${isEnabled ? 'Disable' : 'Enable'}"></button>
                  <span style="font-size: 12px; color: var(--chrome-text-secondary); margin-right: 8px;">${isEnabled ? 'Enabled' : 'Disabled'}</span>
                  <button class="chrome-extension-btn danger remove" data-ext-id="${ext.id}">Remove</button>
                ` : `
                  <button class="chrome-extension-btn install" data-ext-id="${ext.id}">Install</button>
                `}
              </div>
            </div>
          </div>
        `;
      }

      installExtension(extId) {
        const ext = this.availableExtensions.find(e => e.id === extId);
        if (!ext) return;

        if (this.extensions.find(e => e.id === extId)) {
          this.showNotification('Extension already installed');
          return;
        }

        this.extensions.push({
          ...ext,
          enabled: true,
          installedAt: Date.now()
        });
        this.saveExtensions();
        this.renderExtensions('installed');
        this.showNotification(`${ext.name} installed`);
      }

      removeExtension(extId) {
        if (confirm('Remove this extension?')) {
          this.extensions = this.extensions.filter(e => e.id !== extId);
          this.saveExtensions();
          this.renderExtensions('installed');
          this.showNotification('Extension removed');
        }
      }

      toggleExtension(extId) {
        const ext = this.extensions.find(e => e.id === extId);
        if (!ext) return;

        ext.enabled = !ext.enabled;
        this.saveExtensions();
        this.renderExtensions('installed');
        this.showNotification(`${ext.name} ${ext.enabled ? 'enabled' : 'disabled'}`);
      }

      updateExtensionToolbar() {
        const toolbar = document.querySelector('.chrome-right-controls');
        if (!toolbar) return;

        // Remove existing extension icons
        const existingIcons = toolbar.querySelectorAll('.chrome-extension-toolbar-icon');
        existingIcons.forEach(icon => icon.remove());

        // Add icons for enabled extensions
        const enabledExtensions = this.extensions.filter(e => e.enabled);
        enabledExtensions.forEach((ext, index) => {
          const icon = document.createElement('div');
          icon.className = 'chrome-extension-toolbar-icon';
          icon.title = ext.name;
          icon.innerHTML = `
            <span style="font-size: 16px;">${ext.icon}</span>
            ${ext.id === 'adblock' ? '<div class="chrome-extension-badge"></div>' : ''}
          `;
          icon.addEventListener('click', () => {
            this.showNotification(`${ext.name} clicked`);
          });
          
          // Insert before extensions button
          const extensionsBtn = document.getElementById('extensions-btn');
          if (extensionsBtn) {
            toolbar.insertBefore(icon, extensionsBtn);
          }
        });
      }

      // Site information methods
      showSiteInfo(e) {
        const popup = document.getElementById('chrome-site-info-popup');
        const icon = document.getElementById('site-info-icon');
        if (!popup || !icon) return;

        // Get icon position
        const iconRect = icon.getBoundingClientRect();
        const popupWidth = 320;
        const popupHeight = popup.offsetHeight || 300;
        
        // Position popup below and aligned to the left of icon
        let left = iconRect.left;
        let top = iconRect.bottom + 8;
        
        // Adjust if popup would go off screen
        if (left + popupWidth > window.innerWidth - 12) {
          left = window.innerWidth - popupWidth - 12;
        }
        if (left < 12) {
          left = 12;
        }
        
        // If popup would go off bottom, position above icon
        if (top + popupHeight > window.innerHeight - 12) {
          top = iconRect.top - popupHeight - 8;
        }
        
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        popup.classList.remove('hidden');
        
        // Update domain name from URL input
        const urlInput = document.getElementById('url-input');
        const domainEl = document.getElementById('site-info-domain');
        if (urlInput && domainEl) {
          const url = urlInput.value || 'bunchhieng.github.io';
          domainEl.textContent = url;
        }
      }

      hideSiteInfo() {
        const popup = document.getElementById('chrome-site-info-popup');
        popup?.classList.add('hidden');
      }

      // Mobile view toggle
      toggleMobileView() {
        const viewport = document.getElementById('viewport');
        const contentArea = document.getElementById('content-area');
        const contentAreaMobile = document.getElementById('content-area-mobile');
        const portfolioContent = document.getElementById('portfolio-content');
        const blogContent = document.getElementById('blog-content');
        const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
        
        if (!viewport) return;
        
        const isMobileMode = viewport.classList.contains('mobile-mode');
        
        if (isMobileMode) {
          // Switch to desktop
          viewport.classList.remove('mobile-mode');
          if (mobileToggleBtn) {
            mobileToggleBtn.classList.remove('active');
            mobileToggleBtn.title = 'Toggle device toolbar (Ctrl+Shift+M)';
          }
          this.showNotification('Desktop view');
        } else {
          // Switch to mobile
          viewport.classList.add('mobile-mode');
          
          // Clone current active content to mobile
          const activeTab = document.querySelector('.chrome-tab.active');
          const tabType = activeTab?.dataset.tab || 'portfolio';
          
          if (contentAreaMobile) {
            // Clear previous content
            contentAreaMobile.innerHTML = '';
            
            // Clone the content
            if (tabType === 'blog' && blogContent) {
              const clonedContent = blogContent.cloneNode(true);
              clonedContent.classList.remove('hidden');
              clonedContent.style.display = 'block';
              contentAreaMobile.appendChild(clonedContent);
            } else if (portfolioContent) {
              const clonedContent = portfolioContent.cloneNode(true);
              clonedContent.classList.remove('hidden');
              clonedContent.style.display = 'block';
              contentAreaMobile.appendChild(clonedContent);
            }
          }
          
          if (mobileToggleBtn) {
            mobileToggleBtn.classList.add('active');
            mobileToggleBtn.title = 'Toggle device toolbar (Ctrl+Shift+M)';
          }
          this.showNotification('Mobile view - iPhone 14 Pro');
        }
      }

      // DevTools dock position
      setDevToolsDock(side) {
        const devtools = document.getElementById('devtools');
        const viewport = document.getElementById('viewport');
        const resizer = document.getElementById('resizer');
        
        if (!devtools || !viewport) return;
        
        // Remove existing dock classes
        devtools.classList.remove('dock-left', 'dock-right', 'dock-bottom');
        viewport.classList.remove('devtools-left', 'devtools-right', 'devtools-bottom');
        
        // Apply new dock position
        this.devToolsDock = side;
        
        if (side === 'left') {
          devtools.classList.add('dock-left');
          viewport.classList.add('devtools-left');
          devtools.style.width = '600px';
          devtools.style.height = '';
          devtools.style.borderLeft = 'none';
          devtools.style.borderRight = '1px solid #3c3c3c';
          devtools.style.borderBottom = 'none';
          if (resizer) {
            resizer.style.cursor = 'ew-resize';
            resizer.style.width = '4px';
            resizer.style.height = '';
          }
          this.showNotification('DevTools docked to left');
        } else if (side === 'bottom') {
          devtools.classList.add('dock-bottom');
          viewport.classList.add('devtools-bottom');
          devtools.style.width = '';
          devtools.style.height = '300px';
          devtools.style.borderLeft = 'none';
          devtools.style.borderRight = 'none';
          devtools.style.borderTop = '1px solid #3c3c3c';
          if (resizer) {
            resizer.style.cursor = 'ns-resize';
            resizer.style.width = '';
            resizer.style.height = '4px';
          }
          this.showNotification('DevTools docked to bottom');
        } else { // right (default)
          devtools.classList.add('dock-right');
          viewport.classList.add('devtools-right');
          devtools.style.width = '600px';
          devtools.style.height = '';
          devtools.style.borderLeft = '1px solid #3c3c3c';
          devtools.style.borderRight = 'none';
          devtools.style.borderBottom = 'none';
          if (resizer) {
            resizer.style.cursor = 'ew-resize';
            resizer.style.width = '4px';
            resizer.style.height = '';
          }
          this.showNotification('DevTools docked to right');
        }
      }

      // Omnibox methods
      handleOmniboxInput(value) {
        if (!value || value.trim() === '') {
          this.hideOmnibox();
          return;
        }

        const suggestions = this.getOmniboxSuggestions(value);
        this.renderOmniboxSuggestions(suggestions);
        this.showOmnibox();
      }

      handleOmniboxKeydown(e) {
        const dropdown = document.getElementById('omnibox-dropdown');
        const items = dropdown?.querySelectorAll('.chrome-omnibox-item');
        const selectedItem = dropdown?.querySelector('.chrome-omnibox-item.selected');

        if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedItem) {
            const url = selectedItem.dataset.url;
            if (url) {
              this.navigateToUrl(url);
            }
          } else {
            this.navigateToUrl(e.target.value);
          }
          this.hideOmnibox();
        } else if (e.key === 'Escape') {
          this.hideOmnibox();
          e.target.blur();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (!selectedItem && items?.length > 0) {
            items[0].classList.add('selected');
          } else if (selectedItem) {
            const currentIndex = Array.from(items).indexOf(selectedItem);
            selectedItem.classList.remove('selected');
            if (currentIndex < items.length - 1) {
              items[currentIndex + 1].classList.add('selected');
            } else {
              items[0].classList.add('selected');
            }
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedItem) {
            const currentIndex = Array.from(items).indexOf(selectedItem);
            selectedItem.classList.remove('selected');
            if (currentIndex > 0) {
              items[currentIndex - 1].classList.add('selected');
            } else {
              items[items.length - 1].classList.add('selected');
            }
          }
        }
      }

      getOmniboxSuggestions(query) {
        const suggestions = [];
        const lowerQuery = query.toLowerCase();

        // Search suggestions (simulated)
        suggestions.push({
          type: 'search',
          title: query,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>'
        });

        // History suggestions (search in browsing history)
        const historyMatches = this.browsingHistory
          .filter(item =>
            item && item.title && item.url &&
            (item.title.toLowerCase().includes(lowerQuery) ||
             item.url.toLowerCase().includes(lowerQuery))
          )
          .slice(0, 3);

        historyMatches.forEach(item => {
          suggestions.push({
            type: 'history',
            title: item.title,
            url: item.url,
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
          });
        });

        // Bookmark suggestions
        const bookmarkMatches = this.bookmarks
          .filter(item =>
            item && item.title && item.url &&
            (item.title.toLowerCase().includes(lowerQuery) ||
             item.url.toLowerCase().includes(lowerQuery))
          )
          .slice(0, 2);

        bookmarkMatches.forEach(item => {
          suggestions.push({
            type: 'bookmark',
            title: item.title,
            url: item.url,
            icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>'
          });
        });

        return suggestions.slice(0, 5); // Max 5 suggestions
      }

      renderOmniboxSuggestions(suggestions) {
        const dropdown = document.getElementById('omnibox-dropdown');
        if (!dropdown) return;

        if (suggestions.length === 0) {
          this.hideOmnibox();
          return;
        }

        dropdown.innerHTML = suggestions.map(suggestion => `
          <div class="chrome-omnibox-item" data-url="${suggestion.url}">
            <div class="chrome-omnibox-icon">${suggestion.icon}</div>
            <div class="chrome-omnibox-content">
              <div class="chrome-omnibox-title">${this.escapeHtml(suggestion.title)}</div>
              <div class="chrome-omnibox-url">${this.escapeHtml(suggestion.url)}</div>
            </div>
          </div>
        `).join('');

        // Add click handlers
        dropdown.querySelectorAll('.chrome-omnibox-item').forEach(item => {
          item.addEventListener('click', () => {
            this.navigateToUrl(item.dataset.url);
            this.hideOmnibox();
          });
        });
      }

      navigateToUrl(url) {
        if (!url) return;

        // Easter egg: chrome://dino
        if (url.toLowerCase() === 'chrome://dino') {
          this.openDinoGame();
          this.hideOmnibox();
          const urlInput = document.getElementById('url-input');
          if (urlInput) {
            urlInput.value = 'bunchhieng.github.io';
            urlInput.blur();
          }
          return;
        }

        // Check if it's a search query or URL
        if (!url.includes('.') && !url.startsWith('http')) {
          // Open Google search in new tab
          window.open(`https://www.google.com/search?q=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
        } else if (url === 'bunchhieng.github.io' || url === 'bunchhieng.github.io/blog') {
          // Navigate within the simulator
          if (url.includes('/blog')) {
            this.switchTab('blog');
          } else {
            this.switchTab('portfolio');
          }
        } else {
          // External URL - open in new tab
          const fullUrl = url.startsWith('http') ? url : `https://${url}`;
          window.open(fullUrl, '_blank', 'noopener,noreferrer');
        }

        // Update URL input
        const urlInput = document.getElementById('url-input');
        if (urlInput) {
          urlInput.value = url;
          urlInput.blur();
        }
      }

      showOmnibox() {
        const dropdown = document.getElementById('omnibox-dropdown');
        if (dropdown && dropdown.innerHTML.trim() !== '') {
          dropdown.classList.remove('hidden');
        }
      }

      hideOmnibox() {
        const dropdown = document.getElementById('omnibox-dropdown');
        if (dropdown) {
          dropdown.classList.add('hidden');
        }
      }

      // Page context menu methods
      showPageContextMenu(e) {
        const menu = document.getElementById('chrome-page-context-menu');
        if (!menu) return;

        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        menu.classList.remove('hidden');
      }

      hidePageContextMenu() {
        const menu = document.getElementById('chrome-page-context-menu');
        if (menu) {
          menu.classList.add('hidden');
        }
      }

      // View source methods
      viewPageSource() {
        const modal = document.getElementById('chrome-view-source-modal');
        const codeElement = document.getElementById('view-source-code');
        const titleElement = document.getElementById('view-source-title');

        if (!modal || !codeElement) return;

        // Get the current page HTML
        const htmlContent = document.documentElement.outerHTML;
        const lineCount = htmlContent.split('\n').length;

        // For large files, show plain text without syntax highlighting
        if (lineCount > 1000) {
          const escaped = this.escapeHtml(htmlContent);
          codeElement.innerHTML = `
            <div style="padding: 16px; background: #2d2d2d; border-bottom: 1px solid #3c3c3c; color: #d4d4d4; font-size: 13px; position: sticky; top: 0; z-index: 10;">
              <strong>⚡ Large file (${lineCount} lines)</strong> - Syntax highlighting disabled for performance
              <button onclick="copySourceToClipboard()" style="margin-left: 16px; padding: 6px 12px; background: #3c9ae8; border: none; color: white; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500;">
                📋 Copy to Clipboard
              </button>
            </div>
            <pre style="margin: 0; padding: 20px; white-space: pre; color: #d4d4d4; line-height: 1.6;">${escaped}</pre>
          `;
        } else {
          // For smaller files, use syntax highlighting
          const formattedHtml = this.formatHtmlForDisplay(htmlContent);
          codeElement.innerHTML = formattedHtml;
        }

        // Update title
        const currentUrl = document.getElementById('url-input')?.value || 'Page';
        if (titleElement) {
          titleElement.textContent = `View Source: ${currentUrl}`;
        }

        // Show modal
        modal.classList.remove('hidden');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      }

      closeViewSource() {
        const modal = document.getElementById('chrome-view-source-modal');
        if (modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
        }
      }

      formatHtmlForDisplay(html) {
        // Escape HTML for display
        const escaped = this.escapeHtml(html);

        // Add line numbers and basic syntax highlighting
        const lines = escaped.split('\n');
        return lines.map((line, index) => {
          const lineNum = index + 1;
          const highlighted = this.highlightHtmlSyntax(line);
          return `<span class="chrome-view-source-line"><span class="chrome-view-source-line-number">${lineNum}</span>${highlighted}</span>`;
        }).join('\n');
      }

      highlightHtmlSyntax(line) {
        // Basic syntax highlighting
        return line
          // DOCTYPE
          .replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi, '<span class="source-doctype">$1</span>')
          // HTML comments
          .replace(/(&lt;!--.*?--&gt;)/g, '<span class="source-comment">$1</span>')
          // Tags
          .replace(/(&lt;\/?[\w-]+)/g, '<span class="source-tag">$1</span>')
          .replace(/(&gt;)/g, '<span class="source-tag">$1</span>')
          // Attributes
          .replace(/([\w-]+)=/g, '<span class="source-attr">$1</span>=')
          // String values
          .replace(/=&quot;([^&]*)&quot;/g, '=<span class="source-string">&quot;$1&quot;</span>')
          .replace(/=&#39;([^&]*)&#39;/g, '=<span class="source-string">&#39;$1&#39;</span>');
      }

      escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
      }

      // Welcome animation
      startWelcomeAnimation() {
        // Wait for window entrance animation to complete
        setTimeout(() => {
          this.typeWelcomeMessage();
        }, 900);
      }

      typeWelcomeMessage() {
        const urlInput = document.getElementById('url-input');
        if (!urlInput) return;

        const messages = [
          "Hi, I'm Bunchhieng 👋",
          "Welcome to my portfolio",
          "Built with vanilla JS",
          "Explore my work..."
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        let currentIndex = 0;

        // Clear current value and add cursor
        urlInput.value = '';
        urlInput.style.caretColor = 'transparent';

        const typeNextChar = () => {
          if (currentIndex < randomMessage.length) {
            urlInput.value = randomMessage.substring(0, currentIndex + 1);
            currentIndex++;

            // Trigger omnibox as we type
            if (currentIndex > 2) {
              this.handleOmniboxInput(urlInput.value);
            }

            // Variable typing speed for more natural feel
            const baseSpeed = 80;
            const variance = Math.random() * 40;
            setTimeout(typeNextChar, baseSpeed + variance);
          } else {
            // Typing complete - pause then clear
            setTimeout(() => {
              this.clearWelcomeMessage();
            }, 2000);
          }
        };

        typeNextChar();
      }

      clearWelcomeMessage() {
        const urlInput = document.getElementById('url-input');
        if (!urlInput) return;

        let currentText = urlInput.value;
        let currentIndex = currentText.length;

        const deleteNextChar = () => {
          if (currentIndex > 0) {
            currentIndex--;
            urlInput.value = currentText.substring(0, currentIndex);

            // Hide omnibox as we delete
            if (currentIndex <= 2) {
              this.hideOmnibox();
            }

            setTimeout(deleteNextChar, 30);
          } else {
            // Deletion complete - restore normal URL
            urlInput.value = 'bunchhieng.github.io';
            urlInput.style.caretColor = '';

            // Show welcome notification
            this.showNotification('👋 Welcome! Explore the tabs above');
          }
        };

        deleteNextChar();
      }

      // Dino Game
      openDinoGame() {
        const modal = document.getElementById('dino-game-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Initialize game if not already done
        if (!this.dinoGame) {
          this.dinoGame = new DinoGame();
        } else {
          this.dinoGame.reset();
        }
      }

      closeDinoGame() {
        const modal = document.getElementById('dino-game-modal');
        if (modal) {
          modal.classList.add('hidden');
          document.body.style.overflow = '';
          if (this.dinoGame) {
            this.dinoGame.stop();
          }
        }
      }
    }

    // Dino Game Class
    class DinoGame {
      constructor() {
        this.canvas = document.getElementById('dino-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('dinoHighScore')) || 0;
        this.isRunning = false;
        this.gameOver = false;
        this.speed = 6;
        this.gravity = 0.6;

        // Dino properties
        this.dino = {
          x: 50,
          y: 150,
          width: 44,
          height: 48,
          velocityY: 0,
          isJumping: false
        };

        // Obstacles
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.obstacleInterval = 90;

        this.init();
      }

      init() {
        this.updateHighScore();
        this.updateScore();

        // Event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('dino-game-close')?.addEventListener('click', () => {
          if (window.chromeBrowser) {
            window.chromeBrowser.closeDinoGame();
          }
        });

        this.showStartHint();
      }

      showStartHint() {
        const startHint = document.getElementById('dino-start-hint');
        if (startHint) {
          startHint.classList.remove('hidden');
        }
      }

      hideStartHint() {
        const startHint = document.getElementById('dino-start-hint');
        if (startHint) {
          startHint.classList.add('hidden');
        }
      }

      handleKeyPress(e) {
        if (e.code === 'Space') {
          e.preventDefault();

          if (!this.isRunning && !this.gameOver) {
            this.start();
          } else if (this.gameOver) {
            this.reset();
          } else if (!this.dino.isJumping) {
            this.jump();
          }
        }
      }

      start() {
        this.isRunning = true;
        this.gameOver = false;
        this.hideStartHint();
        this.gameLoop();
      }

      stop() {
        this.isRunning = false;
      }

      reset() {
        this.score = 0;
        this.speed = 6;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.dino.y = 150;
        this.dino.velocityY = 0;
        this.dino.isJumping = false;
        this.gameOver = false;
        this.updateScore();

        const gameOverEl = document.getElementById('dino-game-over');
        if (gameOverEl) {
          gameOverEl.classList.add('hidden');
        }

        this.start();
      }

      jump() {
        if (!this.dino.isJumping) {
          this.dino.velocityY = -12;
          this.dino.isJumping = true;
        }
      }

      updateScore() {
        const scoreEl = document.getElementById('dino-score');
        if (scoreEl) {
          scoreEl.textContent = String(Math.floor(this.score)).padStart(5, '0');
        }
      }

      updateHighScore() {
        const highScoreEl = document.getElementById('dino-high-score');
        if (highScoreEl) {
          highScoreEl.textContent = 'HI ' + String(this.highScore).padStart(5, '0');
        }
      }

      gameLoop() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update dino
        if (this.dino.isJumping) {
          this.dino.velocityY += this.gravity;
          this.dino.y += this.dino.velocityY;

          if (this.dino.y >= 150) {
            this.dino.y = 150;
            this.dino.velocityY = 0;
            this.dino.isJumping = false;
          }
        }

        // Draw ground line
        this.ctx.strokeStyle = '#535353';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 198);
        this.ctx.lineTo(this.canvas.width, 198);
        this.ctx.stroke();

        // Draw dino
        this.drawDino();

        // Generate obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer > this.obstacleInterval) {
          this.obstacles.push({
            x: this.canvas.width,
            y: 170,
            width: 20,
            height: 40
          });
          this.obstacleTimer = 0;
        }

        // Update and draw obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
          const obs = this.obstacles[i];
          obs.x -= this.speed;

          // Draw obstacle (cactus)
          this.drawCactus(obs.x, obs.y, obs.width, obs.height);

          // Remove off-screen obstacles
          if (obs.x + obs.width < 0) {
            this.obstacles.splice(i, 1);
            this.score += 10;
            this.updateScore();

            // Increase difficulty
            if (this.score % 100 === 0) {
              this.speed += 0.5;
              this.obstacleInterval = Math.max(50, this.obstacleInterval - 5);
            }
          }

          // Collision detection
          if (this.checkCollision(obs)) {
            this.endGame();
          }
        }

        if (!this.gameOver) {
          requestAnimationFrame(() => this.gameLoop());
        }
      }

      drawDino() {
        const x = this.dino.x;
        const y = this.dino.y;

        // Body
        this.ctx.fillStyle = '#535353';
        this.ctx.fillRect(x + 10, y + 10, 25, 25);

        // Head
        this.ctx.fillRect(x + 25, y, 15, 15);

        // Eye
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x + 30, y + 3, 4, 4);

        // Legs
        this.ctx.fillStyle = '#535353';
        this.ctx.fillRect(x + 12, y + 35, 6, 10);
        this.ctx.fillRect(x + 25, y + 35, 6, 10);

        // Tail
        this.ctx.fillRect(x + 5, y + 15, 8, 8);
      }

      drawCactus(x, y, width, height) {
        this.ctx.fillStyle = '#535353';
        // Main body
        this.ctx.fillRect(x + 6, y, 8, height);
        // Left arm
        this.ctx.fillRect(x, y + 10, 6, 15);
        // Right arm
        this.ctx.fillRect(x + 14, y + 15, 6, 12);
      }

      checkCollision(obstacle) {
        return (
          this.dino.x < obstacle.x + obstacle.width &&
          this.dino.x + this.dino.width > obstacle.x &&
          this.dino.y < obstacle.y + obstacle.height &&
          this.dino.y + this.dino.height > obstacle.y
        );
      }

      endGame() {
        this.gameOver = true;
        this.isRunning = false;

        // Update high score
        if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem('dinoHighScore', this.highScore);
          this.updateHighScore();
        }

        // Show game over
        const gameOverEl = document.getElementById('dino-game-over');
        if (gameOverEl) {
          gameOverEl.classList.remove('hidden');
        }
      }
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => {
      const ensureMobileWindow = () => {
        if (document.getElementById('chrome-mobile-window')) return;
        const template = document.getElementById('mobile-window-template');
        if (!template) return;
        document.body.appendChild(template.content.cloneNode(true));
      };

      const mobileLayoutQuery = window.matchMedia('(max-width: 768px)');
      if (mobileLayoutQuery.matches) {
        ensureMobileWindow();
      }
      mobileLayoutQuery.addEventListener?.('change', (event) => {
        if (event.matches) {
          ensureMobileWindow();
        }
      });

      const bootChromeBrowser = () => {
        if (window.chromeBrowser) return window.chromeBrowser;
        const instance = new ChromeBrowserSimulator();
        window.chromeBrowser = instance;
        return instance;
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(bootChromeBrowser, { timeout: 1500 });
      } else {
        setTimeout(bootChromeBrowser, 0);
      }

      // Mobile Menu Toggle
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileNavMenu = document.getElementById('mobile-nav-menu');
      
      if (mobileMenuBtn && mobileNavMenu) {
        mobileMenuBtn.addEventListener('click', () => {
          mobileNavMenu.classList.toggle('hidden');
          
          // Toggle hamburger icon to X
          const svg = mobileMenuBtn.querySelector('svg');
          if (mobileNavMenu.classList.contains('hidden')) {
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
          } else {
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
          }
        });
        
        // Close mobile menu when clicking a link
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
          link.addEventListener('click', () => {
            mobileNavMenu.classList.add('hidden');
            const svg = mobileMenuBtn.querySelector('svg');
            svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>';
          });
        });
      }

      // Navigation Menu - Smooth Scrolling
      const navLinks = document.querySelectorAll('.nav-link, .nav-link-saas, .mobile-nav-link');
      const contentArea = document.getElementById('content-area');
      const mobileViewport = document.getElementById('mobile-viewport');
      const scrollContainer = contentArea || mobileViewport;

      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();

          const targetId = link.getAttribute('href').substring(1);
          const targetSection = document.getElementById(targetId);

          if (targetSection && scrollContainer) {
            // Calculate scroll position using getBoundingClientRect for accurate positioning
            const containerRect = scrollContainer.getBoundingClientRect();
            const sectionRect = targetSection.getBoundingClientRect();
            const currentScroll = scrollContainer.scrollTop;
            
            // Calculate the target scroll position
            // sectionRect.top is relative to viewport, containerRect.top is relative to viewport
            // We need the position relative to the scroll container
            const targetTop = currentScroll + (sectionRect.top - containerRect.top) - 80; // Account for sticky header (64px + padding)

            scrollContainer.scrollTo({
              top: Math.max(0, targetTop),
              behavior: 'smooth'
            });
          }

          // Update active link
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        });
      });

      // Active section tracking on scroll
      let ticking = false;

      const updateActiveLink = () => {
        if (!scrollContainer) return;

        const sections = ['about', 'projects', 'skills', 'contact'];
        const scrollPosition = scrollContainer.scrollTop + 100; // Offset for sticky nav

        let currentSection = 'about';

        for (const sectionId of sections) {
          const section = document.getElementById(sectionId);
          if (section) {
            // Calculate section position relative to scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = scrollContainer.scrollTop + (sectionRect.top - containerRect.top);
            
            if (sectionTop <= scrollPosition) {
              currentSection = sectionId;
            }
          }
        }

        // Update active nav link
        navLinks.forEach(link => {
          const href = link.getAttribute('href').substring(1);
          if (href === currentSection) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        ticking = false;
      };

      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', () => {
          if (!ticking) {
            window.requestAnimationFrame(updateActiveLink);
            ticking = true;
          }
        });
      }

      // DevTools functionality
      const devtools = document.getElementById('devtools');
      const consoleOutput = document.getElementById('console-output');
      const consoleInput = document.getElementById('console-input');
      const clearConsoleBtn = document.getElementById('clear-console');
      const closeDevToolsBtn = document.getElementById('close-devtools');
      const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
      const devtoolsTabs = document.querySelectorAll('.devtools-tab');
      const resizer = document.getElementById('resizer');

      let commandHistory = [];
      let historyIndex = -1;

      // Intercept console methods
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalInfo = console.info;

      function addConsoleEntry(message, type = 'log') {
        const entry = document.createElement('div');
        entry.className = `console-entry ${type}`;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'console-message';
        messageDiv.textContent = String(message);

        entry.appendChild(messageDiv);
        consoleOutput.appendChild(entry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }

      // Override console methods to capture output
      console.log = function(...args) {
        originalLog.apply(console, args);
        addConsoleEntry(args.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' '), 'log');
      };

      console.error = function(...args) {
        originalError.apply(console, args);
        addConsoleEntry(args.join(' '), 'error');
      };

      console.warn = function(...args) {
        originalWarn.apply(console, args);
        addConsoleEntry(args.join(' '), 'warn');
      };

      console.info = function(...args) {
        originalInfo.apply(console, args);
        addConsoleEntry(args.join(' '), 'info');
      };

      // Execute JavaScript code
      function executeCode(code) {
        // Add command to output
        const commandEntry = document.createElement('div');
        commandEntry.className = 'console-entry command';
        commandEntry.innerHTML = `<div class="console-message">${code}</div>`;
        consoleOutput.appendChild(commandEntry);

        try {
          // Execute code in global scope
          const result = eval(code);

          // Show result
          if (result !== undefined) {
            const resultEntry = document.createElement('div');
            resultEntry.className = 'console-entry result';

            let displayValue;
            if (typeof result === 'object' && result !== null) {
              try {
                displayValue = JSON.stringify(result, null, 2);
              } catch (e) {
                displayValue = String(result);
              }
            } else {
              displayValue = String(result);
            }

            resultEntry.innerHTML = `<div class="console-message">${displayValue}</div>`;
            consoleOutput.appendChild(resultEntry);
          }
        } catch (error) {
          addConsoleEntry(error.message, 'error');
        }

        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }

      // Console input handling
      consoleInput.addEventListener('keydown', (e) => {
        // Stop propagation to prevent global handlers from interfering
        e.stopPropagation();
        
        if (e.key === 'Enter') {
          e.preventDefault();
          const code = consoleInput.value.trim();

          if (code) {
            commandHistory.push(code);
            historyIndex = commandHistory.length;
            executeCode(code);
            consoleInput.value = '';
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (historyIndex > 0) {
            historyIndex--;
            consoleInput.value = commandHistory[historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            consoleInput.value = commandHistory[historyIndex];
          } else {
            historyIndex = commandHistory.length;
            consoleInput.value = '';
          }
        }
      });

      // Also handle input event to ensure typing works
      consoleInput.addEventListener('input', (e) => {
        e.stopPropagation();
      });

      // Clear console
      clearConsoleBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = '';
        addConsoleEntry('Console cleared', 'info');
      });

      // Toggle DevTools with F12
      closeDevToolsBtn.addEventListener('click', () => {
        devtools.classList.toggle('hidden');
      });

      // Mobile toggle button
      const mobileToggleBtnDevTools = document.getElementById('mobile-toggle-btn');
      mobileToggleBtnDevTools?.addEventListener('click', () => {
        if (window.chromeBrowser) {
          window.chromeBrowser.toggleMobileView();
        } else {
          console.error('chromeBrowser not found');
        }
      });

      // DevTools menu
      const devtoolsMenuBtn = document.getElementById('devtools-menu-btn');
      const devtoolsMenuDropdown = document.getElementById('devtools-menu-dropdown');
      
      devtoolsMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = devtoolsMenuDropdown.classList.contains('hidden');
        
        if (isHidden) {
          // Position menu below button
          const buttonRect = devtoolsMenuBtn.getBoundingClientRect();
          devtoolsMenuDropdown.style.top = `${buttonRect.bottom + 4}px`;
          devtoolsMenuDropdown.style.left = `${buttonRect.right - 240}px`; // Align to right
          devtoolsMenuDropdown.classList.remove('hidden');
        } else {
          devtoolsMenuDropdown.classList.add('hidden');
        }
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (devtoolsMenuDropdown && !devtoolsMenuDropdown.contains(e.target) && !devtoolsMenuBtn?.contains(e.target)) {
          devtoolsMenuDropdown.classList.add('hidden');
        }
      });

      // Handle dock side changes
      document.querySelectorAll('.devtools-menu-item[data-dock]').forEach(item => {
        item.addEventListener('click', () => {
          const dockSide = item.dataset.dock;
          if (window.chromeBrowser) {
            window.chromeBrowser.setDevToolsDock(dockSide);
          }
          devtoolsMenuDropdown.classList.add('hidden');
        });
      });

      document.addEventListener('keydown', (e) => {
        // Don't interfere with input fields
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }

        if (e.key === 'F12') {
          e.preventDefault();
          devtools.classList.toggle('hidden');
        }
      });

      // DevTools tabs switching
      devtoolsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const panelId = tab.getAttribute('data-panel') + '-panel';

          // Update active tab
          devtoolsTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          // Show corresponding panel
          document.querySelectorAll('.devtools-panel').forEach(panel => {
            panel.classList.remove('active');
          });
          document.getElementById(panelId)?.classList.add('active');
          
          // Initialize panels when opened
          if (panelId === 'performance-panel') {
            setTimeout(() => initPerformancePanel(), 100);
          } else if (panelId === 'network-panel') {
            setTimeout(() => initNetworkPanel(), 100);
          } else if (panelId === 'elements-panel') {
            setTimeout(() => initElementsPanel(), 100);
          } else if (panelId === 'sources-panel') {
            setTimeout(() => initSourcesPanel(), 100);
          }
        });
      });

      // Sources Panel
      function initSourcesPanel() {
        // View Page Source button
        const viewSourceBtn = document.getElementById('view-page-source-btn');
        const indexHtmlFile = document.getElementById('index-html-file');

        if (viewSourceBtn && !viewSourceBtn.dataset.initialized) {
          viewSourceBtn.dataset.initialized = 'true';
          viewSourceBtn.addEventListener('click', () => {
            if (window.chromeBrowser) {
              window.chromeBrowser.viewPageSource();
            }
          });
        }

        // File selection
        if (indexHtmlFile && !indexHtmlFile.dataset.initialized) {
          indexHtmlFile.dataset.initialized = 'true';
          indexHtmlFile.addEventListener('click', () => {
            showSourceInViewer();
          });
        }
      }

      function showSourceInViewer() {
        const viewer = document.querySelector('.sources-viewer');
        const indexHtmlFile = document.getElementById('index-html-file');

        if (!viewer) return;

        // Mark file as active
        document.querySelectorAll('.sources-file').forEach(f => f.classList.remove('active'));
        indexHtmlFile?.classList.add('active');

        // Get HTML content
        const htmlContent = document.documentElement.outerHTML;
        const lines = htmlContent.split('\n');
        const lineCount = lines.length;

        // For large files (>1000 lines), use plain text without syntax highlighting
        if (lineCount > 1000) {
          viewer.innerHTML = `
            <div style="padding: 12px; background: #2d2d2d; border-bottom: 1px solid #3c3c3c; color: #d4d4d4; font-size: 12px;">
              <strong>Large file detected (${lineCount} lines)</strong> - Syntax highlighting disabled for performance
              <button onclick="copySourceToClipboard()" style="margin-left: 12px; padding: 4px 8px; background: #3c9ae8; border: none; color: white; border-radius: 3px; cursor: pointer; font-size: 11px;">
                Copy to Clipboard
              </button>
            </div>
            <pre class="sources-code" id="plain-source-code" style="margin: 0; padding: 12px; white-space: pre; overflow: auto; color: #d4d4d4; line-height: 1.5;">${escapeHtmlForSources(htmlContent)}</pre>
          `;
        } else {
          // For smaller files, use syntax highlighting
          const escaped = escapeHtmlForSources(htmlContent);
          const highlighted = lines.map((line, index) => {
            const lineNum = index + 1;
            const coloredLine = highlightHtmlSyntaxForSources(escapeHtmlForSources(line));
            return `<span class="chrome-view-source-line"><span class="chrome-view-source-line-number">${lineNum}</span>${coloredLine}</span>`;
          }).join('\n');
          viewer.innerHTML = `<pre class="sources-code">${highlighted}</pre>`;
        }
      }

      // Global function for copy button
      window.copySourceToClipboard = function() {
        const htmlContent = document.documentElement.outerHTML;
        navigator.clipboard.writeText(htmlContent).then(() => {
          if (window.chromeBrowser) {
            window.chromeBrowser.showNotification('Source copied to clipboard!');
          } else {
            alert('Source copied to clipboard!');
          }
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      };

      function escapeHtmlForSources(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
      }

      function highlightHtmlSyntaxForSources(line) {
        return line
          .replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi, '<span class="source-doctype">$1</span>')
          .replace(/(&lt;!--.*?--&gt;)/g, '<span class="source-comment">$1</span>')
          .replace(/(&lt;\/?[\w-]+)/g, '<span class="source-tag">$1</span>')
          .replace(/(&gt;)/g, '<span class="source-tag">$1</span>')
          .replace(/([\w-]+)=/g, '<span class="source-attr">$1</span>=')
          .replace(/=&quot;([^&]*)&quot;/g, '=<span class="source-string">&quot;$1&quot;</span>')
          .replace(/=&#39;([^&]*)&#39;/g, '=<span class="source-string">&#39;$1&#39;</span>');
      }

      // Performance Monitoring
      let performanceData = {
        loadTime: 0,
        domTime: 0,
        memory: 0,
        fps: 60,
        isRecording: false
      };

      function initPerformancePanel() {
        const loadTimeEl = document.getElementById('load-time');
        const domTimeEl = document.getElementById('dom-time');
        const memoryEl = document.getElementById('memory-usage');
        const fpsEl = document.getElementById('fps');
        const recordBtn = document.getElementById('record-performance');
        const clearBtn = document.getElementById('clear-performance');
        const timelineBar = document.getElementById('timeline-bar');
        const timelineEvents = document.getElementById('timeline-events');

        if (!loadTimeEl) return;

        // Calculate initial metrics
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          const domTime = timing.domContentLoadedEventEnd - timing.navigationStart;
          
          performanceData.loadTime = loadTime;
          performanceData.domTime = domTime;
          
          loadTimeEl.textContent = formatTime(loadTime);
          domTimeEl.textContent = formatTime(domTime);
          
          // Update timeline
          timelineBar.style.width = '100%';
          
          // Add timeline events
          addTimelineEvent(timelineEvents, 'Navigation Start', '0 ms');
          addTimelineEvent(timelineEvents, 'DOM Content Loaded', formatTime(domTime));
          addTimelineEvent(timelineEvents, 'Page Load', formatTime(loadTime));
        }

        // Simulate memory usage
        if (performance.memory) {
          const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
          performanceData.memory = memoryMB;
          memoryEl.textContent = memoryMB + ' MB';
        } else {
          // Simulated memory
          const simulatedMemory = (Math.random() * 50 + 20).toFixed(2);
          performanceData.memory = simulatedMemory;
          memoryEl.textContent = simulatedMemory + ' MB';
        }

        // FPS monitoring
        let lastTime = performance.now();
        let frameCount = 0;
        let fpsInterval = 1000;

        function updateFPS() {
          frameCount++;
          const currentTime = performance.now();
          
          if (currentTime >= lastTime + fpsInterval) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            performanceData.fps = fps;
            fpsEl.textContent = fps;
            frameCount = 0;
            lastTime = currentTime;
          }
          
          if (performanceData.isRecording) {
            requestAnimationFrame(updateFPS);
          }
        }

        if (recordBtn) {
          recordBtn.addEventListener('click', () => {
            performanceData.isRecording = !performanceData.isRecording;
            recordBtn.classList.toggle('active');
            recordBtn.textContent = performanceData.isRecording ? 'Stop' : 'Record';
            
            if (performanceData.isRecording) {
              updateFPS();
            }
          });
        }

        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            if (timelineEvents) timelineEvents.innerHTML = '';
            if (timelineBar) timelineBar.style.width = '0%';
          });
        }

        // Update memory periodically
        setInterval(() => {
          if (performance.memory && memoryEl) {
            const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            memoryEl.textContent = memoryMB + ' MB';
          }
        }, 2000);
      }

      function formatTime(ms) {
        if (ms < 1000) return ms + ' ms';
        return (ms / 1000).toFixed(2) + ' s';
      }

      function addTimelineEvent(container, label, value) {
        if (!container) return;
        const event = document.createElement('div');
        event.className = 'timeline-event';
        event.innerHTML = `
          <span class="timeline-event-label">${label}</span>
          <span class="timeline-event-value">${value}</span>
        `;
        container.appendChild(event);
      }

      // Network Monitoring
      let networkRequests = [];
      let isRecordingNetwork = true;

      function initNetworkPanel() {
        const clearBtn = document.getElementById('clear-network');
        const recordBtn = document.getElementById('record-network');
        const filterInput = document.getElementById('network-filter');
        const tableBody = document.getElementById('network-table-body');

        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const url = args[0];
          const startTime = performance.now();
          
          return originalFetch.apply(this, args)
            .then(response => {
              const endTime = performance.now();
              const duration = endTime - startTime;
              
              if (isRecordingNetwork) {
                addNetworkRequest({
                  url: typeof url === 'string' ? url : url.url,
                  method: 'GET',
                  status: response.status,
                  type: getResourceType(url),
                  size: response.headers.get('content-length') || '0',
                  time: duration.toFixed(2)
                });
              }
              
              return response;
            })
            .catch(error => {
              if (isRecordingNetwork) {
                addNetworkRequest({
                  url: typeof url === 'string' ? url : url.url,
                  method: 'GET',
                  status: 'Error',
                  type: 'error',
                  size: '0',
                  time: '0'
                });
              }
              throw error;
            });
        };

        // Add initial page load requests
        if (window.performance && window.performance.getEntriesByType) {
          const resources = performance.getEntriesByType('resource');
          resources.forEach(resource => {
            addNetworkRequest({
              url: resource.name,
              method: 'GET',
              status: 200,
              type: getResourceType(resource.name),
              size: formatBytes(resource.transferSize || 0),
              time: resource.duration.toFixed(2)
            });
          });
        }

        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            networkRequests = [];
            if (tableBody) {
              tableBody.innerHTML = '<div class="network-empty">No network activity. Requests will appear here.</div>';
            }
          });
        }

        if (recordBtn) {
          recordBtn.addEventListener('click', () => {
            isRecordingNetwork = !isRecordingNetwork;
            recordBtn.classList.toggle('active');
            recordBtn.textContent = isRecordingNetwork ? 'Record' : 'Stop';
          });
        }

        if (filterInput) {
          filterInput.addEventListener('input', (e) => {
            filterNetworkRequests(e.target.value);
          });
        }
      }

      function addNetworkRequest(request) {
        networkRequests.push(request);
        updateNetworkTable();
      }

      function updateNetworkTable(filter = '') {
        const tableBody = document.getElementById('network-table-body');
        if (!tableBody) return;

        const filtered = filter 
          ? networkRequests.filter(r => r.url.toLowerCase().includes(filter.toLowerCase()))
          : networkRequests;

        if (filtered.length === 0) {
          tableBody.innerHTML = '<div class="network-empty">No network activity. Requests will appear here.</div>';
          return;
        }

        tableBody.innerHTML = filtered.map((req, index) => {
          const fileName = req.url.split('/').pop().split('?')[0] || req.url;
          const statusClass = req.status >= 400 || req.status === 'Error' ? 'error' : '';
          
          return `
            <div class="network-row" data-index="${index}">
              <div class="network-col-name" title="${req.url}">${fileName}</div>
              <div class="network-col-status ${statusClass}">${req.status}</div>
              <div class="network-col-type">${req.type}</div>
              <div class="network-col-size">${req.size}</div>
              <div class="network-col-time">${req.time} ms</div>
            </div>
          `;
        }).join('');
      }

      function filterNetworkRequests(filter) {
        updateNetworkTable(filter);
      }

      function getResourceType(url) {
        if (!url) return 'other';
        const urlStr = typeof url === 'string' ? url : url.toString();
        const ext = urlStr.split('.').pop().split('?')[0].toLowerCase();
        if (['js', 'mjs'].includes(ext)) return 'script';
        if (['css'].includes(ext)) return 'stylesheet';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
        if (['woff', 'woff2', 'ttf', 'otf'].includes(ext)) return 'font';
        if (urlStr.includes('api') || urlStr.includes('json')) return 'xhr';
        return 'document';
      }

      function formatBytes(bytes) {
        if (bytes === 0 || bytes === '0') return '0 B';
        const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
        if (isNaN(numBytes)) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(numBytes) / Math.log(k));
        return Math.round(numBytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
      }

      // Elements Panel - DOM Inspector
      let selectedElement = null;
      let isSelectingElement = false;

      function initElementsPanel() {
        const treeContainer = document.getElementById('elements-tree');
        const propertiesPanel = document.getElementById('elements-properties');
        const refreshBtn = document.getElementById('refresh-elements');
        const selectBtn = document.getElementById('select-element');
        const filterInput = document.getElementById('elements-filter');

        if (!treeContainer) return;

        // Build DOM tree - start with content area or portfolio/blog sections only
        treeContainer.innerHTML = '<div style="padding: 12px; color: #9d9d9d; font-size: 12px;">Loading DOM tree...</div>';

        setTimeout(() => {
          treeContainer.innerHTML = '';
          const targetElement = document.querySelector('.chrome-content') ||
                               document.getElementById('portfolio-content') ||
                               document.getElementById('blog-content') ||
                               document.body;

          // Only render first 2 levels by default for performance
          buildDOMTree(treeContainer, targetElement, 0, 2);
        }, 100);

        // Refresh button
        if (refreshBtn && !refreshBtn.dataset.initialized) {
          refreshBtn.dataset.initialized = 'true';
          refreshBtn.addEventListener('click', () => {
            treeContainer.innerHTML = '<div style="padding: 12px; color: #9d9d9d; font-size: 12px;">Refreshing...</div>';
            setTimeout(() => {
              treeContainer.innerHTML = '';
              const targetElement = document.querySelector('.chrome-content') ||
                                   document.getElementById('portfolio-content') ||
                                   document.getElementById('blog-content') ||
                                   document.body;
              buildDOMTree(treeContainer, targetElement, 0, 2);
            }, 100);
          });
        }

        // Select element button
        if (selectBtn && !selectBtn.dataset.initialized) {
          selectBtn.dataset.initialized = 'true';
          selectBtn.addEventListener('click', () => {
            isSelectingElement = !isSelectingElement;
            selectBtn.classList.toggle('active');

            if (isSelectingElement) {
              enableElementSelection();
            } else {
              disableElementSelection();
            }
          });
        }

        // Filter input
        if (filterInput && !filterInput.dataset.initialized) {
          filterInput.dataset.initialized = 'true';
          filterInput.addEventListener('input', (e) => {
            filterDOMTree(e.target.value);
          });
        }
      }

      function buildDOMTree(container, element, level = 0, maxDepth = 2) {
        if (!element || element.id === 'devtools' || element.id === 'chrome-window' ||
            element.classList?.contains('chrome-devtools') || element.classList?.contains('chrome-window') ||
            element.classList?.contains('chrome-view-source-modal') || element.classList?.contains('chrome-page-context-menu')) {
          return;
        }

        // Skip if we've exceeded max depth
        if (level >= maxDepth && maxDepth !== -1) {
          return;
        }

        const node = document.createElement('div');
        node.className = 'element-node';
        node.dataset.elementId = element.id || '';
        node.style.paddingLeft = (level * 16) + 'px';

        const children = Array.from(element.children).filter(child => {
          return child.id !== 'devtools' && child.id !== 'chrome-window' &&
                 !child.classList?.contains('chrome-devtools') &&
                 !child.classList?.contains('chrome-window') &&
                 !child.classList?.contains('chrome-view-source-modal') &&
                 !child.classList?.contains('chrome-page-context-menu');
        });
        const hasChildren = children.length > 0;
        const atMaxDepth = level === maxDepth - 1 && maxDepth !== -1;
        const hasText = element.childNodes.length > 0 && 
          Array.from(element.childNodes).some(node => 
            node.nodeType === 3 && node.textContent.trim().length > 0
          );

        // Expander
        const expander = document.createElement('span');
        expander.className = 'element-expander' + (hasChildren ? '' : ' empty');
        if (hasChildren) {
          expander.addEventListener('click', (e) => {
            e.stopPropagation();
            // If at max depth and children not loaded yet, load them now
            if (atMaxDepth && childrenContainer.children.length === 0) {
              children.forEach(child => {
                buildDOMTree(childrenContainer, child, level + 1, -1); // -1 = no limit
              });
            }
            toggleElementNode(expander, childrenContainer);
          });
        }

        // Tag name
        const tagSpan = document.createElement('span');
        tagSpan.className = 'element-tag';
        tagSpan.textContent = '<' + element.tagName.toLowerCase();

        // Attributes
        const attrs = [];
        if (element.id) {
          attrs.push(`<span class="element-attr-name">id</span>="<span class="element-attr-value">${element.id}</span>"`);
        }
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.trim();
          if (classes) {
            attrs.push(`<span class="element-attr-name">class</span>="<span class="element-attr-value">${classes}</span>"`);
          }
        }
        // Add other common attributes
        ['href', 'src', 'type', 'role', 'aria-label'].forEach(attr => {
          if (element.hasAttribute(attr)) {
            attrs.push(`<span class="element-attr-name">${attr}</span>="<span class="element-attr-value">${element.getAttribute(attr)}</span>"`);
          }
        });

        const attrsSpan = document.createElement('span');
        if (attrs.length > 0) {
          attrsSpan.innerHTML = ' ' + attrs.join(' ');
        }
        attrsSpan.innerHTML += '>';

        // Click handler
        node.addEventListener('click', (e) => {
          if (e.target.classList.contains('element-expander')) return;
          selectElement(element, node);
        });

        node.appendChild(expander);
        node.appendChild(tagSpan);
        node.appendChild(attrsSpan);

        // Children container
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'element-children';

        // Only build children if we haven't reached max depth
        if (hasChildren && !atMaxDepth) {
          children.forEach(child => {
            buildDOMTree(childrenContainer, child, level + 1, maxDepth);
          });
        } else if (hasChildren && atMaxDepth) {
          // Add placeholder to show there are more children (will load on expand)
          const placeholder = document.createElement('div');
          placeholder.style.paddingLeft = ((level + 1) * 16) + 'px';
          placeholder.style.color = '#9d9d9d';
          placeholder.style.fontSize = '12px';
          placeholder.style.fontStyle = 'italic';
          placeholder.textContent = `... ${children.length} more child${children.length !== 1 ? 'ren' : ''} (click to load)`;
          childrenContainer.appendChild(placeholder);
        }

        // Text content (if any and no children)
        if (hasText && !hasChildren) {
          const textNode = element.childNodes[0];
          if (textNode && textNode.nodeType === 3) {
            const text = textNode.textContent.trim();
            if (text && text.length < 50) {
              const textSpan = document.createElement('span');
              textSpan.className = 'element-text';
              textSpan.textContent = text;
              node.appendChild(textSpan);
            }
          }
        }

        // Closing tag
        const closeTag = document.createElement('span');
        closeTag.className = 'element-tag';
        closeTag.textContent = '</' + element.tagName.toLowerCase() + '>';
        node.appendChild(closeTag);

        container.appendChild(node);
        if (hasChildren) {
          container.appendChild(childrenContainer);
        }
      }

      function toggleElementNode(expander, childrenContainer) {
        expander.classList.toggle('expanded');
        childrenContainer.classList.toggle('expanded');
      }

      function selectElement(element, nodeElement) {
        // Remove previous selection
        document.querySelectorAll('.element-node.selected').forEach(node => {
          node.classList.remove('selected');
        });

        // Add selection
        nodeElement.classList.add('selected');
        selectedElement = element;

        // Show properties
        showElementProperties(element);
      }

      function showElementProperties(element) {
        const propertiesPanel = document.getElementById('elements-properties');
        if (!propertiesPanel) return;

        const props = {
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          classes: element.className ? element.className.split(' ').filter(c => c.trim()) : [],
          attributes: {},
          styles: {},
          dimensions: {}
        };

        // Get all attributes
        Array.from(element.attributes).forEach(attr => {
          props.attributes[attr.name] = attr.value;
        });

        // Get computed styles
        const computed = window.getComputedStyle(element);
        props.styles = {
          'display': computed.display,
          'position': computed.position,
          'width': computed.width,
          'height': computed.height,
          'margin': computed.margin,
          'padding': computed.padding,
          'color': computed.color,
          'background-color': computed.backgroundColor,
          'font-size': computed.fontSize,
          'font-family': computed.fontFamily
        };

        // Get dimensions
        const rect = element.getBoundingClientRect();
        props.dimensions = {
          'width': Math.round(rect.width) + 'px',
          'height': Math.round(rect.height) + 'px',
          'x': Math.round(rect.x) + 'px',
          'y': Math.round(rect.y) + 'px'
        };

        // Render properties
        let html = '';

        // Basic Info
        html += '<div class="property-section">';
        html += '<div class="property-section-title">Element</div>';
        html += `<div class="property-item"><span class="property-name">Tag</span><span class="property-value">${props.tag}</span></div>`;
        if (props.id) {
          html += `<div class="property-item"><span class="property-name">ID</span><span class="property-value">${props.id}</span></div>`;
        }
        if (props.classes.length > 0) {
          html += '<div class="property-item"><span class="property-name">Classes</span></div>';
          html += '<div class="property-classes">';
          props.classes.forEach(cls => {
            html += `<span class="property-class">${cls}</span>`;
          });
          html += '</div>';
        }
        html += '</div>';

        // Dimensions
        html += '<div class="property-section">';
        html += '<div class="property-section-title">Dimensions</div>';
        Object.entries(props.dimensions).forEach(([key, value]) => {
          html += `<div class="property-item"><span class="property-name">${key}</span><span class="property-value">${value}</span></div>`;
        });
        html += '</div>';

        // Styles
        html += '<div class="property-section">';
        html += '<div class="property-section-title">Computed Styles</div>';
        Object.entries(props.styles).forEach(([key, value]) => {
          if (value && value !== 'none' && value !== 'normal') {
            html += `<div class="property-item"><span class="property-name">${key}</span><span class="property-value">${value}</span></div>`;
          }
        });
        html += '</div>';

        // Attributes
        if (Object.keys(props.attributes).length > 0) {
          html += '<div class="property-section">';
          html += '<div class="property-section-title">Attributes</div>';
          Object.entries(props.attributes).forEach(([key, value]) => {
            if (key !== 'class' && key !== 'id') {
              html += `<div class="property-item"><span class="property-name">${key}</span><span class="property-value">${value}</span></div>`;
            }
          });
          html += '</div>';
        }

        propertiesPanel.innerHTML = html;
      }

      function enableElementSelection() {
        document.body.style.cursor = 'crosshair';
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
          contentArea.style.pointerEvents = 'auto';
        }

        const handler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const element = e.target;
          if (element.id === 'devtools' || element.id === 'chrome-window' ||
              element.closest('#devtools') || element.closest('#chrome-window')) {
            return;
          }

          // Find the corresponding node in the tree
          const nodes = document.querySelectorAll('.element-node');
          let found = false;
          nodes.forEach(node => {
            if (node.dataset.elementId && node.dataset.elementId === element.id) {
              selectElement(element, node);
              node.scrollIntoView({ behavior: 'smooth', block: 'center' });
              found = true;
            }
          });

          // If not found by ID, try to find by traversing
          if (!found) {
            let current = element;
            while (current && current !== document.body) {
              if (current.id) {
                nodes.forEach(node => {
                  if (node.dataset.elementId === current.id) {
                    selectElement(current, node);
                    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    found = true;
                  }
                });
                if (found) break;
              }
              current = current.parentElement;
            }
          }

          disableElementSelection();
        };

        document.addEventListener('click', handler, true);
        window._elementSelectionHandler = handler;
      }

      function disableElementSelection() {
        document.body.style.cursor = '';
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
          contentArea.style.pointerEvents = '';
        }

        if (window._elementSelectionHandler) {
          document.removeEventListener('click', window._elementSelectionHandler, true);
          window._elementSelectionHandler = null;
        }

        const selectBtn = document.getElementById('select-element');
        if (selectBtn) {
          selectBtn.classList.remove('active');
        }
        isSelectingElement = false;
      }

      function filterDOMTree(filter) {
        const nodes = document.querySelectorAll('.element-node');
        if (!filter) {
          nodes.forEach(node => {
            node.style.display = '';
          });
          return;
        }

        const filterLower = filter.toLowerCase();
        nodes.forEach(node => {
          const tag = node.querySelector('.element-tag')?.textContent || '';
          const attrs = node.textContent || '';
          if (tag.toLowerCase().includes(filterLower) || attrs.toLowerCase().includes(filterLower)) {
            node.style.display = '';
            // Expand parent nodes
            let parent = node.parentElement;
            while (parent && parent.classList.contains('element-children')) {
              const expander = parent.previousElementSibling?.querySelector('.element-expander');
              if (expander && !expander.classList.contains('expanded')) {
                expander.click();
              }
              parent = parent.parentElement;
            }
          } else {
            node.style.display = 'none';
          }
        });
      }

      // Resizable splitter
      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = devtools.offsetWidth;
        resizer.classList.add('resizing');
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaX = startX - e.clientX;
        const newWidth = Math.max(300, Math.min(1200, startWidth + deltaX));
        devtools.style.width = newWidth + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          resizer.classList.remove('resizing');
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      });
    });
