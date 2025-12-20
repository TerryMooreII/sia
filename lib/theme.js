import prompts from 'prompts';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Ensure a directory exists
 */
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate package.json for the theme
 */
function getPackageJson(themeName, displayName, author) {
  return {
    name: `sia-theme-${themeName}`,
    version: '1.0.0',
    description: `${displayName} theme for Sia static site generator`,
    main: 'index.js',
    type: 'module',
    keywords: [
      'sia',
      'sia-theme',
      'static-site',
      'theme'
    ],
    author: author,
    license: 'MIT',
    repository: {
      type: 'git',
      url: ''
    },
    peerDependencies: {
      '@terrymooreii/sia': '>=2.0.0'
    }
  };
}

/**
 * Generate index.js that exports the theme directory
 */
function getIndexJs() {
  return `import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Export the theme directory path for Sia to use
export const themeDir = __dirname;
export default themeDir;
`;
}

/**
 * Generate README.md for the theme
 */
function getReadme(themeName, displayName, author) {
  return `# ${displayName}

A custom theme for [Sia](https://github.com/terrymooreii/sia) static site generator.

## Installation

\`\`\`bash
npm install sia-theme-${themeName}
\`\`\`

## Usage

In your site's \`_config.yml\`:

\`\`\`yaml
theme:
  name: ${themeName}
\`\`\`

## Theme Structure

\`\`\`
sia-theme-${themeName}/
├── package.json
├── index.js
├── README.md
├── layouts/
│   ├── base.njk      # Base HTML template
│   ├── post.njk      # Blog post template
│   ├── page.njk      # Static page template
│   └── note.njk      # Note template
├── includes/
│   ├── header.njk    # Site header/navigation
│   ├── footer.njk    # Site footer
│   ├── hero.njk      # Homepage hero section
│   ├── pagination.njk # Pagination component
│   └── tag-list.njk  # Tag cloud component
├── pages/
│   ├── index.njk     # Homepage
│   ├── blog.njk      # Blog listing
│   ├── notes.njk     # Notes listing
│   ├── tags.njk      # All tags page
│   ├── tag.njk       # Single tag page
│   └── feed.njk      # RSS feed
└── styles/
    └── main.css      # Theme styles
\`\`\`

## Customization

### Available Template Variables

**Site data:**
- \`site.title\` - Site title
- \`site.description\` - Site description
- \`site.author\` - Site author
- \`site.url\` - Site URL

**Collections:**
- \`collections.posts\` - All blog posts
- \`collections.pages\` - All pages
- \`collections.notes\` - All notes

**Page data (in content templates):**
- \`page.title\` - Page title
- \`page.date\` - Page date
- \`page.tags\` - Page tags array
- \`page.content\` - Rendered HTML content
- \`page.excerpt\` - Text excerpt

**Pagination (in listing templates):**
- \`pagination.pageNumber\` - Current page
- \`pagination.totalPages\` - Total pages
- \`pagination.previousUrl\` - Previous page URL
- \`pagination.nextUrl\` - Next page URL

### Available Filters

- \`| date('format')\` - Format dates ('short', 'long', 'iso', 'rss', 'full')
- \`| url\` - Convert relative URLs to absolute with basePath
- \`| excerpt(length)\` - Get excerpt from content
- \`| readingTime\` - Estimate reading time
- \`| limit(n)\` - Limit array to n items
- \`| slug\` - Convert string to URL slug
- \`| where(key, value)\` - Filter array by property
- \`| sortBy(key, order)\` - Sort array by property
- \`| withTag(tag)\` - Filter items with specific tag

## Publishing

To publish your theme to npm:

1. Update the \`package.json\` with your details
2. Add a \`repository\` URL
3. Run \`npm publish\`

## License

MIT
`;
}

/**
 * Base layout template
 */
function getBaseLayout() {
  return `<!DOCTYPE html>
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
`;
}

/**
 * Post layout template
 */
