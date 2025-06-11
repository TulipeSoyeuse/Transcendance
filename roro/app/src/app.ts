import * as path from 'path'
import fastifyStatic from '@fastify/static';
import fastify from 'fastify'
import root from './routes/root'
import dbPlugin from './plugins/dbplugin';
import formBody from '@fastify/formbody';
const server = fastify()

server.register(root.routes)
server.register(root.api)
// add fastify.database everywhere in the backend
server.register(dbPlugin)
server.register(formBody)
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
