#!/usr/bin/env node

import { main } from './main.js'

try {
  await main(process.argv)
} catch (err) {
  console.error(err)
  throw err
}
