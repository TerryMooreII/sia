![Sia](./docs/imgs/logo-sia-t.png)
# Sia

A simple, powerful static site generator built with JavaScript. Similar to Eleventy/11ty, Sia supports markdown, front matter, Nunjucks templates, and more.

## Features

- **Enhanced Markdown** - Syntax highlighting, emoji support, footnotes, alert boxes, auto-linkify, and more
- **Markdown & Front Matter** - Write content in markdown with YAML front matter
- **Nunjucks Templates** - Flexible templating with includes and layouts
- **Multiple Content Types** - Blog posts, pages, and notes (tweet-like short posts)
- **Tags & Categories** - Organize content with tags, auto-generated tag pages
- **Pagination** - Built-in pagination for listing pages
- **Image Support** - Automatic image copying and organization
- **Static Assets** - Support for favicons, fonts, and other static files
- **Live Reload** - Development server with hot reloading
- **Themes** - Built-in themes (main, minimal, developer, magazine) with light/dark mode toggle
- **Custom Themes** - Create and share themes as npm packages (`sia-theme-*`)
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
├── assets/              # Static assets (optional)
├── static/              # Static assets (optional)
├── public/              # Static assets (optional)
├── favicon.ico          # Site favicon (optional)
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
  showDrafts: false  # Set to true to show draft posts in dev server
```

### Server Configuration

| Option | Description | Default |
|-------|-------------|---------|
| `port` | Port number for development server | `3000` |
| `showDrafts` | Show draft posts when using `sia dev` | `false` |

When `showDrafts` is set to `true`, draft posts (posts with `draft: true` in front matter) will be included in the development server build. This is useful for previewing draft content locally. Drafts are always excluded from production builds.

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
| `draft` | If true, excluded from build (unless `server.showDrafts` is enabled) |
| `excerpt` | Custom excerpt |

## Markdown Features

Sia supports enhanced markdown features beyond standard markdown:

### Syntax Highlighting

Code blocks are automatically highlighted using Highlight.js:

````markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

### Emoji Support

Use emoji shortcodes in your markdown:

```markdown
:smile: :rocket: :heart: :thumbsup:
```

Common emojis: `:smile:`, `:heart:`, `:thumbsup:`, `:fire:`, `:rocket:`, `:star:`, `:check:`, `:warning:`, and many more.

### Heading IDs

All headings automatically get ID attributes for anchor links:

```markdown
## My Heading
```

Becomes: `<h2 id="my-heading">My Heading</h2>`

You can link to headings within the same document:

```markdown
[Link to My Heading](#my-heading)
```

### Footnotes

Add footnotes to your content:

```markdown
This is a sentence with a footnote[^1].

[^1]: This is the footnote content.
```

### Typography Enhancements

Smart typography automatically converts:

- Straight quotes (`"` and `'`) to curly quotes (`"` `"` `'` `'`)
- Double hyphens (`--`) to en-dash (`–`)
- Triple hyphens (`---`) to em-dash (`—`)
- Three dots (`...`) to ellipsis (`…`)

### Alert Boxes

Create GitHub Flavored Markdown-style alert boxes:

```markdown
> [!NOTE]
> This is a note alert.

> [!TIP]
> This is a tip alert.

> [!WARNING]
> This is a warning alert.

> [!CAUTION]
> This is a caution alert.
```

### Auto-Linkify

Plain URLs are automatically converted to clickable links:

```markdown
Visit https://example.com for more info.
```

### Media Embeds

Sia automatically converts YouTube and Giphy URLs into responsive embeds.

#### YouTube Videos

YouTube videos can be embedded using any of these methods:

**As a markdown link:**
```markdown
[Watch this video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
```

**As a plain URL (auto-linked):**
```markdown
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Using short URL format:**
```markdown
https://youtu.be/dQw4w9WgXcQ
```

All of these formats are automatically converted to responsive YouTube embeds.

#### Giphy GIFs

Giphy GIFs can be embedded in two ways:

**As a direct image link (standard markdown):**
```markdown
![Alt text](https://media.giphy.com/media/ID/giphy.gif)
```

**As a Giphy share URL (auto-embedded):**
```markdown
[Check this out](https://giphy.com/gifs/ID)
```

Or just paste the URL:
```markdown
https://giphy.com/gifs/ID
```

Giphy share URLs are automatically converted to responsive embeds. Supported formats include:
- `https://giphy.com/gifs/ID`
- `https://gph.is/g/ID`
- `https://giphy.com/embed/ID`

### GitHub Flavored Markdown

Full GFM support including:

- Tables
- Task lists (`- [ ]` and `- [x]`)
- Strikethrough (`~~text~~`)
- And more

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

# Create a new theme package
sia theme my-theme
sia theme my-theme --quick  # Skip prompts
```

## Custom Theme Packages

Sia supports external themes distributed as npm packages. Theme packages must be named `sia-theme-{name}`.

### Using an External Theme

```bash
# Install the theme package
npm install sia-theme-awesome

# Configure in _config.yml
```

```yaml
theme:
  name: awesome  # Uses sia-theme-awesome package
```

Sia resolves themes in this order:
1. Built-in themes (`main`, `minimal`, `developer`, `magazine`)
2. npm packages matching `sia-theme-{name}`

### Creating a Theme Package

```bash
# Generate a new theme scaffold
sia theme my-theme

# This creates sia-theme-my-theme/ with:
# - package.json (properly configured)
# - README.md (documentation template)
# - layouts/, includes/, pages/, styles/
```

After customizing, publish to npm:

```bash
cd sia-theme-my-theme
npm publish
```

See [Creating Themes](docs/creating-themes.md) for detailed documentation.

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
