import * as path from 'path'
import fastifyStatic from '@fastify/static';
import fastify from 'fastify'
import root from './routes/root'
import dbPlugin from './plugins/dbplugin';
import formbody from '@fastify/formbody';
import fastifySession from '@fastify/session'
import fastifyCookie from '@fastify/cookie'

const server = fastify()

// PLUGINS (register plugins first or you're gonna have issue)
server.register(formbody)
server.register(fastifyCookie)
server.register(fastifySession, {
  cookieName: 'sessionId',
  secret: '2c8c3c1549e14bfc7f124ed4a8dbbb94',
  cookie: { maxAge: 1800000, secure: "auto" }
})
server.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/',
});
// add fastify.database everywhere in the backend
server.register(dbPlugin)
// --------------------------

//all user endpoint here
server.register(root.routes)

//all api routes (and hooks ?) here
server.register(root.api)

//all request linked to authentification (and sessions managment ?) here
server.register(root.auth)

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
