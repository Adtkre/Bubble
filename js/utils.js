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
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>'
      };

      toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: flex; align-items: center;">${iconMap[type] || iconMap.info}</span>
          <span>${Utils.escapeHtml(message)}</span>
        </div>
        <button style="color: var(--color-text-subtle); display: flex; align-items: center; padding: 2px; margin-left: 8px;" title="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg></button>
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
