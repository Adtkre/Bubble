/**
 * BUBBLE - Drag and Drop System
 * Native HTML5 drag-and-drop handling for component library, canvas reordering, and nesting.
 */

(function (window) {
  'use strict';

  class DragDropManager {
    constructor(editor) {
      this.editor = editor;
      this.draggedData = null; // { source: 'library'|'canvas', type, componentId }
      this.dropIndicator = null;
      this.currentDropTarget = null;
      this.initDropIndicator();
      this.bindWindowEvents();
    }

    initDropIndicator() {
      this.dropIndicator = document.createElement('div');
      this.dropIndicator.className = 'drop-indicator-line';
      this.dropIndicator.style.display = 'none';
      document.body.appendChild(this.dropIndicator);
    }

    bindWindowEvents() {
      // Prevent browser default behavior of opening dropped files or text
      window.addEventListener('dragover', (e) => e.preventDefault(), false);
      window.addEventListener('drop', (e) => e.preventDefault(), false);
    }

    /**
     * Attach dragstart handlers to component library items
     */
    setupLibraryDrag(container) {
      const items = container.querySelectorAll('.component-item');
      items.forEach(item => {
        item.setAttribute('draggable', 'true');

        item.addEventListener('dragstart', (e) => {
          const type = item.getAttribute('data-type');
          this.draggedData = {
            source: 'library',
            type: type
          };
          e.dataTransfer.setData('text/plain', type);
          e.dataTransfer.effectAllowed = 'copy';
          item.classList.add('is-dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('is-dragging');
          this.hideDropIndicator();
          this.draggedData = null;
        });
      });
    }

    /**
     * Attach drag and drop listeners to canvas workspace
     */
    setupCanvasDrop(canvasRoot) {
      canvasRoot.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedData) return;

        // Find nearest canvas component under cursor
        const targetElement = this.findNearestComponent(e.target);

        if (!targetElement || targetElement === canvasRoot) {
          // Dropping directly into root canvas
          this.showIndicatorForRoot(canvasRoot, e.clientY);
          this.currentDropTarget = {
            parentId: null,
            index: this.editor.project.components.length
          };
          return;
        }

        const compId = targetElement.getAttribute('data-bubble-id');
        const targetComp = this.editor.findComponent(compId);

        if (!targetComp) return;

        const rect = targetElement.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const heightThreshold = rect.height / 3;

        // Container nesting logic
        const isContainer = window.BubbleComponentLibrary.getDefinition(targetComp.type)?.isContainer;
        const isValidNesting = isContainer && (
          this.draggedData.source === 'library'
            ? window.BubbleComponentLibrary.isNestingAllowed(targetComp.type, this.draggedData.type)
            : targetComp.id !== this.draggedData.componentId // cannot drop into self
        );

        if (isContainer && isValidNesting && relativeY > heightThreshold && relativeY < (rect.height - heightThreshold)) {
          // Inside container
          this.hideDropIndicator();
          targetElement.classList.add('drop-indicator-nested');
          this.currentDropTarget = {
            parentId: targetComp.id,
            index: Array.isArray(targetComp.children) ? targetComp.children.length : 0,
            element: targetElement
          };
        } else {
          // Before or after element
          targetElement.classList.remove('drop-indicator-nested');
          const isBefore = relativeY < (rect.height / 2);
          const location = this.editor.findParent(targetComp.id);
          const parentId = location && location.parent ? location.parent.id : null;
          const targetIndex = isBefore ? location.index : location.index + 1;

          this.showIndicatorForElement(rect, isBefore);
          this.currentDropTarget = {
            parentId: parentId,
            index: targetIndex
          };
        }
      });

      canvasRoot.addEventListener('dragleave', (e) => {
        if (e.target.classList && e.target.classList.contains('drop-indicator-nested')) {
          e.target.classList.remove('drop-indicator-nested');
        }
      });

      canvasRoot.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.hideDropIndicator();
        document.querySelectorAll('.drop-indicator-nested').forEach(el => el.classList.remove('drop-indicator-nested'));

        if (!this.draggedData || !this.currentDropTarget) {
          this.draggedData = null;
          this.currentDropTarget = null;
          return;
        }

        const { parentId, index } = this.currentDropTarget;

        if (this.draggedData.source === 'library') {
          // Add new component from library
          const newComp = window.BubbleProjectModel.createComponent(this.draggedData.type);
          this.editor.addComponent(newComp, parentId, index);
        } else if (this.draggedData.source === 'canvas') {
          // Move existing component
          this.editor.moveComponentToPosition(this.draggedData.componentId, parentId, index);
        }

        this.draggedData = null;
        this.currentDropTarget = null;
      });
    }

    /**
     * Enable dragging on rendered canvas component
     */
    makeCanvasComponentDraggable(el, compId) {
      el.setAttribute('draggable', 'true');

      el.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        const comp = this.editor.findComponent(compId);
        if (!comp) return;

        this.draggedData = {
          source: 'canvas',
          componentId: compId,
          type: comp.type
        };

        e.dataTransfer.setData('text/plain', compId);
        e.dataTransfer.effectAllowed = 'move';
        el.classList.add('is-dragging');
      });

      el.addEventListener('dragend', (e) => {
        e.stopPropagation();
        el.classList.remove('is-dragging');
        this.hideDropIndicator();
        document.querySelectorAll('.drop-indicator-nested').forEach(n => n.classList.remove('drop-indicator-nested'));
        this.draggedData = null;
      });
    }

    findNearestComponent(target) {
      if (!target) return null;
      return target.closest('[data-bubble-id]');
    }

    showIndicatorForElement(rect, isBefore) {
      const y = isBefore ? rect.top : rect.bottom;
      this.dropIndicator.style.top = `${y - 2}px`;
      this.dropIndicator.style.left = `${rect.left}px`;
      this.dropIndicator.style.width = `${rect.width}px`;
      this.dropIndicator.style.display = 'block';
    }

    showIndicatorForRoot(rootEl, clientY) {
      const rect = rootEl.getBoundingClientRect();
      this.dropIndicator.style.top = `${rect.bottom - 4}px`;
      this.dropIndicator.style.left = `${rect.left + 16}px`;
      this.dropIndicator.style.width = `${rect.width - 32}px`;
      this.dropIndicator.style.display = 'block';
    }

    hideDropIndicator() {
      if (this.dropIndicator) {
        this.dropIndicator.style.display = 'none';
      }
    }
  }

  window.BubbleDragDropManager = DragDropManager;
})(window);
