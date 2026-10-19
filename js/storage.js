/**
 * BUBBLE - Persistent Storage Module for Mobile App Projects
 * Strictly client-side browser Local Storage with versioned keys and error resilience.
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    PROJECTS: 'bubble.apps.v1',
    SETTINGS: 'bubble.app_settings.v1',
    CURRENT_APP_ID: 'bubble.active_app_id.v1'
  };

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

    getAllProjects() {
      if (!this.isAvailable()) return [];

      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.PROJECTS);
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

      const projects = this.getAllProjects();
      const existingIdx = projects.findIndex(p => p.id === project.id);

      project.updatedAt = new Date().toISOString();
      if (!project.createdAt) {
        project.createdAt = project.updatedAt;
      }

      if (existingIdx >= 0) {
        projects[existingIdx] = project;
      } else {
        projects.unshift(project);
      }

      try {
        window.localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
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
      const projects = this.getAllProjects();
      const filtered = projects.filter(p => p.id !== id);

      try {
        window.localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
        return true;
      } catch (err) {
        console.error('Error deleting project:', err);
        return false;
      }
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
        return window.localStorage.getItem(STORAGE_KEYS.CURRENT_APP_ID) || null;
      } catch (e) {
        return null;
      }
    },

    setCurrentProjectId(id) {
      try {
        if (id) {
          window.localStorage.setItem(STORAGE_KEYS.CURRENT_APP_ID, id);
        } else {
          window.localStorage.removeItem(STORAGE_KEYS.CURRENT_APP_ID);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  window.BubbleStorage = Storage;
})(window);
