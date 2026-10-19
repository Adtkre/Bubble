/**
 * BUBBLE - Dual-Engine Database Adapter
 * Seamlessly connects to Vercel Postgres / Neon in production,
 * and falls back to a persistent local database in local development.
 */

const fs = require('fs');
const path = require('path');
let Pool;
try {
  // Use Neon's serverless driver with HTTP fetch & WebSocket fallback to eliminate TLS disconnects
  const neonServerless = require('@neondatabase/serverless');
  Pool = neonServerless.Pool;
  if (neonServerless.neonConfig) {
    try {
      neonServerless.neonConfig.webSocketConstructor = require('ws');
    } catch (e) {}
    // Query over standard native HTTP fetch to bypass all raw socket/TLS drops
    neonServerless.neonConfig.poolQueryViaFetch = true;
  }
} catch (e) {
  Pool = require('pg').Pool;
}

function findConnectionString() {
  const direct =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.STORAGE_DATABASE_URL ||
    process.env.STORAGE_URL ||
    process.env.STORAGE_POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (direct) return direct;

  // Dynamically inspect environment variables for any postgresql URI
  for (const [key, val] of Object.entries(process.env)) {
    if (typeof val === 'string' && (val.startsWith('postgres://') || val.startsWith('postgresql://'))) {
      return val;
    }
  }
  return null;
}

let pgPool = null;
const connectionString = findConnectionString();
const isPostgresConfigured = Boolean(connectionString);

if (isPostgresConfigured) {
  try {
    pgPool = new Pool({
      connectionString,
      ssl: true
    });
  } catch (e) {
    console.error('Failed to create pg pool:', e);
  }
}

// Memory database cache to protect against read-only serverless filesystems
let memoryDb = {
  users: [
    {
      id: 'user_admin_root',
      email: 'admin@bubble.dev',
      password_hash: '$2b$10$iEt90A1DLH2KulEks4DFHu2a0esMd64.pmp0j7IIB/0cixKLq4ava',
      name: 'Bubble Administrator',
      role: 'admin',
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString()
    }
  ],
  login_logs: [],
  projects: []
};

// Safe path for Vercel (/tmp) vs local (data/bubble_db.json)
const LOCAL_DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'bubble_db.json')
  : path.join(process.cwd(), 'data', 'bubble_db.json');

function readLocalDb() {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const dir = path.dirname(LOCAL_DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(memoryDb, null, 2));
      return memoryDb;
    }
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    memoryDb = parsed;
    return parsed;
  } catch (err) {
    return memoryDb;
  }
}

function writeLocalDb(data) {
  try {
    memoryDb = data;
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    // In-memory fallback is already updated
  }
}

let initPromise = null;

/**
 * Initialize Tables in PostgreSQL if running on Vercel Postgres
 */
async function initPostgresTables() {
  if (!pgPool) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        email VARCHAR(255) NOT NULL,
        action VARCHAR(64) NOT NULL,
        ip_address VARCHAR(128),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        blocks JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default admin account directly in PostgreSQL if missing
    const adminCheck = await pgPool.query("SELECT id FROM users WHERE LOWER(email) = 'admin@bubble.dev' LIMIT 1");
    if (adminCheck.rows.length === 0) {
      const defaultAdminHash = '$2b$10$iEt90A1DLH2KulEks4DFHu2a0esMd64.pmp0j7IIB/0cixKLq4ava'; // bcrypt('admin123')
      await pgPool.query(
        `INSERT INTO users (id, email, password_hash, name, role)
         VALUES ('user_admin_root', 'admin@bubble.dev', $1, 'Bubble Administrator', 'admin')`,
        [defaultAdminHash]
      );
      console.log('[DB] Auto-seeded default admin into Vercel Postgres.');
    }
  } catch (err) {
    console.error('Postgres init check:', err.message);
  }
}

async function ensureInit() {
  if (pgPool && !initPromise) {
    initPromise = initPostgresTables();
  }
  if (initPromise) {
    await initPromise;
  }
}

