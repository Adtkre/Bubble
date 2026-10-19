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
    const { email, password } = body;

    if (!email || !password) {
      return sendJson(res, 400, { error: 'Email and password are required.' });
    }

    const user = await DB.findUserByEmail(email);
    if (!user) {
      return sendJson(res, 401, { error: 'Invalid email or password.' });
    }

    const isValid = await Auth.comparePassword(password, user.password_hash);
    if (!isValid) {
      return sendJson(res, 401, { error: 'Invalid email or password.' });
    }

    // Update last login
    await DB.updateLastLogin(user.id);

    // Record audit log
    const ip = Auth.getClientIp(req);
    const userAgent = Auth.getUserAgent(req);
    await DB.addAuditLog({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      user_id: user.id,
      email: user.email,
      action: 'login',
      ip_address: ip,
      user_agent: userAgent
    });

    const token = Auth.generateToken(user);

    return sendJson(res, 200, {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return sendJson(res, 500, { error: 'Internal server error during authentication.' });
  }
};