function getPostLayout() {
  return `{% extends "base.njk" %}

{% block content %}
<article class="post">
  <header class="post-header">
    <h1 class="post-title">
      {{ page.title }}
      {% if page.draft %}<span class="draft-badge">Draft</span>{% endif %}
    </h1>
    
    <div class="post-meta">
      <time datetime="{{ page.date | date('iso') }}">{{ page.date | date('long') }}</time>
      {% if page.tags and page.tags.length %}
      <span class="post-meta-divider">·</span>
      <span class="post-tags">
        {% for tag in page.tags %}
        <a href="{{ '/tags/' | url }}{{ tag | slug }}/" class="tag">{{ tag }}</a>{% if not loop.last %}, {% endif %}
        {% endfor %}
      </span>
      {% endif %}
      <span class="post-meta-divider">·</span>
      <span class="reading-time">{{ page.content | readingTime }}</span>
    </div>
  </header>
  
  <div class="post-content prose">
    {{ content | safe }}
  </div>
  
  <footer class="post-footer">
    <nav class="post-nav">
      <a href="{{ '/blog/' | url }}" class="btn btn-secondary">← Back to Blog</a>
    </nav>
  </footer>
</article>
{% endblock %}
`;
}

/**
 * Page layout template
 */
function getPageLayout() {
  return `{% extends "base.njk" %}

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
`;
}

/**
 * Note layout template
 */
function getNoteLayout() {
  return `{% extends "base.njk" %}

{% block content %}
<article class="note">
  <div class="note-content prose">
    {{ content | safe }}
  </div>
  
  <footer class="note-footer">
    <time datetime="{{ page.date | date('iso') }}">{{ page.date | date('full_time') }}</time>
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
  <a href="{{ '/notes/' | url }}" class="btn btn-secondary">← All Notes</a>
</nav>
{% endblock %}
`;
}

/**
 * Header include
 */
function getHeaderInclude() {
  return `<header class="site-header">
  <div class="container">
    <a href="{{ '/' | url }}" class="site-logo">{{ site.title }}</a>
    
    <nav class="site-nav">
      <a href="{{ '/' | url }}" class="nav-link{% if page.url == ('/' | url) %} active{% endif %}">Home</a>
      <a href="{{ '/blog/' | url }}" class="nav-link{% if page.url and page.url.startsWith('/blog') %} active{% endif %}">Blog</a>
      <a href="{{ '/notes/' | url }}" class="nav-link{% if page.url and page.url.startsWith('/notes') %} active{% endif %}">Notes</a>
      <a href="{{ '/tags/' | url }}" class="nav-link{% if page.url and page.url.startsWith('/tags') %} active{% endif %}">Tags</a>
      {% if collections.pages %}
      {% for p in collections.pages | limit(3) %}
      <a href="{{ p.url }}" class="nav-link{% if page.url == p.url %} active{% endif %}">{{ p.title }}</a>
      {% endfor %}
      {% endif %}
      
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
    </nav>
  </div>
</header>

<script>
(function() {
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
  
  setTheme(getPreferredTheme());
  
  toggle.addEventListener('click', function() {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
})();
</script>
`;
}

/**
 * Footer include
 */
function getFooterInclude() {
  return `<footer class="site-footer">
  <div class="container">
    <p class="footer-text">
      © {{ "now" | date('year') }} {{ site.author or site.title }}. 
      Built with <a href="https://github.com/terrymooreii/sia">Sia</a>.
    </p>
    
    <nav class="footer-nav">
      <a href="{{ '/feed.xml' | url }}" class="footer-link">RSS</a>
      <a href="{{ '/tags/' | url }}" class="footer-link">Tags</a>
    </nav>
  </div>
</footer>
`;
}

/**
 * Hero include
 */
function getHeroInclude() {
  return `{% if config.theme.showHero %}
<section class="hero">
  <h1 class="hero-title">{{ site.title }}</h1>
  <p class="hero-description">{{ site.description }}</p>
</section>
{% endif %}
`;
}

/**
 * Pagination include
 */
function getPaginationInclude() {
  return `{% if pagination and pagination.totalPages > 1 %}
<nav class="pagination" aria-label="Pagination">
  <div class="pagination-info">
    Page {{ pagination.pageNumber }} of {{ pagination.totalPages }}
  </div>
  
  <div class="pagination-links">
    {% if pagination.previousUrl %}
    <a href="{{ pagination.previousUrl }}" class="pagination-link pagination-prev" aria-label="Previous page">
      ← Newer
    </a>
    {% else %}
    <span class="pagination-link pagination-prev disabled">← Newer</span>
    {% endif %}
    
    {% if pagination.nextUrl %}
    <a href="{{ pagination.nextUrl }}" class="pagination-link pagination-next" aria-label="Next page">
      Older →
    </a>
    {% else %}
    <span class="pagination-link pagination-next disabled">Older →</span>
    {% endif %}
  </div>
</nav>
{% endif %}
`;
}

