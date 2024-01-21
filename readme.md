# Sia blog

Sia is static site generator

## Installation

```
npm install --save-dev @terrymooreii/sia
```

After installation run the following command in a new node repo

```
sia init
```

This will install the nunjucks template files, some base css and a shell `index.html`

It also add the `.siarc.js` config file to the root of your project.

The `.siarc.js` file contains two sections.  One for configuing your site information. The second is to configure the app's folders, numjucks template, and markdown configutation. 


## Adding pages and posts

The easist way to add a new page or a post to your site is to run the following command

```
sia new post new-post-name
```

This will create a new folder in the `content` folder called `new-post-name` and add a shell `index.html`

You can do the same thing to create a new page

```
sia new post new-post-name
```

The difference between pages and posts is that during the build process sia keeps tack of all posts and generate a post list page at the url `/blog`

New pages and post will have config area at the top that tell sia how to handle the page and post.  All properties expect the image is required. The image is used to generate the page's `og:image`.  If its not present we will use the `blogs_image`.

```
---

template: post
title: Page title
created_at: 2024-01-12 16:00:00-5:00
description: Testing out some markdown
---
```

- `template` is the nunjucks template located in `src/_partials`
- `title` is the post title and used in the blog posts list page
- `create_at` is the date of the post
- `description` a short description of the post

Not ready to publish a post?  Add `draft: true`

## Build

To build the site run 

```
sia build
```

This will parse all markdown files and then numjucks. 
The default output folder is `/public`

The build command will also copy all `assets`, `js` and `css` to the `/public` folder.  If a post or a page folder contain other files other than markdown then those files will also get moved to the `/public/<folder>`.  This makes it easy to organize a single page or posts with custom js, css, or images.

All markdown files will get parsed with `markdown-it` and you can add additional `markdown-it` plugins in the `.siarc.js` file.

## Plugins

There are lots of plugins that you can use in sia to extend [markdown-it](https://github.com/markdown-it/markdown-it) and in turn sia.  Just install the plugin, import itto your `.siarc.js` file and then add it to the `app.markdown.plugins` array.  

## Local developement 

Currently these are the apps that I use on my blog for local development and building

```
"scripts": {
  "serve": "npx http-server public",
  "watch": "forever --watchDirectory ./src -w ./node_modules/@terrymooreii/sia/lib/index.js build",
  "dev": "concurrently --kill-others \"npm run watch\" \"npm run serve\"",
  "clean": "rm -rf public",
  "build": "sia build"
},
```

```
npm install forever concurrently http-server
```

Coming soon will be a simple way to run a local web server to see live updates to posts and pages as you work via the `sia` command.

## Templates and site configuration

All `njk` files are in a simple default state to generate a simple and clean website.  You can modifiy the html in these file to customer your site to look how you want.

If you make something cool please let me know.


## Todo

This is a list of items that still need to be tackled

[ ] Better error handling
[ ] Pagination
[ ] `sia init` to generate a new site and clean up of the initial theme
[ ] While pages and longer blog posts are great, i would like to add a mircoblogging feed to the site.
[ ] Github action to publish new version to npm