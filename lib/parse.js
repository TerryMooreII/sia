import config from './readconfig.js'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'
import nunjucks from 'nunjucks'
import md from './markdown.js'

import { formatDate, mkdir, writefile } from './helpers.js'

const { app, site } = config

nunjucks.configure(path.join(app.src, app.partials), {
  autoescape: false,
})

const render = (srcFolder, publicFolder, file) => {
  const parsed = matter.read(path.join(srcFolder, file))
  const { data: page, content } = parsed
  const fileName = path.parse(file).name
  const fileNameHtml = `${fileName}.html`

  if(page.draft) {
    return
  }

  if (!page.template) {
    throw new Error(`Missing template tag in ${file}`)
  }

  page.date = formatDate(page.created_at)

  // technically slug is the permalink or uri
  // this removes the public folder path to reveal the slug path
  page.slug = path.join(publicFolder).replace(app.public, '')
  // index pages will render automatically in folder but if the file
  // name is not then make sure it included in the permalink
  if (fileNameHtml !== 'index.html') {
    page.slug = path.join(page.slug, fileNameHtml)
  }

  const html = md.render(content)
  const rendered = nunjucks.render(`${page.template}${app.template_ext}`, {
    content: html,
    page,
    site,
  })

  writefile(path.join(publicFolder, fileNameHtml), rendered)

  // collect all the page attibutes for blog posts
  if (page.template === 'post') {
    return { ...page }
  }
}

const getAllFiles = (srcPath, posts) => {
  // take the source path and generate the public path equivalent
  const publicPath = srcPath.replace(path.join(app.src, app.content), app.public)

  mkdir(publicPath)

  const files = fs.readdirSync(srcPath)

  files.forEach((file) => {
    const filePath = path.join(srcPath, file)

    if (fs.statSync(filePath).isDirectory()) {
      // recursively look at files
      getAllFiles(filePath, posts)
    } else {
      // Process markdown files and render the nunjucks template
      if (path.extname(file) === '.md') {
        const post = render(srcPath, publicPath, file)
        if (post) {
          posts.push(post)
        }
      } else {
        // file is not a markdown file so just copy it to its public folder
        fs.copyFileSync(path.join(srcPath, file), path.join(publicPath, file))
      }
    }
  })
  return posts
}

export const parseContent = () => {
  return getAllFiles(path.join(app.src, app.content), [], '/').filter((o) => o != null) // make sure there are no undefined items
}

export const generateBlogListPage = (posts) => {
  const rendered = nunjucks.render(app.posts_template, {
    posts,
    site,
  })

  const blogListDirectory = path.join(app.public, app.blog_list)

  mkdir(blogListDirectory)
  writefile(path.join(blogListDirectory, 'index.html'), rendered)
}