/**
 * Tag list include
 */
function getTagListInclude() {
  return `{% if allTags and allTags.length %}
<div class="tag-cloud">
  {% for tag in allTags %}
  <a href="{{ '/tags/' | url }}{{ tag.slug }}/" class="tag">
    {{ tag.name }}
    <span class="tag-count">({{ tag.count }})</span>
  </a>
  {% endfor %}
</div>
{% endif %}
`;
}

/**
 * Index page
 */
function getIndexPage() {
  return `{% extends "base.njk" %}

{% block content %}
{% include "hero.njk" %}

<section class="section">
  <div class="section-header">
    <h2 class="section-title">Latest Posts</h2>
    <a href="{{ '/blog/' | url }}" class="section-link">View all →</a>
  </div>
  
  <div class="post-list">
    {% for post in collections.posts | limit(5) %}
    <article class="post-card">
      <h3 class="post-card-title">
        <a href="{{ post.url }}">{{ post.title }}</a>
        {% if post.draft %}<span class="draft-badge">Draft</span>{% endif %}
      </h3>
      <div class="post-card-meta">
        <time datetime="{{ post.date | date('iso') }}">{{ post.date | date('short') }}</time>
        {% if post.tags and post.tags.length %}
        <span class="post-card-tags">
          {% for tag in post.tags | limit(3) %}
          <a href="{{ '/tags/' | url }}{{ tag | slug }}/" class="tag tag-sm">{{ tag }}</a>
          {% endfor %}
        </span>
        {% endif %}
      </div>
      <p class="post-card-excerpt">{{ post.excerpt }}</p>
    </article>
    {% else %}
    <p class="empty-message">No posts yet. Create your first post with <code>npx sia new post "My First Post"</code></p>
    {% endfor %}
  </div>
</section>

{% if collections.notes and collections.notes.length %}
<section class="section">
  <div class="section-header">
    <h2 class="section-title">Recent Notes</h2>
    <a href="{{ '/notes/' | url }}" class="section-link">View all →</a>
  </div>
  
  <div class="notes-grid">
    {% for note in collections.notes | limit(3) %}
    <article class="note-card">
      <div class="note-card-content">{{ note.excerptHtml | safe }}</div>
      <footer class="note-card-footer">
        <time datetime="{{ note.date | date('iso') }}">{{ note.date | date('full_time') }}</time>
        <a href="{{ note.url }}" class="note-card-link">View →</a>
      </footer>
    </article>
    {% endfor %}
  </div>
</section>
{% endif %}
{% endblock %}
`;
}

/**
 * Blog page
 */
function getBlogPage() {
  return `{% extends "base.njk" %}

{% block content %}
<header class="page-header">
  <h1 class="page-title">Blog</h1>
  <p class="page-description">All posts, newest first</p>
</header>

<div class="post-list">
  {% for post in posts %}
  <article class="post-card">
    <h2 class="post-card-title">
      <a href="{{ post.url }}">{{ post.title }}</a>
      {% if post.draft %}<span class="draft-badge">Draft</span>{% endif %}
    </h2>
    <div class="post-card-meta">
      <time datetime="{{ post.date | date('iso') }}">{{ post.date | date('long') }}</time>
      <span class="post-card-reading-time">{{ post.content | readingTime }}</span>
    </div>
    {% if post.tags and post.tags.length %}
    <div class="post-card-tags">
      {% for tag in post.tags %}
      <a href="{{ '/tags/' | url }}{{ tag | slug }}/" class="tag tag-sm">{{ tag }}</a>
      {% endfor %}
    </div>
    {% endif %}
    <p class="post-card-excerpt">{{ post.excerpt }}</p>
    <a href="{{ post.url }}" class="post-card-link">Read more →</a>
  </article>
  {% else %}
  <p class="empty-message">No posts yet. Create your first post with <code>npx sia new post "My First Post"</code></p>
  {% endfor %}
</div>

{% include "pagination.njk" %}
{% endblock %}
`;
}

/**
 * Notes page
 */
