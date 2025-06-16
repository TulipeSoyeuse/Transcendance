/*
FOR 2A protocol: for signup process, the infos are inserted into the db without completing
qrcode/2fa process. It s acceptable if you dont think it as fully part of the signup process
but as a security protocol to log in but check with others

*/

const { runAsync, runAllAsync } = require('../db');
const path = require('path');
const fastifyPlugin = require('fastify-plugin');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');

async function authRoutes(fastify, options) {
  // Sign Up - register user
  fastify.post('/signup', async (request, reply) => {
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return reply.code(400).send('Missing name, email, or password');
    }
    try {
      const hashedPwd = await bcrypt.hash(password, 10); // hashing pwd with limit 10 char
      const twofa = speakeasy.generateSecret({ name: `MyApp (${email})` });
      await runAsync(
        `INSERT INTO form_data (name, email, password, twofa_secret) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPwd, twofa.base32] // base32 is the format speakeasy uses for storage
      );
 
        // Optionally return QR code or secret to enable 2FA on the frontend
      const qrCodeDataUrl = await qrcode.toDataURL(twofa.otpauth_url);

      return reply.send({
        msg: `User ${name} registered successfully`,
        twofa_secret: twofa.base32,        // Optional: for dev/debug only
        otpauth_url: twofa.otpauth_url,    // Can use this directly in apps
        qr_code: qrCodeDataUrl             // Data URL to embed as <img src="">
      });

    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return reply.code(400).send('Email already registered.');
      }
      console.error('DB error:', err);
      return reply.code(500).send('Failed to save data');
    }
  });

  // Sign In - check user credentials
  fastify.post('/signin', async (request, reply) => {
    const { name, password } = request.body;
    if (!name || !password) {
      return reply.code(400).send('Missing name or password');
    }
    try {
      const rows = await runAllAsync(`SELECT * FROM form_data WHERE name = ?`, [name]);
      // const user = await getUserByEmail(email); another way to do it
      if (rows.length === 0) {
        return reply.code(401).send('Invalid credentials');
      }

      const user = rows[0];
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid)
        return reply.code(401).send('Invalid password');


      return reply.send({ msg: 'Password valid, now verify 2FA' });
      
      } catch (err) {
        console.error('DB error:', err);
        return reply.code(500).send('Failed to sign in');
      }
  });

  fastify.get('/protected', { preValidation: [fastify.authenticate] }, async (request, reply) => { // protected route to check JWT
    // If we get here, JWT is valid and payload is available
    const user = request.user; // populated by `fastify.authenticate`
    return { msg: `Hello ${user.name}, you accessed a protected route!` };
  });

  
  fastify.post('/setup-2fa', async (request, reply) => {
    const { name } = request.body;

    const secret = speakeasy.generateSecret({ name: `MyApp (${name})` });

    // Store `secret.base32` in DB
    await runAsync(
      `UPDATE form_data SET twofa_secret = ? WHERE name = ?`,
      [secret.base32, name]
    );

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    return reply.send({ qrCode: qrDataUrl, secret: secret.base32 });
  });

  fastify.post('/verify-2fa', async (request, reply) => {
    const { name, token } = request.body;

    if (!name || !token) {
      return reply.code(400).send('Missing name or token');
    }

    try {
      const rows = await runAllAsync(
        `SELECT * FROM form_data WHERE name = ?`,
        [name]
      );

      if (rows.length === 0) {
        return reply.code(404).send('User not found');
      }

      const user = rows[0];

      if (!user.twofa_secret) {
        return reply.code(400).send('2FA is not enabled for this user');
      }

      const isValid = speakeasy.totp.verify({
        secret: user.twofa_secret,
        encoding: 'base32',
        token,
        window: 1, // double check
      });

      if (!isValid) {
        return reply.code(401).send('Invalid 2FA token');
      }

      // 2FA passed, generate JWT !!!!!!!!!!!!!!!!!!!!!!!!
      const jwtToken = fastify.jwt.sign({
        name: user.name,
        email: user.email
      });

      return reply.send({ token: jwtToken, name: user.name });

    } catch (err) {
      console.error('Error verifying 2FA:', err);
      return reply.code(500).send('Internal server error');
    }
  });

  fastify.post('/update', { preValidation: [fastify.authenticate] }, async (request, reply) => { //mettre ailleurs!!!!!!
    const { name, email, password } = request.body;
    if (!name || !email || !password) {
      return reply.code(400).send('Missing fields');
    }

    try {
      const hashedPwd = await bcrypt.hash(password, 10);
      await runAsync(
        `UPDATE form_data SET email = ?, password = ? WHERE name = ?`,
        [email, hashedPwd, name]
      );
      return reply.send('User updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      return reply.code(500).send('Failed to update user');
    }
  });

  // Delete user
  fastify.post('/delete', async (request, reply) => {//mettre ailleurs!!!!!!
    const { name } = request.body;
    if (!name) return reply.code(400).send('Missing name');

    try {
      await runAsync(`DELETE FROM form_data WHERE name = ?`, [name]);
      return reply.send('User deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      return reply.code(500).send('Failed to delete user');
    }
  });
}

module.exports = fastifyPlugin(authRoutes);
module.exports = authRoutes;