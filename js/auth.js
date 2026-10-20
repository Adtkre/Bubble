/**
 * BUBBLE - Client Authentication & User Session Manager
 * Handles user signup, login, session persistence, role checks,
 * and dynamic navbar auth state across all pages.
 */

(function (window) {
  'use strict';

  const TOKEN_KEY = 'bubble_auth_token';
  const USER_KEY = 'bubble_auth_user';

  const AuthClient = {
    getToken() {
      return localStorage.getItem(TOKEN_KEY) || null;
    },

    getUser() {
      try {
        const u = localStorage.getItem(USER_KEY);
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },

    setSession(token, user) {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.notifyStateChange();
    },

    clearSession() {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.notifyStateChange();
    },

    isAuthenticated() {
      return Boolean(this.getToken() && this.getUser());
    },

    isAdmin() {
      const u = this.getUser();
      return Boolean(u && u.role === 'admin');
    },

    async signup(name, email, password) {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { error: 'Server temporarily unavailable. Please try again.' };
        }
        if (!res.ok) {
          throw new Error(data.error || 'Failed to sign up.');
        }
        this.setSession(data.token, data.user);
        return data;
      } catch (err) {
        throw err;
      }
    },

    async login(email, password) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { error: 'Server temporarily unavailable. Please try again.' };
        }
        if (!res.ok) {
          throw new Error(data.error || 'Invalid email or password.');
        }
        this.setSession(data.token, data.user);
        return data;
      } catch (err) {
        throw err;
      }
    },

    logout() {
      this.clearSession();
      window.location.href = 'index.html';
    },

    async checkSession() {
      const token = this.getToken();
      if (!token) return null;

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return data.user;
          }
        } else if (res.status === 401) {
          this.clearSession();
        }
      } catch (e) {
        // Offline or server not responding, keep local cached user
      }
      return this.getUser();
    },

    notifyStateChange() {
      window.dispatchEvent(new CustomEvent('bubble:auth-changed', { detail: { user: this.getUser() } }));
      this.renderNav();
    },

    // Injects the Auth Modal HTML into body if not already present
    injectModal() {
      if (document.getElementById('bubble-auth-modal')) return;

      const modalHtml = `
        <div id="bubble-auth-modal" class="auth-modal-overlay" style="display: none;">
          <div class="auth-modal-card">
            <button class="auth-modal-close" id="btn-close-auth-modal" aria-label="Close modal">&times;</button>
            
            <div class="auth-modal-header">
              <div class="auth-brand-badge">
                <span class="auth-brand-icon">❖</span>
                <span>BUBBLE</span>
              </div>
              <h2 id="auth-modal-title">Welcome to Bubble</h2>
              <p id="auth-modal-subtitle">Visual Mobile App Creation Platform</p>
            </div>

            <div class="auth-tab-row">
              <button class="auth-tab-btn active" id="tab-login" data-tab="login">Log In</button>
              <button class="auth-tab-btn" id="tab-signup" data-tab="signup">Create Account</button>
            </div>

            <div id="auth-alert" class="auth-alert" style="display: none;"></div>

            <!-- Login Form -->
            <form id="form-auth-login" class="auth-form">
              <div class="auth-field">
                <label for="login-email">Email Address</label>
                <input type="email" id="login-email" required placeholder="you@domain.com" autocomplete="email" />
              </div>
              <div class="auth-field">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" required placeholder="Enter your password" autocomplete="current-password" />
              </div>
              <div class="auth-admin-hint">
                <small style="display: flex; align-items: center; gap: 5px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                  <span>Testing? Default Admin: <strong>admin@bubble.dev</strong> / <strong>admin123</strong></span>
                </small>
              </div>
              <button type="submit" class="auth-submit-btn" id="btn-submit-login">
                <span>Sign In</span>
                <span class="auth-btn-spinner" style="display:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></span>
              </button>
            </form>

            <!-- Signup Form -->
            <form id="form-auth-signup" class="auth-form" style="display: none;">
              <div class="auth-field">
                <label for="signup-name">Full Name</label>
                <input type="text" id="signup-name" required placeholder="e.g. Alex Rivera" autocomplete="name" />
              </div>
              <div class="auth-field">
                <label for="signup-email">Email Address</label>
                <input type="email" id="signup-email" required placeholder="you@domain.com" autocomplete="email" />
              </div>
              <div class="auth-field">
                <label for="signup-password">Password (min 6 characters)</label>
                <input type="password" id="signup-password" minlength="6" required placeholder="Create a strong password" autocomplete="new-password" />
              </div>
              <button type="submit" class="auth-submit-btn" id="btn-submit-signup">
                <span>Create Free Account</span>
                <span class="auth-btn-spinner" style="display:none;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-icon"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg></span>
              </button>
            </form>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      this.bindModalEvents();
    },

    bindModalEvents() {
      const modal = document.getElementById('bubble-auth-modal');
      const closeBtn = document.getElementById('btn-close-auth-modal');
      const tabLogin = document.getElementById('tab-login');
      const tabSignup = document.getElementById('tab-signup');
      const formLogin = document.getElementById('form-auth-login');
      const formSignup = document.getElementById('form-auth-signup');
      const alertBox = document.getElementById('auth-alert');

      if (!modal) return;

      const showAlert = (msg, isError = true) => {
        alertBox.textContent = msg;
        alertBox.className = `auth-alert ${isError ? 'auth-alert-error' : 'auth-alert-success'}`;
        alertBox.style.display = 'block';
      };

      const hideAlert = () => {
        alertBox.style.display = 'none';
      };

      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        hideAlert();
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
          hideAlert();
        }
      });

      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        formLogin.style.display = 'flex';
        formSignup.style.display = 'none';
        hideAlert();
      });

      tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        formSignup.style.display = 'flex';
        formLogin.style.display = 'none';
        hideAlert();
      });

      // Submit Login
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-submit-login');

        btn.disabled = true;
        try {
          await this.login(email, password);
          showAlert('Login successful! Redirecting to dashboard...', false);
          setTimeout(() => {
            modal.style.display = 'none';
            if (window.location.pathname.includes('admin.html') && this.isAdmin()) {
              window.location.reload();
            } else if (window.location.pathname.includes('dashboard.html')) {
              window.location.reload();
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 600);
        } catch (err) {
          showAlert(err.message || 'Login failed. Please check your credentials.');
        } finally {
          btn.disabled = false;
        }
      });

      // Submit Signup
      formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const btn = document.getElementById('btn-submit-signup');

        btn.disabled = true;
        try {
          await this.signup(name, email, password);
          showAlert('Account created! Redirecting to dashboard...', false);
          setTimeout(() => {
            modal.style.display = 'none';
            if (window.location.pathname.includes('dashboard.html')) {
              window.location.reload();
            } else {
              window.location.href = 'dashboard.html';
            }
          }, 700);
        } catch (err) {
          showAlert(err.message || 'Signup failed.');
        } finally {
          btn.disabled = false;
        }
      });
    },

    openModal(tab = 'login') {
      this.injectModal();
      const modal = document.getElementById('bubble-auth-modal');
      const tabLogin = document.getElementById('tab-login');
      const tabSignup = document.getElementById('tab-signup');
      const formLogin = document.getElementById('form-auth-login');
      const formSignup = document.getElementById('form-auth-signup');

      if (tab === 'signup') {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        formSignup.style.display = 'flex';
        formLogin.style.display = 'none';
      } else {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        formLogin.style.display = 'flex';
        formSignup.style.display = 'none';
      }

      modal.style.display = 'flex';
    },

    // Render Navigation buttons/dropdown
    renderNav() {
      const container = document.getElementById('auth-nav-container');
      if (!container) return;

      const user = this.getUser();

      if (!user) {
        container.innerHTML = `
          <div class="auth-nav-guest">
            <button class="btn btn-ghost btn-sm" id="nav-btn-login">Log In</button>
            <button class="btn btn-primary btn-sm" id="nav-btn-signup">Sign Up</button>
          </div>
        `;

        document.getElementById('nav-btn-login')?.addEventListener('click', () => this.openModal('login'));
        document.getElementById('nav-btn-signup')?.addEventListener('click', () => this.openModal('signup'));
      } else {
        const initial = (user.name || user.email || 'U')[0].toUpperCase();
        const isAdmin = user.role === 'admin';

        container.innerHTML = `
          <div class="auth-user-dropdown-wrap">
            <button class="auth-user-trigger" id="auth-user-menu-btn" aria-haspopup="true">
              <span class="auth-user-avatar">${initial}</span>
              <span class="auth-user-name">${user.name || user.email.split('@')[0]}</span>
              ${isAdmin ? '<span class="auth-badge-admin">Admin</span>' : ''}
              <span class="auth-arrow">▾</span>
            </button>
            <div class="auth-dropdown-menu" id="auth-dropdown-menu" style="display: none;">
              <div class="auth-dropdown-header">
                <div class="auth-dropdown-user-name">${user.name || 'User'}</div>
                <div class="auth-dropdown-user-email">${user.email}</div>
                <div class="auth-dropdown-role">Role: <strong>${user.role || 'user'}</strong></div>
              </div>
              <div class="auth-dropdown-divider"></div>
              <a href="/dashboard.html" class="auth-dropdown-item" style="display: flex; align-items: center; gap: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                <span>My Projects</span>
              </a>
              ${isAdmin ? `
                <a href="/admin.html" class="auth-dropdown-item auth-admin-link" style="display: flex; align-items: center; gap: 8px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Admin Portal</span>
                </a>
              ` : ''}
              <div class="auth-dropdown-divider"></div>
              <button class="auth-dropdown-item auth-logout-btn" id="nav-btn-logout" style="display: flex; align-items: center; gap: 8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        `;

        const menuBtn = document.getElementById('auth-user-menu-btn');
        const menu = document.getElementById('auth-dropdown-menu');

        menuBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          const isShown = menu.style.display === 'block';
          menu.style.display = isShown ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
          if (menu) menu.style.display = 'none';
        });

        document.getElementById('nav-btn-logout')?.addEventListener('click', () => {
          this.logout();
        });
      }
    },

    init() {
      this.injectModal();
      this.renderNav();
      this.checkSession();
    }
  };

  window.AuthClient = AuthClient;

  document.addEventListener('DOMContentLoaded', () => {
    AuthClient.init();
  });
})(window);
