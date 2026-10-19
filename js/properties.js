/**
 * BUBBLE - Visual Block Property Inspector & Editor
 * Dynamically renders form controls for editing selected block fields and shows educational Dart insights.
 */

(function (window) {
  'use strict';

  class PropertiesInspector {
    constructor(editor, container) {
      this.editor = editor;
      this.container = container;
      this.selectedBlock = null;
    }

    setSelected(block) {
      this.selectedBlock = block;
      this.render();
    }

    render() {
      if (!this.container) return;

      if (!this.selectedBlock) {
        this.container.innerHTML = `
          <div class="inspector-empty">
            <div class="inspector-empty-icon">👆</div>
            <div style="font-weight: 700; color: var(--color-text-main); margin-bottom: 4px;">No Block Selected</div>
            <div>Click any block in the workspace to customize its fields, widgets, or logic parameters.</div>
          </div>
        `;
        return;
      }

      const block = this.selectedBlock;
      const def = window.BubbleBlockRegistry.getDefinition(block.type);
      const cat = window.BubbleBlockRegistry.getCategory(block.category) || { color: '#0284c7', label: 'Widget' };
      const lesson = window.BubbleDartLearn.getLesson(block.type);

      let fieldsHtml = '';
      for (const [key, fieldDef] of Object.entries(def.fields || {})) {
        const val = block.fields[key];

        if (fieldDef.type === 'text') {
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${fieldDef.label}</label>
              <input type="text" class="form-input" data-field="${key}" value="${window.BubbleUtils.escapeHtml(String(val || ''))}" />
            </div>
          `;
        } else if (fieldDef.type === 'number') {
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${fieldDef.label}</label>
              <input type="number" class="form-input" data-field="${key}" value="${val}" />
            </div>
          `;
        } else if (fieldDef.type === 'color') {
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${fieldDef.label}</label>
              <div class="prop-color-input-wrapper">
                <input type="color" class="prop-color-swatch" data-color-target="${key}" value="${val || '#000000'}" />
                <input type="text" class="form-input" data-field="${key}" value="${val || '#000000'}" />
              </div>
            </div>
          `;
        } else if (fieldDef.type === 'select') {
          const optionsHtml = fieldDef.options.map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('');
          fieldsHtml += `
            <div class="form-group">
              <label class="form-label">${fieldDef.label}</label>
              <select class="form-select" data-field="${key}">
                ${optionsHtml}
              </select>
            </div>
          `;
        } else if (fieldDef.type === 'boolean') {
          fieldsHtml += `
            <div class="form-group">
              <label class="bubble-checkbox-group">
                <input type="checkbox" class="bubble-checkbox" data-field="${key}" ${val ? 'checked' : ''} />
                <span>${fieldDef.label}</span>
              </label>
            </div>
          `;
        }
      }

      this.container.innerHTML = `
        <div class="inspector-header">
          <div class="inspector-title">
            <span class="badge" style="background-color: ${cat.color}; color: #ffffff;">${def ? def.icon : '▢'}</span>
            <span>${def ? def.label : block.type}</span>
          </div>
          <button class="btn btn-subtle btn-sm" id="btn-prop-del" title="Delete Block" style="color: var(--color-danger);">🗑</button>
        </div>

        <div class="inspector-body">
          <div class="prop-section">
            <div class="prop-section-title">Block Properties</div>
            ${fieldsHtml || '<div style="font-size: 13px; color: var(--color-text-muted);">No editable fields for this block.</div>'}
          </div>

          <!-- Educational Dart Breakdown -->
          <div class="inspector-learn-tip" style="margin-top: 16px;">
            <div class="learn-tip-title">🎓 Flutter & Dart Insight</div>
            <div class="learn-tip-text" style="margin-bottom: 8px;">${lesson.summary}</div>
            <pre style="background: #0f172a; color: #38bdf8; padding: 10px; border-radius: 6px; font-size: 11px; font-family: var(--font-mono); overflow-x: auto; margin-bottom: 8px;"><code>${window.BubbleUtils.escapeHtml(lesson.dartSnippet)}</code></pre>
            <div style="font-size: 12px; color: #4338ca; line-height: 1.5; margin-bottom: 6px;">${lesson.explanation}</div>
            ${lesson.beginnerMistake ? `<div style="font-size: 11px; color: #b45309; background: #fef3c7; padding: 6px 8px; border-radius: 4px;"><strong>⚠️ Beginner Tip:</strong> ${lesson.beginnerMistake}</div>` : ''}
          </div>
        </div>
      `;

      // Bind input events
      this.container.querySelectorAll('[data-field]').forEach(input => {
        const fieldName = input.getAttribute('data-field');
        const eventType = input.type === 'checkbox' ? 'change' : 'input';

        input.addEventListener(eventType, () => {
          let newVal = input.value;
          if (input.type === 'checkbox') newVal = input.checked;
          if (input.type === 'number') newVal = Number(input.value);

          this.editor.updateBlockField(block.id, fieldName, newVal);
        });
      });

      // Synchronize color pickers
      this.container.querySelectorAll('[data-color-target]').forEach(picker => {
        const targetField = picker.getAttribute('data-color-target');
        const textInput = this.container.querySelector(`[data-field="${targetField}"]`);
        picker.addEventListener('input', () => {
          if (textInput) textInput.value = picker.value;
          this.editor.updateBlockField(block.id, targetField, picker.value);
        });
      });

      // Delete block button
      const delBtn = this.container.querySelector('#btn-prop-del');
      if (delBtn) {
        delBtn.onclick = () => this.editor.deleteBlock(block.id);
      }
    }
  }

  window.BubblePropertiesInspector = PropertiesInspector;
})(window);
