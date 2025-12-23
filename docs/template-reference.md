# Template Reference

Sia uses [Nunjucks](https://mozilla.github.io/nunjucks/) as its templating engine. This guide covers all available variables and custom filters.

## Table of Contents

- [Global Variables](#global-variables)
- [Page Context Variables](#page-context-variables)
- [Pagination Variables](#pagination-variables)
- [Tag Page Variables](#tag-page-variables)
- [Listing Page Variables](#listing-page-variables)
- [Custom Filters](#custom-filters)
- [Nunjucks Basics](#nunjucks-basics)

---

## Global Variables

These variables are available in all templates.

### `site`

Site configuration from `_config.yml`:

| Property | Type | Description |
|----------|------|-------------|
| `site.title` | string | Site title |
| `site.description` | string | Site description |
| `site.url` | string | Full site URL (e.g., `https://example.com`) |
| `site.author` | string | Default author name |
| `site.basePath` | string | URL path prefix (extracted from `site.url`) |

**Example:**

```nunjucks
<title>{{ site.title }}</title>
<meta name="description" content="{{ site.description }}">
<link rel="canonical" href="{{ site.url }}{{ page.url }}">
```

### `config`

The full configuration object including all settings:

| Property | Type | Description |
|----------|------|-------------|
| `config.theme` | object | Theme configuration object |
| `config.theme.name` | string | Current theme name |
| `config.input` | string | Input directory name |
| `config.output` | string | Output directory name |
| `config.collections` | object | Collection configurations |
| `config.pagination.size` | number | Items per page |
| `config.server.port` | number | Dev server port |
| `config.server.showDrafts` | boolean | Show drafts in dev mode |

### `collections`

Object containing all content collections:

| Property | Type | Description |
|----------|------|-------------|
| `collections.posts` | array | All blog posts |
| `collections.pages` | array | All static pages |
| `collections.notes` | array | All notes |

**Example:**

```nunjucks
{% for post in collections.posts | limit(5) %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <time>{{ post.date | date('long') }}</time>
  </article>
{% endfor %}
```

### `tags`

Object containing tag data, keyed by normalized tag name:

```nunjucks
{% for tagName, tagData in tags %}
  <a href="/tags/{{ tagData.slug }}/">
    {{ tagData.name }} ({{ tagData.count }})
  </a>
{% endfor %}
```

Each tag object contains:

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Original tag name |
| `slug` | string | URL-friendly slug |
| `items` | array | Content items with this tag |
| `count` | number | Number of items |

### `allTags`

Array of all tags sorted by count (most used first):

```nunjucks
<ul class="tag-cloud">
  {% for tag in allTags %}
    <li><a href="/tags/{{ tag.slug }}/">{{ tag.name }}</a></li>
  {% endfor %}
</ul>
```

### `customAssets`

Custom CSS and JavaScript files defined in `_config.yml`:

| Property | Type | Description |
|----------|------|-------------|
| `customAssets.css` | array | Array of CSS file paths (relative to output root) |
| `customAssets.js` | array | Array of JavaScript file paths (relative to output root) |

**Note:** Custom assets are automatically injected into all theme base layouts via shared includes (`custom-assets-css.njk` and `custom-assets-js.njk`). You typically don't need to access this variable directly unless creating custom layouts.

**Example:**

```nunjucks
{# Manually inject custom CSS #}
{% if customAssets and customAssets.css %}
  {% for css in customAssets.css %}
    <link rel="stylesheet" href="{{ css | url }}">
  {% endfor %}
{% endif %}

{# Manually inject custom JavaScript #}
{% if customAssets and customAssets.js %}
  {% for js in customAssets.js %}
    <script src="{{ js | url }}"></script>
  {% endfor %}
{% endif %}
```

---

## Page Context Variables

These variables are available when rendering individual content items (posts, pages, notes).

### `page`

The current content item being rendered:

| Property | Type | Description |
|----------|------|-------------|
| `page.title` | string | Content title |
| `page.date` | Date | Publication date |
| `page.tags` | array | Array of tag strings |
| `page.content` | string | Rendered HTML content |
| `page.excerpt` | string | Plain text excerpt |
| `page.excerptHtml` | string | HTML-rendered excerpt |
| `page.slug` | string | URL slug |
| `page.url` | string | Full URL path (with basePath) |
| `page.draft` | boolean | Draft status |
| `page.layout` | string | Layout template name |
| `page.collection` | string | Collection name (`posts`, `pages`, `notes`) |
| `page.image` | string | Featured image path |
| `page.author` | string | Author (overrides site author) |
| `page.description` | string | Meta description |
| `page.rawContent` | string | Original markdown content |
| `page.filePath` | string | Source file path |
| `page.outputPath` | string | Output file path |

**Example:**

```nunjucks
<article>
  <h1>{{ page.title }}</h1>
  <time datetime="{{ page.date | date('iso') }}">
    {{ page.date | date('long') }}
  </time>
  
  {% if page.tags and page.tags.length %}
    <div class="tags">
      {% for tag in page.tags %}
        <a href="/tags/{{ tag | slug }}/">{{ tag }}</a>
      {% endfor %}
    </div>
  {% endif %}
  
  <div class="content">
    {{ content | safe }}
  </div>
</article>
```

### `content`

The rendered HTML content of the current page. Always use with the `safe` filter:

```nunjucks
<div class="prose">
  {{ content | safe }}
</div>
```

### `title`

The page title, passed separately for convenience:

```nunjucks
<title>{% if title %}{{ title }} | {% endif %}{{ site.title }}</title>
```

---

## Pagination Variables

Available on paginated listing pages (blog, notes, tags).

### `pagination`

| Property | Type | Description |
|----------|------|-------------|
| `pagination.pageNumber` | number | Current page (1-indexed) |
| `pagination.totalPages` | number | Total number of pages |
| `pagination.totalItems` | number | Total items across all pages |
| `pagination.isFirst` | boolean | Is this the first page? |
| `pagination.isLast` | boolean | Is this the last page? |
| `pagination.previousPage` | number/null | Previous page number |
| `pagination.nextPage` | number/null | Next page number |
| `pagination.previousUrl` | string/null | URL to previous page |
| `pagination.nextUrl` | string/null | URL to next page |
| `pagination.url` | string | Current page URL |
| `pagination.items` | array | Items on current page |
| `pagination.startIndex` | number | Start index of items |
| `pagination.endIndex` | number | End index of items |

**Example:**

```nunjucks
{% if pagination and pagination.totalPages > 1 %}
<nav class="pagination">
  <span>Page {{ pagination.pageNumber }} of {{ pagination.totalPages }}</span>
  
  {% if pagination.previousUrl %}
    <a href="{{ pagination.previousUrl }}">← Newer</a>
  {% endif %}
  
  {% if pagination.nextUrl %}
    <a href="{{ pagination.nextUrl }}">Older →</a>
  {% endif %}
</nav>
{% endif %}
```

---

## Tag Page Variables

Available on individual tag pages (`/tags/:slug/`).

### `tag`

The current tag being displayed:

| Property | Type | Description |
|----------|------|-------------|
| `tag.name` | string | Original tag name |
| `tag.slug` | string | URL-friendly slug |
| `tag.items` | array | All items with this tag |
| `tag.count` | number | Number of items |

**Example:**

```nunjucks
<h1>Tagged: {{ tag.name }}</h1>
<p>{{ tag.count }} item{% if tag.count != 1 %}s{% endif %}</p>

{% for post in posts %}
  <article>
    <a href="{{ post.url }}">{{ post.title }}</a>
  </article>
{% endfor %}
```

---

## Listing Page Variables

### Blog Listing (`/blog/`)

| Variable | Type | Description |
|----------|------|-------------|
| `posts` | array | Posts for current page |
| `pagination` | object | Pagination data |

### Notes Listing (`/notes/`)

| Variable | Type | Description |
|----------|------|-------------|
| `notes` | array | Notes for current page |
| `pagination` | object | Pagination data |

### Tags Listing (`/tags/`)

| Variable | Type | Description |
|----------|------|-------------|
| `allTags` | array | All tags sorted by count |
| `tags` | object | Tag data keyed by slug |

---

## Custom Filters

Sia provides these custom Nunjucks filters:

### `date(format)`

Format a date. Supports a special `'now'` keyword to get the current date.

**Formats:**

| Format | Output Example |
|--------|----------------|
| `'short'` | Dec 17, 2024 |
| `'long'` | December 17, 2024 |
| `'iso'` | 2024-12-17 |
| `'rss'` | Tue, 17 Dec 2024 00:00:00 GMT |
| `'year'` | 2024 |
| `'month'` | December 2024 |
| `'time'` | 3:45 PM |
| `'full'` | Tuesday, December 17, 2024 |
| `'full_time'` | Tue, Dec 17, 2024, 3:45 PM |

**Examples:**

```nunjucks
{{ page.date | date('long') }}
<!-- December 17, 2024 -->

{{ page.date | date('iso') }}
<!-- 2024-12-17 -->

<time datetime="{{ page.date | date('iso') }}">
  {{ page.date | date('full') }}
</time>

<!-- Current year -->
© {{ 'now' | date('year') }}
```

### `slug`

Generate a URL-friendly slug from a string:

```nunjucks
{{ "Hello World!" | slug }}
<!-- hello-world -->

<a href="/tags/{{ tag | slug }}/">{{ tag }}</a>
```

### `excerpt(length)`

Extract an excerpt from HTML content. Default length is 200 characters.

```nunjucks
{{ post.content | excerpt }}
<!-- First 200 characters... -->

{{ post.content | excerpt(100) }}
<!-- First 100 characters... -->
```

### `limit(count)`

Limit an array to the first N items:

```nunjucks
{% for post in collections.posts | limit(5) %}
  <!-- First 5 posts -->
{% endfor %}
```

### `skip(count)`

Skip the first N items in an array:

```nunjucks
{% for post in collections.posts | skip(3) %}
  <!-- All posts except first 3 -->
{% endfor %}

{% for post in collections.posts | skip(5) | limit(5) %}
  <!-- Posts 6-10 -->
{% endfor %}
```

### `wordCount`

Get the word count of content:

```nunjucks
{{ post.content | wordCount }} words
<!-- 1234 words -->
```

### `readingTime(wordsPerMinute)`

Estimate reading time. Default is 200 words per minute.

```nunjucks
{{ post.content | readingTime }}
<!-- 5 min read -->

{{ post.content | readingTime(250) }}
<!-- 4 min read -->
```

### `groupBy(key)`

Group an array of objects by a property:

```nunjucks
{% set postsByYear = collections.posts | groupBy('year') %}
{% for year, posts in postsByYear %}
  <h2>{{ year }}</h2>
  {% for post in posts %}
    <a href="{{ post.url }}">{{ post.title }}</a>
  {% endfor %}
{% endfor %}
```

### `sortBy(key, order)`

Sort an array by a property. Order can be `'asc'` (default) or `'desc'`.

```nunjucks
{% for post in collections.posts | sortBy('title', 'asc') %}
  <!-- Posts sorted alphabetically by title -->
{% endfor %}

{% for post in collections.posts | sortBy('date', 'desc') %}
  <!-- Posts sorted newest first -->
{% endfor %}
```

### `where(key, value)`

Filter items where a property equals a value:

```nunjucks
{% for post in collections.posts | where('draft', false) %}
  <!-- Only non-draft posts -->
{% endfor %}

{% for post in collections.posts | where('author', 'John') %}
  <!-- Only posts by John -->
{% endfor %}
```

### `withTag(tag)`

Filter items that have a specific tag:

```nunjucks
{% for post in collections.posts | withTag('javascript') %}
  <!-- Only posts tagged with 'javascript' -->
{% endfor %}
```

### `json(spaces)`

Convert an object to JSON string. Useful for debugging.

```nunjucks
<script>
  const data = {{ page | json | safe }};
</script>

<!-- Pretty printed with 2 spaces -->
<pre>{{ page | json(2) }}</pre>
```

### `url`

Prepend the site's basePath to a URL. Essential for sites hosted in subdirectories.

```nunjucks
<a href="{{ '/' | url }}">Home</a>
<link rel="stylesheet" href="{{ '/styles/main.css' | url }}">
<a href="{{ '/blog/' | url }}">Blog</a>
```

If your site is at `https://example.com/blog/`, the `url` filter ensures paths work correctly.

---

## Nunjucks Basics

### Variables

```nunjucks
{{ variable }}
{{ object.property }}
{{ array[0] }}
```

### Conditionals

```nunjucks
{% if condition %}
  <!-- content -->
{% elif otherCondition %}
  <!-- content -->
{% else %}
  <!-- content -->
{% endif %}
```

### Loops

```nunjucks
{% for item in items %}
  {{ item }}
  {{ loop.index }}      <!-- 1-indexed -->
  {{ loop.index0 }}     <!-- 0-indexed -->
  {{ loop.first }}      <!-- true on first iteration -->
  {{ loop.last }}       <!-- true on last iteration -->
  {{ loop.length }}     <!-- total items -->
{% else %}
  <!-- if items is empty -->
{% endfor %}
```

### Template Inheritance

**Base template (`base.njk`):**

```nunjucks
<!DOCTYPE html>
<html>
<head>
  {% block head %}{% endblock %}
</head>
<body>
  {% block content %}{% endblock %}
</body>
</html>
```

**Child template:**

```nunjucks
{% extends "base.njk" %}

{% block head %}
  <title>{{ title }}</title>
{% endblock %}

{% block content %}
  <h1>{{ page.title }}</h1>
  {{ content | safe }}
{% endblock %}
```

### Includes

```nunjucks
{% include "header.njk" %}
{% include "footer.njk" %}
```

### Comments

```nunjucks
{# This is a comment that won't appear in output #}
```

### Safe Output

Use `safe` to output HTML without escaping:

```nunjucks
{{ content | safe }}
```

### Setting Variables

```nunjucks
{% set myVar = "value" %}
{% set myArray = [1, 2, 3] %}
{% set myObj = { key: "value" } %}
```

### Macros

Create reusable template functions:

```nunjucks
{% macro postCard(post) %}
<article class="post-card">
  <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
  <time>{{ post.date | date('short') }}</time>
</article>
{% endmacro %}

<!-- Use the macro -->
{% for post in posts %}
  {{ postCard(post) }}
{% endfor %}
```

For more Nunjucks features, see the [official documentation](https://mozilla.github.io/nunjucks/templating.html).
