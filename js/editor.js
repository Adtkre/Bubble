/**
 * BUBBLE - Mobile App Visual Programming Editor Controller
 * Connects visual blocks, the live mobile phone simulator, and Flutter Dart code generation.
 */

(function (window) {
  'use strict';

  class BubbleAppEditor {
    constructor() {
      this.project = null;
      this.blocks = [];
      this.selectedBlockId = null;
      this.history = new window.BubbleHistoryManager(40);

      // Submodules
      this.workspace = null;
      this.simulator = null;
      this.codeExplorer = null;
      this.inspector = null;

      this.debouncedSave = window.BubbleUtils.debounce(() => this.saveToStorage(), 500);
    }

    init() {
      // 1. Load active mobile app project
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('id') || window.BubbleStorage.getCurrentProjectId();

      if (projectId) {
        this.project = window.BubbleStorage.getProjectById(projectId);
      }

      if (!this.project) {
        // Initialize default Counter App starter project
        const counterTutorial = window.BubbleTutorials.getCounterApp();
        this.project = {
          id: window.BubbleUtils.generateId('app'),
          name: 'My Flutter Counter App',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          blocks: window.BubbleUtils.deepClone(counterTutorial.blocks)
        };
        window.BubbleStorage.saveProject(this.project);
        window.BubbleStorage.setCurrentProjectId(this.project.id);
      }

      this.blocks = this.project.blocks || [];

      // 2. Setup History
      this.history.clear(this.blocks);
      this.history.subscribe((status) => this.updateHistoryButtons(status));

      // 3. Initialize Submodules
      const workspaceSurface = document.getElementById('workspace-canvas-surface');
      this.workspace = new window.BubbleBlockWorkspace(this, workspaceSurface);

      const simContainer = document.getElementById('mobile-screen-content');
      this.simulator = new window.BubbleMobileSimulator(simContainer);

      const codeDrawer = document.getElementById('code-explorer-drawer');
      this.codeExplorer = new window.BubbleCodeExplorer(this, codeDrawer);

      const inspectorContainer = document.getElementById('inspector-container');
      this.inspector = new window.BubblePropertiesInspector(this, inspectorContainer);

      // 4. Setup UI Components
      this.setupToolbar();
      this.setupBlockLibrary();
      this.setupKeyboardShortcuts();

      // 5. Initial Render
      this.renderAll();

      // Select first block if present
      if (this.blocks.length > 0) {
        this.selectBlock(this.blocks[0].id);
      }

      this.setSaveStatus('saved');
    }

    /**
     * Top Toolbar Controls
     */
    setupToolbar() {
      // Title inline editing
      const titleEl = document.getElementById('editor-project-title');
      if (titleEl) {
        titleEl.textContent = this.project.name;
        titleEl.onclick = () => {
          const newName = prompt('Enter app project name:', this.project.name);
          if (newName && newName.trim()) {
            this.project.name = newName.trim();
            titleEl.textContent = this.project.name;
            this.onProjectModified();
          }
        };
      }

      // Undo & Redo
      const undoBtn = document.getElementById('btn-undo');
      const redoBtn = document.getElementById('btn-redo');

      if (undoBtn) {
        undoBtn.onclick = () => {
          const prevState = this.history.undo();
          if (prevState) {
            this.blocks = prevState;
            this.project.blocks = this.blocks;
            this.renderAll();
            this.debouncedSave();
          }
        };
      }

      if (redoBtn) {
        redoBtn.onclick = () => {
          const nextState = this.history.redo();
          if (nextState) {
            this.blocks = nextState;
            this.project.blocks = this.blocks;
            this.renderAll();
            this.debouncedSave();
          }
        };
      }

      // Tutorial / Mini-Project Dropdown Loader
      const tutSelect = document.getElementById('select-tutorial-template');
      if (tutSelect) {
        tutSelect.addEventListener('change', (e) => {
          const tId = e.target.value;
          if (tId) {
            this.loadTutorial(tId);
            tutSelect.value = '';
          }
        });
      }

      // Code Explorer Toggle
      const codeToggleBtn = document.getElementById('btn-toggle-code-explorer');
      if (codeToggleBtn) {
        codeToggleBtn.onclick = () => this.codeExplorer.toggle();
      }

      // Download main.dart
      const exportDartBtn = document.getElementById('btn-export-dart');
      if (exportDartBtn) {
        exportDartBtn.onclick = () => {
          const code = window.BubbleDartGenerator.generateFullDartCode(this.blocks, this.project.name);
          window.BubbleUtils.downloadFile('main.dart', code, 'text/plain');
          window.BubbleUtils.showToast('Downloaded main.dart for Flutter!', 'success');
        };
      }

      // Export JSON
      const exportJsonBtn = document.getElementById('btn-export-json');
      if (exportJsonBtn) {
        exportJsonBtn.onclick = () => {
          const json = window.BubbleStorage.exportProjectAsJson(this.project.id);
          const safe = (this.project.name || 'flutter_app').toLowerCase().replace(/[^a-z0-9]/g, '_');
          window.BubbleUtils.downloadFile(`${safe}.bubble.json`, json, 'application/json');
          window.BubbleUtils.showToast('App project JSON downloaded!', 'success');
        };
      }

      // Learn Guide Modal
      const learnBtn = document.getElementById('btn-open-learn-mode');
      const learnModal = document.getElementById('learn-modal');
      if (learnBtn && learnModal) {
        learnBtn.onclick = () => this.openLearnModal();
        const closeBtn = document.getElementById('btn-close-learn-modal');
        if (closeBtn) closeBtn.onclick = () => learnModal.classList.remove('active');
      }
    }

    /**
     * Left Panel Block Library
     */
    setupBlockLibrary() {
      const container = document.getElementById('block-library-categories');
      if (!container) return;

      const categories = window.BubbleBlockRegistry.getCategories();
      let html = '';

      categories.forEach(cat => {
        const blocks = window.BubbleBlockRegistry.getByCategory(cat.id);
        if (blocks.length > 0) {
          html += `
            <div class="library-category">
              <div class="library-category-title" style="color: ${cat.color};">● ${cat.label}</div>
              <div class="category-blocks-list" style="display: flex; flex-direction: column; gap: 6px;">
                ${blocks.map(b => `
                  <div class="block-library-item"
                       data-block-type="${b.type}"
                       data-tooltip="${b.description}"
                       draggable="true"
                       style="background-color: ${cat.color};">
                    <span>${b.icon}</span>
                    <span>${b.label}</span>
                    <button class="block-lib-add-btn" data-quick-add="${b.type}" title="Click to Add">+</button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      });

      container.innerHTML = html;

      // Attach dragstart listeners to library items
      container.querySelectorAll('.block-library-item').forEach(item => {
        item.addEventListener('dragstart', (e) => {
          const type = item.getAttribute('data-block-type');
          e.dataTransfer.setData('text/bubble-block-type', type);
          e.dataTransfer.effectAllowed = 'copy';
        });

        // Click-to-add fallback
        const addBtn = item.querySelector('[data-quick-add]');
        if (addBtn) {
          addBtn.onclick = (e) => {
            e.stopPropagation();
            const type = addBtn.getAttribute('data-quick-add');
            const newBlock = window.BubbleBlockRegistry.createBlockInstance(type);

            // If selected block is a container, add inside; else add to root
            let parentId = null;
            if (this.selectedBlockId) {
              const sel = this.findBlock(this.selectedBlockId);
              if (sel && window.BubbleBlockRegistry.getDefinition(sel.type)?.acceptsChildren) {
                parentId = sel.id;
              }
            }

            this.addBlock(newBlock, parentId);
            window.BubbleUtils.showToast(`Added ${newBlock.type} block`, 'info', 1500);
          };
        }
      });

      // Search filter
      const searchInp = document.getElementById('library-search-input');
      if (searchInp) {
        searchInp.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase().trim();
          container.querySelectorAll('.block-library-item').forEach(el => {
            const label = el.textContent.toLowerCase();
            el.style.display = label.includes(query) ? 'flex' : 'none';
          });
        });
      }
    }

    /**
     * Re-render Workspace, Phone Simulator, Code Explorer, and Inspector
     */
    renderAll() {
      // 1. Render Block Workspace
      this.workspace.render(this.blocks, this.selectedBlockId);

      // 2. Render Phone Simulator
      this.simulator.update(this.blocks, true);

      // 3. Render Dart Code Explorer
      this.codeExplorer.render();

      // 4. Update Inspector
      const activeBlock = this.selectedBlockId ? this.findBlock(this.selectedBlockId) : null;
      this.inspector.setSelected(activeBlock);
    }

    /**
     * Block Selection
     */
    selectBlock(blockId) {
      this.selectedBlockId = blockId;
      this.workspace.render(this.blocks, this.selectedBlockId);
      const active = blockId ? this.findBlock(blockId) : null;
      this.inspector.setSelected(active);
      this.codeExplorer.setSelectedBlock(blockId);
    }

    /**
     * Tree Manipulation Operations
     */
    findBlock(id, list = this.blocks) {
      for (const b of list) {
        if (b.id === id) return b;
        if (Array.isArray(b.children)) {
          const found = this.findBlock(id, b.children);
          if (found) return found;
        }
      }
      return null;
    }

    findBlockLocation(id, list = this.blocks, parent = null) {
      const idx = list.findIndex(b => b.id === id);
      if (idx !== -1) {
        return { container: list, index: idx, parent: parent };
      }
      for (const b of list) {
        if (Array.isArray(b.children)) {
          const res = this.findBlockLocation(id, b.children, b);
          if (res) return res;
        }
      }
      return null;
    }

    addBlock(block, parentId = null, index = null) {
      if (!block) return;

      if (!parentId) {
        if (typeof index === 'number') {
          this.blocks.splice(index, 0, block);
        } else {
          this.blocks.push(block);
        }
      } else {
        const parent = this.findBlock(parentId);
        if (parent && Array.isArray(parent.children)) {
          if (typeof index === 'number') {
            parent.children.splice(index, 0, block);
          } else {
            parent.children.push(block);
          }
        }
      }

      this.onProjectModified();
      this.selectBlock(block.id);
    }

    deleteBlock(id) {
      const loc = this.findBlockLocation(id);
      if (loc) {
        const [removed] = loc.container.splice(loc.index, 1);
        this.selectBlock(null);
        this.onProjectModified();
        window.BubbleUtils.showToast(`Deleted ${removed.type} block`, 'info', 1500);
      }
    }

    duplicateBlock(id) {
      const original = this.findBlock(id);
      if (!original) return;

      const clone = window.BubbleUtils.deepClone(original);
      const reassign = (node) => {
        node.id = window.BubbleUtils.generateId('block');
        if (Array.isArray(node.children)) {
          node.children.forEach(c => reassign(c));
        }
      };
      reassign(clone);

      const loc = this.findBlockLocation(id);
      if (loc) {
        loc.container.splice(loc.index + 1, 0, clone);
      } else {
        this.blocks.push(clone);
      }

      this.onProjectModified();
      this.selectBlock(clone.id);
      window.BubbleUtils.showToast('Duplicated block', 'success', 1500);
    }

    moveBlockDirection(id, direction) {
      const loc = this.findBlockLocation(id);
      if (!loc) return;

      const targetIdx = direction === 'up' ? loc.index - 1 : loc.index + 1;
      if (targetIdx < 0 || targetIdx >= loc.container.length) return;

      const [item] = loc.container.splice(loc.index, 1);
      loc.container.splice(targetIdx, 0, item);

      this.onProjectModified();
      this.selectBlock(id);
    }

    moveBlockTo(blockId, targetParentId, targetIndex) {
      const block = this.findBlock(blockId);
      if (!block) return;

      // Remove from old position
      const loc = this.findBlockLocation(blockId);
      if (loc) loc.container.splice(loc.index, 1);

      // Re-insert at new target position
      if (!targetParentId) {
        const idx = typeof targetIndex === 'number' ? targetIndex : this.blocks.length;
        this.blocks.splice(idx, 0, block);
      } else {
        const parent = this.findBlock(targetParentId);
        if (parent && Array.isArray(parent.children)) {
          const idx = typeof targetIndex === 'number' ? targetIndex : parent.children.length;
          parent.children.splice(idx, 0, block);
        }
      }

      this.onProjectModified();
      this.selectBlock(blockId);
    }

    updateBlockField(blockId, fieldName, value) {
      const block = this.findBlock(blockId);
      if (!block) return;

      block.fields[fieldName] = value;
      this.onProjectModified();
    }

    /**
     * Starter Mini-Project Loader
     */
    loadTutorial(tutorialId) {
      const tutorial = window.BubbleTutorials.getTutorialById(tutorialId);
      this.blocks = window.BubbleUtils.deepClone(tutorial.blocks);
      this.project.name = tutorial.title;
      const titleEl = document.getElementById('editor-project-title');
      if (titleEl) titleEl.textContent = this.project.name;

      this.onProjectModified();
      if (this.blocks.length > 0) {
        this.selectBlock(this.blocks[0].id);
      }
      window.BubbleUtils.showToast(`Loaded "${tutorial.title}"`, 'success');
    }

    onProjectModified() {
      this.project.blocks = this.blocks;
      this.history.pushState(this.blocks);
      this.renderAll();
      this.debouncedSave();
    }

    saveToStorage() {
      try {
        this.setSaveStatus('saving');
        window.BubbleStorage.saveProject(this.project);
        setTimeout(() => this.setSaveStatus('saved'), 200);
      } catch (err) {
        console.error('Save failed:', err);
        this.setSaveStatus('failed');
      }
    }

    setSaveStatus(status) {
      const pill = document.getElementById('save-status-pill');
      const text = document.getElementById('save-status-text');
      if (!pill || !text) return;

      pill.classList.remove('saving', 'failed');
      if (status === 'saving') {
        pill.classList.add('saving');
        text.textContent = 'Saving app...';
      } else if (status === 'saved') {
        text.textContent = 'All changes saved';
      } else if (status === 'failed') {
        pill.classList.add('failed');
        text.textContent = 'Save failed';
      }
    }

    updateHistoryButtons(status) {
      const undoBtn = document.getElementById('btn-undo');
      const redoBtn = document.getElementById('btn-redo');
      if (undoBtn) undoBtn.disabled = !status.canUndo;
      if (redoBtn) redoBtn.disabled = !status.canRedo;
    }

    openLearnModal() {
      const modal = document.getElementById('learn-modal');
      const body = document.getElementById('learn-modal-body');
      if (!modal || !body) return;

      const tutorials = window.BubbleTutorials.getAllTutorials();
      body.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 20px; font-weight: 800; color: var(--color-text-main); margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-primary-main);"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            <span>Flutter & Dart Visual App Tutorials</span>
          </h2>
          <p style="font-size: 14px; color: var(--color-text-muted);">
            Pick a guided mini-project to build with visual blocks and learn standard Flutter app concepts:
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          ${tutorials.map(t => `
            <div class="learn-card" style="cursor: pointer;" data-load-tut="${t.id}">
              <div class="learn-card-title">
                <span style="display: inline-flex; align-items: center;">${t.icon}</span>
                <span>${t.title}</span>
                <span class="badge badge-accent" style="margin-left: auto;">${t.level}</span>
              </div>
              <div class="learn-card-desc">${t.description}</div>
              <div style="font-size: 11px; font-weight: 600; color: var(--color-primary); margin-top: 6px;">Key Concept: ${t.concept} →</div>
            </div>
          `).join('')}
        </div>
      `;

      body.querySelectorAll('[data-load-tut]').forEach(card => {
        card.onclick = () => {
          const tId = card.getAttribute('data-load-tut');
          this.loadTutorial(tId);
          modal.classList.remove('active');
        };
      });

      modal.classList.add('active');
    }

    setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          const undoBtn = document.getElementById('btn-undo');
          if (undoBtn) undoBtn.click();
        } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
          e.preventDefault();
          const redoBtn = document.getElementById('btn-redo');
          if (redoBtn) redoBtn.click();
        } else if (!isInput && (e.key === 'Delete' || e.key === 'Backspace')) {
          if (this.selectedBlockId) {
            e.preventDefault();
            this.deleteBlock(this.selectedBlockId);
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
          if (this.selectedBlockId && !isInput) {
            e.preventDefault();
            this.duplicateBlock(this.selectedBlockId);
          }
        }
      });
    }
  }

  window.BubbleAppEditor = BubbleAppEditor;

  window.addEventListener('DOMContentLoaded', () => {
    const editor = new BubbleAppEditor();
    editor.init();
    window.currentBubbleAppEditor = editor;
  });
})(window);
