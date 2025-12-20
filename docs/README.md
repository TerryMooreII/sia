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
- **Live Reload** - Development server with hot reloading
- **Multiple Themes** - Built-in themes (main, minimal, developer, magazine) with light/dark mode
- **RSS Feed** - Automatic RSS feed generation
- **SEO Ready** - Open Graph and Twitter Card meta tags included

## Project Structure

```
my-site/
├── _config.yml          # Site configuration
├── src/
│   ├── posts/           # Blog posts (markdown)
│   ├── pages/           # Static pages
│   ├── notes/           # Short notes/tweets
│   └── images/          # Images
├── _layouts/            # Custom layouts (optional)
├── _includes/           # Custom includes (optional)
├── styles/              # Custom CSS (optional)
└── dist/                # Generated output
```

## Configuration

Edit `_config.yml` to customize your site:

```yaml
site:
  title: "My Blog"
  description: "A personal blog"
  url: "https://example.com"
  author: "Your Name"

theme:
  name: main  # Options: main, minimal, developer, magazine

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

## License

MIT
