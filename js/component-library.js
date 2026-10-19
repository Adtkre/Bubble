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
      icon: '🖼',
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
      icon: '🔗',
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
      icon: '☰',
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
      icon: '🗂',
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
      icon: '⚑',
      category: 'Layout',
      description: 'Header navigation bar with brand title and menu links.',
      isContainer: false,
      defaultProps: {
        brandName: '🚀 MyBrand',
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
      icon: '📝',
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
      icon: '☑',
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
