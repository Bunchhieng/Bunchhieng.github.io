# Blog System

This blog system uses markdown files and client-side rendering, perfect for GitHub Pages.

## How It Works

1. **Blog Posts**: Markdown files stored in `/blog/posts/`
2. **Blog Page**: `blog.html` loads and renders markdown files using [marked.js](https://marked.js.org/)
3. **Tab System**: The main portfolio page (`index.html`) includes a tab system that can open the blog in a new tab

## Adding New Blog Posts

1. Create a new markdown file in `/blog/posts/` with a `.md` extension
2. Use a descriptive filename (e.g., `my-new-post.md`)
3. Add the post metadata to the `blogPosts` array in `blog.html`:

```javascript
{
  slug: 'my-new-post',  // filename without .md
  title: 'My New Post',
  date: '2026-01-20',
  excerpt: 'A brief description of the post',
  tags: ['tag1', 'tag2']
}
```

## Markdown Support

The blog supports standard markdown syntax:
- Headers (# ## ###)
- **Bold** and *italic* text
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Links and images
- Blockquotes
- Tables

## GitHub Pages Compatibility

This setup works perfectly with GitHub Pages because:
- No build step required (client-side rendering)
- Static files only (HTML, CSS, JS, Markdown)
- Uses CDN for dependencies (marked.js, Tailwind CSS)
- No server-side processing needed

## File Structure

```
/
├── index.html          # Main portfolio page with tab system
├── blog.html          # Blog listing and post viewer
└── blog/
    └── posts/
        ├── welcome-to-my-blog.md
        └── building-scalable-web-apps.md
```

## Customization

- **Styling**: Edit the CSS in `blog.html` to match your brand
- **Layout**: Modify the HTML structure in `blog.html`
- **Features**: Add search, categories, or pagination by editing the JavaScript

## Future Enhancements

Potential improvements:
- RSS feed generation
- Post categories/tags filtering
- Search functionality
- Comments system (using GitHub Issues or external service)
- Syntax highlighting for code blocks (using highlight.js or Prism.js)

