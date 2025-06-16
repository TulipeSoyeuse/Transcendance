/*
TO DO 

add email format validation, bcrypt, or error messages for invalid id values too.

http://localhost:3000/dashboard.html is accessible straight away which should not be the case ??

PB AVEC L UPDATE INFO, AFTER THE NEW PASSWORD SEEMS SO BE INVALID

Regarding JWT: We store it in the session storage (better security than local storage because
it gets erased every time the session is closed but less fluid for the user, has to reconnect every time)
Tho it seems to be better to use HTTP-only, Secure cookies for tokens to protect them from JavaScript access.
If you must use localStorage/sessionStorage, make sure your app is XSS hardened
NO IT IS NOT THE CASE!!!!!
--> REFREASH THE TOKEN OR TOKEN LAST LONGER OTHERWISE THE SESSION WILL BE CLOSE AT SOME POINT
*/

const path = require('path');
const Fastify = require('fastify');
const fastifyStatic = require('@fastify/static');
const fastifyJwt = require('@fastify/jwt');

const fastify = Fastify({ 
  logger: true,
  ignoreTrailingSlash: true,
});

// Plugins
fastify.register(require('@fastify/formbody'));

// Serve static files (e.g., HTML)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/', // serve at root path
});

fastify.register(fastifyJwt, {
  secret: 'your-super-secret' // use stronger secret here
});

fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
});

// Serve the main auth page
fastify.get('/', async (request, reply) => {
  return reply.sendFile('auth.html');
});

fastify.get('/dashboard', { preValidation: [fastify.authenticate] }, async (request, reply) => { // or maybe in a route/protected.js
  const user = request.user;
  return { message: `Welcome, ${user.name}`, email: user.email };
});

// Routes
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/form');
const clientRoutes = require('./routes/clients');

fastify.register(authRoutes);
fastify.register(formRoutes);
fastify.register(clientRoutes);

// Start server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
