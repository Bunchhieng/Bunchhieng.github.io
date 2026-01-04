# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **personal portfolio and blog website** hosted on GitHub Pages. It's a static site using vanilla JavaScript with no build process required. The main feature is an interactive Chrome browser simulator UI that serves as the portfolio interface.

## Technology Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Tailwind CSS (via CDN)
- **Blog**: Markdown files rendered client-side with marked.js
- **Deployment**: GitHub Pages
- **No build tools**: All dependencies loaded from CDN

## Development Workflow

### Running Locally

Since this is a static site with no build process:

1. **No local server needed**: Simply open `index.html` (or any HTML file) directly in a new Chrome browser window.

2. **Open in browser**: Right-click the file and select "Open with" > "Google Chrome", or drag the file into a Chrome window.

3. **No build step required**: Changes to HTML/CSS/JS are immediately visible on page refresh.

### Deployment

Deployment happens automatically via GitHub Pages when pushing to the `main` branch. No manual deployment steps needed.

## Code Architecture

### Main Portfolio Page (`index.html`)

The portfolio uses a **Chrome browser simulator** as its primary UI metaphor. Key architectural components:

#### ChromeBrowserSimulator Class
The main class that orchestrates all browser simulation features:
- **Navigation system**: Back/forward buttons, URL bar, browsing history
- **Tab management**: Multiple tabs with content switching
- **Downloads manager**: Simulated download tracking with localStorage persistence
- **Bookmarks system**: Add/remove/organize bookmarks
- **Extension system**: Display and manage simulated Chrome extensions
- **Developer Tools**: Built-in DevTools panel with DOM inspector

#### DevTools Panel Architecture
Located in `index.html` around line 5000+, features:
- **DOM tree viewer**: Recursive rendering of element hierarchy
- **Element inspector**: Click-to-select elements on the page
- **Property inspector**: Display dimensions, styles, and attributes
- **Filter system**: Search/filter elements in the tree
- **Resizable panel**: Drag splitter to adjust panel size

#### State Management
- Uses **class properties** for state (no external state management)
- **localStorage** for persistence: history, downloads, bookmarks, extensions
- Event-driven updates with **addEventListener** patterns

#### Responsive Design
- **Desktop view**: Fixed chrome window (85vw × 90vh) with full browser simulation
- **Mobile view**: Full-screen mobile browser UI with touch-optimized controls
- Separate CSS classes: `chrome-window` (desktop) vs `chrome-mobile-window` (mobile)

### Blog System (`blog.html`)

Simple markdown-based blog with client-side rendering:

#### Architecture
- **Blog metadata** stored in JavaScript array at top of `blog.html`
- **Markdown files** in `/blog/posts/` directory
- **Client-side rendering** using marked.js library
- **Two view states**: List view (all posts) and single post view

#### Adding New Blog Posts

1. Create markdown file: `/blog/posts/my-new-post.md`
2. Add metadata to `blogPosts` array in `blog.html`:
   ```javascript
   {
     slug: 'my-new-post',
     title: 'My New Post',
     date: '2026-01-20',
     excerpt: 'Brief description',
     tags: ['tag1', 'tag2']
   }
   ```

## Key Implementation Patterns

### 1. Client-Side Only Architecture
- All logic runs in the browser
- No server-side processing
- Markdown files fetched via `fetch()` API
- CDN dependencies (no npm packages)

### 2. localStorage Persistence Pattern
```javascript
// Save data
localStorage.setItem('key', JSON.stringify(data));

// Load data
const data = JSON.parse(localStorage.getItem('key') || '[]');
```

Used for: browsing history, downloads, bookmarks, extensions, DevTools state

### 3. DOM Manipulation Pattern
Direct DOM manipulation with vanilla JS:
```javascript
const element = document.querySelector('.selector');
element.innerHTML = '...';
element.addEventListener('click', handler);
```

### 4. Mobile-First Responsive
Media queries and separate UI components for mobile:
- Desktop: Full browser chrome with tabs, URL bar, etc.
- Mobile: Simplified mobile browser UI with bottom navigation
- Viewport-based sizing (vw/vh units)

## File Organization

```
/
├── index.html              # Main portfolio (7,337 lines)
│                          # Contains ChromeBrowserSimulator class
│                          # Includes all portfolio content and logic
│
├── blog.html              # Blog system (315 lines)
│                          # Handles markdown loading and rendering
│
├── blog/
│   ├── README.md          # Blog system documentation
│   └── posts/
│       └── *.md           # Individual blog post markdown files
│
├── CLAUDE.md              # This file
└── README.md              # Project summary
```

## Important Notes

### No Build Process
- Don't suggest adding webpack, Vite, or other bundlers
- Don't suggest npm packages (everything is CDN-based)
- Changes are immediately testable by refreshing the browser

### GitHub Pages Constraints
- Static files only
- No server-side processing
- No Node.js runtime
- All dependencies must be CDN-loaded or inline

### Code Style
- **Vanilla JavaScript**: No JSX, no TypeScript
- **Inline styles and scripts**: All code embedded in HTML files
- **Class-based architecture**: Use ES6 classes for major features
- **Template literals**: Use backticks for HTML string building
- **Dark theme**: Maintain consistent Chrome Material Design colors

### Testing Changes
When modifying the Chrome simulator or blog system:
1. Test on desktop viewport (large screen)
2. Test on mobile viewport (small screen)
3. Verify localStorage persistence across page reloads
4. Check browser console for JavaScript errors

### Analytics and Monetization
- Google Analytics (GA-4) is integrated - don't remove tracking code
- Google AdSense is integrated - preserve ad unit divs
- SEO structured data (JSON-LD) present - maintain for search visibility
