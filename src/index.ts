#!/usr/bin/env node

import { main } from './main.js'

main(process.argv)
  .then(() => {})
  .catch(err => {
    console.error(err)
    throw err
  })
