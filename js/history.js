/**
 * BUBBLE - Undo & Redo History Manager
 * Maintains a bounded snapshot stack for non-destructive time-travel editing.
 */

(function (window) {
  'use strict';

  class HistoryManager {
    constructor(maxSize = 40) {
      this.maxSize = maxSize;
      this.undoStack = [];
      this.redoStack = [];
      this.listeners = [];
      this.isPerformingAction = false;
    }

    /**
     * Push a new state snapshot
     */
    pushState(state) {
      if (this.isPerformingAction) return;

      const snapshot = JSON.stringify(state);

      // Don't record duplicate consecutive states
      if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === snapshot) {
        return;
      }

      this.undoStack.push(snapshot);
      if (this.undoStack.length > this.maxSize) {
        this.undoStack.shift();
      }

      // Any new modification clears redo stack
      this.redoStack = [];
      this.notify();
    }

    /**
     * Can undo?
     */
    canUndo() {
      return this.undoStack.length > 1;
    }

    /**
     * Can redo?
     */
    canRedo() {
      return this.redoStack.length > 0;
    }

    /**
     * Perform undo operation
     */
    undo() {
      if (!this.canUndo()) return null;

      this.isPerformingAction = true;
      const current = this.undoStack.pop();
      this.redoStack.push(current);

      const previous = this.undoStack[this.undoStack.length - 1];
      this.isPerformingAction = false;

      this.notify();
      return JSON.parse(previous);
    }

    /**
     * Perform redo operation
     */
    redo() {
      if (!this.canRedo()) return null;

      this.isPerformingAction = true;
      const next = this.redoStack.pop();
      this.undoStack.push(next);
      this.isPerformingAction = false;

      this.notify();
      return JSON.parse(next);
    }

    /**
     * Clear history (e.g., when loading a new project)
     */
    clear(initialState = null) {
      this.undoStack = [];
      this.redoStack = [];
      if (initialState) {
        this.undoStack.push(JSON.stringify(initialState));
      }
      this.notify();
    }

    /**
     * Subscribe to history state changes to enable/disable buttons
     */
    subscribe(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
    }

    notify() {
      const status = {
        canUndo: this.canUndo(),
        canRedo: this.canRedo(),
        undoCount: this.undoStack.length,
        redoCount: this.redoStack.length
      };
      this.listeners.forEach(cb => {
        try {
          cb(status);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }

  window.BubbleHistoryManager = HistoryManager;
})(window);
