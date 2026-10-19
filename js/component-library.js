/**
 * BUBBLE - Component Library Definitions
 * Registry of all available components with default properties, styles, and nesting rules.
 */

(function (window) {
  'use strict';

  const DEFINITIONS = {
    // 1. Heading
    heading: {
      type: 'heading',
      label: 'Heading',
      icon: 'H',
      category: 'Typography',
      description: 'Important title text using h1 to h6 tags.',
      isContainer: false,
      defaultProps: {
        text: 'Build Something Amazing',
        level: 'h1'
      },
      defaultStyles: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'left',
        marginTop: '0px',
        marginBottom: '16px'
      }
    },

    // 2. Paragraph
    paragraph: {
      type: 'paragraph',
      label: 'Paragraph',
      icon: '¶',
      category: 'Typography',
      description: 'Block of readable body text for descriptions and stories.',
      isContainer: false,
      defaultProps: {
        text: 'Bubble empowers beginners to build real, modern websites visually while learning the fundamentals of HTML, CSS, and JavaScript.'
      },
      defaultStyles: {
        fontSize: '16px',
        lineHeight: '1.7',
        color: '#475569',
        textAlign: 'left',
        marginTop: '0px',
        marginBottom: '16px'
      }
    },

    // 3. Button
    button: {
      type: 'button',
      label: 'Button',
      icon: '▰',
      category: 'Interactive',
      description: 'Clickable call-to-action button that triggers events or links.',
      isContainer: false,
      defaultProps: {
        label: 'Get Started Today',
        actionType: 'none', // 'none' | 'url' | 'scroll' | 'alert' | 'toggle'
        actionTarget: '',
        targetNewTab: false
      },
      defaultStyles: {
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '600',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '24px',
        paddingRight: '24px',
        borderRadius: '8px',
        textAlign: 'center',
        display: 'inline-flex',
        cursor: 'pointer'
      }
    },

    // 4. Image
    image: {
      type: 'image',
      label: 'Image',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
      category: 'Media',
      description: 'Visual image with URL and accessibility alternative text.',
      isContainer: false,
      defaultProps: {
        src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        alt: 'Code editor screen showing modern programming interface'
      },
      defaultStyles: {
        width: '100%',
        maxWidth: '600px',
        height: 'auto',
        borderRadius: '12px',
        objectFit: 'cover',
        display: 'block',
        marginTop: '0px',
        marginBottom: '16px'
      }
    },

    // 5. Link
    link: {
      type: 'link',
      label: 'Hyperlink',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
      category: 'Typography',
      description: 'Clickable text that points to an external page or section.',
      isContainer: false,
      defaultProps: {
        text: 'Learn more about web standards →',
        href: 'https://developer.mozilla.org',
        targetNewTab: true
      },
      defaultStyles: {
        color: '#4f46e5',
        fontSize: '15px',
        fontWeight: '500',
        textDecoration: 'underline'
      }
    },

    // 6. Container / Section
    section: {
      type: 'section',
      label: 'Section / Container',
      icon: '▢',
      category: 'Layout',
      description: 'Full-width or bounded wrapper box for grouping components.',
      isContainer: true,
      defaultProps: {
        tag: 'section',
        maxWidth: '1140px'
      },
      defaultStyles: {
        backgroundColor: 'transparent',
        paddingTop: '48px',
        paddingBottom: '48px',
        paddingLeft: '24px',
        paddingRight: '24px',
        marginTop: '0px',
        marginBottom: '0px',
        borderRadius: '0px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        gap: '16px'
      }
    },

    // 7. Row Layout
    row: {
      type: 'row',
      label: 'Row (Flexbox)',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/></svg>',
      category: 'Layout',
      description: 'Horizontal row layout to place elements or columns side-by-side.',
      isContainer: true,
      defaultProps: {
        wrap: true
      },
      defaultStyles: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '24px',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingTop: '16px',
        paddingBottom: '16px'
      }
    },

    // 8. Column Layout
    column: {
      type: 'column',
      label: 'Column',
      icon: '▮',
      category: 'Layout',
      description: 'Vertical column container that splits space evenly inside a row.',
      isContainer: true,
      defaultProps: {
        flexGrow: '1'
      },
      defaultStyles: {
        flex: '1 1 0%',
        minWidth: '240px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }
    },

    // 9. Card
    card: {
      type: 'card',
      label: 'Card',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="8" x2="16" y1="10" y2="10"/></svg>',
      category: 'Layout',
      description: 'Elevated content box with rounded borders, padding, and shadow.',
      isContainer: true,
      defaultProps: {},
      defaultStyles: {
        backgroundColor: '#ffffff',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e2e8f0',
        borderRadius: '12px',
        paddingTop: '24px',
        paddingBottom: '24px',
        paddingLeft: '24px',
        paddingRight: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }
    },

    // 10. Navigation Bar
    navbar: {
      type: 'navbar',
      label: 'Navbar',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
      category: 'Layout',
      description: 'Header navigation bar with brand title and menu links.',
      isContainer: false,
      defaultProps: {
        brandName: 'MyBrand',
        links: [
          { text: 'Features', href: '#features' },
          { text: 'About', href: '#about' },
          { text: 'Contact', href: '#contact' }
        ],
        ctaText: 'Sign Up',
        ctaHref: '#signup'
      },
      defaultStyles: {
        backgroundColor: '#ffffff',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: '#e2e8f0',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '32px',
        paddingRight: '32px'
      }
    },

    // 11. Form
    form: {
      type: 'form',
      label: 'Form',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
      category: 'Interactive',
      description: 'Form container to capture user input and trigger submissions.',
      isContainer: true,
      defaultProps: {
        formName: 'contact-form',
        onSubmitAlert: 'Thank you for your message! We will get back to you soon.'
      },
      defaultStyles: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        paddingTop: '24px',
        paddingBottom: '24px',
        paddingLeft: '24px',
        paddingRight: '24px',
        borderRadius: '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#e2e8f0'
      }
    },

    // 12. Input Field
    input: {
      type: 'input',
      label: 'Input Field',
      icon: '⌨',
      category: 'Interactive',
      description: 'Text input with label, placeholder, and validation.',
      isContainer: false,
      defaultProps: {
        label: 'Email Address',
        inputType: 'email', // 'text' | 'email' | 'number' | 'password'
        placeholder: 'alex@example.com',
        required: true
      },
      defaultStyles: {
        width: '100%',
        paddingTop: '10px',
        paddingBottom: '10px',
        paddingLeft: '14px',
        paddingRight: '14px',
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#cbd5e1',
        fontSize: '15px'
      }
    },

    // 13. Checkbox
    checkbox: {
      type: 'checkbox',
      label: 'Checkbox',
      icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px;"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>',
      category: 'Interactive',
      description: 'Selectable checkbox with accompanying label text.',
      isContainer: false,
      defaultProps: {
        label: 'I accept the terms and conditions',
        checked: false
      },
      defaultStyles: {
        fontSize: '14px',
        color: '#334155',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }
    },

    // 14. Divider
    divider: {
      type: 'divider',
      label: 'Divider Line',
      icon: '―',
      category: 'Basic Elements',
      description: 'Subtle horizontal rule dividing different sections.',
      isContainer: false,
      defaultProps: {},
      defaultStyles: {
        width: '100%',
        height: '1px',
        backgroundColor: '#e2e8f0',
        marginTop: '24px',
        marginBottom: '24px'
      }
    },

    // 15. Spacer
    spacer: {
      type: 'spacer',
      label: 'Spacer',
      icon: '↕',
      category: 'Basic Elements',
      description: 'Adjustable vertical empty spacing between elements.',
      isContainer: false,
      defaultProps: {
        height: '40px'
      },
      defaultStyles: {
        width: '100%',
        height: '40px'
      }
    },

    // 16. Footer
    footer: {
      type: 'footer',
      label: 'Footer',
      icon: '⏷',
      category: 'Layout',
      description: 'Website footer containing copyright notice, credits, and links.',
      isContainer: false,
      defaultProps: {
        copyright: '© 2026 Bubble. Built with passion for visual coding.',
        links: [
          { text: 'Privacy Policy', href: '#' },
          { text: 'Terms of Service', href: '#' },
          { text: 'GitHub', href: '#' }
        ]
      },
      defaultStyles: {
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        paddingTop: '36px',
        paddingBottom: '36px',
        paddingLeft: '24px',
        paddingRight: '24px',
        width: '100%',
        marginTop: '32px'
      }
    }
  };

  const ComponentLibrary = {
    getAllDefinitions() {
      return Object.values(DEFINITIONS);
    },

    getDefinition(type) {
      return DEFINITIONS[type] || null;
    },

    getCategories() {
      return ['Typography', 'Layout', 'Interactive', 'Media', 'Basic Elements'];
    },

    getByCategory(category) {
      return Object.values(DEFINITIONS).filter(def => def.category === category);
    },

    isNestingAllowed(parentType, childType) {
      const parentDef = DEFINITIONS[parentType];
      if (!parentDef || !parentDef.isContainer) return false;

      // Restrict invalid nesting (e.g. form inside form, or section inside input/button)
      if (childType === 'form' && parentType === 'form') return false;
      if (childType === 'navbar' && parentType !== 'section') return false;
      return true;
    }
  };

  window.BubbleComponentLibrary = ComponentLibrary;
})(window);
