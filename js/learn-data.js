/**
 * BUBBLE - Learn Mode Knowledge Base
 * Educational explanations connecting visual properties directly to real web code.
 */

(function (window) {
  'use strict';

  const LearnData = {
    /**
     * Explanations by component type
     */
    byType: {
      heading: {
        title: 'HTML Headings (<h1> to <h6>)',
        summary: 'Headings introduce sections and establish a logical document outline.',
        htmlLesson: {
          code: '<h1>Welcome to My Site</h1>',
          explanation: 'There are six heading levels in HTML: <h1> is the most important (usually one per page), and <h6> is the least. Search engines like Google use headings to understand what your page is about, and screen readers use them so visually impaired users can jump to sections quickly.'
        },
        cssLesson: {
          code: 'font-size: 36px;\nfont-weight: 700;',
          explanation: 'Headings are styled primarily with font-size (how large the letters appear) and font-weight (700 is bold, 400 is regular). Always use semantic heading tags rather than just making regular text bold!'
        },
        quickTip: 'Always start with an <h1> for your main page title before using <h2> or <h3>.'
      },

      paragraph: {
        title: 'HTML Paragraphs (<p>)',
        summary: 'Paragraphs wrap blocks of readable text.',
        htmlLesson: {
          code: '<p>This is a paragraph of text on the web.</p>',
          explanation: 'Browsers automatically add margin above and below paragraph elements. Using <p> tags instead of plain text tells the browser that this content is a coherent unit of written thought.'
        },
        cssLesson: {
          code: 'line-height: 1.7;\ncolor: #475569;',
          explanation: 'The "line-height" property controls the vertical spacing between lines of text. A line-height around 1.5 to 1.7 greatly improves readability for human eyes.'
        },
        quickTip: 'Keep paragraphs concise (2-4 sentences) for high web readability.'
      },

      button: {
        title: 'Interactive Buttons (<button>)',
        summary: 'Buttons allow users to trigger actions with mouse or keyboard.',
        htmlLesson: {
          code: '<button type="button">Click Me</button>',
          explanation: 'Never make a <div> look like a button with JavaScript! Real <button> elements are accessible by default: users can press Tab to focus them and press Space or Enter to trigger them.'
        },
        cssLesson: {
          code: 'background-color: #4f46e5;\npadding: 12px 24px;\nborder-radius: 8px;',
          explanation: 'Buttons are styled using background-color, border-radius (for rounded corners), and padding (space inside the button surrounding the label).'
        },
        jsLesson: {
          code: 'button.addEventListener("click", function() {\n  alert("Button clicked!");\n});',
          explanation: 'An "event listener" waits for a user action—like a click. When the click happens, the browser executes the function inside.'
        },
        quickTip: 'Buttons trigger actions on the current page; <a> links navigate between pages.'
      },

      image: {
        title: 'HTML Images (<img>) & Alt Text',
        summary: 'Images display visual media and require alternative text.',
        htmlLesson: {
          code: '<img src="photo.jpg" alt="A golden retriever puppy playing with a ball" />',
          explanation: 'The "src" attribute points to the image file URL. The "alt" attribute is crucial for accessibility: screen readers speak it aloud, and if the network fails to load the image, the alt text is shown instead.'
        },
        cssLesson: {
          code: 'max-width: 100%;\nheight: auto;\nobject-fit: cover;',
          explanation: '"max-width: 100%" prevents large photos from overflowing mobile screens. "object-fit: cover" ensures images fit their containers without stretching or distorting.'
        },
        quickTip: 'Always write descriptive alt text that explains the image content to someone who cannot see it.'
      },

      section: {
        title: 'Semantic Sections (<section>) & Containers',
        summary: 'Sections divide your webpage into thematic chapters.',
        htmlLesson: {
          code: '<section class="bubble-section">\n  <!-- Content here -->\n</section>',
          explanation: 'Instead of using meaningless <div> tags everywhere, HTML5 introduced semantic elements like <section>, <header>, and <article>. This gives meaning and structure to your code.'
        },
        cssLesson: {
          code: 'padding: 48px 24px;\nmax-width: 1140px;\nmargin: 0 auto;',
          explanation: 'Setting a "max-width" and "margin: 0 auto" is the classic web design technique to center content nicely on wide desktop monitors while looking great on phones.'
        },
        quickTip: 'Group related components inside sections so they move and scale together.'
      },

      row: {
        title: 'Flexbox Layouts (display: flex)',
        summary: 'Flexbox is the modern CSS standard for arranging elements in rows or columns.',
        htmlLesson: {
          code: '<div class="bubble-row">\n  <div class="col">Left</div>\n  <div class="col">Right</div>\n</div>',
          explanation: 'A flex container automatically distributes its child elements along a main axis.'
        },
        cssLesson: {
          code: 'display: flex;\nflex-direction: row;\ngap: 24px;',
          explanation: '"display: flex" turns an element into a flex container. The "gap" property creates clean, even spacing between items without needing tricky margin hacks.'
        },
        quickTip: 'Use Flexbox for 1-dimensional layouts (rows or columns).'
      },

      card: {
        title: 'UI Cards & Visual Elevation',
        summary: 'Cards group related information, media, and actions together.',
        htmlLesson: {
          code: '<div class="bubble-card">\n  <h3>Card Title</h3>\n  <p>Description</p>\n</div>',
          explanation: 'Cards are one of the most common UI design patterns, packaging an image, heading, text, and button into a self-contained unit.'
        },
        cssLesson: {
          code: 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);\nborder-radius: 12px;',
          explanation: '"box-shadow" creates depth by simulating light casting a shadow behind the card, making it look elevated above the page.'
        },
        quickTip: 'Keep card padding consistent throughout your site (usually 16px to 24px).'
      },

      form: {
        title: 'HTML Forms (<form>) & User Input',
        summary: 'Forms collect user input and submit it to scripts or servers.',
        htmlLesson: {
          code: '<form method="POST">\n  <input type="email" required />\n  <button type="submit">Submit</button>\n</form>',
          explanation: 'The <form> element wraps interactive controls. Browsers provide built-in validation: if an input has "required", the form cannot be submitted empty.'
        },
        jsLesson: {
          code: 'form.addEventListener("submit", function(event) {\n  event.preventDefault(); // Stop page reload\n  alert("Sent!");\n});',
          explanation: '"event.preventDefault()" stops the default browser behavior of refreshing the entire page, allowing modern web apps to handle data smoothly.'
        },
        quickTip: 'Always pair an <input> with a visible <label> for accessibility.'
      }
    },

    /**
     * Core Web Concepts for beginners
     */
    coreConcepts: [
      {
        title: 'Margin vs Padding (The CSS Box Model)',
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px;"><rect width="20" height="20" x="2" y="2" rx="2"/><rect width="10" height="10" x="7" y="7" rx="1"/></svg>',
        desc: 'Every element in CSS is a box. Padding is the space INSIDE the border, cushioning the content. Margin is the space OUTSIDE the border, pushing away neighboring elements.',
        visual: 'box-model'
      },
      {
        title: 'HTML vs CSS vs JavaScript',
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px;"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        desc: 'Think of a house: HTML is the bricks and walls (structure). CSS is the paint, lighting, and interior design (styling). JavaScript is the electricity, automatic doors, and switches (interactivity).'
      },
      {
        title: 'Responsive Design (Media Queries)',
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px;"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>',
        desc: 'Websites must look great on smartphones, tablets, and large 4K monitors. CSS uses media queries to adjust font sizes and stack columns vertically on smaller screens.'
      },
      {
        title: 'Semantic HTML',
        icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -3px;"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>',
        desc: 'Semantic tags like <header>, <nav>, <main>, and <footer> explain their meaning to both the browser, search engines, and screen readers for visually impaired visitors.'
      }
    ],

    /**
     * Retrieve education data for a component type
     */
    getForType(type) {
      return this.byType[type] || {
        title: `HTML & CSS: <${type}>`,
        summary: `Standard web component representing ${type}.`,
        htmlLesson: {
          code: `<${type}>...</${type}>`,
          explanation: 'This element forms part of the standard HTML5 web specification.'
        },
        cssLesson: {
          code: 'display: block;\nmargin: 16px 0;',
          explanation: 'Cascading Style Sheets (CSS) control the visual presentation of this element.'
        },
        quickTip: 'Use inspector properties to adjust colors, padding, and layout in real-time.'
      };
    }
  };

  window.BubbleLearnData = LearnData;
})(window);