function getNotesPage() {
  return `{% extends "base.njk" %}

{% block content %}
<header class="page-header">
  <h1 class="page-title">Notes</h1>
  <p class="page-description">Short thoughts and quick updates</p>
</header>

<div class="notes-stream">
  {% for note in notes %}
  <article class="note-item">
    <div class="note-item-content prose">
      {{ note.content | safe }}
    </div>
    <footer class="note-item-footer">
      <time datetime="{{ note.date | date('iso') }}">{{ note.date | date('full_time') }}</time>
      {% if note.tags and note.tags.length %}
      <div class="note-item-tags">
        {% for tag in note.tags %}
        <a href="{{ '/tags/' | url }}{{ tag | slug }}/" class="tag tag-sm">{{ tag }}</a>
        {% endfor %}
      </div>
      {% endif %}
      <a href="{{ note.url }}" class="note-item-permalink">Permalink</a>
    </footer>
  </article>
  {% else %}
  <p class="empty-message">No notes yet. Create your first note with <code>npx sia new note "Quick thought"</code></p>
  {% endfor %}
</div>

{% include "pagination.njk" %}
{% endblock %}
`;
}

/**
 * Tags page
 */
function getTagsPage() {
  return `{% extends "base.njk" %}

{% block content %}
<header class="page-header">
  <h1 class="page-title">Tags</h1>
  <p class="page-description">Browse all {{ allTags.length }} tags</p>
</header>

{% if allTags and allTags.length %}
<div class="tags-page">
  {% include "tag-list.njk" %}
  
  <div class="tags-detail">
    {% for tag in allTags %}
    <section class="tag-section" id="{{ tag.slug }}">
      <h2 class="tag-section-title">
        <a href="{{ '/tags/' | url }}{{ tag.slug }}/">{{ tag.name }}</a>
        <span class="tag-section-count">({{ tag.count }})</span>
      </h2>
      <ul class="tag-posts">
        {% for item in tag.items | limit(5) %}
        <li>
          <a href="{{ item.url }}">{{ item.title or item.excerpt }}</a>
          <time datetime="{{ item.date | date('iso') }}">{{ item.date | date('short') }}</time>
        </li>
        {% endfor %}
        {% if tag.count > 5 %}
        <li><a href="{{ '/tags/' | url }}{{ tag.slug }}/" class="more-link">View all {{ tag.count }} →</a></li>
        {% endif %}
      </ul>
    </section>
    {% endfor %}
  </div>
</div>
{% else %}
<p class="empty-message">No tags yet. Add tags to your posts in the front matter.</p>
{% endif %}
{% endblock %}
`;
}

/**
 * Tag page (single tag)
 */
function getTagPage() {
  return `{% extends "base.njk" %}

{% block content %}
<header class="page-header">
  <h1 class="page-title">Tagged: {{ tag.name }}</h1>
  <p class="page-description">{{ tag.count }} item{% if tag.count != 1 %}s{% endif %} tagged with "{{ tag.name }}"</p>
</header>

<div class="post-list">
  {% for post in posts %}
  <article class="post-card">
    <h2 class="post-card-title">
      <a href="{{ post.url }}">{{ post.title or post.excerpt }}</a>
      {% if post.draft %}<span class="draft-badge">Draft</span>{% endif %}
    </h2>
    <div class="post-card-meta">
      <time datetime="{{ post.date | date('iso') }}">{{ post.date | date('long') }}</time>
    </div>
    {% if post.tags and post.tags.length %}
    <div class="post-card-tags">
      {% for t in post.tags %}
      <a href="{{ '/tags/' | url }}{{ t | slug }}/" class="tag tag-sm{% if t | slug == tag.slug %} active{% endif %}">{{ t }}</a>
      {% endfor %}
    </div>
    {% endif %}
    {% if post.excerpt %}
    <p class="post-card-excerpt">{{ post.excerpt }}</p>
    {% endif %}
  </article>
  {% endfor %}
</div>

{% include "pagination.njk" %}

<nav class="page-nav">
  <a href="{{ '/tags/' | url }}" class="btn btn-secondary">← All Tags</a>
</nav>
{% endblock %}
`;
}

/**
 * Feed page (RSS)
 */
