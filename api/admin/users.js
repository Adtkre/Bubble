const DB = require('../../lib/db');
const Auth = require('../../lib/auth');
const { parseBody, sendJson, handleCors } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const tokenUser = Auth.extractUserFromRequest(req);
  if (!tokenUser) {
    return sendJson(res, 401, { error: 'Unauthorized. Authentication token required.' });
  }

  if (tokenUser.role !== 'admin') {
    return sendJson(res, 403, { error: 'Access denied. Administrator privileges required.' });
  }

  if (req.method === 'GET') {
    try {
      const users = await DB.getAllUsers();
      return sendJson(res, 200, { ok: true, users });
    } catch (err) {
      console.error('Admin get users error:', err);
      return sendJson(res, 500, { error: 'Failed to retrieve users list.' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = await parseBody(req);
      const { userId, role } = body;

      if (!userId || !role || !['admin', 'user'].includes(role)) {
        return sendJson(res, 400, { error: 'Valid userId and role (admin|user) are required.' });
      }

      const updated = await DB.updateUserRole(userId, role);
      if (!updated) {
        return sendJson(res, 404, { error: 'Target user not found.' });
      }

      return sendJson(res, 200, { ok: true, user: updated });
    } catch (err) {
      console.error('Admin update user role error:', err);
      return sendJson(res, 500, { error: 'Failed to update user role.' });
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
};
