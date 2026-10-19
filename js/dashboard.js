/**
 * BUBBLE - Mobile App Project Dashboard Controller
 * Manages Flutter app projects, starter mobile templates, cloning, renaming, and JSON backups.
 */

(function (window) {
  'use strict';

  class BubbleDashboard {
    constructor() {
      this.projects = [];
      this.searchQuery = '';
      this.pendingDeleteId = null;
      this.pendingRenameId = null;
    }

    init() {
      if (!this.checkAuth()) return;
      this.loadProjects();
      this.setupEventListeners();
      this.render();
    }

    checkAuth() {
      const guard = document.getElementById('dashboard-auth-guard');
      const isAuthed = window.AuthClient && window.AuthClient.isAuthenticated();
      if (!isAuthed) {
        if (guard) guard.style.display = 'flex';
        return false;
      }
      if (guard) guard.style.display = 'none';
      return true;
    }

    loadProjects() {
      this.projects = window.BubbleStorage.getAllProjects();
      // Starts strictly at 0 if user hasn't created any apps yet
    }

    setupEventListeners() {
      // 1. Search Bar
      const searchInput = document.getElementById('search-projects-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.renderProjectsGrid();
        });
      }

      // 2. New App Button
      const newAppBtn = document.getElementById('btn-new-project');
      if (newAppBtn) {
        newAppBtn.onclick = () => this.openNewProjectModal();
      }

      // 3. Import JSON Button
      const importBtn = document.getElementById('btn-import-project');
      const importFileInput = document.getElementById('import-file-input');
      if (importBtn && importFileInput) {
        importBtn.onclick = () => importFileInput.click();
        importFileInput.onchange = (e) => this.handleFileImport(e);
      }

      // 4. Modal Submissions
      this.setupModalEvents();
    }

    setupModalEvents() {
      // Create New App Modal
      const createModal = document.getElementById('modal-create-project');
      if (createModal) {
        const form = document.getElementById('form-create-project');
        form.onsubmit = (e) => {
          e.preventDefault();
          const nameInput = document.getElementById('input-project-name');
          const templateSelect = document.getElementById('select-project-template');
          const name = nameInput.value.trim() || 'My Flutter App';
          const templateId = templateSelect.value;

          const tutorial = window.BubbleTutorials.getTutorialById(templateId);
          const newApp = {
            id: window.BubbleUtils.generateId('app'),
            name: name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            blocks: window.BubbleUtils.deepClone(tutorial.blocks)
          };

          window.BubbleStorage.saveProject(newApp);
          window.BubbleStorage.setCurrentProjectId(newApp.id);

          createModal.classList.remove('active');
          window.location.href = `editor.html?id=${newApp.id}`;
        };

        const cancelBtn = document.getElementById('btn-cancel-create');
        if (cancelBtn) cancelBtn.onclick = () => createModal.classList.remove('active');
      }

      // Rename Modal
      const renameModal = document.getElementById('modal-rename-project');
      if (renameModal) {
        const form = document.getElementById('form-rename-project');
        form.onsubmit = (e) => {
          e.preventDefault();
          const input = document.getElementById('input-rename-project');
          const newName = input.value.trim();
          if (this.pendingRenameId && newName) {
            window.BubbleStorage.renameProject(this.pendingRenameId, newName);
            window.BubbleUtils.showToast('App renamed successfully', 'success');
            this.loadProjects();
            this.render();
          }
          renameModal.classList.remove('active');
        };

        const cancelBtn = document.getElementById('btn-cancel-rename');
        if (cancelBtn) cancelBtn.onclick = () => renameModal.classList.remove('active');
      }

      // Delete Modal
      const deleteModal = document.getElementById('modal-delete-project');
      if (deleteModal) {
        const confirmBtn = document.getElementById('btn-confirm-delete');
        if (confirmBtn) {
          confirmBtn.onclick = () => {
            if (this.pendingDeleteId) {
              window.BubbleStorage.deleteProject(this.pendingDeleteId);
              window.BubbleUtils.showToast('App project deleted', 'info');
              this.pendingDeleteId = null;
              this.loadProjects();
              this.render();
            }
            deleteModal.classList.remove('active');
          };
        }

        const cancelBtn = document.getElementById('btn-cancel-delete');
        if (cancelBtn) cancelBtn.onclick = () => deleteModal.classList.remove('active');
      }

      // Close modal on backdrop click
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) backdrop.classList.remove('active');
        });
      });
    }

    render() {
      this.renderStarterTemplates();
      this.renderProjectsGrid();
      this.updateStats();
    }

    updateStats() {
      const countEl = document.getElementById('stat-total-projects');
      if (countEl) countEl.textContent = this.projects.length;
    }

    renderStarterTemplates() {
      const container = document.getElementById('templates-container');
      if (!container) return;

      const templates = window.BubbleTutorials.getAllTutorials();
      container.innerHTML = templates.map(t => {
        let miniMockup = '';
        if (t.id === 'counter_app') {
          miniMockup = `
            <div class="template-mini-phone">
              <div class="mini-phone-bar" style="background: #0284c7;"></div>
              <div class="mini-phone-body">
                <div style="font-size: 8px; font-weight: 700; color: #0284c7; text-align: center; margin-top: 4px;">42</div>
                <div class="mini-phone-btn" style="background: #0284c7;"></div>
              </div>
            </div>
          `;
        } else if (t.id === 'calculator_app') {
          miniMockup = `
            <div class="template-mini-phone">
              <div class="mini-phone-bar" style="background: #059669;"></div>
              <div class="mini-phone-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px; padding: 2px;">
                <div style="grid-column: span 2; height: 8px; background: #ecfdf5; border-radius: 2px;"></div>
                <div style="height: 6px; background: #d1fae5; border-radius: 2px;"></div>
                <div style="height: 6px; background: #d1fae5; border-radius: 2px;"></div>
              </div>
            </div>
          `;
        } else if (t.id === 'login_form') {
          miniMockup = `
            <div class="template-mini-phone">
              <div class="mini-phone-bar" style="background: #4f46e5;"></div>
              <div class="mini-phone-body">
                <div class="mini-phone-line" style="margin-top: 4px;"></div>
                <div class="mini-phone-line" style="width: 60%;"></div>
                <div class="mini-phone-btn" style="background: #4f46e5;"></div>
              </div>
            </div>
          `;
        } else if (t.id === 'todo_app') {
          miniMockup = `
            <div class="template-mini-phone">
              <div class="mini-phone-bar" style="background: #7c3aed;"></div>
              <div class="mini-phone-body">
                <div style="font-size: 6px; color: #7c3aed; font-weight: 700;">Task 1</div>
                <div style="font-size: 6px; color: #94a3b8;">○ Task 2</div>
              </div>
            </div>
          `;
        } else {
          miniMockup = `
            <div class="template-mini-phone">
              <div class="mini-phone-bar" style="background: #0284c7;"></div>
              <div class="mini-phone-body">
                <div style="font-size: 14px; text-align: center; margin-top: 6px;">${t.icon}</div>
              </div>
            </div>
          `;
        }

        return `
          <div class="template-card" data-template-id="${t.id}">
            <div class="template-preview">
              ${miniMockup}
            </div>
            <div class="template-card-info">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="template-title">${t.icon} ${t.title}</span>
                <span class="badge" style="background-color: #ede7dc; color: #525c56; font-size: 10px; font-weight: 700; border-radius: 9999px; padding: 2px 8px;">${t.level}</span>
              </div>
              <div class="template-desc">${t.description}</div>
              <div style="margin-top: 10px; font-size: 12px; font-weight: 700; color: #17241c; display: flex; align-items: center; gap: 4px;">
                <span>Start Project</span>
                <span>→</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      container.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
          const tId = card.getAttribute('data-template-id');
          this.createAppFromTemplate(tId);
        });
      });
    }

    renderProjectsGrid() {
      const grid = document.getElementById('projects-grid');
      const emptyState = document.getElementById('projects-empty-state');
      if (!grid) return;

      const filtered = this.projects.filter(p => {
        if (!this.searchQuery) return true;
        return p.name.toLowerCase().includes(this.searchQuery);
      });

      if (filtered.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      }

      grid.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';

      grid.innerHTML = filtered.map(p => {
        const blockCount = (p.blocks || []).length;
        const dateStr = window.BubbleUtils.formatDate(p.updatedAt || p.createdAt);

        return `
          <div class="project-card" data-project-id="${p.id}">
            <div class="project-card-header">
              <div class="template-mini-phone" style="width: 100px; height: 110px;">
                <div class="mini-phone-bar" style="background: #0284c7; justify-content: center;">
                  <span style="font-size: 7px; color: #ffffff; font-weight: 700;">Flutter</span>
                </div>
                <div class="mini-phone-body">
                  <div class="mini-phone-line" style="margin-top: 6px;"></div>
                  <div class="mini-phone-line" style="width: 50%;"></div>
                  <div class="mini-phone-btn" style="background: #0284c7; margin-top: auto;"></div>
                </div>
              </div>
            </div>
            <div class="project-card-body">
              <div class="project-title">
                <span>${window.BubbleUtils.escapeHtml(p.name)}</span>
                <span class="badge" style="background-color: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 700; border-radius: 9999px; padding: 2px 8px;">Flutter 3</span>
              </div>
              <div class="project-meta">
                <span style="display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Updated ${dateStr}
                </span>
                <span>•</span>
                <span style="display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049-.913-.772-1.637-1.685-1.686a2.235 2.235 0 0 1-2.128-2.128c-.049-.913-.773-1.637-1.686-1.686C13.027 2.3 12 3.1 12 4.1a2 2 0 0 1-4 0c0-1-.973-1.8-1.94-1.75-.913.049-1.637.773-1.686 1.686A2.235 2.235 0 0 1 2.246 6.164c-.913.049-1.637.773-1.686 1.686.05 1 .85 2.05 1.85 2.05a2 2 0 0 1 0 4c-1 0-1.8.95-1.85 1.95.049.913.773 1.637 1.686 1.686a2.235 2.235 0 0 1 2.128 2.128c.049.913.773 1.637 1.686 1.686.967.05 1.94-.75 1.94-1.75a2 2 0 0 1 4 0c0 1 1.027 1.8 1.94 1.75.913-.049 1.637-.773 1.686-1.686a2.235 2.235 0 0 1 2.128-2.128c.913-.049 1.637-.773 1.686-1.686-.05-1-.85-1.95-1.85-1.95a2 2 0 0 1 0-4c1 0 1.8-1.05 1.85-2.05z"/></svg>
                  ${blockCount} blocks
                </span>
              </div>
            </div>
            <div class="project-card-actions">
              <a href="editor.html?id=${p.id}" class="btn-open-editor">Open Block Studio →</a>
              <div style="display: flex; gap: 4px;">
                <button class="btn btn-secondary btn-sm" data-action="rename" title="Rename App" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button class="btn btn-secondary btn-sm" data-action="duplicate" title="Duplicate App" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
                <button class="btn btn-secondary btn-sm" data-action="export-json" title="Download JSON Backup" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                </button>
                <button class="btn btn-secondary btn-sm" data-action="delete" title="Delete App" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0; color: var(--color-danger); display: inline-flex; align-items: center; justify-content: center;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Bind card buttons
      grid.querySelectorAll('.project-card').forEach(card => {
        const id = card.getAttribute('data-project-id');

        card.querySelector('[data-action="rename"]').onclick = (e) => {
          e.stopPropagation();
          this.openRenameModal(id);
        };

        card.querySelector('[data-action="duplicate"]').onclick = (e) => {
          e.stopPropagation();
          const clone = window.BubbleStorage.duplicateProject(id);
          window.BubbleUtils.showToast(`Duplicated "${clone.name}"`, 'success');
          this.loadProjects();
          this.render();
        };

        card.querySelector('[data-action="export-json"]').onclick = (e) => {
          e.stopPropagation();
          const proj = window.BubbleStorage.getProjectById(id);
          if (proj) {
            const json = window.BubbleStorage.exportProjectAsJson(proj.id);
            const safe = (proj.name || 'flutter_app').toLowerCase().replace(/[^a-z0-9]/g, '_');
            window.BubbleUtils.downloadFile(`${safe}.bubble.json`, json, 'application/json');
            window.BubbleUtils.showToast('App project JSON downloaded!', 'success');
          }
        };

        card.querySelector('[data-action="delete"]').onclick = (e) => {
          e.stopPropagation();
          this.openDeleteModal(id);
        };
      });
    }

    createAppFromTemplate(templateId) {
      const tutorial = window.BubbleTutorials.getTutorialById(templateId);
      const name = templateId === 'blank_app' ? 'Untitled Flutter App' : tutorial.title;
      const app = {
        id: window.BubbleUtils.generateId('app'),
        name: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: window.BubbleUtils.deepClone(tutorial.blocks)
      };

      window.BubbleStorage.saveProject(app);
      window.BubbleStorage.setCurrentProjectId(app.id);
      window.location.href = `editor.html?id=${app.id}`;
    }

    openNewProjectModal() {
      const modal = document.getElementById('modal-create-project');
      const input = document.getElementById('input-project-name');
      if (modal && input) {
        input.value = 'My Awesome Flutter App';
        modal.classList.add('active');
        input.focus();
        input.select();
      }
    }

    openRenameModal(id) {
      this.pendingRenameId = id;
      const proj = window.BubbleStorage.getProjectById(id);
      if (!proj) return;

      const modal = document.getElementById('modal-rename-project');
      const input = document.getElementById('input-rename-project');
      if (modal && input) {
        input.value = proj.name;
        modal.classList.add('active');
        input.focus();
        input.select();
      }
    }

    openDeleteModal(id) {
      this.pendingDeleteId = id;
      const proj = window.BubbleStorage.getProjectById(id);
      if (!proj) return;

      const modal = document.getElementById('modal-delete-project');
      const nameSpan = document.getElementById('delete-project-name');
      if (modal && nameSpan) {
        nameSpan.textContent = proj.name;
        modal.classList.add('active');
      }
    }

    async handleFileImport(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = window.BubbleStorage.importProjectFromJson(text, file.name.replace(/\.json$/i, ''));
        window.BubbleUtils.showToast(`Imported app "${imported.name}" successfully!`, 'success');
        this.loadProjects();
        this.render();
      } catch (err) {
        console.error('Import failed:', err);
        window.BubbleUtils.showToast(`Import error: ${err.message}`, 'error');
      } finally {
        event.target.value = '';
      }
    }
  }

  window.BubbleDashboard = BubbleDashboard;

  window.addEventListener('DOMContentLoaded', () => {
    const dashboard = new BubbleDashboard();
    dashboard.init();
    window.currentBubbleDashboard = dashboard;

    window.addEventListener('bubble:auth-changed', () => {
      dashboard.init();
    });

    document.getElementById('btn-guard-open-login')?.addEventListener('click', () => {
      if (window.AuthClient) {
        window.AuthClient.openModal('login');
      }
    });
  });
})(window);