function getFeedPage() {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
      {% if post.tags and post.tags.length %}
      {% for tag in post.tags %}
      <category>{{ tag | safe }}</category>
      {% endfor %}
      {% endif %}
      <description><![CDATA[{{ post.excerpt | safe }}]]></description>
      <content:encoded><![CDATA[{{ post.content | safe }}]]></content:encoded>
    </item>
    {% endfor %}
  </channel>
</rss>
`;
}

/**
 * Main CSS file
 */
function getMainCss(themeName, displayName) {
  return `/* ${displayName} Theme for Sia
 * Customize this file to create your unique theme!
 */

/* ===== CSS Variables ===== */
:root {
  /* Light Mode Colors */
  --color-bg: #ffffff;
  --color-bg-alt: #f8f9fa;
  --color-text: #212529;
  --color-text-muted: #6c757d;
  --color-text-light: #adb5bd;
  --color-primary: #0d6efd;
  --color-primary-hover: #0b5ed7;
  --color-border: #dee2e6;
  --color-border-light: #e9ecef;
  --color-accent: #dc3545;
  --color-code-bg: #f1f3f5;
  
  /* Typography */
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  
  /* Sizing */
  --container-width: 720px;
  --container-wide: 1024px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Dark Mode */
[data-theme="dark"] {
  --color-bg: #1a1a2e;
  --color-bg-alt: #16213e;
  --color-text: #eaeaea;
  --color-text-muted: #a0a0a0;
  --color-text-light: #6a6a6a;
  --color-primary: #4dabf7;
  --color-primary-hover: #74c0fc;
  --color-border: #2d3748;
  --color-border-light: #1e2533;
  --color-accent: #f06595;
  --color-code-bg: #0d1117;
}

/* ===== Reset & Base ===== */
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

/* ===== Layout ===== */
.container {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.main {
  flex: 1;
  padding: var(--spacing-2xl) 0 var(--spacing-3xl);
  max-width: var(--container-width);
  margin: 0 auto;
  width: 100%;
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

/* ===== Header ===== */
.site-header {
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-lg) 0;
}

.site-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--container-wide);
}

.site-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.site-logo:hover {
  color: var(--color-primary);
  text-decoration: none;
}

.site-nav {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.nav-link {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.nav-link:hover,
.nav-link.active {
  color: var(--color-text);
  text-decoration: none;
}

/* Theme Toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-muted);
}

.theme-toggle:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

.theme-toggle .icon-sun { display: none; }
.theme-toggle .icon-moon { display: block; }

[data-theme="dark"] .theme-toggle .icon-sun { display: block; }
[data-theme="dark"] .theme-toggle .icon-moon { display: none; }

/* ===== Footer ===== */
.site-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--spacing-xl) 0;
  margin-top: auto;
}

.site-footer .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--container-wide);
}

.footer-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.footer-nav {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-link {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

/* ===== Hero ===== */
.hero {
  text-align: center;
  padding: var(--spacing-3xl) 0;
  margin-bottom: var(--spacing-2xl);
  border-bottom: 1px solid var(--color-border-light);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-md);
}

.hero-description {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* ===== Page Header ===== */
.page-header {
  margin-bottom: var(--spacing-2xl);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm);
}

.page-description {
  color: var(--color-text-muted);
  margin: 0;
}

/* ===== Sections ===== */
.section {
  margin-bottom: var(--spacing-3xl);
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.section-link {
  font-size: 0.9rem;
}

/* ===== Post Cards ===== */
.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.post-card {
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.post-card:last-child {
  border-bottom: none;
}

.post-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm);
}

.post-card-title a {
  color: var(--color-text);
}

.post-card-title a:hover {
  color: var(--color-primary);
  text-decoration: none;
}

.post-card-meta {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-sm);
}

.post-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.post-card-excerpt {
  color: var(--color-text-muted);
  margin: 0;
}

.post-card-link {
  font-size: 0.9rem;
  display: inline-block;
  margin-top: var(--spacing-sm);
}

/* ===== Tags ===== */
.tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-alt);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.tag:hover {
  background: var(--color-primary);
  color: white;
  text-decoration: none;
}

.tag-sm {
  padding: 2px var(--spacing-xs);
  font-size: 0.75rem;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-2xl);
}

.tag-count {
  opacity: 0.7;
}

/* ===== Notes ===== */
.notes-grid {
  display: grid;
  gap: var(--spacing-lg);
}

