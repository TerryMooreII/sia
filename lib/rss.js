import fs from 'fs'
import path from 'path'
import { Feed } from 'feed'
import config from './readconfig.js'
const { app, site } = config

const feed = new Feed({
  title: site.blog_title,
  description: site.blog_description,
  id: site.blog_url,
  link: site.blog_url,
  language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
  image: site.blog_image,
  favicon: `${site.blog_url}/assets/favicon.ico`,
  copyright: `All rights reserved ${new Date().getFullYear()}, ${site.author}`,
  feedLinks: {
    json: `${site.blog_url}/feed.json`,
    atom: `${site.blog_url}/atom.xml`,
  },
  author: {
    name: site.author,
    email: site.email_address,
  },
})

const writeFeed = (name, content) => {
  fs.writeFileSync(path.join(app.public, name), content, {
    flag: 'w+',
  })
}

export const generateRSS = (posts, count = 10) => {
  posts.splice(0, count).forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${site.blog_url}${post.slug}`,
      link: `${site.blog_url}${post.slug}`,
      description: post.description,
      content: post.content,
      author: [
        {
          name: site.author,
          email: site.email_address,
          link: site.blog_url,
        },
      ],
      date: post.created_at,
      image: `${site.blog_url}/${post.image}`,
    })
  })

  if (app.feed.rss2) {
    writeFeed('rss.xml', feed.rss2())
  }

  if (app.feed.atom1) {
    writeFeed('atom.xml', feed.atom1())
  }

  if (app.feed.json1) {
    writeFeed('feed.json', feed.json1())
  }
}
