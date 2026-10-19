const DB = require('../../lib/db');
const Auth = require('../../lib/auth');
const { parseBody, sendJson, handleCors } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await parseBody(req);
    const { name, email, password } = body;

    if (!email || !password || !name) {
      return sendJson(res, 400, { error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return sendJson(res, 400, { error: 'Password must be at least 6 characters long.' });
    }

    const existing = await DB.findUserByEmail(email);
    if (existing) {
      return sendJson(res, 400, { error: 'An account with this email already exists.' });
    }

    const password_hash = await Auth.hashPassword(password);
    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newUser = await DB.createUser({
      id: userId,
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password_hash,
      role: 'user'
    });

    // Record audit log
    const ip = Auth.getClientIp(req);
    const userAgent = Auth.getUserAgent(req);
    await DB.addAuditLog({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: newUser.id,
      email: newUser.email,
      action: 'signup',
      ip_address: ip,
      user_agent: userAgent
    });

    const token = Auth.generateToken(newUser);

    return sendJson(res, 201, {
      ok: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      token
    });
  } catch (err) {
    console.error('Signup error:', err);
    return sendJson(res, 500, { error: 'Failed to create account. Please try again.' });
  }
};
