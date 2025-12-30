# Sia Documentation

Welcome to the Sia documentation. Sia is a simple, powerful static site generator built with JavaScript, featuring markdown content, Nunjucks templates, and multiple themes.

## Documentation

| Guide | Description |
|-------|-------------|
| [Template Reference](template-reference.md) | Nunjucks variables, filters, and template syntax |
| [Markdown Guide](markdown-guide.md) | Markdown syntax and all supported plugins |
| [Front Matter Reference](front-matter.md) | YAML front matter options for posts, pages, and notes |
| [Creating Themes](creating-themes.md) | How to create and customize themes |

## Quick Links

### Getting Started

```bash
# Install Sia globally
npm install -g @terrymooreii/sia

# Create a new site
sia init my-blog

# Start development server
cd my-blog
npm run dev
```

### Creating Content

```bash
# Create a new blog post
npx sia new post "My Post Title"

# Create a new page
npx sia new page "About Me"

# Create a short note
npx sia new note "Quick thought"
```

### Building for Production

```bash
npm run build
```

## Features Overview

- **Enhanced Markdown** - Syntax highlighting, emoji support, footnotes, alert boxes, auto-linkify, and more
- **Nunjucks Templates** - Flexible templating with includes, layouts, and custom filters
- **Multiple Content Types** - Blog posts, static pages, and notes (tweet-like short posts)
- **Tags & Categories** - Organize content with tags and auto-generated tag pages
- **Pagination** - Built-in pagination for listing pages
- **Image Support** - Automatic image copying and organization
- **Static Assets** - Support for favicons, fonts, and other static files
- **Live Reload** - Development server with hot reloading
- **Multiple Themes** - Built-in themes (main, minimal, developer, magazine) with light/dark mode
- **Custom Theme Packages** - Create and share themes as npm packages (`sia-theme-*`)
- **RSS Feed** - Automatic RSS feed generation
- **SEO Ready** - Open Graph and Twitter Card meta tags included

## Project Structure

```
my-site/
├── _config.yml          # Site configuration
├── src/
│   ├── posts/           # Blog posts (markdown)
│   │   └── 2024-12-17-my-post/
│   │       ├── index.md
│   │       └── (assets can go here)
│   ├── pages/           # Static pages
│   │   └── about/
│   │       ├── index.md
│   │       └── (assets can go here)
│   ├── notes/           # Short notes/tweets
│   │   └── 2024-12-17-note-1234567890/
│   │       ├── index.md
│   │       └── (assets can go here)
│   └── images/          # Images
├── assets/              # Static assets (optional)
├── static/              # Static assets (optional)
├── public/              # Static assets (optional)
├── favicon.ico          # Site favicon (optional)
├── _layouts/            # Custom layouts (optional)
├── _includes/           # Custom includes (optional)
├── styles/              # Custom CSS (optional)
└── dist/                # Generated output
```

Each post, page, and note is created as a folder containing an `index.md` file. This allows you to organize assets (images, PDFs, etc.) alongside your content in the same folder.

## Configuration

Edit `_config.yml` to customize your site:

```yaml
site:
  title: "My Blog"
  description: "A personal blog"
  url: "https://example.com"
  author: "Your Name"

theme:
  name: main  # Built-in: main, minimal, developer, magazine
              # Or use external: my-theme (loads sia-theme-my-theme)

input: src
output: dist

collections:
  posts:
    path: posts
    layout: post
    permalink: /blog/:slug/
    sortBy: date
    sortOrder: desc
  pages:
    path: pages
    layout: page
    permalink: /:slug/
  notes:
    path: notes
    layout: note
    permalink: /notes/:slug/

pagination:
  size: 10

server:
  port: 3000
  showDrafts: false

assets:
  css: []  # Custom CSS files (paths relative to root)
  js: []   # Custom JavaScript files (paths relative to root)
```

## Custom CSS and JavaScript

You can inject custom CSS and JavaScript files into your theme by defining them in `_config.yml`:

```yaml
assets:
  css:
    - custom/styles.css
    - vendor/library.css
  js:
    - custom/script.js
    - vendor/analytics.js
```

Files are specified as paths relative to your project root. During build, CSS files are copied to `dist/styles/` and JavaScript files to `dist/scripts/`, preserving directory structure. Custom CSS is injected after theme styles (allowing overrides), and JavaScript is injected before the closing `</body>` tag.

**Example:**
```yaml
assets:
  css:
    - assets/custom.css
    - vendor/prism.css
  js:
    - assets/analytics.js
    - vendor/prism.js
```

This will:
- Copy `assets/custom.css` → `dist/styles/assets/custom.css`
- Copy `vendor/prism.css` → `dist/styles/vendor/prism.css`
- Copy `assets/analytics.js` → `dist/scripts/assets/analytics.js`
- Copy `vendor/prism.js` → `dist/scripts/vendor/prism.js`

And inject them into all pages automatically.

## Static Assets

Sia automatically copies static assets during the build process. You can place static files in any of these locations:

- **`assets/`** - Place files in `assets/` at the project root
- **`static/`** - Place files in `static/` at the project root
- **`public/`** - Place files in `public/` at the project root
- **Root directory** - Place `favicon.ico` directly in the project root

All files from these directories will be copied to the `dist/` folder during build, preserving their directory structure.

### Supported File Types

Static assets include:
- **Favicons** - `.ico` files (favicon.ico can be in root or asset directories)
- **Fonts** - `.woff`, `.woff2`, `.ttf`, `.eot`
- **Documents** - `.pdf`, `.txt`, `.json`, `.xml`
- **Scripts** - `.js` files
- **Stylesheets** - `.css` files (though custom CSS is better placed in `styles/`)
- **Images** - All image formats (though images are better placed in `src/images/`)

### Example Structure

```
my-site/
├── assets/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   └── fonts/
│       └── custom-font.woff2
├── static/
│   └── documents/
│       └── resume.pdf
└── favicon.ico  # Also supported in root
```

During build, these will be copied to:
```
dist/
├── assets/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   └── fonts/
│       └── custom-font.woff2
├── static/
│   └── documents/
│       └── resume.pdf
└── favicon.ico
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `sia init [directory]` | Create a new site |
| `sia dev` | Start development server with live reload |
| `sia build` | Build for production |
| `sia new post "Title"` | Create a new blog post |
| `sia new page "Title"` | Create a new page |
| `sia new note "Content"` | Create a new note |
| `sia theme <name>` | Create a new theme package |

## License

MIT
