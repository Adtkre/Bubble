/**
 * BUBBLE - Dual-Engine Database Adapter
 * Seamlessly connects to Vercel Postgres / Neon in production,
 * and falls back to a persistent local database in local development.
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

let pgPool = null;
const isPostgresConfigured = Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);

if (isPostgresConfigured) {
  pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Local File Database for offline / local npm start without Postgres
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'bubble_db.json');

function readLocalDb() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const initialData = {
        users: [],
        login_logs: [],
        projects: []
      };
      const dir = path.dirname(LOCAL_DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return { users: [], login_logs: [], projects: [] };
  }
}

function writeLocalDb(data) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
}

/**
 * Initialize Tables in PostgreSQL if running on Vercel Postgres
 */
async function initPostgresTables() {
  if (!pgPool) return;
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        email VARCHAR(255) NOT NULL,
        action VARCHAR(64) NOT NULL,
        ip_address VARCHAR(128),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        blocks JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('Failed to initialize Postgres tables:', err);
  } finally {
    client.release();
  }
}

// Automatically init tables if Postgres is configured
if (isPostgresConfigured) {
  initPostgresTables().catch(console.error);
}

const DB = {
  isPostgres: isPostgresConfigured,

  // --- Users Operations ---
  async findUserByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
      return res.rows[0] || null;
    } else {
      const data = readLocalDb();
      return data.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
    }
  },

  async findUserById(id) {
    if (pgPool) {
      const res = await pgPool.query('SELECT id, email, name, role, created_at, last_login_at FROM users WHERE id = $1 LIMIT 1', [id]);
      return res.rows[0] || null;
    } else {
      const data = readLocalDb();
      const u = data.users.find(u => u.id === id);
      if (!u) return null;
      const { password_hash, ...safe } = u;
      return safe;
    }
  },

  async createUser({ id, email, password_hash, name, role = 'user' }) {
    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    if (pgPool) {
      const res = await pgPool.query(
        `INSERT INTO users (id, email, password_hash, name, role, created_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING id, email, name, role, created_at, last_login_at`,
        [id, cleanEmail, password_hash, name, role, now]
      );
      return res.rows[0];
    } else {
      const data = readLocalDb();
      const newUser = {
        id,
        email: cleanEmail,
        password_hash,
        name,
        role,
        created_at: now,
        last_login_at: now
      };
      data.users.push(newUser);
      writeLocalDb(data);
      const { password_hash: _, ...safe } = newUser;
      return safe;
    }
  },

  async updateLastLogin(userId) {
    const now = new Date().toISOString();
    if (pgPool) {
      await pgPool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, userId]);
    } else {
      const data = readLocalDb();
      const u = data.users.find(x => x.id === userId);
      if (u) {
        u.last_login_at = now;
        writeLocalDb(data);
      }
    }
  },

  async getAllUsers() {
    if (pgPool) {
      const res = await pgPool.query(`
        SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at,
               COUNT(p.id)::int as total_projects
        FROM users u
        LEFT JOIN projects p ON u.id = p.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `);
      return res.rows;
    } else {
      const data = readLocalDb();
      return data.users.map(u => {
        const total_projects = (data.projects || []).filter(p => p.user_id === u.id).length;
        const { password_hash, ...safe } = u;
        return { ...safe, total_projects };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async updateUserRole(userId, newRole) {
    if (pgPool) {
      const res = await pgPool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role', [newRole, userId]);
      return res.rows[0] || null;
    } else {
      const data = readLocalDb();
      const u = data.users.find(x => x.id === userId);
      if (u) {
        u.role = newRole;
        writeLocalDb(data);
        return { id: u.id, email: u.email, name: u.name, role: u.role };
      }
      return null;
    }
  },

  // --- Audit Log Operations ---
  async addAuditLog({ id, user_id, email, action, ip_address, user_agent }) {
    const now = new Date().toISOString();
    if (pgPool) {
      await pgPool.query(
        `INSERT INTO login_logs (id, user_id, email, action, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, user_id, email, action, ip_address || '127.0.0.1', user_agent || 'Unknown Browser', now]
      );
    } else {
      const data = readLocalDb();
      data.login_logs.unshift({
        id,
        user_id,
        email,
        action,
        ip_address: ip_address || '127.0.0.1',
        user_agent: user_agent || 'Unknown Browser',
        created_at: now
      });
      // Keep bounded at last 500 logs
      if (data.login_logs.length > 500) data.login_logs.pop();
      writeLocalDb(data);
    }
  },

  async getRecentAuditLogs(limit = 100) {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM login_logs ORDER BY created_at DESC LIMIT $1', [limit]);
      return res.rows;
    } else {
      const data = readLocalDb();
      return (data.login_logs || []).slice(0, limit);
    }
  },

  // --- Projects Operations ---
  async getProjectsByUser(userId) {
    if (pgPool) {
      const res = await pgPool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
      return res.rows;
    } else {
      const data = readLocalDb();
      return (data.projects || []).filter(p => p.user_id === userId).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    }
  },

  async saveProject({ id, user_id, name, blocks }) {
    const now = new Date().toISOString();
    if (pgPool) {
      const res = await pgPool.query(
        `INSERT INTO projects (id, user_id, name, blocks, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           blocks = EXCLUDED.blocks,
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [id, user_id, name, JSON.stringify(blocks), now]
      );
      return res.rows[0];
    } else {
      const data = readLocalDb();
      const existingIdx = data.projects.findIndex(p => p.id === id);
      const proj = {
        id,
        user_id,
        name,
        blocks,
        updated_at: now,
        created_at: existingIdx >= 0 ? data.projects[existingIdx].created_at : now
      };
      if (existingIdx >= 0) {
        data.projects[existingIdx] = proj;
      } else {
        data.projects.unshift(proj);
      }
      writeLocalDb(data);
      return proj;
    }
  },

  async deleteProject(id, userId) {
    if (pgPool) {
      const res = await pgPool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
      return (res.rowCount || 0) > 0;
    } else {
      const data = readLocalDb();
      const before = data.projects.length;
      data.projects = data.projects.filter(p => !(p.id === id && p.user_id === userId));
      writeLocalDb(data);
      return data.projects.length < before;
    }
  },

  // --- System KPI Metrics ---
  async getSystemStats() {
    if (pgPool) {
      const userCountRes = await pgPool.query('SELECT COUNT(*)::int as count FROM users');
      const projectCountRes = await pgPool.query('SELECT COUNT(*)::int as count FROM projects');
      const activeTodayRes = await pgPool.query(`
        SELECT COUNT(DISTINCT user_id)::int as count
        FROM login_logs
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `);
      const recentLoginsRes = await pgPool.query(`
        SELECT COUNT(*)::int as count
        FROM login_logs
        WHERE action = 'login' AND created_at >= NOW() - INTERVAL '24 hours'
      `);

      return {
        totalUsers: userCountRes.rows[0]?.count || 0,
        totalProjects: projectCountRes.rows[0]?.count || 0,
        activeUsersToday: activeTodayRes.rows[0]?.count || 0,
        recentLogins24h: recentLoginsRes.rows[0]?.count || 0
      };
    } else {
      const data = readLocalDb();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const activeToday = new Set(
        (data.login_logs || [])
          .filter(l => new Date(l.created_at) >= oneDayAgo)
          .map(l => l.user_id)
      ).size;

      const recentLogins = (data.login_logs || [])
        .filter(l => l.action === 'login' && new Date(l.created_at) >= oneDayAgo).length;

      return {
        totalUsers: (data.users || []).length,
        totalProjects: (data.projects || []).length,
        activeUsersToday: activeToday,
        recentLogins24h: recentLogins
      };
    }
  }
};

module.exports = DB;
