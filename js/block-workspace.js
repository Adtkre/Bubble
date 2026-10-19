/**
 * BUBBLE - Visual Block Workspace Manager
 * Renders connected visual programming blocks with puzzle notches, C-block nesting clamps, and drag-and-drop.
 */

(function (window) {
  'use strict';

  class BlockWorkspace {
    constructor(editor, workspaceContainer) {
      this.editor = editor;
      this.container = workspaceContainer;
      this.selectedBlockId = null;
      this.draggedBlock = null;
      this.dropTarget = null; // { parentId, index, isInside }
      this.zoom = 100;

      this.initEvents();
    }

    initEvents() {
      if (!this.container) return;

      // Click on canvas background deselects
      this.container.addEventListener('click', (e) => {
        if (e.target === this.container || e.target.id === 'workspace-canvas-surface') {
          this.editor.selectBlock(null);
        }
      });

      // Drag and drop events for workspace
      this.setupDropZone();
    }

    setupDropZone() {
      const surface = this.container;

      surface.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        const nearestBlock = e.target.closest('[data-block-id]');
        if (!nearestBlock || nearestBlock === surface) {
          surface.classList.add('drag-over-surface');
          this.dropTarget = { parentId: null, index: this.editor.blocks.length };
          return;
        }

        surface.classList.remove('drag-over-surface');
        const targetId = nearestBlock.getAttribute('data-block-id');
        const targetBlock = this.editor.findBlock(targetId);
        if (!targetBlock) return;

        const rect = nearestBlock.getBoundingClientRect();
        const relY = e.clientY - rect.top;

        // Container nesting logic for C-shaped blocks
        const def = window.BubbleBlockRegistry.getDefinition(targetBlock.type);
        const isContainer = def && def.acceptsChildren;

        if (isContainer && relY > 30 && relY < (rect.height - 15)) {
          nearestBlock.classList.add('drop-into-clamp');
          this.dropTarget = { parentId: targetBlock.id, index: (targetBlock.children || []).length };
        } else {
          document.querySelectorAll('.drop-into-clamp').forEach(el => el.classList.remove('drop-into-clamp'));
          const isBefore = relY < (rect.height / 2);
          const loc = this.editor.findBlockLocation(targetBlock.id);
          this.dropTarget = {
            parentId: loc.parent ? loc.parent.id : null,
            index: isBefore ? loc.index : loc.index + 1
          };
        }
      });

      surface.addEventListener('dragleave', (e) => {
        if (e.target === surface) {
          surface.classList.remove('drag-over-surface');
        }
        if (e.target.classList && e.target.classList.contains('drop-into-clamp')) {
          e.target.classList.remove('drop-into-clamp');
        }
      });

      surface.addEventListener('drop', (e) => {
        e.preventDefault();
        surface.classList.remove('drag-over-surface');
        document.querySelectorAll('.drop-into-clamp').forEach(el => el.classList.remove('drop-into-clamp'));

        const blockType = e.dataTransfer.getData('text/bubble-block-type');
        const moveBlockId = e.dataTransfer.getData('text/bubble-move-id');

        if (blockType) {
          // Add new block from library
          const newBlock = window.BubbleBlockRegistry.createBlockInstance(blockType);
          const parentId = this.dropTarget ? this.dropTarget.parentId : null;
          const index = this.dropTarget ? this.dropTarget.index : null;
          this.editor.addBlock(newBlock, parentId, index);
        } else if (moveBlockId) {
          // Move existing block in workspace
          const parentId = this.dropTarget ? this.dropTarget.parentId : null;
          const index = this.dropTarget ? this.dropTarget.index : null;
          this.editor.moveBlockTo(moveBlockId, parentId, index);
        }

        this.dropTarget = null;
      });
    }

    /**
     * Render the visual block stacks and trees
     */
    render(blocks, selectedId = null) {
      this.selectedBlockId = selectedId;
      if (!this.container) return;

      if (!blocks || blocks.length === 0) {
        this.container.innerHTML = `
          <div class="workspace-empty-state">
            <div style="margin-bottom: 8px; color: var(--color-primary-main);">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19.439 7.85c0-1.57.802-2.41 1.561-2.41 1.536 0 2 1.94 2 3.19 0 .85-.45 1.5-1.14 1.83a2.5 2.5 0 0 0 0 4.7c.69.33 1.14.98 1.14 1.84 0 1.24-.464 3.19-2 3.19-.759 0-1.561-.84-1.561-2.41V17H16v2.561c0 .759-.84 1.561-2.41 1.561-1.25 0-3.19-.464-3.19-2 0-.69.65-1.14.98-1.83a2.5 2.5 0 0 0-4.7 0c-.33.69-.98 1.14-1.83 1.14-1.25 0-3.19-.464-3.19-2 0-.759.802-1.561 1.561-2.561H5.5V13h-2.56c-.759 0-1.561-.802-1.561-2.36 0-1.25.464-3.19 2-3.19.85 0 1.5.45 1.84 1.14a2.5 2.5 0 0 0 4.7 0c.33-.69.98-1.14 1.83-1.14 1.57 0 2.41.802 2.41 1.561V11H16V7.85Z"/>
              </svg>
            </div>
            <div style="font-size: 18px; font-weight: 700; color: var(--color-text-main); margin-bottom: 6px;">Visual Block Workspace</div>
            <div style="font-size: 14px; color: var(--color-text-muted); max-width: 480px; line-height: 1.6; margin-bottom: 16px;">
              Drag programming blocks and Flutter widgets from the left library, or pick a starter tutorial above to start building your mobile app!
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-quick-hw">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Load Hello World
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-quick-counter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px;"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>
                Load Counter App
              </button>
            </div>
          </div>
        `;

        const hwBtn = this.container.querySelector('#btn-quick-hw');
        if (hwBtn) hwBtn.onclick = () => this.editor.loadTutorial('hello_world');

        const cntBtn = this.container.querySelector('#btn-quick-counter');
        if (cntBtn) cntBtn.onclick = () => this.editor.loadTutorial('counter_app');

        return;
      }

      let html = '<div class="blocks-stack-root" id="blocks-stack-root">';
      html += blocks.map(b => this.renderBlockHtml(b)).join('');
      html += '</div>';

      this.container.innerHTML = html;
      this.attachBlockEvents(this.container);
    }

    /**
     * Render HTML markup for a visual block
     */
    renderBlockHtml(block) {
      if (!block) return '';
      const def = window.BubbleBlockRegistry.getDefinition(block.type);
      const cat = window.BubbleBlockRegistry.getCategory(block.category) || { color: '#0284c7', label: 'Widget' };
      const isSelected = block.id === this.selectedBlockId;
      const f = block.fields || {};

      let fieldSummary = '';
      if (block.type === 'widget_text') {
        fieldSummary = f.isVariable ? `var: $${f.variableName || 'message'}` : `"${f.text || ''}"`;
      } else if (block.type === 'widget_button') {
        fieldSummary = `"${f.label || ''}"`;
      } else if (block.type === 'var_declare') {
        fieldSummary = `${f.varType} ${f.varName} = ${f.initValue}`;
      } else if (block.type === 'var_set') {
        fieldSummary = `${f.varName} = ${f.value}`;
      } else if (block.type === 'logic_if') {
        fieldSummary = `(${f.condition})`;
      } else if (block.type === 'loop_repeat') {
        fieldSummary = `${f.times} times`;
      } else if (block.type === 'widget_scaffold') {
        fieldSummary = `title: "${f.appBarTitle}"`;
      } else if (block.type === 'event_button_pressed') {
        fieldSummary = `button: "${f.buttonLabel}"`;
      } else if (block.type === 'state_increment') {
        fieldSummary = `${f.varName}++`;
      } else if (block.type === 'action_show_snackbar') {
        fieldSummary = `"${f.message}"`;
      }

      // Check if block accepts children (C-shaped bracket clamp)
      const isContainer = def && def.acceptsChildren;
      let childrenHtml = '';
      if (isContainer) {
        const innerBlocks = block.children || [];
        childrenHtml = `
          <div class="block-clamp-mouth">
            ${innerBlocks.map(child => this.renderBlockHtml(child)).join('')}
            ${innerBlocks.length === 0 ? '<div class="block-drop-hint">Drop nested action statements here</div>' : ''}
          </div>
          <div class="block-clamp-bottom" style="background-color: ${cat.color};"></div>
        `;
      }

      return `
        <div class="vblock ${isContainer ? 'vblock-clamp' : 'vblock-statement'} ${isSelected ? 'selected' : ''}"
             data-block-id="${block.id}"
             data-block-type="${block.type}"
             draggable="true"
             style="--block-color: ${cat.color};">

          <!-- Puzzle Notch Header / Body -->
          <div class="vblock-head" style="background-color: ${cat.color};">
            <span class="vblock-notch"></span>
            <div class="vblock-icon">${def ? def.icon : '▢'}</div>
            <div class="vblock-title">${def ? def.label : block.type}</div>
            ${fieldSummary ? `<div class="vblock-field-summary">${window.BubbleUtils.escapeHtml(fieldSummary)}</div>` : ''}

            <!-- Quick Action Toolbar -->
            <div class="vblock-tools">
              <button class="vblock-tool-btn" data-tool="up" title="Move Up"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg></button>
              <button class="vblock-tool-btn" data-tool="down" title="Move Down"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg></button>
              <button class="vblock-tool-btn" data-tool="dup" title="Duplicate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="13" height="13" x="9" y="9" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <button class="vblock-tool-btn" data-tool="del" title="Delete" style="color: #fca5a5;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg></button>
            </div>
          </div>

          <!-- Nested clamp children -->
          ${childrenHtml}
        </div>
      `;
    }

    /**
     * Attach click selection and reorder dragging on rendered visual blocks
     */
    attachBlockEvents(root) {
      root.querySelectorAll('[data-block-id]').forEach(el => {
        const id = el.getAttribute('data-block-id');

        // Click to select
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editor.selectBlock(id);
        });

        // Drag to move
        el.addEventListener('dragstart', (e) => {
          e.stopPropagation();
          e.dataTransfer.setData('text/bubble-move-id', id);
          e.dataTransfer.effectAllowed = 'move';
          el.classList.add('is-dragging');
        });

        el.addEventListener('dragend', (e) => {
          e.stopPropagation();
          el.classList.remove('is-dragging');
        });

        // Block tool buttons
        const upBtn = el.querySelector('[data-tool="up"]');
        if (upBtn) {
          upBtn.onclick = (e) => {
            e.stopPropagation();
            this.editor.moveBlockDirection(id, 'up');
          };
        }

        const downBtn = el.querySelector('[data-tool="down"]');
        if (downBtn) {
          downBtn.onclick = (e) => {
            e.stopPropagation();
            this.editor.moveBlockDirection(id, 'down');
          };
        }

        const dupBtn = el.querySelector('[data-tool="dup"]');
        if (dupBtn) {
          dupBtn.onclick = (e) => {
            e.stopPropagation();
            this.editor.duplicateBlock(id);
          };
        }

        const delBtn = el.querySelector('[data-tool="del"]');
        if (delBtn) {
          delBtn.onclick = (e) => {
            e.stopPropagation();
            this.editor.deleteBlock(id);
          };
        }
      });
    }
  }

  window.BubbleBlockWorkspace = BlockWorkspace;
})(window);