.note-card {
  padding: var(--spacing-lg);
  background: var(--color-bg-alt);
  border-radius: var(--radius-lg);
}

.note-card-content {
  margin-bottom: var(--spacing-md);
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.notes-stream {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.note-item {
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.note-item-footer {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-md);
}

/* ===== Post/Page Content ===== */
.post-header,
.note-footer {
  margin-bottom: var(--spacing-xl);
}

.post-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-md);
}

.post-meta {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.post-meta-divider {
  margin: 0 var(--spacing-sm);
}

.post-content,
.page-content,
.note-content {
  font-size: 1.05rem;
  line-height: 1.7;
}

.post-footer {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

/* ===== Prose (Content Styling) ===== */
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  margin-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  line-height: 1.3;
}

.prose h1 { font-size: 2rem; }
.prose h2 { font-size: 1.5rem; }
.prose h3 { font-size: 1.25rem; }
.prose h4 { font-size: 1.1rem; }

.prose p {
  margin: 0 0 var(--spacing-lg);
}

.prose ul, .prose ol {
  margin: 0 0 var(--spacing-lg);
  padding-left: var(--spacing-xl);
}

.prose li {
  margin-bottom: var(--spacing-sm);
}

.prose blockquote {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-md) var(--spacing-xl);
  border-left: 4px solid var(--color-primary);
  background: var(--color-bg-alt);
  font-style: italic;
}

.prose pre {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--color-code-bg);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.5;
}

.prose code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  padding: 2px 6px;
  background: var(--color-code-bg);
  border-radius: var(--radius-sm);
}

.prose pre code {
  padding: 0;
  background: none;
}

.prose img {
  margin: var(--spacing-xl) 0;
  border-radius: var(--radius-md);
}

.prose hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-2xl) 0;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-xl) 0;
}

.prose th, .prose td {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  text-align: left;
}

.prose th {
  background: var(--color-bg-alt);
  font-weight: 600;
}

/* ===== Pagination ===== */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
}

.pagination-info {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.pagination-links {
  display: flex;
  gap: var(--spacing-md);
}

.pagination-link {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
}

.pagination-link.disabled {
  color: var(--color-text-light);
  pointer-events: none;
}

/* ===== Buttons ===== */
.btn {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  text-decoration: none;
}

.btn-secondary {
  background: var(--color-bg-alt);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-border-light);
  text-decoration: none;
}

/* ===== Utilities ===== */
.draft-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-accent);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  margin-left: var(--spacing-sm);
}

.empty-message {
  color: var(--color-text-muted);
  font-style: italic;
}

/* ===== Tags Page ===== */
.tags-page {
  margin-top: var(--spacing-xl);
}

.tags-detail {
  margin-top: var(--spacing-2xl);
}

.tag-section {
  margin-bottom: var(--spacing-2xl);
}

.tag-section-title {
  font-size: 1.25rem;
  margin: 0 0 var(--spacing-md);
}

.tag-section-count {
  color: var(--color-text-muted);
  font-weight: normal;
}

