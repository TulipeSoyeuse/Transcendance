'use strict'

import * as path from 'path'
import AutoLoad from '@fastify/autoload'

// Pass --options via CLI arguments in command to enable these options.
import fastify from 'fastify'

const server = fastify()

server.register(require('./routes/root.js'))

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
