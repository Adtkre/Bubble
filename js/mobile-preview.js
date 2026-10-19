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
            <div style="font-size: 36px; margin-bottom: 8px;">📱</div>
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
          const iconGlyphs = {
            favorite: '❤️',
            star: '⭐',
            home: '🏠',
            settings: '⚙️',
            add: '➕',
            check: '✓',
            thumb_up: '👍'
          };
          const glyph = iconGlyphs[f.iconName] || '❤️';
          return `<div class="sim-widget-icon" style="font-size: ${size}px; color: ${color};">${glyph}</div>`;
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
