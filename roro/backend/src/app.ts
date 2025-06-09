'use strict'

import * as path from 'path'
import fastifyStatic from '@fastify/static';
import fastify from 'fastify'
import routes from './routes/root.js'

const server = fastify()

server.register(routes)

server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
