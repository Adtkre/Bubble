const DB = require('../../lib/db');
const Auth = require('../../lib/auth');
const { parseBody, sendJson, handleCors } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const tokenUser = Auth.extractUserFromRequest(req);
  if (!tokenUser) {
    return sendJson(res, 401, { error: 'Please log in to manage your cloud projects.' });
  }

  // GET: Fetch all projects for the logged in user
  if (req.method === 'GET') {
    try {
      const projects = await DB.getProjectsByUser(tokenUser.id);
      return sendJson(res, 200, { ok: true, projects });
    } catch (err) {
      console.error('Get projects error:', err);
      return sendJson(res, 500, { error: 'Failed to retrieve projects from database.' });
    }
  }

  // POST: Save or update project
  if (req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { id, name, blocks } = body;

      if (!id || !name) {
        return sendJson(res, 400, { error: 'Project ID and name are required.' });
      }

      const saved = await DB.saveProject({
        id,
        user_id: tokenUser.id,
        name,
        blocks: blocks || []
      });

      return sendJson(res, 200, { ok: true, project: saved });
    } catch (err) {
      console.error('Save project error:', err);
      return sendJson(res, 500, { error: 'Failed to save project to database.' });
    }
  }

  // DELETE: Delete project
  if (req.method === 'DELETE') {
    try {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const id = url.searchParams.get('id');

      if (!id) {
        return sendJson(res, 400, { error: 'Project ID query parameter is required.' });
      }

      const deleted = await DB.deleteProject(id, tokenUser.id);
      return sendJson(res, 200, { ok: true, deleted });
    } catch (err) {
      console.error('Delete project error:', err);
      return sendJson(res, 500, { error: 'Failed to delete project from database.' });
    }
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
};
