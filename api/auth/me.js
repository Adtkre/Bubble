const DB = require('../../lib/db');
const Auth = require('../../lib/auth');
const { sendJson, handleCors } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const tokenUser = Auth.extractUserFromRequest(req);
  if (!tokenUser) {
    return sendJson(res, 401, { error: 'Unauthorized. Missing or invalid token.' });
  }

  try {
    const user = await DB.findUserById(tokenUser.id);
    if (!user) {
      return sendJson(res, 404, { error: 'User not found.' });
    }

    return sendJson(res, 200, {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        created_at: user.created_at,
        last_login_at: user.last_login_at
      }
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    return sendJson(res, 500, { error: 'Failed to retrieve user profile.' });
  }
};
