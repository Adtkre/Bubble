/**
 * BUBBLE - Website & Project Exporter
 * Bundles standalone production-ready HTML, CSS, JS, README.md into a downloadable ZIP.
 */

(function (window) {
  'use strict';

  const Exporter = {
    /**
     * Generate standalone index.html (referencing external styles.css and script.js)
     */
    generateIndexHtml(project) {
      const title = window.BubbleUtils.escapeHtml(project.name || 'My Website');
      const bodyContent = (project.components || [])
        .map(comp => window.BubbleCodeGenerator.generateComponentHtml(comp, 2, true))
        .join('');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bubble-page-wrapper">
${bodyContent}
  <script src="script.js"></script>
</body>
</html>\n`;
    },

    /**
     * Generate comprehensive styles.css combining default component styles and user styles
     */
    generateStylesCss(project, baseComponentCss = '') {
      const userCss = window.BubbleCodeGenerator.generateCssSource(project);
      return `/* ==========================================================
   BUBBLE EXPORTED WEBSITE STYLESHEET
   Project: ${project.name || 'Untitled Project'}
   Exported: ${new Date().toLocaleString()}
   ========================================================== */

${baseComponentCss}

${userCss}
`;
    },

    /**
     * Generate standalone script.js
     */
    generateScriptJs(project) {
      return window.BubbleCodeGenerator.generateJsSource(project);
    },

    /**
     * Generate informative README.md for the beginner user
     */
    generateReadmeMd(project) {
      const title = project.name || 'My Website';
      return `# ${title}

This website was built with **Bubble — The Visual Coding Platform for Beginners**.

## 🚀 How to Run Your Website

1. Double click **\`index.html\`** to open and preview your website directly in any modern web browser (Google Chrome, Firefox, Safari, Microsoft Edge).
2. Or use a local web server (such as Python or VS Code Live Server):
   \`\`\`bash
   # Using Python 3:
   python -m http.server 8000
   \`\`\`
   Then open \`http://localhost:8000\` in your browser.

## 📂 Project Structure

- **\`index.html\`**: The semantic HTML5 structure of your web pages.
- **\`styles.css\`**: Responsive CSS styling, fonts, and layout rules.
- **\`script.js\`**: Interactive JavaScript click listeners, scrolling, and alerts.
- **\`project.json\`**: Your raw Bubble project file so you can re-import and continue editing anytime in Bubble!

## 🎓 Learning Web Development

Inspect \`index.html\`, \`styles.css\`, and \`script.js\` in any code editor (like VS Code) to see how your visual designs translated directly into standard, clean web development code.
`;
    },

    /**
     * Export complete website as a ZIP file
     */
    async exportZip(project, baseComponentCss = '') {
      const safeName = (project.name || 'website').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');

      if (window.JSZip) {
        try {
          const zip = new window.JSZip();
          const htmlContent = this.generateIndexHtml(project);
          const cssContent = this.generateStylesCss(project, baseComponentCss);
          const jsContent = this.generateScriptJs(project);
          const readmeContent = this.generateReadmeMd(project);
          const projectJson = window.BubbleStorage.exportProjectAsJson(project.id);

          zip.file('index.html', htmlContent);
          zip.file('styles.css', cssContent);
          zip.file('script.js', jsContent);
          zip.file('README.md', readmeContent);
          zip.file('project.json', projectJson);

          const content = await zip.generateAsync({ type: 'blob' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `${safeName}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);

          window.BubbleUtils.showToast(`Exported "${safeName}.zip" successfully!`, 'success');
          return true;
        } catch (err) {
          console.error('ZIP generation failed:', err);
          window.BubbleUtils.showToast('ZIP export failed, downloading individual files.', 'warning');
        }
      }

      // Fallback: download individual files
      this.exportIndividualFiles(project, baseComponentCss);
      return true;
    },

    /**
     * Download files individually
     */
    exportIndividualFiles(project, baseComponentCss = '') {
      const html = this.generateIndexHtml(project);
      const css = this.generateStylesCss(project, baseComponentCss);
      const js = this.generateScriptJs(project);
      const readme = this.generateReadmeMd(project);
      const json = window.BubbleStorage.exportProjectAsJson(project.id);

      window.BubbleUtils.downloadFile('index.html', html, 'text/html');
      setTimeout(() => window.BubbleUtils.downloadFile('styles.css', css, 'text/css'), 200);
      setTimeout(() => window.BubbleUtils.downloadFile('script.js', js, 'application/javascript'), 400);
      setTimeout(() => window.BubbleUtils.downloadFile('README.md', readme, 'text/markdown'), 600);
      setTimeout(() => window.BubbleUtils.downloadFile('project.json', json, 'application/json'), 800);

      window.BubbleUtils.showToast('Downloaded website files and project backup!', 'success');
    },

    /**
     * Export raw project JSON
     */
    exportProjectJson(project) {
      const json = window.BubbleStorage.exportProjectAsJson(project.id);
      const safeName = (project.name || 'project').toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
      window.BubbleUtils.downloadFile(`${safeName}.bubble.json`, json, 'application/json');
      window.BubbleUtils.showToast('Project JSON backup downloaded!', 'success');
    }
  };

  window.BubbleExporter = Exporter;
})(window);
