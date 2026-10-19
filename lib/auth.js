/**
 * BUBBLE - JWT & Authentication Security Helper
 * Password hashing with bcryptjs and JWT token issuance & verification.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DB = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'bubble_super_secret_jwt_key_2026_secure';
const JWT_EXPIRES_IN = '7d';

/**
 * Seed default admin if no users exist
 */
async function ensureAdminUser() {
  try {
    const existingAdmin = await DB.findUserByEmail('admin@bubble.dev');
    if (!existingAdmin) {
      const hash = await bcrypt.hash('admin123', 10);
      await DB.createUser({
        id: 'user_admin_root',
        email: 'admin@bubble.dev',
        password_hash: hash,
        name: 'Bubble Administrator',
        role: 'admin'
      });
      console.log('🛡️ Seeded default admin account: admin@bubble.dev / admin123');
    }
  } catch (err) {
    console.error('Admin seeding check:', err);
  }
}

// Auto-seed admin user
ensureAdminUser();

const Auth = {
  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  },

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return null;
    }
  },

  extractUserFromRequest(req) {
    // 1. From Authorization header
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      return this.verifyToken(token);
    }

    // 2. From Cookie header
    const cookieHeader = req.headers['cookie'];
    if (cookieHeader) {
      const match = cookieHeader.match(/bubble_token=([^;]+)/);
      if (match && match[1]) {
        return this.verifyToken(match[1]);
      }
    }

    return null;
  },

  getClientIp(req) {
    return (
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    ).split(',')[0].trim();
  },

  getUserAgent(req) {
    return req.headers['user-agent'] || 'Unknown Browser';
  }
};

module.exports = Auth;
