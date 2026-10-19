/**
 * BUBBLE - Persistent Storage Module for Mobile App Projects
 * Strictly client-side browser Local Storage with versioned keys and error resilience.
 */

(function (window) {
  'use strict';

  const Storage = {
    isAvailable() {
      try {
        const testKey = '__bubble_app_storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    },

    getActiveUserId() {
      try {
        if (window.AuthClient && typeof window.AuthClient.getUser === 'function') {
          const u = window.AuthClient.getUser();
          if (u && (u.id || u.email)) {
            return String(u.id || u.email);
          }
        }
        if (window.localStorage) {
          const raw = window.localStorage.getItem('bubble_user');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.id || parsed.email)) {
              return String(parsed.id || parsed.email);
            }
          }
        }
      } catch (e) {}
      return 'guest';
    },

    getProjectsKey() {
      const uid = this.getActiveUserId();
      return uid === 'guest' ? 'bubble.apps.v1.guest' : `bubble.apps.v1.${uid}`;
    },

    getCurrentAppKey() {
      const uid = this.getActiveUserId();
      return uid === 'guest' ? 'bubble.active_app_id.v1.guest' : `bubble.active_app_id.v1.${uid}`;
    },

    getSettingsKey() {
      const uid = this.getActiveUserId();
      return uid === 'guest' ? 'bubble.app_settings.v1.guest' : `bubble.app_settings.v1.${uid}`;
    },

    migrateLegacyProjectsIfNeeded(targetKey) {
      if (!this.isAvailable()) return;
      try {
        const legacyRaw = window.localStorage.getItem('bubble.apps.v1');
        if (!legacyRaw) return;

        const currentRaw = window.localStorage.getItem(targetKey);
        // If current user's isolated storage is empty, migrate legacy data over to this user
        if (!currentRaw) {
          const parsed = JSON.parse(legacyRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            window.localStorage.setItem(targetKey, legacyRaw);
          }
        }
        // Remove legacy global key so other accounts (Admin, Account B) start clean
        window.localStorage.removeItem('bubble.apps.v1');
      } catch (e) {
        console.warn('Legacy project migration check:', e);
      }
    },

    getAllProjects() {
      if (!this.isAvailable()) return [];

      try {
        const key = this.getProjectsKey();
        this.migrateLegacyProjectsIfNeeded(key);

        const raw = window.localStorage.getItem(key);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter(p => p && typeof p === 'object' && p.id && p.name);
      } catch (err) {
        console.error('Error reading projects from storage:', err);
        return [];
      }
    },

    getProjectById(id) {
      if (!id) return null;
      const projects = this.getAllProjects();
      return projects.find(p => p.id === id) || null;
    },

    saveProject(project) {
      if (!this.isAvailable()) {
        throw new Error('Local Storage is not available or disabled in this browser.');
      }
      if (!project || !project.id) {
        throw new Error('Invalid project: Missing project ID.');
      }

      const uid = this.getActiveUserId();
      project.userId = project.userId || uid;
      project.updatedAt = new Date().toISOString();
      if (!project.createdAt) {
        project.createdAt = project.updatedAt;
      }

      const key = this.getProjectsKey();
      const projects = this.getAllProjects();
      const existingIdx = projects.findIndex(p => p.id === project.id);

      if (existingIdx >= 0) {
        projects[existingIdx] = project;
      } else {
        projects.unshift(project);
      }

      try {
        window.localStorage.setItem(key, JSON.stringify(projects));

        // Background Cloud Database Sync if user is authenticated
        if (window.AuthClient && window.AuthClient.getToken()) {
          fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${window.AuthClient.getToken()}`
            },
            body: JSON.stringify({
              id: project.id,
              name: project.name,
              blocks: project.blocks || []
            })
          }).catch(err => console.warn('Cloud database sync offline / skipped:', err));
        }

        return project;
      } catch (err) {
        if (err.name === 'QuotaExceededError' || err.code === 22) {
          throw new Error('Storage quota exceeded! Please delete older projects or export them as JSON.');
        }
        throw new Error(`Failed to save project: ${err.message}`);
      }
    },

    deleteProject(id) {
      if (!id) return false;
      const key = this.getProjectsKey();
      const projects = this.getAllProjects();
      const filtered = projects.filter(p => p.id !== id);

      try {
        window.localStorage.setItem(key, JSON.stringify(filtered));

        // Background Cloud Database deletion
        if (window.AuthClient && window.AuthClient.getToken()) {
          fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${window.AuthClient.getToken()}`
            }
          }).catch(err => console.warn('Cloud database delete offline / skipped:', err));
        }

        return true;
      } catch (err) {
        console.error('Error deleting project:', err);
        return false;
      }
    },

    syncCloudProjects(cloudProjects) {
      if (!Array.isArray(cloudProjects)) return this.getAllProjects();
      const key = this.getProjectsKey();
      const local = this.getAllProjects();

      const cloudMap = new Map();
      cloudProjects.forEach(cp => {
        if (cp && cp.id) {
          cloudMap.set(cp.id, {
            id: cp.id,
            name: cp.name,
            blocks: cp.blocks || [],
            createdAt: cp.createdAt || cp.created_at || new Date().toISOString(),
            updatedAt: cp.updatedAt || cp.updated_at || new Date().toISOString()
          });
        }
      });

      // Retain any locally created projects not yet uploaded
      local.forEach(lp => {
        if (lp && lp.id) {
          if (!cloudMap.has(lp.id)) {
            cloudMap.set(lp.id, lp);
            if (window.AuthClient && window.AuthClient.getToken()) {
              fetch('/api/projects', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${window.AuthClient.getToken()}`
                },
                body: JSON.stringify({
                  id: lp.id,
                  name: lp.name,
                  blocks: lp.blocks || []
                })
              }).catch(() => {});
            }
          } else {
            const cp = cloudMap.get(lp.id);
            const lpTime = new Date(lp.updatedAt || 0).getTime();
            const cpTime = new Date(cp.updatedAt || 0).getTime();
            if (lpTime > cpTime) {
              cloudMap.set(lp.id, lp);
            }
          }
        }
      });

      const merged = Array.from(cloudMap.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      try {
        window.localStorage.setItem(key, JSON.stringify(merged));
      } catch (e) {}
      return merged;
    },

    async fetchCloudProjects() {
      if (!window.AuthClient || !window.AuthClient.getToken()) return this.getAllProjects();
      try {
        const res = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${window.AuthClient.getToken()}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.projects)) {
            return this.syncCloudProjects(data.projects);
          }
        }
      } catch (err) {
        console.warn('Could not sync cloud projects:', err);
      }
      return this.getAllProjects();
    },

    duplicateProject(id) {
      const original = this.getProjectById(id);
      if (!original) throw new Error('Original project not found.');

      const clone = window.BubbleUtils.deepClone(original);
      clone.id = window.BubbleUtils.generateId('app');
      clone.name = `${original.name} (Copy)`;
      clone.createdAt = new Date().toISOString();
      clone.updatedAt = clone.createdAt;

      // Reassign new IDs for all blocks
      const reassignBlockIds = (blocks) => {
        blocks.forEach(b => {
          b.id = window.BubbleUtils.generateId('block');
          if (Array.isArray(b.children)) {
            reassignBlockIds(b.children);
          }
        });
      };
      if (Array.isArray(clone.blocks)) {
        reassignBlockIds(clone.blocks);
      }

      this.saveProject(clone);
      return clone;
    },

    renameProject(id, newName) {
      const cleanName = (newName || '').trim();
      if (!cleanName) throw new Error('Project name cannot be empty.');

      const project = this.getProjectById(id);
      if (!project) throw new Error('Project not found.');

      project.name = cleanName;
      return this.saveProject(project);
    },

    exportProjectAsJson(id) {
      const project = this.getProjectById(id);
      if (!project) throw new Error('Project not found.');
      return JSON.stringify({
        bubble_platform: 'mobile_app_flutter_dart',
        bubble_version: '2.0',
        exported_at: new Date().toISOString(),
        project: project
      }, null, 2);
    },

    importProjectFromJson(jsonString, customName = '') {
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (err) {
        throw new Error('Invalid JSON file format.');
      }

      const projectData = data.project || data;
      if (!projectData || typeof projectData !== 'object' || !Array.isArray(projectData.blocks)) {
        throw new Error('Invalid Bubble mobile project schema: missing blocks array.');
      }

      const newProject = window.BubbleUtils.deepClone(projectData);
      newProject.id = window.BubbleUtils.generateId('app');
      newProject.name = (customName || newProject.name || 'Imported Flutter App').trim();
      newProject.createdAt = new Date().toISOString();
      newProject.updatedAt = newProject.createdAt;

      return this.saveProject(newProject);
    },

    getCurrentProjectId() {
      try {
        const key = this.getCurrentAppKey();
        return window.localStorage.getItem(key) || null;
      } catch (e) {
        return null;
      }
    },

    setCurrentProjectId(id) {
      try {
        const key = this.getCurrentAppKey();
        if (id) {
          window.localStorage.setItem(key, id);
        } else {
          window.localStorage.removeItem(key);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  window.BubbleStorage = Storage;
})(window);
