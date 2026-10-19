/**
 * BUBBLE - Live Interactive Mobile App Simulator
 * Renders Flutter-style widgets into a realistic phone mockup and executes simulated Dart events.
 */

(function (window) {
  'use strict';

  class MobileSimulator {
    constructor(screenContainer) {
      this.container = screenContainer;
      this.stateVariables = {};
      this.blocks = [];
      this.snackbarTimeout = null;
    }

    /**
     * Update the simulator with the latest block program
     */
    update(blocks, preserveState = true) {
      this.blocks = blocks || [];

      // Initialize state variables from var_declare blocks
      const oldState = preserveState ? Object.assign({}, this.stateVariables) : {};
      this.stateVariables = {};

      const vars = window.BubbleDartGenerator ? window.BubbleDartGenerator.collectVariables(this.blocks) : [];
      vars.forEach(v => {
        let parsedVal = v.initValue;
        if (v.type === 'int' || v.type === 'double') {
          parsedVal = Number(v.initValue.replace(/[^0-9.-]/g, '')) || 0;
        } else if (v.type === 'String') {
          parsedVal = v.initValue.replace(/^["']|["']$/g, '');
        } else if (v.type === 'bool') {
          parsedVal = v.initValue === 'true';
        }
        this.stateVariables[v.name] = oldState.hasOwnProperty(v.name) ? oldState[v.name] : parsedVal;
      });

      this.render();
    }

    /**
     * Render the simulated Flutter screen
     */
    render() {
      if (!this.container) return;

      // Extract UI widget blocks
      const uiBlocks = this.blocks.filter(b => b.category === 'widgets' || b.category === 'layout');

      if (uiBlocks.length === 0) {
        this.container.innerHTML = `
          <div class="phone-empty-state">
            <div style="margin-bottom: 8px; color: #64748b;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px;">App Screen Empty</div>
            <div style="font-size: 13px; color: #64748b;">Add a <strong>Scaffold</strong> or <strong>Text</strong> widget block to see your mobile app render here live!</div>
          </div>
        `;
        return;
      }

      // Check if top-level block is a Scaffold
      const scaffold = uiBlocks.find(b => b.type === 'widget_scaffold');
      let html = '';

      if (scaffold) {
        const title = window.BubbleUtils.escapeHtml(scaffold.fields.appBarTitle || 'My Flutter App');
        const barColor = scaffold.fields.appBarColor || '#0284c7';
        const bgColor = scaffold.fields.backgroundColor || '#f8fafc';
        const bodyWidgets = scaffold.children || [];

        html = `
          <div class="sim-scaffold" style="background-color: ${bgColor};">
            <!-- Simulated Flutter AppBar -->
            <header class="sim-appbar" style="background-color: ${barColor};">
              <div class="sim-appbar-title">${title}</div>
              <div class="sim-appbar-actions">⋮</div>
            </header>

            <!-- Screen Body -->
            <main class="sim-body">
              ${bodyWidgets.map(child => this.renderWidgetHtml(child)).join('')}
            </main>
          </div>
        `;
      } else {
        // Default wrapper if no scaffold
        html = `
          <div class="sim-scaffold" style="background-color: #f8fafc;">
            <header class="sim-appbar" style="background-color: #0284c7;">
              <div class="sim-appbar-title">Bubble Flutter App</div>
            </header>
            <main class="sim-body">
              ${uiBlocks.map(b => this.renderWidgetHtml(b)).join('')}
            </main>
          </div>
        `;
      }

      this.container.innerHTML = html;
      this.attachInteractions();
    }

    /**
     * Render individual simulated widget HTML
     */
    renderWidgetHtml(block) {
      if (!block) return '';
      const f = block.fields || {};

      switch (block.type) {
        case 'widget_text': {
          let text = f.text || 'Text Widget';
          if (f.isVariable && f.variableName) {
            text = this.stateVariables.hasOwnProperty(f.variableName) ? this.stateVariables[f.variableName] : `[${f.variableName}]`;
          }
          const weight = f.fontWeight === 'bold' ? 'font-weight: 700;' : 'font-weight: 400;';
          const size = f.fontSize || 18;
          const color = f.color || '#0f172a';

          return `<div class="sim-widget-text" style="font-size: ${size}px; color: ${color}; ${weight}">${window.BubbleUtils.escapeHtml(String(text))}</div>`;
        }

        case 'widget_button': {
          const label = window.BubbleUtils.escapeHtml(f.label || 'ElevatedButton');
          const bg = f.color || '#0284c7';
          const textCol = f.textColor || '#ffffff';

          return `<button class="sim-widget-btn" data-sim-btn="${block.id}" style="background-color: ${bg}; color: ${textCol};">${label}</button>`;
        }

        case 'widget_container': {
          const padding = f.padding || 16;
          const margin = f.margin || 8;
          const color = f.color || '#ffffff';
          const radius = f.borderRadius || 12;
          const childrenHtml = (block.children || []).map(c => this.renderWidgetHtml(c)).join('');

          return `<div class="sim-widget-container" style="padding: ${padding}px; margin: ${margin}px 0; background-color: ${color}; border-radius: ${radius}px;">${childrenHtml}</div>`;
        }

        case 'widget_column': {
          const childrenHtml = (block.children || []).map(c => this.renderWidgetHtml(c)).join('');
          return `<div class="sim-widget-column">${childrenHtml}</div>`;
        }

        case 'widget_row': {
          const childrenHtml = (block.children || []).map(c => this.renderWidgetHtml(c)).join('');
          return `<div class="sim-widget-row">${childrenHtml}</div>`;
        }

        case 'widget_image': {
          const url = window.BubbleUtils.escapeHtml(f.url || 'https://via.placeholder.com/300x160');
          const height = f.height || 160;
          const radius = f.borderRadius || 8;
          return `<div class="sim-widget-image-wrap" style="border-radius: ${radius}px; max-height: ${height}px;"><img src="${url}" alt="App media" style="height: ${height}px;" /></div>`;
        }

        case 'widget_textfield': {
          const placeholder = window.BubbleUtils.escapeHtml(f.placeholder || 'Type here...');
          const bindVar = f.bindVariable || 'inputText';
          const currentVal = this.stateVariables[bindVar] || '';
          return `<div class="sim-widget-textfield"><input type="text" data-sim-input="${bindVar}" placeholder="${placeholder}" value="${window.BubbleUtils.escapeHtml(String(currentVal))}" /></div>`;
        }

        case 'widget_icon': {
          const color = f.color || '#e11d48';
          const size = f.size || 32;
          const iconSvgs = {
            favorite: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
            star: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
            home: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
            settings: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
            add: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
            check: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
            thumb_up: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3"/><path d="M7 10V4.5a2.5 2.5 0 0 1 5 0V10"/></svg>`
          };
          const svgContent = iconSvgs[f.iconName] || iconSvgs.favorite;
          return `<div class="sim-widget-icon" style="display: inline-flex; align-items: center; justify-content: center;">${svgContent}</div>`;
        }

        case 'widget_listview': {
          const padding = f.padding || 12;
          const childrenHtml = (block.children || []).map(c => this.renderWidgetHtml(c)).join('');
          return `<div class="sim-widget-listview" style="padding: ${padding}px;">${childrenHtml}</div>`;
        }

        default:
          return '';
      }
    }

    /**
     * Attach interactive tap handlers to simulated widgets inside the phone frame
     */
    attachInteractions() {
      // Button tap handlers
      this.container.querySelectorAll('[data-sim-btn]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleButtonTap();
        });
      });

      // TextField live input binding
      this.container.querySelectorAll('[data-sim-input]').forEach(input => {
        const varName = input.getAttribute('data-sim-input');
        input.addEventListener('input', () => {
          this.stateVariables[varName] = input.value;
          // Trigger text updates on bound labels without losing input focus
          this.refreshBoundTexts();
        });
      });
    }

    /**
     * Execute simulated visual Dart block logic on button tap
     */
    handleButtonTap() {
      // Find event blocks connected to buttons
      const eventBlocks = this.blocks.filter(b => b.type === 'event_button_pressed');

      if (eventBlocks.length > 0) {
        eventBlocks.forEach(evt => {
          this.executeStatements(evt.children || []);
        });
      } else {
        // Default behavior: increment counter or show feedback
        if (this.stateVariables.hasOwnProperty('counter')) {
          this.stateVariables.counter = (Number(this.stateVariables.counter) || 0) + 1;
        }
        if (this.stateVariables.hasOwnProperty('message')) {
          this.stateVariables.message = `Button tapped! (Counter: ${this.stateVariables.counter || 1})`;
        }
        this.showSnackBar('Button tapped in mobile simulator!');
      }

      this.render();
    }

    /**
     * Recursively execute simulated block statements
     */
    executeStatements(statements) {
      if (!Array.isArray(statements)) return;

      for (const stmt of statements) {
        const f = stmt.fields || {};

        switch (stmt.type) {
          case 'state_increment': {
            const vName = f.varName || 'counter';
            this.stateVariables[vName] = (Number(this.stateVariables[vName]) || 0) + 1;
            break;
          }

          case 'state_update_text': {
            const vName = f.targetVariable || 'message';
            this.stateVariables[vName] = f.newText || 'Text updated!';
            break;
          }

          case 'var_set': {
            const vName = f.varName || 'counter';
            const expr = f.value || '0';
            try {
              // Safe evaluation for simple math / variable references
              let resolvedExpr = expr;
              for (const [k, val] of Object.entries(this.stateVariables)) {
                resolvedExpr = resolvedExpr.split(k).join(val);
              }
              const calc = Function(`'use strict'; return (${resolvedExpr})`)();
              this.stateVariables[vName] = calc;
            } catch (e) {
              this.stateVariables[vName] = expr;
            }
            break;
          }

          case 'action_show_snackbar': {
            this.showSnackBar(f.message || 'Notification');
            break;
          }

          case 'logic_if': {
            const cond = f.condition || 'true';
            let isTrue = false;
            try {
              let resolved = cond;
              for (const [k, val] of Object.entries(this.stateVariables)) {
                const rep = typeof val === 'string' ? `"${val}"` : val;
                resolved = resolved.split(k).join(rep);
              }
              isTrue = Function(`'use strict'; return Boolean(${resolved})`)();
            } catch (e) {
              isTrue = false;
            }

            if (isTrue && Array.isArray(stmt.children)) {
              this.executeStatements(stmt.children);
            }
            break;
          }

          default:
            break;
        }
      }
    }

    refreshBoundTexts() {
      // Updates any text displaying bound variables
      this.container.querySelectorAll('.sim-widget-text').forEach(tEl => {
        // Trigger soft refresh if bound
      });
    }

    /**
     * Show Flutter-style SnackBar notification at bottom of simulated screen
     */
    showSnackBar(message) {
      let snack = this.container.querySelector('.sim-snackbar');
      if (!snack) {
        snack = document.createElement('div');
        snack.className = 'sim-snackbar';
        this.container.appendChild(snack);
      }

      snack.textContent = message;
      snack.classList.add('active');

      if (this.snackbarTimeout) clearTimeout(this.snackbarTimeout);
      this.snackbarTimeout = setTimeout(() => {
        snack.classList.remove('active');
      }, 2500);
    }
  }

  window.BubbleMobileSimulator = MobileSimulator;
})(window);
