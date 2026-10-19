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
      this.loadProjects();
      this.setupEventListeners();
      this.render();
    }

    loadProjects() {
      this.projects = window.BubbleStorage.getAllProjects();

      // If user has zero projects, create the initial sample Flutter apps (Counter & Hello World)
      if (this.projects.length === 0) {
        const counterTutorial = window.BubbleTutorials.getCounterApp();
        const p1 = {
          id: window.BubbleUtils.generateId('app'),
          name: 'Flutter Counter App',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks: window.BubbleUtils.deepClone(counterTutorial.blocks)
        };
        window.BubbleStorage.saveProject(p1);

        const hwTutorial = window.BubbleTutorials.getHelloWorld();
        const p2 = {
          id: window.BubbleUtils.generateId('app'),
          name: 'Hello World App',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks: window.BubbleUtils.deepClone(hwTutorial.blocks)
        };
        window.BubbleStorage.saveProject(p2);

        this.projects = window.BubbleStorage.getAllProjects();
      }
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
                <div style="font-size: 6px; color: #7c3aed; font-weight: 700;">✓ Task 1</div>
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
                <span>🕒 Updated ${dateStr}</span>
                <span>•</span>
                <span>🧩 ${blockCount} blocks</span>
              </div>
            </div>
            <div class="project-card-actions">
              <a href="editor.html?id=${p.id}" class="btn-open-editor">Open Block Studio →</a>
              <div style="display: flex; gap: 4px;">
                <button class="btn btn-secondary btn-sm" data-action="rename" title="Rename App" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0;">✏️</button>
                <button class="btn btn-secondary btn-sm" data-action="duplicate" title="Duplicate App" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0;">⧉</button>
                <button class="btn btn-secondary btn-sm" data-action="export-json" title="Download JSON Backup" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0;">💾</button>
                <button class="btn btn-secondary btn-sm" data-action="delete" title="Delete App" style="border-radius: 9999px; width: 32px; height: 32px; padding: 0; color: var(--color-danger);">🗑</button>
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
  });
})(window);
