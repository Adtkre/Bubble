/**
 * BUBBLE - Core Utilities Module
 */

(function (window) {
  'use strict';

  const Utils = {
    /**
     * Generate a unique ID for components or projects
     */
    generateId(prefix = 'comp') {
      return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    },

    /**
     * Debounce function for input events and autosaving
     */
    debounce(fn, delay = 300) {
      let timer = null;
      return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
        }, delay);
      };
    },

    /**
     * Deep clone an object or array safely
     */
    deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (err) {
        console.error('Failed deep clone:', err);
        return obj;
      }
    },

    /**
     * Safe HTML escaping to prevent XSS
     */
    escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Format timestamp nicely
     */
    formatDate(dateInput) {
      if (!dateInput) return 'Unknown date';
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'Invalid date';

      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
      if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    },

    /**
     * Toast notification system
     */
    showToast(message, type = 'info', duration = 3000) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 700;">${iconMap[type] || 'ℹ'}</span>
          <span>${Utils.escapeHtml(message)}</span>
        </div>
        <button style="color: var(--color-text-subtle); font-size: 14px; margin-left: 8px;">✕</button>
      `;

      const closeBtn = toast.querySelector('button');
      closeBtn.onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 200);
      };

      container.appendChild(toast);

      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(10px)';
          setTimeout(() => toast.remove(), 200);
        }
      }, duration);
    },

    /**
     * Trigger file download in browser
     */
    downloadFile(filename, content, mimeType = 'text/plain') {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          return successful;
        }
      } catch (err) {
        console.error('Copy to clipboard failed:', err);
        return false;
      }
    }
  };

  window.BubbleUtils = Utils;
})(window);
