/**
 * BUBBLE - Block Library Definitions for Dart & Flutter
 * Defines 12 categories of visual programming blocks with inputs, outputs, fields, and colors.
 */

(function (window) {
  'use strict';

  // Distinct, accessible category colors for visual blocks
  const CATEGORIES = {
    WIDGETS: { id: 'widgets', label: 'UI Widgets', color: '#0284c7', light: '#e0f2fe' },
    LAYOUT: { id: 'layout', label: 'Layout & Structure', color: '#0369a1', light: '#bae6fd' },
    VARIABLES: { id: 'variables', label: 'Variables', color: '#d97706', light: '#fef3c7' },
    DATATYPES: { id: 'datatypes', label: 'Data & Values', color: '#16a34a', light: '#dcfce7' },
    OPERATORS: { id: 'operators', label: 'Operators & Math', color: '#059669', light: '#d1fae5' },
    CONDITIONS: { id: 'conditions', label: 'Conditions (Logic)', color: '#7c3aed', light: '#ede9fe' },
    LOOPS: { id: 'loops', label: 'Loops & Iteration', color: '#9333ea', light: '#f3e8ff' },
    FUNCTIONS: { id: 'functions', label: 'Functions', color: '#c026d3', light: '#fae8ff' },
    EVENTS: { id: 'events', label: 'Events & Gestures', color: '#ea580c', light: '#ffedd5' },
    STATE: { id: 'state', label: 'State Updates', color: '#e11d48', light: '#ffe4e6' },
    LISTS: { id: 'lists', label: 'Lists & Collections', color: '#4f46e5', light: '#e0e7ff' },
    NAVIGATION: { id: 'navigation', label: 'Navigation', color: '#475569', light: '#f1f5f9' }
  };

  const svg = (path) => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; display: inline-block;">${path}</svg>`;

  const ICONS = {
    text: svg('<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" x2="15" y1="20" y2="20"/><line x1="12" x2="12" y1="4" y2="20"/>'),
    button: svg('<rect width="18" height="12" x="3" y="6" rx="3"/>'),
    container: svg('<rect width="18" height="18" x="3" y="3" rx="2"/>'),
    column: svg('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>'),
    row: svg('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/>'),
    image: svg('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
    input: svg('<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="6" x2="6" y1="9" y2="15"/>'),
    star: svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    scaffold: svg('<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>'),
    listview: svg('<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>'),
    box: svg('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>'),
    set: svg('<line x1="5" x2="19" y1="9" y2="9"/><line x1="5" x2="19" y1="15" y2="15"/>'),
    quote: svg('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>'),
    hash: svg('<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>'),
    toggle: svg('<rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/>'),
    plus: svg('<line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>'),
    compare: svg('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>'),
    branch: svg('<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'),
    repeat: svg('<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
    refresh: svg('<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>'),
    settings: svg('<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/>'),
    play: svg('<polygon points="5 3 19 12 5 21 5 3"/>'),
    message: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    pointer: svg('<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>'),
    bell: svg('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'),
    list: svg('<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>'),
    arrowRight: svg('<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
    arrowLeft: svg('<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>')
  };

  const BLOCK_DEFINITIONS = {
    // ==========================================
    // 1. UI Widgets & Layout
    // ==========================================
    'widget_text': {
      type: 'widget_text',
      category: 'widgets',
      shape: 'statement', // statement | expression | container_c | event_hat
      label: 'Text',
      icon: ICONS.text,
      description: 'Flutter Text widget to display a string of styled text on screen.',
      fields: {
        text: { type: 'text', label: 'Content', default: 'Hello Flutter!' },
        fontSize: { type: 'number', label: 'Font Size', default: 18 },
        color: { type: 'color', label: 'Color', default: '#0f172a' },
        fontWeight: { type: 'select', label: 'Weight', options: ['normal', 'bold'], default: 'normal' },
        isVariable: { type: 'boolean', label: 'Bind to Variable?', default: false },
        variableName: { type: 'text', label: 'Variable Name', default: 'message' }
      }
    },

    'widget_button': {
      type: 'widget_button',
      category: 'widgets',
      shape: 'statement',
      label: 'ElevatedButton',
      icon: ICONS.button,
      description: 'Material Design elevated button that triggers an action when pressed.',
      fields: {
        label: { type: 'text', label: 'Button Label', default: 'Click Me' },
        color: { type: 'color', label: 'Background', default: '#0284c7' },
        textColor: { type: 'color', label: 'Text Color', default: '#ffffff' },
        actionHandler: { type: 'select', label: 'On Pressed Action', options: ['custom_event', 'increment_counter', 'show_snackbar', 'navigate'], default: 'custom_event' }
      }
    },

    'widget_container': {
      type: 'widget_container',
      category: 'layout',
      shape: 'container_c',
      label: 'Container',
      icon: ICONS.container,
      description: 'Box decoration container with padding, background color, and child widgets.',
      acceptsChildren: true,
      fields: {
        padding: { type: 'number', label: 'Padding', default: 16 },
        margin: { type: 'number', label: 'Margin', default: 8 },
        color: { type: 'color', label: 'Background', default: '#ffffff' },
        borderRadius: { type: 'number', label: 'Corner Radius', default: 12 }
      }
    },

    'widget_column': {
      type: 'widget_column',
      category: 'layout',
      shape: 'container_c',
      label: 'Column Layout',
      icon: ICONS.column,
      description: 'Arranges its child widgets vertically top-to-bottom.',
      acceptsChildren: true,
      fields: {
        mainAxisAlignment: { type: 'select', label: 'Align (Vertical)', options: ['center', 'start', 'end', 'spaceBetween'], default: 'center' },
        crossAxisAlignment: { type: 'select', label: 'Align (Horizontal)', options: ['center', 'start', 'end'], default: 'center' }
      }
    },

    'widget_row': {
      type: 'widget_row',
      category: 'layout',
      shape: 'container_c',
      label: 'Row Layout',
      icon: ICONS.row,
      description: 'Arranges its child widgets horizontally side-by-side.',
      acceptsChildren: true,
      fields: {
        mainAxisAlignment: { type: 'select', label: 'Align (Horizontal)', options: ['center', 'start', 'end', 'spaceBetween'], default: 'center' }
      }
    },

    'widget_image': {
      type: 'widget_image',
      category: 'widgets',
      shape: 'statement',
      label: 'Image.network',
      icon: ICONS.image,
      description: 'Displays an image from a network URL.',
      fields: {
        url: { type: 'text', label: 'Image URL', default: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400' },
        height: { type: 'number', label: 'Height (px)', default: 160 },
        borderRadius: { type: 'number', label: 'Radius', default: 8 }
      }
    },

    'widget_textfield': {
      type: 'widget_textfield',
      category: 'widgets',
      shape: 'statement',
      label: 'TextField Input',
      icon: ICONS.input,
      description: 'A text input field for capturing user typing.',
      fields: {
        placeholder: { type: 'text', label: 'Placeholder / Hint', default: 'Enter text here...' },
        bindVariable: { type: 'text', label: 'Store in Variable', default: 'inputText' }
      }
    },

    'widget_icon': {
      type: 'widget_icon',
      category: 'widgets',
      shape: 'statement',
      label: 'Icon',
      icon: ICONS.star,
      description: 'Displays a Material Icon symbol.',
      fields: {
        iconName: { type: 'select', label: 'Icon', options: ['favorite', 'star', 'home', 'settings', 'add', 'check', 'thumb_up'], default: 'favorite' },
        color: { type: 'color', label: 'Icon Color', default: '#e11d48' },
        size: { type: 'number', label: 'Size', default: 32 }
      }
    },

    'widget_scaffold': {
      type: 'widget_scaffold',
      category: 'layout',
      shape: 'container_c',
      label: 'Scaffold & AppBar',
      icon: ICONS.scaffold,
      description: 'Top-level screen framework with AppBar header and body area.',
      acceptsChildren: true,
      fields: {
        appBarTitle: { type: 'text', label: 'AppBar Title', default: 'My Flutter App' },
        appBarColor: { type: 'color', label: 'AppBar Color', default: '#0284c7' },
        backgroundColor: { type: 'color', label: 'Screen Background', default: '#f8fafc' }
      }
    },

    'widget_listview': {
      type: 'widget_listview',
      category: 'layout',
      shape: 'container_c',
      label: 'ListView (Scrollable)',
      icon: ICONS.listview,
      description: 'A scrollable vertical list of items or widgets.',
      acceptsChildren: true,
      fields: {
        padding: { type: 'number', label: 'Padding', default: 12 }
      }
    },

    // ==========================================
    // 2. Variables & Data Types
    // ==========================================
    'var_declare': {
      type: 'var_declare',
      category: 'variables',
      shape: 'statement',
      label: 'Create Variable',
      icon: ICONS.box,
      description: 'Defines a Dart state variable with a name, type, and initial value.',
      fields: {
        varName: { type: 'text', label: 'Name', default: 'counter' },
        varType: { type: 'select', label: 'Data Type', options: ['int', 'String', 'double', 'bool'], default: 'int' },
        initValue: { type: 'text', label: 'Initial Value', default: '0' }
      }
    },

    'var_set': {
      type: 'var_set',
      category: 'variables',
      shape: 'statement',
      label: 'Set Variable Value',
      icon: ICONS.set,
      description: 'Assigns a new value or calculation to an existing variable.',
      fields: {
        varName: { type: 'text', label: 'Variable', default: 'counter' },
        value: { type: 'text', label: 'New Value / Expression', default: 'counter + 1' }
      }
    },

    'val_string': {
      type: 'val_string',
      category: 'datatypes',
      shape: 'expression',
      label: 'Text "String"',
      icon: ICONS.quote,
      description: 'A piece of text surrounded by quotes in Dart.',
      fields: {
        value: { type: 'text', label: 'String Value', default: 'Welcome' }
      }
    },

    'val_number': {
      type: 'val_number',
      category: 'datatypes',
      shape: 'expression',
      label: 'Number (int / double)',
      icon: ICONS.hash,
      description: 'A numeric integer or floating point number.',
      fields: {
        value: { type: 'number', label: 'Number', default: 1 }
      }
    },

    'val_boolean': {
      type: 'val_boolean',
      category: 'datatypes',
      shape: 'expression',
      label: 'Boolean (true / false)',
      icon: ICONS.toggle,
      description: 'A true or false logic value.',
      fields: {
        value: { type: 'select', label: 'Value', options: ['true', 'false'], default: 'true' }
      }
    },

    // ==========================================
    // 3. Operators & Math
    // ==========================================
    'op_arithmetic': {
      type: 'op_arithmetic',
      category: 'operators',
      shape: 'expression',
      label: 'Math Operation',
      icon: ICONS.plus,
      description: 'Adds, subtracts, multiplies, or divides two values in Dart.',
      fields: {
        left: { type: 'text', label: 'Left', default: 'counter' },
        operator: { type: 'select', label: 'Operator', options: ['+', '-', '*', '/'], default: '+' },
        right: { type: 'text', label: 'Right', default: '1' }
      }
    },

    'op_compare': {
      type: 'op_compare',
      category: 'operators',
      shape: 'expression',
      label: 'Comparison',
      icon: ICONS.compare,
      description: 'Compares two values and returns true or false (==, >, <, !=).',
      fields: {
        left: { type: 'text', label: 'Left', default: 'score' },
        operator: { type: 'select', label: 'Operator', options: ['==', '!=', '>', '<', '>=', '<='], default: '>=' },
        right: { type: 'text', label: 'Right', default: '10' }
      }
    },

    // ==========================================
    // 4. Conditions (Logic)
    // ==========================================
    'logic_if': {
      type: 'logic_if',
      category: 'conditions',
      shape: 'container_c',
      label: 'if (condition) then',
      icon: ICONS.branch,
      description: 'Executes nested statements only if the condition is true.',
      acceptsChildren: true,
      fields: {
        condition: { type: 'text', label: 'Condition', default: 'counter > 5' }
      }
    },

    'logic_if_else': {
      type: 'logic_if_else',
      category: 'conditions',
      shape: 'container_c',
      label: 'if / else',
      icon: ICONS.branch,
      description: 'Branching execution: does one block if true, or else runs alternate branch.',
      acceptsChildren: true,
      fields: {
        condition: { type: 'text', label: 'Condition', default: 'isLoggedIn == true' },
        elseActionText: { type: 'text', label: 'Else Message', default: 'Please log in' }
      }
    },

    // ==========================================
    // 5. Loops & Iteration
    // ==========================================
    'loop_repeat': {
      type: 'loop_repeat',
      category: 'loops',
      shape: 'container_c',
      label: 'Repeat N Times',
      icon: ICONS.repeat,
      description: 'Loops and executes statements a specified number of times.',
      acceptsChildren: true,
      fields: {
        times: { type: 'number', label: 'Repeat Count', default: 5 }
      }
    },

    'loop_for_each': {
      type: 'loop_for_each',
      category: 'loops',
      shape: 'container_c',
      label: 'For Each item in List',
      icon: ICONS.refresh,
      description: 'Iterates through each element in a Dart list.',
      acceptsChildren: true,
      fields: {
        itemName: { type: 'text', label: 'Item Variable', default: 'item' },
        listName: { type: 'text', label: 'List Variable', default: 'tasks' }
      }
    },

    // ==========================================
    // 6. Functions & State
    // ==========================================
    'func_define': {
      type: 'func_define',
      category: 'functions',
      shape: 'container_c',
      label: 'Define Function',
      icon: ICONS.settings,
      description: 'Creates a named reusable function in Dart.',
      acceptsChildren: true,
      fields: {
        name: { type: 'text', label: 'Function Name', default: 'calculateScore' },
        returnType: { type: 'select', label: 'Return Type', options: ['void', 'int', 'String', 'bool'], default: 'void' }
      }
    },

    'func_call': {
      type: 'func_call',
      category: 'functions',
      shape: 'statement',
      label: 'Call Function()',
      icon: ICONS.play,
      description: 'Executes a defined function by name.',
      fields: {
        name: { type: 'text', label: 'Function Name', default: 'calculateScore' }
      }
    },

    'state_set': {
      type: 'state_set',
      category: 'state',
      shape: 'container_c',
      label: 'setState(() { ... })',
      icon: ICONS.refresh,
      description: 'Notifies Flutter that internal state has changed, triggering UI re-render.',
      acceptsChildren: true,
      fields: {
        description: { type: 'text', label: 'Note', default: 'Update Screen' }
      }
    },

    'state_update_text': {
      type: 'state_update_text',
      category: 'state',
      shape: 'statement',
      label: 'Update Displayed Text',
      icon: ICONS.message,
      description: 'Changes a message variable inside setState() so the screen updates immediately.',
      fields: {
        targetVariable: { type: 'text', label: 'Text Variable', default: 'message' },
        newText: { type: 'text', label: 'New Message', default: 'Button was clicked!' }
      }
    },

    'state_increment': {
      type: 'state_increment',
      category: 'state',
      shape: 'statement',
      label: 'Increment Counter (+1)',
      icon: ICONS.plus,
      description: 'Increases a number variable by 1 and updates the mobile preview screen.',
      fields: {
        varName: { type: 'text', label: 'Counter Variable', default: 'counter' }
      }
    },

    // ==========================================
    // 7. Events & User Input
    // ==========================================
    'event_button_pressed': {
      type: 'event_button_pressed',
      category: 'events',
      shape: 'event_hat',
      label: 'When Button Is Pressed',
      icon: ICONS.pointer,
      description: 'Event trigger block: statements placed inside run whenever the user taps the button.',
      acceptsChildren: true,
      fields: {
        buttonLabel: { type: 'text', label: 'For Button', default: 'Click Me' }
      }
    },

    'action_show_snackbar': {
      type: 'action_show_snackbar',
      category: 'events',
      shape: 'statement',
      label: 'Show SnackBar Message',
      icon: ICONS.bell,
      description: 'Displays a popup toast notification at the bottom of the phone screen.',
      fields: {
        message: { type: 'text', label: 'Alert Message', default: 'Task completed successfully!' }
      }
    },

    // ==========================================
    // 8. Lists & Collections
    // ==========================================
    'list_create': {
      type: 'list_create',
      category: 'lists',
      shape: 'statement',
      label: 'Create List<String>',
      icon: ICONS.list,
      description: 'Initializes a Dart List of strings for to-dos, shopping, or feeds.',
      fields: {
        listName: { type: 'text', label: 'List Name', default: 'todoList' },
        initialItems: { type: 'text', label: 'Items (comma-separated)', default: 'Learn Flutter, Build with Blocks, Launch App' }
      }
    },

    'list_add': {
      type: 'list_add',
      category: 'lists',
      shape: 'statement',
      label: 'Add to List',
      icon: ICONS.plus,
      description: 'Appends a new item into a list.',
      fields: {
        listName: { type: 'text', label: 'List Name', default: 'todoList' },
        itemValue: { type: 'text', label: 'New Item', default: 'New Task' }
      }
    },

    // ==========================================
    // 9. Navigation
    // ==========================================
    'nav_push': {
      type: 'nav_push',
      category: 'navigation',
      shape: 'statement',
      label: 'Navigate to Screen',
      icon: ICONS.arrowRight,
      description: 'Pushes a new screen route onto the Flutter Navigator stack.',
      fields: {
        screenName: { type: 'text', label: 'Screen Name', default: 'DetailsScreen' }
      }
    },

    'nav_pop': {
      type: 'nav_pop',
      category: 'navigation',
      shape: 'statement',
      label: 'Go Back (Pop Screen)',
      icon: ICONS.arrowLeft,
      description: 'Dismisses the current screen and returns to the previous one.',
      fields: {}
    }
  };

  const BlockRegistry = {
    getCategories() {
      return Object.values(CATEGORIES);
    },

    getCategory(id) {
      return CATEGORIES[id.toUpperCase()] || null;
    },

    getAllDefinitions() {
      return Object.values(BLOCK_DEFINITIONS);
    },

    getDefinition(type) {
      return BLOCK_DEFINITIONS[type] || null;
    },

    getByCategory(categoryKey) {
      return Object.values(BLOCK_DEFINITIONS).filter(b => b.category === categoryKey);
    },

    createBlockInstance(type, customFields = {}) {
      const def = this.getDefinition(type);
      if (!def) return null;

      const fields = {};
      for (const [k, v] of Object.entries(def.fields || {})) {
        fields[k] = v.default;
      }
      Object.assign(fields, customFields);

      return {
        id: window.BubbleUtils.generateId('block'),
        type: type,
        category: def.category,
        fields: fields,
        children: def.acceptsChildren ? [] : undefined
      };
    }
  };

  window.BubbleBlockRegistry = BlockRegistry;
})(window);
