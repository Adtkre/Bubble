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

  const BLOCK_DEFINITIONS = {
    // ==========================================
    // 1. UI Widgets & Layout
    // ==========================================
    'widget_text': {
      type: 'widget_text',
      category: 'widgets',
      shape: 'statement', // statement | expression | container_c | event_hat
      label: 'Text',
      icon: '🔤',
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
      icon: '▰',
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
      icon: '▢',
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
      icon: '▮',
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
      icon: '☰',
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
      icon: '🖼',
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
      icon: '⌨',
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
      icon: '⭐',
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
      icon: '📱',
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
      icon: '📜',
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
      icon: '📦',
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
      icon: '≔',
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
      icon: '❝',
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
      icon: '🔢',
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
      icon: '🔘',
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
      icon: '➕',
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
      icon: '⚖️',
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
      icon: '🔀',
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
      icon: '⇌',
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
      icon: '🔁',
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
      icon: '🔄',
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
      icon: '⚙️',
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
      icon: '▶',
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
      icon: '🔄',
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
      icon: '💬',
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
      icon: '➕',
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
      icon: '👆',
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
      icon: '📢',
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
      icon: '📋',
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
      icon: '➕',
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
      icon: '➡️',
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
      icon: '⬅️',
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
