---
title: "Welcome to Sia"
date: 2024-12-17
tags: [getting-started, sia]
---

Welcome to your new blog powered by **Sia**! This is a sample post to help you get started.

## What is Sia?

Sia is a simple, powerful static site generator that supports:

- **Markdown** with front matter for easy content creation
- **Nunjucks templates** for flexible layouts
- **Tags** for organizing your content
- **Pagination** for listing pages
- **Live reload** during development
- **Clean, light theme** out of the box

## Getting Started

### Creating Content

To create a new blog post:

```bash
npx sia new post "My New Post"
```

To create a new page:

```bash
npx sia new page "About Me"
```

To create a short note (like a tweet):

```bash
npx sia new note "Just discovered something cool!"
```

### Running the Development Server

```bash
npm run dev
```

This will start a local server with live reload at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

This will generate your static site in the `dist` folder, ready to deploy!

## Front Matter

Each markdown file can have front matter at the top:

```yaml
---
title: "My Post Title"
date: 2024-12-17
tags: [tag1, tag2]
draft: true  # Set to true to hide from production
---
```

## Customization

- Edit `_config.yml` to change site settings
- Add custom layouts in `_layouts/`
- Add custom includes in `_includes/`
- Override default styles by adding `styles/main.css`

Happy blogging! 🚀
