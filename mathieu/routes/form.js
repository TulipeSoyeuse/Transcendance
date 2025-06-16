const path = require('path');
const fs = require('fs');

async function formRoutes(fastify, options) {
  fastify.get('/form', async (request, reply) => {
    const formPath = path.join(__dirname, '../views/form.html');
    const formHtml = fs.readFileSync(formPath, 'utf-8');
    reply.type('text/html').send(formHtml);
  });
}

module.exports = formRoutes;