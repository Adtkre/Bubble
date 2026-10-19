/**
 * BUBBLE - Starter Templates
 * Real editable component structures for portfolio, landing page, business, and product card.
 */

(function (window) {
  'use strict';

  const Templates = {
    /**
     * Template 1: Blank Canvas
     */
    getBlank() {
      return {
        id: 'blank',
        name: 'Blank Canvas',
        icon: '📄',
        description: 'Start from scratch with a clean slate.',
        components: []
      };
    },

    /**
     * Template 2: Personal Portfolio
     */
    getPortfolio() {
      return {
        id: 'portfolio',
        name: 'Personal Portfolio',
        icon: '👨‍💻',
        description: 'Showcase your creative projects, skills, and contact details.',
        components: [
          // Navbar
          {
            id: 'elem_port_nav',
            type: 'navbar',
            props: {
              brandName: '✨ Alex Morgan',
              links: [
                { text: 'About', href: '#about' },
                { text: 'Projects', href: '#projects' },
                { text: 'Skills', href: '#skills' }
              ],
              ctaText: 'Hire Me',
              ctaHref: '#contact'
            },
            styles: {
              backgroundColor: '#ffffff',
              borderBottomWidth: '1px',
              borderBottomColor: '#e2e8f0'
            }
          },

          // Hero Section
          {
            id: 'elem_port_hero',
            type: 'section',
            props: { tag: 'section' },
            styles: {
              paddingTop: '64px',
              paddingBottom: '64px',
              backgroundColor: '#f8fafc',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'elem_port_hero_h',
                type: 'heading',
                props: { text: "Hi, I'm Alex. I craft clean digital experiences.", level: 'h1' },
                styles: { fontSize: '42px', fontWeight: '800', color: '#0f172a', textAlign: 'center', maxWidth: '800px' }
              },
              {
                id: 'elem_port_hero_p',
                type: 'paragraph',
                props: { text: 'Frontend engineer & visual designer specialized in responsive web interfaces and user-centered design systems.' },
                styles: { fontSize: '18px', color: '#64748b', textAlign: 'center', maxWidth: '640px' }
              },
              {
                id: 'elem_port_hero_btn',
                type: 'button',
                props: { label: 'Explore Featured Work ↓', actionType: 'scroll', actionTarget: 'elem_port_projects' },
                styles: { backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', fontSize: '16px' }
              }
            ]
          },

          // Projects Section
          {
            id: 'elem_port_projects',
            type: 'section',
            props: { tag: 'section' },
            styles: { paddingTop: '64px', paddingBottom: '64px', backgroundColor: '#ffffff' },
            children: [
              {
                id: 'elem_port_proj_title',
                type: 'heading',
                props: { text: 'Featured Work', level: 'h2' },
                styles: { fontSize: '28px', fontWeight: '700', textAlign: 'center', marginBottom: '32px' }
              },
              {
                id: 'elem_port_proj_row',
                type: 'row',
                props: { wrap: true },
                styles: { gap: '24px' },
                children: [
                  // Card 1
                  {
                    id: 'elem_port_card_1',
                    type: 'card',
                    styles: { flex: '1 1 300px' },
                    children: [
                      {
                        id: 'elem_port_c1_img',
                        type: 'image',
                        props: {
                          src: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
                          alt: 'Web Design Project'
                        },
                        styles: { borderRadius: '8px', height: '180px', objectFit: 'cover' }
                      },
                      {
                        id: 'elem_port_c1_h',
                        type: 'heading',
                        props: { text: 'Fintech Dashboard', level: 'h3' },
                        styles: { fontSize: '20px', fontWeight: '700' }
                      },
                      {
                        id: 'elem_port_c1_p',
                        type: 'paragraph',
                        props: { text: 'A clean analytics dashboard built with accessible UI components and data visualizations.' },
                        styles: { fontSize: '14px', color: '#64748b' }
                      }
                    ]
                  },
                  // Card 2
                  {
                    id: 'elem_port_card_2',
                    type: 'card',
                    styles: { flex: '1 1 300px' },
                    children: [
                      {
                        id: 'elem_port_c2_img',
                        type: 'image',
                        props: {
                          src: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=600&auto=format&fit=crop&q=80',
                          alt: 'Mobile Interface Project'
                        },
                        styles: { borderRadius: '8px', height: '180px', objectFit: 'cover' }
                      },
                      {
                        id: 'elem_port_c2_h',
                        type: 'heading',
                        props: { text: 'EcoTrack Mobile App', level: 'h3' },
                        styles: { fontSize: '20px', fontWeight: '700' }
                      },
                      {
                        id: 'elem_port_c2_p',
                        type: 'paragraph',
                        props: { text: 'Helping users track and reduce their carbon footprint through gamified habits.' },
                        styles: { fontSize: '14px', color: '#64748b' }
                      }
                    ]
                  }
                ]
              }
            ]
          },

          // Contact Form Section
          {
            id: 'elem_port_contact',
            type: 'section',
            props: { tag: 'section' },
            styles: { paddingTop: '64px', paddingBottom: '64px', backgroundColor: '#f1f5f9', alignItems: 'center' },
            children: [
              {
                id: 'elem_port_contact_h',
                type: 'heading',
                props: { text: "Let's Work Together", level: 'h2' },
                styles: { fontSize: '28px', textAlign: 'center', marginBottom: '8px' }
              },
              {
                id: 'elem_port_contact_p',
                type: 'paragraph',
                props: { text: 'Have an inquiry or project in mind? Drop me a quick message.' },
                styles: { fontSize: '15px', textAlign: 'center', marginBottom: '24px' }
              },
              {
                id: 'elem_port_form',
                type: 'form',
                props: { formName: 'portfolio-contact', onSubmitAlert: 'Message sent! Alex will get back to you shortly.' },
                styles: { maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '12px' },
                children: [
                  {
                    id: 'elem_port_inp_email',
                    type: 'input',
                    props: { label: 'Your Email', inputType: 'email', placeholder: 'you@domain.com', required: true }
                  },
                  {
                    id: 'elem_port_inp_msg',
                    type: 'input',
                    props: { label: 'Brief Project Note', inputType: 'text', placeholder: 'Tell me about your idea...', required: true }
                  },
                  {
                    id: 'elem_port_sub_btn',
                    type: 'button',
                    props: { label: 'Send Message ✉', actionType: 'none' },
                    styles: { backgroundColor: '#4f46e5', color: '#ffffff', width: '100%' }
                  }
                ]
              }
            ]
          },

          // Footer
          {
            id: 'elem_port_footer',
            type: 'footer',
            props: {
              copyright: '© 2026 Alex Morgan. Built with Bubble.',
              links: [{ text: 'GitHub', href: '#' }, { text: 'LinkedIn', href: '#' }]
            }
          }
        ]
      };
    },

    /**
     * Template 3: SaaS / Startup Landing Page
     */
    getSaaS() {
      return {
        id: 'saas',
        name: 'SaaS Startup Landing',
        icon: '🚀',
        description: 'Modern landing page with hero CTA, 3 feature columns, and sign-up.',
        components: [
          // Navbar
          {
            id: 'elem_saas_nav',
            type: 'navbar',
            props: {
              brandName: '⚡ BoltFlow',
              links: [
                { text: 'Product', href: '#features' },
                { text: 'Pricing', href: '#pricing' },
                { text: 'Documentation', href: '#' }
              ],
              ctaText: 'Start Free Trial',
              ctaHref: '#signup'
            }
          },

          // Hero Section
          {
            id: 'elem_saas_hero',
            type: 'section',
            props: { tag: 'section' },
            styles: {
              paddingTop: '80px',
              paddingBottom: '80px',
              backgroundColor: '#f8fafc',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'elem_saas_hero_h',
                type: 'heading',
                props: { text: 'Automate your workflows in minutes, not months.', level: 'h1' },
                styles: { fontSize: '44px', fontWeight: '800', color: '#0f172a', textAlign: 'center', maxWidth: '850px' }
              },
              {
                id: 'elem_saas_hero_p',
                type: 'paragraph',
                props: { text: 'BoltFlow connects your favorite web tools together seamlessly with visual automation pipelines. Zero coding required.' },
                styles: { fontSize: '18px', color: '#475569', textAlign: 'center', maxWidth: '680px' }
              },
              {
                id: 'elem_saas_hero_btn',
                type: 'button',
                props: { label: 'Get Started for Free →', actionType: 'alert', actionTarget: 'Welcome aboard! Your 14-day trial has begun.' },
                styles: { backgroundColor: '#4f46e5', color: '#ffffff', fontSize: '18px', paddingTop: '14px', paddingBottom: '14px' }
              }
            ]
          },

          // Features Section
          {
            id: 'elem_saas_features',
            type: 'section',
            props: { tag: 'section' },
            styles: { paddingTop: '64px', paddingBottom: '64px', backgroundColor: '#ffffff' },
            children: [
              {
                id: 'elem_saas_feat_h',
                type: 'heading',
                props: { text: 'Why Leading Teams Choose BoltFlow', level: 'h2' },
                styles: { fontSize: '32px', textAlign: 'center', marginBottom: '40px' }
              },
              {
                id: 'elem_saas_feat_row',
                type: 'row',
                props: { wrap: true },
                styles: { gap: '24px' },
                children: [
                  {
                    id: 'elem_saas_c1',
                    type: 'card',
                    styles: { flex: '1 1 260px' },
                    children: [
                      { id: 'elem_saas_c1_h', type: 'heading', props: { text: '⚡ Lightning Fast', level: 'h3' }, styles: { fontSize: '20px' } },
                      { id: 'elem_saas_c1_p', type: 'paragraph', props: { text: 'Built on edge workers to trigger events with sub-millisecond response times.' } }
                    ]
                  },
                  {
                    id: 'elem_saas_c2',
                    type: 'card',
                    styles: { flex: '1 1 260px' },
                    children: [
                      { id: 'elem_saas_c2_h', type: 'heading', props: { text: '🔒 Enterprise Security', level: 'h3' }, styles: { fontSize: '20px' } },
                      { id: 'elem_saas_c2_p', type: 'paragraph', props: { text: 'SOC-2 compliant end-to-end encryption keeping your customer data safe.' } }
                    ]
                  },
                  {
                    id: 'elem_saas_c3',
                    type: 'card',
                    styles: { flex: '1 1 260px' },
                    children: [
                      { id: 'elem_saas_c3_h', type: 'heading', props: { text: '📊 Real-time Insights', level: 'h3' }, styles: { fontSize: '20px' } },
                      { id: 'elem_saas_c3_p', type: 'paragraph', props: { text: 'Live audit logs and error alerts directly sent to your team Slack channel.' } }
                    ]
                  }
                ]
              }
            ]
          },

          // Footer
          {
            id: 'elem_saas_footer',
            type: 'footer',
            props: {
              copyright: '© 2026 BoltFlow Inc. All rights reserved.',
              links: [{ text: 'Security', href: '#' }, { text: 'Terms', href: '#' }, { text: 'Privacy', href: '#' }]
            }
          }
        ]
      };
    },

    /**
     * Template 4: Local Coffee Shop & Cafe
     */
    getCoffeeShop() {
      return {
        id: 'coffeeshop',
        name: 'Artisan Coffee & Bakery',
        icon: '☕',
        description: 'Warm, cozy business website featuring menu specials and opening hours.',
        components: [
          {
            id: 'elem_cafe_nav',
            type: 'navbar',
            props: {
              brandName: '☕ Bean & Brew',
              links: [
                { text: 'Our Story', href: '#story' },
                { text: 'Menu', href: '#menu' },
                { text: 'Hours', href: '#hours' }
              ],
              ctaText: 'Order Online',
              ctaHref: '#order'
            },
            styles: {
              backgroundColor: '#fffbeb',
              borderBottomColor: '#fde68a'
            }
          },
          {
            id: 'elem_cafe_hero',
            type: 'section',
            props: { tag: 'section' },
            styles: {
              paddingTop: '64px',
              paddingBottom: '64px',
              backgroundColor: '#fffbeb',
              alignItems: 'center',
              textAlign: 'center'
            },
            children: [
              {
                id: 'elem_cafe_h',
                type: 'heading',
                props: { text: 'Handcrafted Coffee & Fresh Bakes', level: 'h1' },
                styles: { fontSize: '38px', color: '#78350f', textAlign: 'center' }
              },
              {
                id: 'elem_cafe_p',
                type: 'paragraph',
                props: { text: 'Ethically sourced beans roasted in small batches, paired with organic pastries baked every morning at sunrise.' },
                styles: { fontSize: '17px', color: '#92400e', textAlign: 'center', maxWidth: '620px' }
              },
              {
                id: 'elem_cafe_img',
                type: 'image',
                props: {
                  src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80',
                  alt: 'Steaming cup of latte art coffee on wooden table'
                },
                styles: { maxHeight: '380px', borderRadius: '16px' }
              }
            ]
          },
          {
            id: 'elem_cafe_footer',
            type: 'footer',
            props: {
              copyright: '© 2026 Bean & Brew Coffee Roasters. Open 7am - 6pm Daily.',
              links: [{ text: '124 Main Street, Seattle WA', href: '#' }]
            },
            styles: {
              backgroundColor: '#451a03',
              color: '#fde68a'
            }
          }
        ]
      };
    },

    /**
     * Template 5: Product Card Showcase
     */
    getProductCard() {
      return {
        id: 'product',
        name: 'Product Showcase',
        icon: '🎧',
        description: 'Single product showcase card with photo, price tag, features, and purchase CTA.',
        components: [
          {
            id: 'elem_prod_sec',
            type: 'section',
            props: { tag: 'section' },
            styles: {
              paddingTop: '60px',
              paddingBottom: '60px',
              backgroundColor: '#f1f5f9',
              alignItems: 'center'
            },
            children: [
              {
                id: 'elem_prod_card',
                type: 'card',
                styles: {
                  maxWidth: '420px',
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                },
                children: [
                  {
                    id: 'elem_prod_img',
                    type: 'image',
                    props: {
                      src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
                      alt: 'Wireless Noise Cancelling Headphones'
                    },
                    styles: { borderRadius: '10px', height: '240px', objectFit: 'cover' }
                  },
                  {
                    id: 'elem_prod_h',
                    type: 'heading',
                    props: { text: 'Aura Pro Wireless Headphones', level: 'h2' },
                    styles: { fontSize: '22px', fontWeight: '800', marginBottom: '4px' }
                  },
                  {
                    id: 'elem_prod_p',
                    type: 'paragraph',
                    props: { text: 'Studio-grade acoustic sound with active noise cancellation and 40-hour battery life.' },
                    styles: { fontSize: '14px', color: '#64748b' }
                  },
                  {
                    id: 'elem_prod_divider',
                    type: 'divider',
                    styles: { marginTop: '8px', marginBottom: '8px' }
                  },
                  {
                    id: 'elem_prod_btn',
                    type: 'button',
                    props: {
                      label: 'Buy Now — $199',
                      actionType: 'alert',
                      actionTarget: 'Thank you! Aura Pro Headphones added to your cart.'
                    },
                    styles: { backgroundColor: '#0f172a', color: '#ffffff', borderRadius: '8px', width: '100%' }
                  }
                ]
              }
            ]
          }
        ]
      };
    },

    getAllTemplates() {
      return [
        this.getBlank(),
        this.getPortfolio(),
        this.getSaaS(),
        this.getCoffeeShop(),
        this.getProductCard()
      ];
    },

    getTemplateById(id) {
      const all = this.getAllTemplates();
      return all.find(t => t.id === id) || this.getBlank();
    }
  };

  window.BubbleTemplates = Templates;
})(window);
