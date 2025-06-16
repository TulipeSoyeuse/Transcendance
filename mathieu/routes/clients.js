const { runAllAsync, runAsync } = require('../db');
const runWithChanges = require('../utils/runWithChanges');

async function clientRoutes(fastify, options) {
  // Submit form
  fastify.post('/', async (request, reply) => {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return reply.code(400).send('Missing name, email, or password');
    }

    try {
      await runAsync(
        `INSERT INTO form_data (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password]
      );

      return reply
        .type('text/html')
        .send(`<h1>Thank you, ${name}!</h1><p>Your data has been saved.</p>`);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return reply.code(400).send('Email already registered.');
      }

      console.error('DB error:', err);
      return reply.code(500).send('Failed to save data');
    }
  });


// List all clients - password does not appear for sec measures
fastify.get('/clients', async (request, reply) => {
  try {
    const rows = await runAllAsync(`SELECT * FROM form_data ORDER BY created_at DESC`);
    const html = `
      <h1>Registered Clients</h1>
      <ul>
        ${rows.length > 0
          ? rows.map(row => `<li>${row.name} - ${row.email} - ${row.created_at}</li>`).join('')
          : '<li>No clients found.</li>'}
      </ul>
    `;

    reply.type('text/html').send(html);
  } catch (err) {
    console.error('DB error:', err);
    reply.code(500).send('Failed to retrieve data');
  }
});

fastify.delete('/clients/:id', async (request, reply) => {
  const { id } = request.params;

  try {
    const result = await runWithChanges(`DELETE FROM form_data WHERE id = ?`, [id]);

    if (result.changes === 0) {
      return reply.code(404).send('Client not found');
    }

    return reply.send({ success: true, deletedId: id });
  } catch (err) {
    console.error('Delete error:', err);
    return reply.code(500).send('Failed to delete');
  }
});


// PUT /clients/:id route
fastify.put('/clients/:id', async (request, reply) => {
  const { id } = request.params;
  const { name, email } = request.body;

  if (!name || !email) {
    return reply.code(400).send('Missing name or email');
  }

  try {
    const result = await runWithChanges(
      `UPDATE form_data SET name = ?, email = ? WHERE id = ?`,
      [name, email, id]
    );

    if (result.changes === 0) {
      return reply.code(404).send('Client not found');
    }

    return reply.send({ success: true, updatedId: id });
  } catch (err) {
    console.error('Update error:', err);
    return reply.code(500).send('Failed to update');
  }
  });
}

module.exports = clientRoutes;
