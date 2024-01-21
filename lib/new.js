import fs from 'fs'
import path from 'path'
import config from './readconfig.js'
import { mkdir } from './helpers.js'
import slugify from 'slugify'

const { app } = config

export const create = (type, folder) => {
  if (!type || !folder) {
    console.log('Must specify a type and folder')
    process.exit(1)
  }

  const slugified = slugify(folder, {
    replacement: '-',
    lower: true,
    strict: true,
    locale: 'en',
    trim: true,
  })

  if (!['page', 'post'].includes(type)) {
    console.log('Invalid type.  post or page')
    process.exit(1)
  }

  const date = new Date()
  const createdAt = date.toISOString()

  const template = `---
created_at: ${createdAt}
title: ${slugified}
description:
image: 
template: ${type}
---

Add ${type} content here

`

  const root = path.join(app.src, app.content, slugified)
  mkdir(root)
  fs.writeFileSync(path.join(root, `index.md`), template)
}
