# Sia

A simple, powerful static site generator built with JavaScript. Similar to Eleventy/11ty, Sia supports markdown, front matter, Nunjucks templates, and more.

## Features

- **Markdown & Front Matter** - Write content in markdown with YAML front matter
- **Nunjucks Templates** - Flexible templating with includes and layouts
- **Multiple Content Types** - Blog posts, pages, and notes (tweet-like short posts)
- **Tags & Categories** - Organize content with tags, auto-generated tag pages
- **Pagination** - Built-in pagination for listing pages
- **Image Support** - Automatic image copying and organization
- **Live Reload** - Development server with hot reloading
- **Themes** - Built-in themes (main, minimal) with light/dark mode toggle
- **RSS Feed** - Automatic RSS feed generation
- **YAML/JSON Config** - Flexible configuration options

## Quick Start

### Create a New Site

```bash
# Install Sia globally
npm install -g sia

# Create a new site
sia init my-blog

# Or create in current directory
sia init

# Non-interactive mode
sia init my-blog --yes
```

### Development

```bash
cd my-blog
npm install
npm run dev
```

Visit `http://localhost:3000` to see your site.

### Production Build

```bash
npm run build
```

The output will be in the `dist/` folder, ready to deploy to any static hosting.

## Creating Content

### New Blog Post

```bash
npx sia new post "My Post Title"
```

Creates a new markdown file in `src/posts/` with front matter template.

### New Page

```bash
npx sia new page "About Me"
```

Creates a new page in `src/pages/`.

### New Note

```bash
npx sia new note "Quick thought"
```

Creates a short note in `src/notes/`.

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

theme: main  # 'main' or 'minimal'

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
```

## Front Matter

Each markdown file can have YAML front matter:

```yaml
---
title: "My Post Title"
date: 2024-12-17
tags: [javascript, tutorial]
layout: post
permalink: /custom-url/
draft: true          # Excludes from build
excerpt: "Custom excerpt text"
---
```

### Supported Fields

| Field | Description |
|-------|-------------|
| `title` | Post/page title |
| `date` | Publication date |
| `tags` | Array of tags |
| `layout` | Template to use |
| `permalink` | Custom URL |
| `draft` | If true, excluded from build |
| `excerpt` | Custom excerpt |

## Templates

Sia uses Nunjucks for templating. Templates are loaded from:

1. `_layouts/` - Your custom layouts
2. `_includes/` - Your custom includes
3. Default templates (provided by Sia)

### Available Variables

In templates, you have access to:

- `site` - Site configuration (title, description, etc.)
- `page` - Current page data
- `content` - Rendered markdown content
- `collections` - All content collections
- `tags` - Tag data with counts
- `allTags` - Array of all tags

### Custom Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `date` | Format dates | `{{ page.date \| date('long') }}` |
| `slug` | Generate URL slug | `{{ title \| slug }}` |
| `excerpt` | Get excerpt | `{{ content \| excerpt(200) }}` |
| `limit` | Limit array | `{{ posts \| limit(5) }}` |
| `readingTime` | Estimate reading time | `{{ content \| readingTime }}` |
| `withTag` | Filter by tag | `{{ posts \| withTag('javascript') }}` |

## Customization

### Custom Layouts

Create `_layouts/post.njk` to override the default post layout:

```njk
{% extends "base.njk" %}

{% block content %}
<article>
  <h1>{{ page.title }}</h1>
  {{ content | safe }}
</article>
{% endblock %}
```

### Custom Styles

Create `styles/main.css` to override default styles. Your custom CSS will be used instead of the default theme.

### Custom Includes

Create `_includes/header.njk` to override the header, etc.

## CLI Commands

```bash
# Create a new site
sia init [directory]
sia init my-blog --yes  # Non-interactive

# Start development server
sia dev
sia dev --port 8080

# Build for production
sia build
sia build --clean

# Create new content
sia new post "Title"
sia new page "Title"
sia new note "Content"
```

## Upgrading

If you installed Sia as a dependency (recommended):

```bash
# Check for updates
npm outdated

# Upgrade to latest
npm update sia

# Or upgrade to specific version
npm install sia@2.0.0
```

## Deployment

After running `npm run build`, deploy the `dist/` folder to:

- **Netlify** - Drag and drop or connect to Git
- **Vercel** - Import project
- **GitHub Pages** - Push to `gh-pages` branch
- **Cloudflare Pages** - Connect repository
- **Any static host** - Upload the `dist/` folder

## License

MIT
