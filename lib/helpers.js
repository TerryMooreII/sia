import fs from 'fs'

export const formatDate = (postDate) => {
  const d = new Date(postDate)
  const date = d.toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const time = d.toLocaleTimeString()
  return {
    datetime: `${date} ${time}`,
    date,
    year: d.getFullYear(),
  }
}

export const mkdir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
    return true
  }
  return false
}

export const cpdir = (src, dest) => {
  if (fs.existsSync(src)) {
    mkdir(dest)
    fs.cpSync(src, dest, { recursive: true })
    return true
  }
  return false
}

export const writefile = (file, content, options = { flags: 'w+' }) => {
  fs.writeFileSync(file, content, options)
}