const DB = {
  isPostgres: isPostgresConfigured,

  // --- Users Operations ---
  async findUserByEmail(email) {
    await ensureInit();
    const cleanEmail = (email || '').toLowerCase().trim();
    if (pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres query fallback to local DB:', err.message);
      }
    }
    const data = readLocalDb();
    return data.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    if (pgPool) {
      try {
        const res = await pgPool.query('SELECT id, email, name, role, created_at, last_login_at FROM users WHERE id = $1 LIMIT 1', [id]);
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres findUserById fallback to local DB:', err.message);
      }
    }
    const data = readLocalDb();
    const u = data.users.find(u => u.id === id);
    if (!u) return null;
    const { password_hash, ...safe } = u;
    return safe;
  },

  async createUser({ id, email, password_hash, name, role = 'user' }) {
    const cleanEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();

    if (pgPool) {
      try {
        const res = await pgPool.query(
          `INSERT INTO users (id, email, password_hash, name, role, created_at, last_login_at)
           VALUES ($1, $2, $3, $4, $5, $6, $6)
           RETURNING id, email, name, role, created_at, last_login_at`,
          [id, cleanEmail, password_hash, name, role, now]
        );
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres createUser fallback to local DB:', err.message);
      }
    }

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
  },

  async updateLastLogin(userId) {
    const now = new Date().toISOString();
    if (pgPool) {
      try {
        await pgPool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, userId]);
        return;
      } catch (err) {
        console.warn('Postgres updateLastLogin fallback:', err.message);
      }
    }
    const data = readLocalDb();
    const u = data.users.find(x => x.id === userId);
    if (u) {
      u.last_login_at = now;
      writeLocalDb(data);
    }
  },

  async getAllUsers() {
    if (pgPool) {
      try {
        const res = await pgPool.query(`
          SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at,
                 COUNT(p.id)::int as total_projects
          FROM users u
          LEFT JOIN projects p ON u.id = p.user_id
          GROUP BY u.id
          ORDER BY u.created_at DESC
        `);
        if (res.rows) return res.rows;
      } catch (err) {
        console.warn('Postgres getAllUsers fallback:', err.message);
      }
    }
    const data = readLocalDb();
    return data.users.map(u => {
      const total_projects = (data.projects || []).filter(p => p.user_id === u.id).length;
      const { password_hash, ...safe } = u;
      return { ...safe, total_projects };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async updateUserRole(userId, newRole) {
    if (pgPool) {
      try {
        const res = await pgPool.query('UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role', [newRole, userId]);
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres updateUserRole fallback:', err.message);
      }
    }
    const data = readLocalDb();
    const u = data.users.find(x => x.id === userId);
    if (u) {
      u.role = newRole;
      writeLocalDb(data);
      return { id: u.id, email: u.email, name: u.name, role: u.role };
    }
    return null;
  },

  // --- Audit Log Operations ---
  async addAuditLog({ id, user_id, email, action, ip_address, user_agent }) {
    const now = new Date().toISOString();
    if (pgPool) {
      try {
        await pgPool.query(
          `INSERT INTO login_logs (id, user_id, email, action, ip_address, user_agent, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, user_id, email, action, ip_address || '127.0.0.1', user_agent || 'Unknown Browser', now]
        );
        return;
      } catch (err) {
        console.warn('Postgres addAuditLog fallback:', err.message);
      }
    }
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
    if (data.login_logs.length > 500) data.login_logs.pop();
    writeLocalDb(data);
  },

  async getRecentAuditLogs(limit = 100) {
    if (pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM login_logs ORDER BY created_at DESC LIMIT $1', [limit]);
        if (res.rows) return res.rows;
      } catch (err) {
        console.warn('Postgres getRecentAuditLogs fallback:', err.message);
      }
    }
    const data = readLocalDb();
    return (data.login_logs || []).slice(0, limit);
  },

  // --- Projects Operations ---
  async getProjectsByUser(userId) {
    if (pgPool) {
      try {
        const res = await pgPool.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
        if (res.rows) return res.rows;
      } catch (err) {
        console.warn('Postgres getProjectsByUser fallback:', err.message);
      }
    }
    const data = readLocalDb();
    return (data.projects || []).filter(p => p.user_id === userId).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  },

  async saveProject({ id, user_id, name, blocks }) {
    const now = new Date().toISOString();
    if (pgPool) {
      try {
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
        if (res.rows && res.rows[0]) return res.rows[0];
      } catch (err) {
        console.warn('Postgres saveProject fallback:', err.message);
      }
    }
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
  },

  async deleteProject(id, userId) {
    if (pgPool) {
      try {
        const res = await pgPool.query('DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        return (res.rowCount || 0) > 0;
      } catch (err) {
        console.warn('Postgres deleteProject fallback:', err.message);
      }
    }
    const data = readLocalDb();
    const before = data.projects.length;
    data.projects = data.projects.filter(p => !(p.id === id && p.user_id === userId));
    writeLocalDb(data);
    return data.projects.length < before;
  },

  // --- System KPI Metrics ---
  async getSystemStats() {
    if (pgPool) {
      try {
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
      } catch (err) {
        console.warn('Postgres getSystemStats fallback:', err.message);
      }
    }
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
};

module.exports = DB;
