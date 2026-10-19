/**
 * BUBBLE - Comprehensive Integration Test Suite for Auth, Database, & Admin API
 */

const http = require('http');

function request(options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (bodyData) {
      req.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Bubble Database & Admin API Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Admin login with seeded credentials
    console.log('[Test 1] Default Admin Authentication');
    const adminLoginRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@bubble.dev', password: 'admin123' });

    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    assert(adminLoginRes.body.ok === true, 'Admin login body has ok: true');
    assert(adminLoginRes.body.user && adminLoginRes.body.user.role === 'admin', 'Admin user has role: "admin"');
    assert(Boolean(adminLoginRes.body.token), 'Admin login returned JWT token');

    const adminToken = adminLoginRes.body.token;

    // 2. Fetch admin stats
    console.log('\n[Test 2] Admin KPI Metrics');
    const statsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    assert(statsRes.status === 200, 'Admin stats returns 200 OK');
    assert(statsRes.body.stats && statsRes.body.stats.totalUsers >= 1, 'Stats reports >= 1 total user');

    // 3. User Signup
    console.log('\n[Test 3] New User Account Creation & Audit Trail');
    const testEmail = `tester_${Date.now()}@bubble.dev`;
    const signupRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/signup',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Sarah Flutter Dev', email: testEmail, password: 'password123' });

    assert(signupRes.status === 201, 'User signup returns 201 Created');
    assert(signupRes.body.user && signupRes.body.user.role === 'user', 'New account has default role: "user"');
    const userToken = signupRes.body.token;

    // 4. Verify regular user is forbidden from admin endpoints
    console.log('\n[Test 4] Security Check: Regular User Blocked from Admin API');
    const forbiddenRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert(forbiddenRes.status === 403, 'Regular user receives 403 Forbidden for admin stats');

    // 5. Fetch audit logs as admin
    console.log('\n[Test 5] Audit Logs Tracking (Signups & Logins)');
    const logsRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/logs',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    assert(logsRes.status === 200, 'Admin logs returns 200 OK');
    assert(Array.isArray(logsRes.body.logs) && logsRes.body.logs.length >= 2, 'Audit logs contains recent activity entries');
    const signupLog = logsRes.body.logs.find(l => l.email === testEmail && l.action === 'signup');
    assert(Boolean(signupLog), `Audit logs recorded signup for ${testEmail}`);

    // 6. Cloud Projects Database Sync
    console.log('\n[Test 6] User Cloud Project Database Sync');
    const saveProjRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      }
    }, {
      id: 'app_test_sync_1',
      name: 'Counter Demo App',
      blocks: [{ id: 'b1', type: 'flutter_scaffold', title: 'Scaffold' }]
    });

    assert(saveProjRes.status === 200, 'Project saved to database with 200 OK');

    const getProjRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/projects',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });

    assert(getProjRes.status === 200, 'Project list retrieved with 200 OK');
    assert(getProjRes.body.projects.length === 1, 'User has exactly 1 cloud project');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n======================================================`);
  console.log(`  Tests Completed: ${passed} passed, ${failed} failed`);
  console.log(`======================================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