.tag-posts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag-posts li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.tag-posts time {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.more-link {
  font-size: 0.9rem;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .site-header .container {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .site-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-md);
  }
  
  .site-footer .container {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .post-title,
  .page-title {
    font-size: 1.5rem;
  }
}
`;
}

/**
 * Create theme scaffold
 */
export async function createTheme(themeName, options = {}) {
  // Normalize theme name (lowercase, hyphenated)
  const normalizedName = themeName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const packageName = `sia-theme-${normalizedName}`;
  const targetDir = resolve(process.cwd(), packageName);
  
  console.log(`\n🎨 Creating new Sia theme: ${packageName}\n`);
  
  // Check if directory exists
  if (existsSync(targetDir)) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Directory "${packageName}" already exists. Continue anyway?`,
      initial: false
    });
    
    if (!proceed) {
      console.log('\n❌ Cancelled.\n');
      process.exit(0);
    }
  }
  
  // Get theme details
  let answers;
  
  if (options.quick) {
    answers = {
      displayName: themeName.charAt(0).toUpperCase() + themeName.slice(1) + ' Theme',
      author: 'Anonymous'
    };
  } else {
    answers = await prompts([
      {
        type: 'text',
        name: 'displayName',
        message: 'Theme display name:',
        initial: themeName.charAt(0).toUpperCase() + themeName.slice(1) + ' Theme'
      },
      {
        type: 'text',
        name: 'author',
        message: 'Author name:',
        initial: 'Anonymous'
      }
    ]);
  }
  
  if (!answers.displayName) {
    console.log('\n❌ Cancelled.\n');
    process.exit(0);
  }
  
  console.log('\n📁 Creating theme structure...\n');
  
  // Create directories
  ensureDir(targetDir);
  ensureDir(join(targetDir, 'layouts'));
  ensureDir(join(targetDir, 'includes'));
  ensureDir(join(targetDir, 'pages'));
  ensureDir(join(targetDir, 'styles'));
  
  // Create package.json
  writeFileSync(
    join(targetDir, 'package.json'),
    JSON.stringify(getPackageJson(normalizedName, answers.displayName, answers.author), null, 2),
    'utf-8'
  );
  console.log('  ✓ package.json');
  
  // Create index.js
  writeFileSync(join(targetDir, 'index.js'), getIndexJs(), 'utf-8');
  console.log('  ✓ index.js');
  
  // Create README.md
  writeFileSync(
    join(targetDir, 'README.md'),
    getReadme(normalizedName, answers.displayName, answers.author),
    'utf-8'
  );
  console.log('  ✓ README.md');
  
  // Create layouts
  writeFileSync(join(targetDir, 'layouts', 'base.njk'), getBaseLayout(), 'utf-8');
  writeFileSync(join(targetDir, 'layouts', 'post.njk'), getPostLayout(), 'utf-8');
  writeFileSync(join(targetDir, 'layouts', 'page.njk'), getPageLayout(), 'utf-8');
  writeFileSync(join(targetDir, 'layouts', 'note.njk'), getNoteLayout(), 'utf-8');
  console.log('  ✓ layouts/');
  
  // Create includes
  writeFileSync(join(targetDir, 'includes', 'header.njk'), getHeaderInclude(), 'utf-8');
  writeFileSync(join(targetDir, 'includes', 'footer.njk'), getFooterInclude(), 'utf-8');
  writeFileSync(join(targetDir, 'includes', 'hero.njk'), getHeroInclude(), 'utf-8');
  writeFileSync(join(targetDir, 'includes', 'pagination.njk'), getPaginationInclude(), 'utf-8');
  writeFileSync(join(targetDir, 'includes', 'tag-list.njk'), getTagListInclude(), 'utf-8');
  console.log('  ✓ includes/');
  
  // Create pages
  writeFileSync(join(targetDir, 'pages', 'index.njk'), getIndexPage(), 'utf-8');
  writeFileSync(join(targetDir, 'pages', 'blog.njk'), getBlogPage(), 'utf-8');
  writeFileSync(join(targetDir, 'pages', 'notes.njk'), getNotesPage(), 'utf-8');
  writeFileSync(join(targetDir, 'pages', 'tags.njk'), getTagsPage(), 'utf-8');
  writeFileSync(join(targetDir, 'pages', 'tag.njk'), getTagPage(), 'utf-8');
  writeFileSync(join(targetDir, 'pages', 'feed.njk'), getFeedPage(), 'utf-8');
  console.log('  ✓ pages/');
  
  // Create styles
  writeFileSync(
    join(targetDir, 'styles', 'main.css'),
    getMainCss(normalizedName, answers.displayName),
    'utf-8'
  );
  console.log('  ✓ styles/');
  
  // Success message
  console.log('\n✨ Theme created successfully!\n');
  console.log('Next steps:\n');
  console.log(`  cd ${packageName}`);
  console.log('  # Edit the theme files to customize');
  console.log('  npm publish  # When ready to share\n');
  console.log('To use this theme in a Sia site:\n');
  console.log(`  npm install ${packageName}`);
  console.log(`  # Then set theme.name: "${normalizedName}" in _config.yml\n`);
}

/**
 * Theme command handler for CLI
 */
export async function themeCommand(themeName, options) {
  if (!themeName) {
    console.error('❌ Please provide a theme name: sia theme <name>');
    process.exit(1);
  }
  
  try {
    await createTheme(themeName, options);
  } catch (err) {
    console.error('❌ Failed to create theme:', err.message);
    process.exit(1);
  }
}

export default { createTheme, themeCommand };

