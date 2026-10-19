/**
 * BUBBLE - Project & Component Data Model
 * Source-of-truth object schema and immutable/mutable tree operations.
 */

(function (window) {
  'use strict';

  const ProjectModel = {
    /**
     * Create a new blank project
     */
    createProject(name = 'Untitled Project') {
      const id = window.BubbleUtils.generateId('proj');
      const now = new Date().toISOString();
      return {
        id: id,
        name: name,
        createdAt: now,
        updatedAt: now,
        settings: {
          title: name,
          description: 'Created with Bubble Visual Coding Platform',
          theme: 'light'
        },
        components: []
      };
    },

    /**
     * Create an individual component node
     */
    createComponent(type, customProps = {}, customStyles = {}, customEvents = []) {
      const id = window.BubbleUtils.generateId('elem');
      const def = window.BubbleComponentLibrary ? window.BubbleComponentLibrary.getDefinition(type) : null;

      const defaultProps = def ? window.BubbleUtils.deepClone(def.defaultProps || {}) : {};
      const defaultStyles = def ? window.BubbleUtils.deepClone(def.defaultStyles || {}) : {};

      return {
        id: id,
        type: type,
        parentId: null,
        props: Object.assign({}, defaultProps, customProps),
        styles: Object.assign({}, defaultStyles, customStyles),
        events: customEvents.length ? customEvents : [],
        children: def && def.isContainer ? [] : undefined
      };
    },

    /**
     * Find a component recursively by ID
     */
    findComponent(tree, id) {
      if (!Array.isArray(tree) || !id) return null;

      for (const comp of tree) {
        if (comp.id === id) return comp;
        if (Array.isArray(comp.children)) {
          const found = this.findComponent(comp.children, id);
          if (found) return found;
        }
      }
      return null;
    },

    /**
     * Find parent component and array container for a given child ID
     */
    findParent(tree, childId) {
      if (!Array.isArray(tree) || !childId) return null;

      // Check root level
      const rootIndex = tree.findIndex(c => c.id === childId);
      if (rootIndex !== -1) {
        return { parent: null, container: tree, index: rootIndex };
      }

      // Check nested children
      for (const comp of tree) {
        if (Array.isArray(comp.children)) {
          const childIndex = comp.children.findIndex(c => c.id === childId);
          if (childIndex !== -1) {
            return { parent: comp, container: comp.children, index: childIndex };
          }
          const nested = this.findParent(comp.children, childId);
          if (nested) return nested;
        }
      }

      return null;
    },

    /**
     * Insert a component into the tree
     */
    insertComponent(tree, component, parentId = null, index = null) {
      if (!tree || !component) return false;

      component.parentId = parentId;

      if (!parentId) {
        // Insert into root
        if (typeof index === 'number' && index >= 0 && index <= tree.length) {
          tree.splice(index, 0, component);
        } else {
          tree.push(component);
        }
        return true;
      }

      const parent = this.findComponent(tree, parentId);
      if (parent && Array.isArray(parent.children)) {
        if (typeof index === 'number' && index >= 0 && index <= parent.children.length) {
          parent.children.splice(index, 0, component);
        } else {
          parent.children.push(component);
        }
        return true;
      }

      return false;
    },

    /**
     * Remove a component from the tree by ID
     */
    removeComponent(tree, id) {
      const location = this.findParent(tree, id);
      if (!location) return null;

      const [removed] = location.container.splice(location.index, 1);
      return removed;
    },

    /**
     * Move component up or down within its current container
     */
    moveComponent(tree, id, direction = 'up') {
      const location = this.findParent(tree, id);
      if (!location) return false;

      const { container, index } = location;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= container.length) {
        return false; // Already at edge
      }

      const [item] = container.splice(index, 1);
      container.splice(targetIndex, 0, item);
      return true;
    },

    /**
     * Duplicate a component and insert it immediately after the original
     */
    duplicateComponent(tree, id) {
      const original = this.findComponent(tree, id);
      if (!original) return null;

      const clone = window.BubbleUtils.deepClone(original);

      // Reassign new unique IDs for clone and all descendants
      const reassign = (node) => {
        node.id = window.BubbleUtils.generateId('elem');
        if (Array.isArray(node.children)) {
          node.children.forEach(c => {
            c.parentId = node.id;
            reassign(c);
          });
        }
      };
      reassign(clone);

      const location = this.findParent(tree, id);
      if (location) {
        location.container.splice(location.index + 1, 0, clone);
        clone.parentId = location.parent ? location.parent.id : null;
      } else {
        tree.push(clone);
      }

      return clone;
    },

    /**
     * Flatten the tree into an array with depth metadata (useful for layers list)
     */
    flattenTree(tree, depth = 0) {
      let result = [];
      if (!Array.isArray(tree)) return result;

      for (const comp of tree) {
        result.push({
          component: comp,
          depth: depth
        });
        if (Array.isArray(comp.children) && comp.children.length > 0) {
          result = result.concat(this.flattenTree(comp.children, depth + 1));
        }
      }
      return result;
    },

    /**
     * Count total components in a tree
     */
    countComponents(tree) {
      if (!Array.isArray(tree)) return 0;
      let count = tree.length;
      for (const comp of tree) {
        if (Array.isArray(comp.children)) {
          count += this.countComponents(comp.children);
        }
      }
      return count;
    }
  };

  window.BubbleProjectModel = ProjectModel;
})(window);
