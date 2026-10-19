/**
 * BUBBLE - Dart Code Explorer & Synchronized Source Mapping
 * Inspects generated Flutter Dart code with syntax highlighting, line numbers, and block-level selection syncing.
 */

(function (window) {
  'use strict';

  class CodeExplorer {
    constructor(editor, drawerElement) {
      this.editor = editor;
      this.drawer = drawerElement;
      this.activeTab = 'dart'; // 'dart' | 'explanations'
      this.selectedBlockId = null;
      this.isOpen = true; // Open by default for beginner learning

      this.initEvents();
    }

    initEvents() {
      if (!this.drawer) return;

      // Tab switcher
      this.drawer.querySelectorAll('.code-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.drawer.querySelectorAll('.code-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.activeTab = btn.getAttribute('data-tab');
          this.render();
        });
      });

      // Toggle drawer button
      const closeBtn = this.drawer.querySelector('#btn-close-code-drawer');
      if (closeBtn) {
        closeBtn.onclick = () => this.toggle();
      }

      // Copy code button
      const copyBtn = this.drawer.querySelector('#btn-copy-dart-code');
      if (copyBtn) {
        copyBtn.onclick = async () => {
          const code = this.getCurrentDartCode();
          const ok = await window.BubbleUtils.copyToClipboard(code);
          if (ok) {
            window.BubbleUtils.showToast('Flutter Dart code copied to clipboard!', 'success');
          }
        };
      }

      // Download main.dart file button
      const dlBtn = this.drawer.querySelector('#btn-download-dart-file');
      if (dlBtn) {
        dlBtn.onclick = () => {
          const code = this.getCurrentDartCode();
          window.BubbleUtils.downloadFile('main.dart', code, 'text/plain');
          window.BubbleUtils.showToast('Downloaded main.dart', 'success');
        };
      }
    }

    toggle(forceState = null) {
      this.isOpen = typeof forceState === 'boolean' ? forceState : !this.isOpen;
      if (this.isOpen) {
        this.drawer.classList.add('open');
        this.render();
      } else {
        this.drawer.classList.remove('open');
      }

      const toggleBtn = document.getElementById('btn-toggle-code-explorer');
      if (toggleBtn) {
        if (this.isOpen) {
          toggleBtn.classList.add('btn-primary');
          toggleBtn.classList.remove('btn-secondary');
        } else {
          toggleBtn.classList.remove('btn-primary');
          toggleBtn.classList.add('btn-secondary');
        }
      }
    }

    setSelectedBlock(blockId) {
      this.selectedBlockId = blockId;
      if (this.isOpen) {
        this.render();
      }
    }

    getCurrentDartCode() {
      return window.BubbleDartGenerator.generateFullDartCode(this.editor.blocks, this.editor.project?.name);
    }

    render() {
      const viewer = this.drawer.querySelector('#code-viewer-container');
      if (!viewer) return;

      if (this.activeTab === 'explanations') {
        this.renderExplanationsTab(viewer);
        return;
      }

      const dartCode = this.getCurrentDartCode();
      const lines = dartCode.split('\n');
      const targetBlockId = this.selectedBlockId;

      let html = '';
      let highlightLineIndex = -1;

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const isHighlighted = targetBlockId && line.includes(targetBlockId);
        if (isHighlighted && highlightLineIndex === -1) {
          highlightLineIndex = idx;
        }

        const colorized = this.colorizeDartSyntax(line);

        html += `
          <div class="code-line ${isHighlighted ? 'highlighted' : ''}" id="dart-line-${idx}">
            <span class="code-line-num">${lineNum}</span>
            <span class="code-line-content">${colorized}</span>
          </div>
        `;
      });

      viewer.innerHTML = html;

      // Scroll highlighted code line into view
      if (highlightLineIndex >= 0) {
        setTimeout(() => {
          const el = document.getElementById(`dart-line-${highlightLineIndex}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
    }

    /**
     * Render beginner architecture breakdown
     */
    renderExplanationsTab(container) {
      container.innerHTML = `
        <div style="padding: 16px; color: #f8fafc; font-family: var(--font-sans); line-height: 1.6;">
          <h3 style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
            <span>How this Flutter App Works</span>
          </h3>
          <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 16px;">
            In Flutter, everything is a <strong>Widget</strong>. Your visual blocks were translated into standard Flutter code:
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
              <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 4px;">1. StatelessWidget</div>
              <div style="font-size: 12px; color: #94a3b8;">Wraps the overall MaterialApp configuration, theme colors, and sets the root home screen.</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
              <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 4px;">2. StatefulWidget & State</div>
              <div style="font-size: 12px; color: #94a3b8;">Maintains your dynamic variables (counter, message, inputs) and rebuilds the UI whenever state changes.</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
              <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 4px;">3. setState(() { ... })</div>
              <div style="font-size: 12px; color: #94a3b8;">Whenever buttons are tapped, setState() triggers so the phone screen refreshes with your updated values.</div>
            </div>
            <div style="background: #1e293b; padding: 12px; border-radius: 8px;">
              <div style="font-weight: 700; color: #a7f3d0; margin-bottom: 4px;">4. Widget Tree (build)</div>
              <div style="font-size: 12px; color: #94a3b8;">Nests the Scaffold, AppBar, Column, Text, and Buttons into a single cohesive mobile layout.</div>
            </div>
          </div>

          <div style="font-size: 12px; color: #e2e8f0; background: rgba(56, 189, 248, 0.15); border-left: 3px solid #38bdf8; padding: 10px 14px; border-radius: 4px;">
            <strong style="display: inline-flex; align-items: center; gap: 4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> Next Step:</strong> Click the "Copy Dart Code" or "Download main.dart" button above to paste this directly into a real Flutter project in VS Code or Android Studio!
          </div>
        </div>
      `;
    }

    /**
     * Dart syntax colorizer
     */
    colorizeDartSyntax(line) {
      let escaped = window.BubbleUtils.escapeHtml(line);

      // Comments
      if (escaped.trim().startsWith('//')) {
        return `<span style="color: #64748b; font-style: italic;">${escaped}</span>`;
      }

      return escaped
        .replace(/\b(import|class|extends|void|main|runApp|override|const|final|return|if|else|for|int|String|double|bool|super|setState)\b/g, '<span style="color: #c084fc; font-weight: 600;">$1</span>')
        .replace(/\b(Widget|BuildContext|StatelessWidget|StatefulWidget|State|MaterialApp|Scaffold|AppBar|Text|TextStyle|ElevatedButton|Container|Column|Row|SingleChildScrollView|BoxDecoration|BorderRadius|EdgeInsets|Color|Colors|Icon|Icons|ClipRRect|Image|TextField|InputDecoration|OutlineInputBorder|ListView|SnackBar|ScaffoldMessenger|ThemeData|Theme|ColorScheme)\b/g, '<span style="color: #38bdf8; font-weight: 600;">$1</span>')
        .replace(/(&quot;.*?&quot;|&#039;.*?&#039;)/g, '<span style="color: #a7f3d0;">$1</span>')
        .replace(/\b(0x[0-9a-fA-F]+|\d+)\b/g, '<span style="color: #fbbf24;">$1</span>');
    }
  }

  window.BubbleCodeExplorer = CodeExplorer;
})(window);
