/**
 * BUBBLE - Code Generation Engine & Source Mapping
 * Converts the component tree into semantic HTML, readable CSS, and safe JavaScript.
 */

(function (window) {
  'use strict';

  const CodeGenerator = {
    /**
     * Convert camelCase CSS style property to kebab-case
     */
    toKebabCase(prop) {
      return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    },

    /**
     * Convert component styles object into a clean CSS rule block
     */
    generateCssBlock(selector, styles) {
      if (!styles || Object.keys(styles).length === 0) return '';
      const lines = [];
      lines.push(`${selector} {`);
      for (const [prop, val] of Object.entries(styles)) {
        if (val !== undefined && val !== null && val !== '') {
          lines.push(`  ${this.toKebabCase(prop)}: ${val};`);
        }
      }
      lines.push('}\n');
      return lines.join('\n');
    },

    /**
     * Generate HTML for a single component node and its children
     */
    generateComponentHtml(comp, indentLevel = 2, isPreviewOrExport = false) {
      if (!comp) return '';
      const indent = '  '.repeat(indentLevel);
      const idAttr = comp.id;
      // In editor mode we attach data-bubble-id for bi-directional mapping
      const idHook = `id="${idAttr}"${!isPreviewOrExport ? ` data-bubble-id="${idAttr}"` : ''}`;
      const props = comp.props || {};

      switch (comp.type) {
        case 'heading': {
          const tag = props.level || 'h1';
          return `${indent}<${tag} ${idHook} class="bubble-heading">${window.BubbleUtils.escapeHtml(props.text || 'Heading')}</${tag}>\n`;
        }

        case 'paragraph': {
          return `${indent}<p ${idHook} class="bubble-paragraph">${window.BubbleUtils.escapeHtml(props.text || '')}</p>\n`;
        }

        case 'button': {
          const label = window.BubbleUtils.escapeHtml(props.label || 'Button');
          return `${indent}<button ${idHook} class="bubble-button" type="button">${label}</button>\n`;
        }

        case 'image': {
          const src = window.BubbleUtils.escapeHtml(props.src || 'https://via.placeholder.com/600x400');
          const alt = window.BubbleUtils.escapeHtml(props.alt || 'Website image');
          return `${indent}<img ${idHook} class="bubble-image" src="${src}" alt="${alt}" loading="lazy" />\n`;
        }

        case 'link': {
          const href = window.BubbleUtils.escapeHtml(props.href || '#');
          const target = props.targetNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
          const text = window.BubbleUtils.escapeHtml(props.text || 'Link');
          return `${indent}<a ${idHook} class="bubble-link" href="${href}"${target}>${text}</a>\n`;
        }

        case 'section': {
          const tag = props.tag || 'section';
          let innerHtml = '';
          if (Array.isArray(comp.children) && comp.children.length > 0) {
            innerHtml = comp.children.map(child => this.generateComponentHtml(child, indentLevel + 1, isPreviewOrExport)).join('');
          }
          return `${indent}<${tag} ${idHook} class="bubble-section">\n${innerHtml}${indent}</${tag}>\n`;
        }

        case 'row': {
          let innerHtml = '';
          if (Array.isArray(comp.children) && comp.children.length > 0) {
            innerHtml = comp.children.map(child => this.generateComponentHtml(child, indentLevel + 1, isPreviewOrExport)).join('');
          }
          return `${indent}<div ${idHook} class="bubble-row">\n${innerHtml}${indent}</div>\n`;
        }

        case 'column': {
          let innerHtml = '';
          if (Array.isArray(comp.children) && comp.children.length > 0) {
            innerHtml = comp.children.map(child => this.generateComponentHtml(child, indentLevel + 1, isPreviewOrExport)).join('');
          }
          return `${indent}<div ${idHook} class="bubble-col">\n${innerHtml}${indent}</div>\n`;
        }

        case 'card': {
          let innerHtml = '';
          if (Array.isArray(comp.children) && comp.children.length > 0) {
            innerHtml = comp.children.map(child => this.generateComponentHtml(child, indentLevel + 1, isPreviewOrExport)).join('');
          }
          return `${indent}<div ${idHook} class="bubble-card">\n${innerHtml}${indent}</div>\n`;
        }

        case 'navbar': {
          const brand = window.BubbleUtils.escapeHtml(props.brandName || 'Brand');
          const linksHtml = (props.links || []).map(link => {
            const lText = window.BubbleUtils.escapeHtml(link.text || 'Link');
            const lHref = window.BubbleUtils.escapeHtml(link.href || '#');
            return `        <li><a class="bubble-nav-link" href="${lHref}">${lText}</a></li>`;
          }).join('\n');

          const ctaHtml = props.ctaText ? `\n      <a class="bubble-button" href="${window.BubbleUtils.escapeHtml(props.ctaHref || '#')}">${window.BubbleUtils.escapeHtml(props.ctaText)}</a>` : '';

          return `${indent}<nav ${idHook} class="bubble-navbar">
${indent}  <a class="bubble-nav-brand" href="#">${brand}</a>
${indent}  <ul class="bubble-nav-links">
${linksHtml}
${indent}  </ul>${ctaHtml}
${indent}</nav>\n`;
        }

        case 'form': {
          let innerHtml = '';
          if (Array.isArray(comp.children) && comp.children.length > 0) {
            innerHtml = comp.children.map(child => this.generateComponentHtml(child, indentLevel + 1, isPreviewOrExport)).join('');
          }
          return `${indent}<form ${idHook} class="bubble-form" method="POST">\n${innerHtml}${indent}</form>\n`;
        }

        case 'input': {
          const label = props.label ? `<label class="bubble-label" for="${idAttr}_field">${window.BubbleUtils.escapeHtml(props.label)}</label>\n${indent}  ` : '';
          const placeholder = window.BubbleUtils.escapeHtml(props.placeholder || '');
          const type = props.inputType || 'text';
          const req = props.required ? ' required' : '';
          return `${indent}<div class="bubble-input-group">
${indent}  ${label}<input ${idHook} id="${idAttr}_field" class="bubble-input" type="${type}" placeholder="${placeholder}"${req} />
${indent}</div>\n`;
        }

        case 'checkbox': {
          const label = window.BubbleUtils.escapeHtml(props.label || 'Checkbox');
          const chk = props.checked ? ' checked' : '';
          return `${indent}<label class="bubble-checkbox-group">
${indent}  <input ${idHook} class="bubble-checkbox" type="checkbox"${chk} />
${indent}  <span>${label}</span>
${indent}</label>\n`;
        }

        case 'divider': {
          return `${indent}<hr ${idHook} class="bubble-divider" />\n`;
        }

        case 'spacer': {
          return `${indent}<div ${idHook} class="bubble-spacer"></div>\n`;
        }

        case 'footer': {
          const copyright = window.BubbleUtils.escapeHtml(props.copyright || '');
          const linksHtml = (props.links || []).map(link => {
            return `<a href="${window.BubbleUtils.escapeHtml(link.href || '#')}">${window.BubbleUtils.escapeHtml(link.text || '')}</a>`;
          }).join(' &bull; ');

          return `${indent}<footer ${idHook} class="bubble-footer">
${indent}  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
${indent}    <div>${copyright}</div>
${indent}    <div>${linksHtml}</div>
${indent}  </div>
${indent}</footer>\n`;
        }

        default:
          return `${indent}<!-- Unsupported component type: ${comp.type} -->\n`;
      }
    },

    /**
     * Recursively collect all CSS rules for all components
     */
    collectStyles(tree, cssRules = []) {
      if (!Array.isArray(tree)) return cssRules;

      for (const comp of tree) {
        if (comp.styles && Object.keys(comp.styles).length > 0) {
          const rule = this.generateCssBlock(`#${comp.id}`, comp.styles);
          if (rule) {
            cssRules.push({
              componentId: comp.id,
              rule: rule
            });
          }
        }
        if (Array.isArray(comp.children)) {
          this.collectStyles(comp.children, cssRules);
        }
      }
      return cssRules;
    },

    /**
     * Recursively collect JavaScript interactions
     */
    collectScripts(tree, scriptSnippets = []) {
      if (!Array.isArray(tree)) return scriptSnippets;

      for (const comp of tree) {
        const props = comp.props || {};

        // Button interaction logic
        if (comp.type === 'button' && props.actionType && props.actionType !== 'none') {
          let code = '';
          if (props.actionType === 'url' && props.actionTarget) {
            const url = JSON.stringify(props.actionTarget);
            const target = props.targetNewTab ? 'window.open(' + url + ', "_blank");' : 'window.location.href = ' + url + ';';
            code = `  const btn = document.getElementById("${comp.id}");\n  if (btn) {\n    btn.addEventListener("click", function() {\n      ${target}\n    });\n  }`;
          } else if (props.actionType === 'scroll' && props.actionTarget) {
            const targetId = JSON.stringify(props.actionTarget.replace(/^#/, ''));
            code = `  const btn = document.getElementById("${comp.id}");\n  if (btn) {\n    btn.addEventListener("click", function() {\n      const target = document.getElementById(${targetId});\n      if (target) target.scrollIntoView({ behavior: "smooth" });\n    });\n  }`;
          } else if (props.actionType === 'alert' && props.actionTarget) {
            const msg = JSON.stringify(props.actionTarget);
            code = `  const btn = document.getElementById("${comp.id}");\n  if (btn) {\n    btn.addEventListener("click", function() {\n      alert(${msg});\n    });\n  }`;
          } else if (props.actionType === 'toggle' && props.actionTarget) {
            const targetId = JSON.stringify(props.actionTarget.replace(/^#/, ''));
            code = `  const btn = document.getElementById("${comp.id}");\n  if (btn) {\n    btn.addEventListener("click", function() {\n      const target = document.getElementById(${targetId});\n      if (target) {\n        target.style.display = target.style.display === "none" ? "" : "none";\n      }\n    });\n  }`;
          }
          if (code) {
            scriptSnippets.push({
              componentId: comp.id,
              code: code
            });
          }
        }

        // Form submit interaction logic
        if (comp.type === 'form') {
          const msg = JSON.stringify(props.onSubmitAlert || 'Form submitted successfully!');
          const code = `  const form = document.getElementById("${comp.id}");\n  if (form) {\n    form.addEventListener("submit", function(e) {\n      e.preventDefault();\n      alert(${msg});\n      form.reset();\n    });\n  }`;
          scriptSnippets.push({
            componentId: comp.id,
            code: code
          });
        }

        if (Array.isArray(comp.children)) {
          this.collectScripts(comp.children, scriptSnippets);
        }
      }

      return scriptSnippets;
    },

    /**
     * Generate HTML source code tab string
     */
    generateHtmlSource(project) {
      if (!project || !Array.isArray(project.components)) return '';
      const bodyContent = project.components.map(comp => this.generateComponentHtml(comp, 2, false)).join('');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${window.BubbleUtils.escapeHtml(project.name || 'My Website')}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body class="bubble-page-wrapper">
${bodyContent}
  <script src="script.js"></script>
</body>
</html>`;
    },

    /**
     * Generate CSS source code tab string
     */
    generateCssSource(project) {
      if (!project || !Array.isArray(project.components)) return '';
      const cssRules = this.collectStyles(project.components);

      const header = `/* =======================================================
   Generated Stylesheet - ${project.name || 'Bubble Project'}
   Created with Bubble Visual Coding Platform
   ======================================================= */\n\n`;

      const rulesBody = cssRules.map(r => r.rule).join('\n');
      return header + rulesBody;
    },

    /**
     * Generate JavaScript source code tab string
     */
    generateJsSource(project) {
      if (!project || !Array.isArray(project.components)) return '';
      const scriptSnippets = this.collectScripts(project.components);

      return `/**
 * Generated JavaScript - ${project.name || 'Bubble Project'}
 * Interactivity and Event Listeners
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Website initialized successfully.");

${scriptSnippets.map(s => s.code).join('\n\n')}
});\n`;
    },

    /**
     * Generate complete standalone HTML document for iframe preview or standalone file
     */
    generateFullDocument(project, baseComponentCss = '', isSandboxedPreview = true) {
      const title = window.BubbleUtils.escapeHtml(project.name || 'Bubble Website');
      const bodyContent = (project.components || []).map(comp => this.generateComponentHtml(comp, 2, !isSandboxedPreview)).join('');
      const cssRules = this.collectStyles(project.components || []).map(r => r.rule).join('\n');
      const scriptCode = this.generateJsSource(project);

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${baseComponentCss}

${cssRules}
  </style>
</head>
<body class="bubble-page-wrapper">
${bodyContent}
  <script>
${scriptCode}
  </script>
</body>
</html>`;
    }
  };

  window.BubbleCodeGenerator = CodeGenerator;
})(window);
