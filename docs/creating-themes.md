# Creating Themes

This guide explains how to create custom themes for Sia, distribute them as npm packages, and customize existing themes.

## Table of Contents

- [Theme Overview](#theme-overview)
- [Theme Structure](#theme-structure)
- [Required Files](#required-files)
- [Layouts](#layouts)
- [Pages](#pages)
- [Includes](#includes)
- [Styles](#styles)
- [Shared Includes](#shared-includes)
- [Dark Mode Support](#dark-mode-support)
- [External Theme Packages](#external-theme-packages)
- [Creating a Theme Package](#creating-a-theme-package)
- [Publishing Your Theme](#publishing-your-theme)
- [Customizing Existing Themes](#customizing-existing-themes)
- [Built-in Themes](#built-in-themes)
- [Best Practices](#best-practices)

---

## Theme Overview

Sia themes control the visual appearance and structure of your site. A theme consists of:

- **Layouts** - Base templates that wrap content (post, page, note layouts)
- **Pages** - Templates for listing pages (homepage, blog, tags)
- **Includes** - Reusable components (header, footer, pagination)
- **Styles** - CSS files for styling

### Selecting a Theme

Set your theme in `_config.yml`:

```yaml
theme:
  name: minimal  # Options: main, minimal, developer, magazine
```

The theme configuration is an object that allows for additional theme-specific options in the future.

---

## Theme Structure

A complete theme follows this directory structure:

```
themes/your-theme/
├── layouts/
│   ├── base.njk          # Base HTML structure
│   ├── post.njk          # Blog post layout
│   ├── page.njk          # Static page layout
│   └── note.njk          # Note layout
├── includes/
│   ├── header.njk        # Site header/navigation
│   ├── footer.njk        # Site footer
│   ├── hero.njk          # Homepage hero section
│   ├── pagination.njk    # Pagination component
│   └── tag-list.njk      # Tag cloud/list component
├── pages/
│   ├── index.njk         # Homepage
│   ├── blog.njk          # Blog listing
│   ├── notes.njk         # Notes listing
│   ├── tags.njk          # All tags page
│   ├── tag.njk           # Individual tag page
│   └── feed.njk          # RSS feed template
└── styles/
    └── main.css          # Theme styles
```

---

## Required Files

### Layouts (Required)

| File | Purpose |
|------|---------|
| `base.njk` | Base HTML structure, includes head and body |
| `post.njk` | Template for blog posts |
| `page.njk` | Template for static pages |
| `note.njk` | Template for notes |

### Pages (Required)

| File | Purpose |
|------|---------|
| `index.njk` | Homepage |
| `blog.njk` | Blog listing with pagination |
| `notes.njk` | Notes listing with pagination |
| `tags.njk` | All tags overview page |
| `tag.njk` | Individual tag page with pagination |
| `feed.njk` | RSS feed (XML) |

### Includes (Recommended)

| File | Purpose |
|------|---------|
| `header.njk` | Site header and navigation |
| `footer.njk` | Site footer |
| `hero.njk` | Homepage hero section |
| `pagination.njk` | Pagination navigation |
| `tag-list.njk` | Tag cloud or list |

### Styles (Required)

| File | Purpose |
|------|---------|
| `main.css` | All theme styles |

---

## Layouts

### base.njk

The base layout provides the HTML structure for all pages:

```nunjucks
<!DOCTYPE html>
<html lang="en">
<head>
  {% include "meta.njk" %}
  {% include "theme-script.njk" %}
  
  <link rel="stylesheet" href="{{ '/styles/main.css' | url }}">
  
  {% block head %}{% endblock %}
</head>
<body>
  {% include "header.njk" %}

  <main class="main">
    {% block content %}{% endblock %}
  </main>
  
  {% include "footer.njk" %}
</body>
</html>
```

**Key points:**
- Include `meta.njk` for SEO meta tags
- Include `theme-script.njk` to prevent dark mode flash
- Use `{% block content %}` for page-specific content
- Use the `url` filter for all paths

### post.njk

Template for blog posts:

```nunjucks
{% extends "base.njk" %}

{% block content %}
<article class="post">
  <header class="post-header">
    <h1 class="post-title">
      {{ page.title }}
      {% if page.draft %}<span class="draft-badge">Draft</span>{% endif %}
    </h1>
    
    <div class="post-meta">
      <time datetime="{{ page.date | date('iso') }}">
        {{ page.date | date('long') }}
      </time>
      
      {% if page.tags and page.tags.length %}
      <span class="post-tags">
        {% for tag in page.tags %}
        <a href="{{ '/tags/' | url }}{{ tag | slug }}/" class="tag">{{ tag }}</a>
        {% endfor %}
      </span>
      {% endif %}
      
      <span class="reading-time">{{ page.content | readingTime }}</span>
    </div>
  </header>
  
  <div class="post-content prose">
    {{ content | safe }}
  </div>
  
  <footer class="post-footer">
    <a href="{{ '/blog/' | url }}">← Back to Blog</a>
  </footer>
</article>
{% endblock %}
```

### page.njk

Template for static pages:

```nunjucks
{% extends "base.njk" %}

{% block content %}
<article class="page">
  <header class="page-header">
    <h1 class="page-title">{{ page.title }}</h1>
  </header>
  
  <div class="page-content prose">
    {{ content | safe }}
  </div>
</article>
{% endblock %}
```

### note.njk

Template for notes:

```nunjucks
{% extends "base.njk" %}

{% block content %}
<article class="note">
  <div class="note-content prose">
    {{ content | safe }}
  </div>
  
  <footer class="note-footer">
    <time datetime="{{ page.date | date('iso') }}">
      {{ page.date | date('full_time') }}
    </time>
    
    {% if page.tags and page.tags.length %}
    <span class="note-tags">
      {% for tag in page.tags %}
      <a href="{{ '/tags/' | url }}{{ tag | slug }}/" class="tag">{{ tag }}</a>
      {% endfor %}
    </span>
    {% endif %}
  </footer>
</article>

<nav class="note-nav">
  <a href="{{ '/notes/' | url }}">← All Notes</a>
</nav>
{% endblock %}
```

---

## Pages

### index.njk (Homepage)

```nunjucks
{% extends "base.njk" %}

{% block content %}
{% include "hero.njk" %}

<section class="recent-posts">
  <h2>Latest Posts</h2>
  
  {% for post in collections.posts | limit(5) %}
  <article class="post-card">
    <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
    <time>{{ post.date | date('short') }}</time>
    <p>{{ post.excerpt }}</p>
  </article>
  {% else %}
  <p>No posts yet.</p>
  {% endfor %}
  
  <a href="{{ '/blog/' | url }}">View all posts →</a>
</section>

{% if collections.notes and collections.notes.length %}
<section class="recent-notes">
  <h2>Recent Notes</h2>
  
  {% for note in collections.notes | limit(3) %}
  <article class="note-card">
    <div>{{ note.excerptHtml | safe }}</div>
    <time>{{ note.date | date('full_time') }}</time>
  </article>
  {% endfor %}
</section>
{% endif %}
{% endblock %}
```

### blog.njk (Blog Listing)

```nunjucks
{% extends "base.njk" %}

{% block content %}
<header class="page-header">
  <h1>Blog</h1>
  <p>All posts, newest first</p>
</header>

<div class="post-list">
  {% for post in posts %}
  <article class="post-card">
    <h2>
      <a href="{{ post.url }}">{{ post.title }}</a>
      {% if post.draft %}<span class="draft-badge">Draft</span>{% endif %}
    </h2>
    <div class="post-meta">
      <time>{{ post.date | date('long') }}</time>
      <span>{{ post.content | readingTime }}</span>
    </div>
    {% if post.tags and post.tags.length %}
    <div class="tags">
      {% for tag in post.tags %}
      <a href="{{ '/tags/' | url }}{{ tag | slug }}/">{{ tag }}</a>
      {% endfor %}
    </div>
    {% endif %}
    <p>{{ post.excerpt }}</p>
  </article>
  {% else %}
  <p>No posts yet.</p>
  {% endfor %}
</div>

{% include "pagination.njk" %}
{% endblock %}
```

### tag.njk (Individual Tag Page)

```nunjucks
{% extends "base.njk" %}

{% block content %}
<header class="page-header">
  <h1>Tagged: {{ tag.name }}</h1>
  <p>{{ tag.count }} item{% if tag.count != 1 %}s{% endif %}</p>
</header>

<div class="post-list">
  {% for post in posts %}
  <article class="post-card">
    <h2><a href="{{ post.url }}">{{ post.title or post.excerpt }}</a></h2>
    <time>{{ post.date | date('long') }}</time>
  </article>
  {% endfor %}
</div>

{% include "pagination.njk" %}

<a href="{{ '/tags/' | url }}">← All Tags</a>
{% endblock %}
```

### feed.njk (RSS Feed)

```nunjucks
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{{ site.title | safe }}</title>
    <description>{{ site.description | safe }}</description>
    <link>{{ site.url | safe }}</link>
    <atom:link href="{{ site.url | safe }}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>{{ buildDate | safe }}</lastBuildDate>
    <generator>Sia Static Site Generator</generator>
    {% for post in posts | limit(20) %}
    <item>
      <title><![CDATA[{{ post.title | safe }}]]></title>
      <link>{{ site.url | safe }}{{ post.url | safe }}</link>
      <guid isPermaLink="true">{{ site.url | safe }}{{ post.url | safe }}</guid>
      <pubDate>{{ post.date | date('rss') }}</pubDate>
      {% for tag in post.tags %}
      <category>{{ tag | safe }}</category>
      {% endfor %}
      <description><![CDATA[{{ post.excerpt | safe }}]]></description>
      <content:encoded><![CDATA[{{ post.content | safe }}]]></content:encoded>
    </item>
    {% endfor %}
  </channel>
</rss>
```

---

## Includes

### header.njk

```nunjucks
<header class="site-header">
  <a href="{{ '/' | url }}" class="site-logo">{{ site.title }}</a>
  
  <nav class="site-nav">
    <a href="{{ '/' | url }}">Home</a>
    <a href="{{ '/blog/' | url }}">Blog</a>
    <a href="{{ '/notes/' | url }}">Notes</a>
    <a href="{{ '/tags/' | url }}">Tags</a>
    
    {% for p in collections.pages | limit(3) %}
    <a href="{{ p.url }}">{{ p.title }}</a>
    {% endfor %}
    
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
      <!-- Sun/Moon icons -->
    </button>
  </nav>
</header>
```

### footer.njk

```nunjucks
<footer class="site-footer">
  <p>&copy; {{ 'now' | date('year') }} {{ site.title }}</p>
  <p>Built with <a href="https://github.com/terrymooreii/sia">Sia</a></p>
</footer>
```

### pagination.njk

```nunjucks
{% if pagination and pagination.totalPages > 1 %}
<nav class="pagination">
  <span>Page {{ pagination.pageNumber }} of {{ pagination.totalPages }}</span>
  
  {% if pagination.previousUrl %}
  <a href="{{ pagination.previousUrl }}">← Newer</a>
  {% else %}
  <span class="disabled">← Newer</span>
  {% endif %}
  
  {% if pagination.nextUrl %}
  <a href="{{ pagination.nextUrl }}">Older →</a>
  {% else %}
  <span class="disabled">Older →</span>
  {% endif %}
</nav>
{% endif %}
```

### tag-list.njk

```nunjucks
{% if allTags and allTags.length %}
<div class="tag-list">
  {% for tag in allTags %}
  <a href="{{ '/tags/' | url }}{{ tag.slug }}/" class="tag">
    {{ tag.name }} ({{ tag.count }})
  </a>
  {% endfor %}
</div>
{% endif %}
```

### hero.njk

The hero section is displayed on the homepage when `config.theme.showHero` is enabled:

```nunjucks
{% if config.theme.showHero %}
<section class="hero">
  <h1 class="hero-title">{{ site.title }}</h1>
  <p class="hero-description">{{ site.description }}</p>
</section>
{% endif %}
```

Enable the hero section in your `_config.yml`:

```yaml
theme:
  name: main
  showHero: true
```

---

## Styles

### CSS Structure

A typical `main.css` structure:

```css
/* Reset and base styles */
*, *::before, *::after {
  box-sizing: border-box;
}

/* CSS Variables for theming */
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #0066cc;
  --color-muted: #666666;
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #f0f0f0;
  --color-primary: #66b3ff;
  --color-muted: #999999;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
}

/* Layout */
.main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* Typography */
.prose h1, .prose h2, .prose h3 { ... }
.prose p { ... }
.prose a { ... }
.prose code { ... }
.prose pre { ... }

/* Components */
.post-card { ... }
.tag { ... }
.pagination { ... }

/* Header and Footer */
.site-header { ... }
.site-footer { ... }

/* Responsive */
@media (max-width: 768px) {
  .main { padding: 1rem; }
}
```

### Important CSS Classes

Style these classes for full theme support:

| Class | Used For |
|-------|----------|
| `.prose` | Content container (markdown output) |
| `.post-card` | Post preview in listings |
| `.note-card` | Note preview in listings |
| `.tag` | Tag links |
| `.draft-badge` | Draft indicator |
| `.pagination` | Pagination navigation |
| `.site-header` | Site header |
| `.site-footer` | Site footer |

---

## Shared Includes

Sia provides shared includes available to all themes:

### meta.njk

SEO meta tags (Open Graph, Twitter Cards):

```nunjucks
{% include "meta.njk" %}
```

This automatically generates:
- Basic meta tags (charset, viewport, description)
- Open Graph tags for social sharing
- Twitter Card tags
- Article metadata for blog posts
- RSS feed link
- Canonical URL

### theme-script.njk

Prevents flash of wrong theme on page load:

```nunjucks
{% include "theme-script.njk" %}
```

Include this in `<head>` before stylesheets to prevent a flash of light mode when the user prefers dark mode.

---

## Dark Mode Support

### HTML Structure

Use the `data-theme` attribute on `<html>`:

```html
<html data-theme="light">
<!-- or -->
<html data-theme="dark">
```

### CSS Variables

Define colors for both themes:

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #f0f0f0;
}
```

### Theme Toggle Script

Add a toggle button in your header:

```javascript
const toggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Initialize
setTheme(getPreferredTheme());

// Toggle handler
toggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});
```

---

## External Theme Packages

Sia supports distributing themes as npm packages, making it easy to share themes with the community.

### How Theme Resolution Works

When Sia loads a theme, it follows this resolution order:

1. **Built-in themes** - First checks the `themes/` folder in the Sia package
2. **npm packages** - If not found, looks for `sia-theme-{name}` in your `package.json` dependencies
3. **Fallback** - Falls back to the "main" theme if nothing is found

### Using an External Theme

To use an external theme in your Sia site:

```bash
# Install the theme package
npm install sia-theme-awesome
```

Then configure it in your `_config.yml`:

```yaml
theme:
  name: awesome  # Sia will look for sia-theme-awesome
```

That's it! Sia automatically detects and uses the theme from `node_modules`.

### Theme Package Requirements

External theme packages must:

1. **Follow naming convention** - Package name must be `sia-theme-{name}`
2. **Export theme directory** - Include an `index.js` that exports the theme path
3. **Include required files** - Have `layouts/` and `pages/` directories (minimum)
4. **Follow theme structure** - Match the same structure as built-in themes

---

## Creating a Theme Package

### Using the Theme Generator

The easiest way to create a new theme is with the built-in generator:

```bash
sia theme my-awesome-theme
```

This creates a complete theme package with all necessary files:

```
sia-theme-my-awesome-theme/
├── package.json          # npm package configuration
├── index.js              # Exports theme directory path
├── README.md             # Theme documentation
├── layouts/
│   ├── base.njk          # Base HTML template
│   ├── post.njk          # Blog post layout
│   ├── page.njk          # Static page layout
│   └── note.njk          # Note layout
├── includes/
│   ├── header.njk        # Site header/navigation
│   ├── footer.njk        # Site footer
│   ├── hero.njk          # Homepage hero section
│   ├── pagination.njk    # Pagination component
│   └── tag-list.njk      # Tag cloud component
├── pages/
│   ├── index.njk         # Homepage
│   ├── blog.njk          # Blog listing
│   ├── notes.njk         # Notes listing
│   ├── tags.njk          # All tags page
│   ├── tag.njk           # Single tag page
│   └── feed.njk          # RSS feed
└── styles/
    └── main.css          # Theme styles
```

### Generator Options

```bash
# Interactive mode (prompts for details)
sia theme my-theme

# Quick mode (skip prompts, use defaults)
sia theme my-theme --quick
sia theme my-theme -q
```

### package.json Structure

The generated `package.json` includes:

```json
{
  "name": "sia-theme-my-theme",
  "version": "1.0.0",
  "description": "My Theme theme for Sia static site generator",
  "main": "index.js",
  "type": "module",
  "keywords": [
    "sia",
    "sia-theme",
    "static-site",
    "theme"
  ],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "@terrymooreii/sia": ">=2.0.0"
  }
}
```

### index.js Structure

The `index.js` exports the theme directory for Sia to locate:

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Export the theme directory path for Sia to use
export const themeDir = __dirname;
export default themeDir;
```

### Manual Theme Creation

If you prefer to create a theme manually:

1. Create a new directory: `mkdir sia-theme-my-theme`
2. Initialize npm: `npm init`
3. Set the package name to `sia-theme-{name}`
4. Create the required directory structure
5. Add an `index.js` that exports the directory path
6. Add all required template files

---

## Publishing Your Theme

### Preparing for Publication

1. **Test locally** - Link your theme and test with a Sia site:

   ```bash
   # In your theme directory
   npm link
   
   # In a Sia site directory
   npm link sia-theme-my-theme
   ```

2. **Update package.json** - Add repository, bugs, and homepage URLs:

   ```json
   {
     "repository": {
       "type": "git",
       "url": "https://github.com/username/sia-theme-my-theme.git"
     },
     "bugs": {
       "url": "https://github.com/username/sia-theme-my-theme/issues"
     },
     "homepage": "https://github.com/username/sia-theme-my-theme#readme"
   }
   ```

3. **Write documentation** - Update the README with:
   - Screenshots of the theme
   - Installation instructions
   - Configuration options
   - Customization tips

### Publishing to npm

```bash
# Login to npm (if not already)
npm login

# Publish the package
npm publish

# Or publish with public access if scoped
npm publish --access public
```

### Versioning

Follow semantic versioning:

- **Patch** (1.0.1) - Bug fixes, minor style tweaks
- **Minor** (1.1.0) - New features, backward-compatible changes
- **Major** (2.0.0) - Breaking changes to templates or configuration

### Theme Discovery

To help users find your theme:

1. Use `sia-theme` in your npm keywords
2. Add a clear description
3. Include screenshots in your README
4. Consider creating a demo site

---

## Customizing Existing Themes

You don't need to create a full theme to customize your site.

### Override Layouts

Create `_layouts/post.njk` to override the post layout:

```nunjucks
{% extends "base.njk" %}

{% block content %}
<!-- Your custom post layout -->
{% endblock %}
```

### Override Includes

Create `_includes/header.njk` to override the header:

```nunjucks
<header class="my-custom-header">
  <!-- Your custom header -->
</header>
```

### Custom Styles

Create `styles/main.css` to use your own styles instead of the theme's:

```css
/* Your custom styles */
```

### Priority Order

Sia loads templates in this order (first found wins):

1. `_layouts/` - Your custom layouts
2. `_includes/` - Your custom includes
3. Theme layouts (`themes/[theme]/layouts/`)
4. Theme includes (`themes/[theme]/includes/`)
5. Theme pages (`themes/[theme]/pages/`)
6. Shared includes (`themes/_shared/includes/`)

---

## Built-in Themes

### main

The default full-featured theme with:
- Clean, modern design
- Responsive layout
- Dark mode support
- Full tag cloud
- Reading time estimates

### minimal

A simple, content-focused theme with:
- Minimal styling
- Fast loading
- Clean typography
- Dark mode support

### developer

A theme with sidebar navigation:
- Sidebar with recent posts and tags
- Code-focused styling
- Dark mode optimized for code
- Technical aesthetic

### magazine

A publication-style theme with:
- Grid-based layout
- Featured post support
- Image-forward design
- Dark mode support

---

## Best Practices

### Accessibility

- Use semantic HTML (`<article>`, `<nav>`, `<main>`, etc.)
- Include ARIA labels for interactive elements
- Ensure sufficient color contrast
- Support keyboard navigation

### Performance

- Minimize CSS file size
- Use system fonts when possible
- Lazy load images where appropriate
- Test on slow connections

### SEO

- Always include `meta.njk` for proper meta tags
- Use proper heading hierarchy (h1 → h2 → h3)
- Include alt text for images
- Use canonical URLs

### Responsive Design

- Test on multiple screen sizes
- Use relative units (rem, em, %)
- Make navigation mobile-friendly
- Consider touch targets on mobile

### Template Tips

1. **Always use the `url` filter** for paths to support basePath hosting
2. **Use `safe` filter** for HTML content
3. **Check for empty collections** before iterating
4. **Handle missing data** gracefully with conditionals
5. **Keep templates DRY** with includes and macros
