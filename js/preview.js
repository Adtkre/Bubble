/**
 * BUBBLE - Isolated Live Preview Manager
 * Sandboxed iframe rendering that isolates project JavaScript and DOM execution.
 */

(function (window) {
  'use strict';

  class PreviewManager {
    constructor(modalBackdrop, iframeElement) {
      this.modal = modalBackdrop;
      this.iframe = iframeElement;
      this.activeViewport = 'desktop';
      this.initEvents();
    }

    initEvents() {
      if (!this.modal) return;

      const closeBtn = this.modal.querySelector('#btn-close-preview');
      if (closeBtn) {
        closeBtn.onclick = () => this.close();
      }

      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.close();
      });

      // Viewport switcher inside preview
      this.modal.querySelectorAll('.preview-viewport-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.modal.querySelectorAll('.preview-viewport-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const vp = btn.getAttribute('data-viewport');
          this.setViewport(vp);
        });
      });
    }

    setViewport(viewport) {
      this.activeViewport = viewport;
      const wrapper = this.modal.querySelector('.preview-iframe-wrapper');
      if (!wrapper) return;

      wrapper.style.margin = '0 auto';
      wrapper.style.transition = 'width 0.3s ease';

      if (viewport === 'desktop') {
        wrapper.style.width = '100%';
        wrapper.style.maxWidth = '100%';
      } else if (viewport === 'tablet') {
        wrapper.style.width = '768px';
        wrapper.style.maxWidth = '100%';
      } else if (viewport === 'mobile') {
        wrapper.style.width = '375px';
        wrapper.style.maxWidth = '100%';
      }
    }

    /**
     * Open preview modal and render current project inside sandboxed iframe
     */
    open(project, baseCss = '') {
      if (!this.modal || !this.iframe) return;

      try {
        const fullDoc = window.BubbleCodeGenerator.generateFullDocument(project, baseCss, true);
        this.iframe.srcdoc = fullDoc;
        this.modal.classList.add('active');
        this.setViewport(this.activeViewport);
      } catch (err) {
        console.error('Preview render error:', err);
        window.BubbleUtils.showToast(`Preview failed: ${err.message}`, 'error');
      }
    }

    close() {
      if (this.modal) {
        this.modal.classList.remove('active');
        if (this.iframe) {
          this.iframe.srcdoc = ''; // Clear iframe to free memory
        }
      }
    }
  }

  window.BubblePreviewManager = PreviewManager;
})(window);
