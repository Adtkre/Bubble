/**
 * BUBBLE - Admin Portal Dashboard Logic
 * Fetches and displays platform statistics, user logs, and registered accounts.
 */

(function () {
  'use strict';

  let rawLogs = [];
  let rawUsers = [];

  function formatTime(isoStr) {
    if (!isoStr) return 'Never';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function parseUserAgent(ua) {
    if (!ua || ua === 'Unknown Browser') return 'Web Browser';
    let browser = 'Browser';
    let os = 'Unknown OS';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';

    return `${browser} on ${os}`;
  }

  async function checkAdminAccess() {
    const guard = document.getElementById('admin-guard');
    const user = window.AuthClient ? window.AuthClient.getUser() : null;

    if (!user || user.role !== 'admin') {
      if (guard) guard.style.display = 'flex';
      return false;
    } else {
      if (guard) guard.style.display = 'none';
      return true;
    }
  }

  async function fetchStats() {
    try {
      const token = window.AuthClient.getToken();
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data.stats) {
        document.getElementById('kpi-total-users').textContent = data.stats.totalUsers || 0;
        document.getElementById('kpi-active-today').textContent = data.stats.activeUsersToday || 0;
        document.getElementById('kpi-total-apps').textContent = data.stats.totalProjects || 0;
        document.getElementById('kpi-recent-logins').textContent = data.stats.recentLogins24h || 0;
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function fetchLogs() {
    const tbody = document.getElementById('logs-table-body');
    try {
      const token = window.AuthClient.getToken();
      const res = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-empty-state">Failed to load logs.</td></tr>';
        return;
      }

      const data = await res.json();
      rawLogs = data.logs || [];
      renderLogs();
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty-state">Error connecting to server.</td></tr>';
    }
  }

  function renderLogs() {
    const tbody = document.getElementById('logs-table-body');
    const searchVal = (document.getElementById('log-search-input')?.value || '').toLowerCase().trim();
    const actionVal = document.getElementById('log-filter-action')?.value || 'all';

    const filtered = rawLogs.filter(log => {
      const matchesSearch = !searchVal ||
        (log.email && log.email.toLowerCase().includes(searchVal)) ||
        (log.ip_address && log.ip_address.includes(searchVal));

      const matchesAction = actionVal === 'all' || log.action === actionVal;
      return matchesSearch && matchesAction;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-empty-state">No matching activity logs found.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(log => {
      const isSignup = log.action === 'signup';
      const actionBadge = isSignup
        ? '<span class="badge-action-signup" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg> Account Created</span>'
        : '<span class="badge-action-login" style="display: inline-flex; align-items: center; gap: 4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> User Logged In</span>';

      return `
        <tr>
          <td style="color: var(--admin-text-muted); font-size: 0.82rem; white-space: nowrap;">
            ${formatTime(log.created_at)}
          </td>
          <td>${actionBadge}</td>
          <td>
            <strong style="color: #ffffff;">${log.email}</strong>
          </td>
          <td>
            <code class="admin-code-ip">
              ${log.ip_address || '127.0.0.1'}
            </code>
          </td>
          <td style="color: var(--admin-text-secondary); font-size: 0.82rem;">
            ${parseUserAgent(log.user_agent)}
          </td>
        </tr>
      `;
    }).join('');
  }

  async function fetchUsers() {
    const tbody = document.getElementById('users-table-body');
    try {
      const token = window.AuthClient.getToken();
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="6" class="admin-empty-state">Failed to load users.</td></tr>';
        return;
      }

      const data = await res.json();
      rawUsers = data.users || [];
      renderUsers();
    } catch (err) {
      console.error('Failed to fetch users:', err);
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty-state">Error connecting to server.</td></tr>';
    }
  }

  function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    const searchVal = (document.getElementById('user-search-input')?.value || '').toLowerCase().trim();
    const roleVal = document.getElementById('user-filter-role')?.value || 'all';

    const filtered = rawUsers.filter(u => {
      const matchesSearch = !searchVal ||
        (u.name && u.name.toLowerCase().includes(searchVal)) ||
        (u.email && u.email.toLowerCase().includes(searchVal));

      const matchesRole = roleVal === 'all' || u.role === roleVal;
      return matchesSearch && matchesRole;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="admin-empty-state">No matching registered users found.</td></tr>';
      return;
    }

    const currentLoggedInUser = window.AuthClient.getUser();

    tbody.innerHTML = filtered.map(u => {
      const initial = (u.name || u.email || 'U')[0].toUpperCase();
      const isAdmin = u.role === 'admin';
      const isSelf = currentLoggedInUser && currentLoggedInUser.id === u.id;

      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-mini-avatar">${initial}</div>
              <div class="user-cell-meta">
                <span class="user-name-bold">${u.name || 'Anonymous User'}</span>
                <span class="user-email-muted">${u.email}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="${isAdmin ? 'badge-role-admin' : 'badge-role-user'}">
              ${u.role || 'user'}
            </span>
          </td>
          <td>
            <span style="font-weight: 700; color: #ffffff;">${u.total_projects || 0}</span> apps
          </td>
          <td style="color: var(--admin-text-muted); font-size: 0.82rem;">
            ${formatTime(u.created_at)}
          </td>
          <td style="color: var(--admin-text-secondary); font-size: 0.82rem;">
            ${formatTime(u.last_login_at)}
          </td>
          <td>
            ${isSelf
              ? '<span style="color: var(--admin-text-muted); font-size: 0.78rem;">(Your account)</span>'
              : `<button class="btn-table-action" onclick="window.toggleUserRole('${u.id}', '${isAdmin ? 'user' : 'admin'}')">
                  ${isAdmin ? 'Demote to User' : 'Promote to Admin'}
                </button>`
            }
          </td>
        </tr>
      `;
    }).join('');
  }

  window.toggleUserRole = async function (userId, newRole) {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      const token = window.AuthClient.getToken();
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update role.');
        return;
      }

      await fetchUsers();
    } catch (err) {
      alert('Error changing user role.');
    }
  };

  async function refreshAll() {
    const ok = await checkAdminAccess();
    if (!ok) return;

    const timeElem = document.getElementById('last-updated-text');
    if (timeElem) timeElem.textContent = 'Updating...';

    await Promise.all([fetchStats(), fetchLogs(), fetchUsers()]);

    if (timeElem) {
      timeElem.textContent = 'Last synced at ' + new Date().toLocaleTimeString();
    }
  }

  function initListeners() {
    document.getElementById('btn-refresh-data')?.addEventListener('click', refreshAll);
    document.getElementById('log-search-input')?.addEventListener('input', renderLogs);
    document.getElementById('log-filter-action')?.addEventListener('change', renderLogs);
    document.getElementById('user-search-input')?.addEventListener('input', renderUsers);
    document.getElementById('user-filter-role')?.addEventListener('change', renderUsers);

    document.getElementById('btn-guard-login')?.addEventListener('click', () => {
      if (window.AuthClient) {
        window.AuthClient.openModal('login');
      }
    });

    window.addEventListener('bubble:auth-changed', async () => {
      const ok = await checkAdminAccess();
      if (ok) refreshAll();
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    initListeners();
    const ok = await checkAdminAccess();
    if (ok) {
      refreshAll();
    }
  });

})();
