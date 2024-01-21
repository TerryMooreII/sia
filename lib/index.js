#!/usr/bin/env node

import { build } from './build.js'
import { create } from './new.js'
import { init } from './init.js'

const [, , cmd, type, folder] = process.argv

switch (cmd) {
  case init:
    init()
    break
  case 'build':
    build()
    break
  case 'new':
    create(type, folder)
    break
  default:
    console.log('Missing command')
    break
}
