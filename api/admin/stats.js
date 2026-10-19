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
    return sendJson(res, 401, { error: 'Unauthorized. Authentication token required.' });
  }

  if (tokenUser.role !== 'admin') {
    return sendJson(res, 403, { error: 'Access denied. Administrator privileges required.' });
  }

  try {
    const stats = await DB.getSystemStats();
    return sendJson(res, 200, {
      ok: true,
      stats
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return sendJson(res, 500, { error: 'Failed to retrieve administrative statistics.' });
  }
};
