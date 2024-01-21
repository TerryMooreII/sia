import url from 'url'
import path from 'path'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  // User Config
  site: {
    blog_url: process.env.BLOG_URL || '',
    blog_title: '',
    blog_description: '',
    blog_image: '',
    author: '',
    email_address: '',
    highlightjs_theme: 'atom-one-dark.min',
    nav: [
      {
        title: 'Home',
        href: '/',
      },
      {
        title: 'Blog',
        href: '/blog',
      },
    ],
  },

  // App config
  app: {
    public: `${__dirname}/public`,
    src: `${__dirname}/src`,
    partials: '_partials',
    template_ext: '.njk',
    content: 'content',
    css: 'css',
    js: 'js',
    assets: 'assets',
    images: 'imgs',
    posts_template: 'posts.njk',
    blog_list: 'blog',
    feed: {
      count: 10,
      rss2: true,
      atom1: true,
      json1: true,
    },
    markdown: {
      highlightjs: true,
      plugins: [],
    },
  },
}
