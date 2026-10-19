/**
 * BUBBLE - Dart & Flutter Code Generator
 * Converts the structured block tree into syntactically valid, readable Flutter Dart code.
 */

(function (window) {
  'use strict';

  const DartGenerator = {
    /**
     * Generate the complete standalone Flutter main.dart file
     */
    generateFullDartCode(blocks, projectName = 'BubbleApp') {
      const cleanClassName = projectName.replace(/[^a-zA-Z0-9]/g, '') || 'BubbleApp';
      const variables = this.collectVariables(blocks);
      const functions = this.collectFunctions(blocks);
      const eventHandlers = this.collectEventHandlers(blocks);

      // Separate UI widget blocks from logic blocks
      const uiBlocks = blocks.filter(b => b.category === 'widgets' || b.category === 'layout');

      const varDeclarations = variables.map(v => `  ${v.type} ${v.name} = ${v.initValue};`).join('\n');
      const funcDeclarations = functions.map(f => this.generateFunctionCode(f, 2)).join('\n\n');
      const eventCode = this.generateEventsMethodCode(eventHandlers, 2);

      const widgetTreeCode = this.generateWidgetTree(uiBlocks, 4);

      return `// =================================================================
// Generated with Bubble — Visual Dart & Flutter Learning Platform
// Target: Flutter 3.x / Dart 3.x
// =================================================================

import 'package:flutter/material.dart';

void main() {
  runApp(const ${cleanClassName}());
}

class ${cleanClassName} extends StatelessWidget {
  const ${cleanClassName}({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${window.BubbleUtils.escapeHtml(projectName)}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0284C7)),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  // --- App State Variables ---
${varDeclarations || '  int counter = 0;\n  String message = "Welcome to Bubble!";'}

  // --- Visual Logic & Event Handlers ---
${funcDeclarations}

${eventCode}

  @override
  Widget build(BuildContext context) {
    return ${widgetTreeCode};
  }
}
`;
    },

    /**
     * Recursively collect all variable declarations from the block tree
     */
    collectVariables(blocks, vars = []) {
      if (!Array.isArray(blocks)) return vars;
      for (const b of blocks) {
        if (b.type === 'var_declare') {
          const type = b.fields.varType || 'int';
          let val = b.fields.initValue || '0';
          if (type === 'String' && !val.startsWith('"') && !val.startsWith("'")) {
            val = `"${val}"`;
          }
          vars.push({
            id: b.id,
            name: b.fields.varName || 'variable',
            type: type,
            initValue: val
          });
        }
        if (Array.isArray(b.children)) {
          this.collectVariables(b.children, vars);
        }
      }
      return vars;
    },

    /**
     * Collect functions defined in blocks
     */
    collectFunctions(blocks, funcs = []) {
      if (!Array.isArray(blocks)) return funcs;
      for (const b of blocks) {
        if (b.type === 'func_define') {
          funcs.push(b);
        }
        if (Array.isArray(b.children)) {
          this.collectFunctions(b.children, funcs);
        }
      }
      return funcs;
    },

    /**
     * Collect button event handlers
     */
    collectEventHandlers(blocks, handlers = []) {
      if (!Array.isArray(blocks)) return handlers;
      for (const b of blocks) {
        if (b.type === 'event_button_pressed') {
          handlers.push(b);
        }
        if (Array.isArray(b.children)) {
          this.collectEventHandlers(b.children, handlers);
        }
      }
      return handlers;
    },

    /**
     * Generate code for defined functions
     */
    generateFunctionCode(funcBlock, indentLevel = 2) {
      const indent = '  '.repeat(indentLevel);
      const name = funcBlock.fields.name || 'customFunction';
      const retType = funcBlock.fields.returnType || 'void';
      const bodyIndent = '  '.repeat(indentLevel + 1);

      let body = '';
      if (Array.isArray(funcBlock.children) && funcBlock.children.length > 0) {
        body = funcBlock.children.map(child => this.generateStatementCode(child, indentLevel + 1)).join('\n');
      } else {
        body = `${bodyIndent}// Statements inside ${name}()`;
      }

      return `${indent}// [Block: ${funcBlock.id}]\n${indent}${retType} ${name}() {\n${body}\n${indent}}`;
    },

    /**
     * Generate the button click event handler methods
     */
    generateEventsMethodCode(eventBlocks, indentLevel = 2) {
      const indent = '  '.repeat(indentLevel);
      if (!eventBlocks || eventBlocks.length === 0) {
        return `${indent}void _handleButtonClick() {
${indent}  setState(() {
${indent}    counter++;
${indent}    message = "Button tapped! Counter: \$counter";
${indent}  });
${indent}}`;
      }

      return eventBlocks.map((evt, idx) => {
        const bodyLines = (evt.children || []).map(child => this.generateStatementCode(child, indentLevel + 2)).join('\n');
        return `${indent}// [Block: ${evt.id}]
${indent}void _onButtonPress_${idx + 1}() {
${indent}  setState(() {
${bodyLines || `${indent}    counter++;`}
${indent}  });
${indent}}`;
      }).join('\n\n');
    },

    /**
     * Generate statements inside loops, conditions, functions, and events
     */
    generateStatementCode(block, indentLevel = 3) {
      const indent = '  '.repeat(indentLevel);
      const f = block.fields || {};

      switch (block.type) {
        case 'var_set':
          return `${indent}// [Block: ${block.id}]\n${indent}${f.varName || 'counter'} = ${f.value || '0'};`;

        case 'state_increment':
          return `${indent}// [Block: ${block.id}]\n${indent}${f.varName || 'counter'}++;`;

        case 'state_update_text': {
          const val = f.newText || 'Updated text';
          return `${indent}// [Block: ${block.id}]\n${indent}${f.targetVariable || 'message'} = "${val}";`;
        }

        case 'logic_if': {
          const inner = (block.children || []).map(c => this.generateStatementCode(c, indentLevel + 1)).join('\n');
          return `${indent}// [Block: ${block.id}]\n${indent}if (${f.condition || 'true'}) {\n${inner}\n${indent}}`;
        }

        case 'logic_if_else': {
          const inner = (block.children || []).map(c => this.generateStatementCode(c, indentLevel + 1)).join('\n');
          return `${indent}// [Block: ${block.id}]\n${indent}if (${f.condition || 'true'}) {\n${inner}\n${indent}} else {\n${indent}  message = "${f.elseActionText || 'Condition false'}";\n${indent}}`;
        }

        case 'loop_repeat': {
          const inner = (block.children || []).map(c => this.generateStatementCode(c, indentLevel + 1)).join('\n');
          return `${indent}// [Block: ${block.id}]\n${indent}for (int i = 0; i < ${f.times || 5}; i++) {\n${inner}\n${indent}}`;
        }

        case 'action_show_snackbar':
          return `${indent}// [Block: ${block.id}]\n${indent}ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("${f.message || 'Notification'}")));`;

        case 'list_add':
          return `${indent}// [Block: ${block.id}]\n${indent}${f.listName || 'todoList'}.add("${f.itemValue || 'New Item'}");`;

        case 'func_call':
          return `${indent}// [Block: ${block.id}]\n${indent}${f.name || 'customFunction'}();`;

        default:
          return `${indent}// Executing block: ${block.type}`;
      }
    },

    /**
     * Generate the Flutter Widget tree (Scaffold, Column, Text, ElevatedButton, etc.)
     */
    generateWidgetTree(uiBlocks, indentLevel = 4) {
      const indent = '  '.repeat(indentLevel);

      // Check if top-level block is a Scaffold
      const scaffoldBlock = uiBlocks.find(b => b.type === 'widget_scaffold');
      if (scaffoldBlock) {
        const otherRootWidgets = uiBlocks.filter(b => b !== scaffoldBlock);
        const combinedBodyWidgets = (scaffoldBlock.children || []).concat(otherRootWidgets);
        const tempScaffold = Object.assign({}, scaffoldBlock, { children: combinedBodyWidgets });
        return this.generateSingleWidget(tempScaffold, indentLevel);
      }

      // If no explicit Scaffold, wrap child widgets inside a default Scaffold & SingleChildScrollView
      const childrenCode = uiBlocks.length > 0
        ? uiBlocks.map(b => this.generateSingleWidget(b, indentLevel + 3)).join(',\n')
        : `${'  '.repeat(indentLevel + 3)}const Text('Add widgets from the library on the left!')`;

      return `Scaffold(
${indent}  appBar: AppBar(
${indent}    title: const Text('Bubble Flutter App'),
${indent}    backgroundColor: Theme.of(context).colorScheme.inversePrimary,
${indent}  ),
${indent}  body: SingleChildScrollView(
${indent}    padding: const EdgeInsets.all(16.0),
${indent}    child: Column(
${indent}      mainAxisAlignment: MainAxisAlignment.center,
${indent}      crossAxisAlignment: CrossAxisAlignment.stretch,
${indent}      children: [
${childrenCode}
${indent}      ],
${indent}    ),
${indent}  ),
${indent})`;
    },

    /**
     * Generate code for an individual Flutter widget
     */
    generateSingleWidget(b, indentLevel = 4) {
      const indent = '  '.repeat(indentLevel);
      const f = b.fields || {};

      switch (b.type) {
        case 'widget_scaffold': {
          const bodyBlocks = b.children || [];
          const childrenCode = bodyBlocks.length > 0
            ? bodyBlocks.map(child => this.generateSingleWidget(child, indentLevel + 3)).join(',\n')
            : `${'  '.repeat(indentLevel + 3)}const Center(child: Text('Empty Screen'))`;

          const hexColor = (f.appBarColor || '#0284c7').replace('#', '0xFF').toUpperCase();

          return `${indent}Scaffold( // [Block: ${b.id}]
${indent}  appBar: AppBar(
${indent}    title: Text('${f.appBarTitle || 'My App'}'),
${indent}    backgroundColor: const Color(${hexColor}),
${indent}    foregroundColor: Colors.white,
${indent}  ),
${indent}  body: SingleChildScrollView(
${indent}    padding: const EdgeInsets.all(16.0),
${indent}    child: Column(
${indent}      children: [
${childrenCode}
${indent}      ],
${indent}    ),
${indent}  ),
${indent})`;
        }

        case 'widget_text': {
          const isVar = f.isVariable;
          const content = isVar ? `"\$${f.variableName || 'message'}"` : `'${f.text || 'Text'}'`;
          const hex = (f.color || '#0f172a').replace('#', '0xFF').toUpperCase();
          const weight = f.fontWeight === 'bold' ? 'FontWeight.bold' : 'FontWeight.normal';

          return `${indent}Text( // [Block: ${b.id}]
${indent}  ${content},
${indent}  style: TextStyle(
${indent}    fontSize: ${f.fontSize || 18},
${indent}    fontWeight: ${weight},
${indent}    color: const Color(${hex}),
${indent}  ),
${indent})`;
        }

        case 'widget_button': {
          const hex = (f.color || '#0284c7').replace('#', '0xFF').toUpperCase();
          const textHex = (f.textColor || '#ffffff').replace('#', '0xFF').toUpperCase();

          return `${indent}ElevatedButton( // [Block: ${b.id}]
${indent}  onPressed: _onButtonPress_1,
${indent}  style: ElevatedButton.styleFrom(
${indent}    backgroundColor: const Color(${hex}),
${indent}    foregroundColor: const Color(${textHex}),
${indent}    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
${indent}    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
${indent}  ),
${indent}  child: Text('${f.label || 'Click Me'}'),
${indent})`;
        }

        case 'widget_container': {
          const childWidgets = (b.children || []).map(c => this.generateSingleWidget(c, indentLevel + 2)).join(',\n');
          const hex = (f.color || '#ffffff').replace('#', '0xFF').toUpperCase();

          return `${indent}Container( // [Block: ${b.id}]
${indent}  padding: const EdgeInsets.all(${f.padding || 16}.0),
${indent}  margin: const EdgeInsets.symmetric(vertical: ${f.margin || 8}.0),
${indent}  decoration: BoxDecoration(
${indent}    color: const Color(${hex}),
${indent}    borderRadius: BorderRadius.circular(${f.borderRadius || 12}.0),
${indent}    boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6)],
${indent}  ),
${indent}  child: Column(
${indent}    children: [
${childWidgets || `${indent}      const SizedBox.shrink()`}
${indent}    ],
${indent}  ),
${indent})`;
        }

        case 'widget_column': {
          const childWidgets = (b.children || []).map(c => this.generateSingleWidget(c, indentLevel + 2)).join(',\n');
          return `${indent}Column( // [Block: ${b.id}]
${indent}  mainAxisAlignment: MainAxisAlignment.${f.mainAxisAlignment || 'center'},
${indent}  children: [
${childWidgets || `${indent}    const SizedBox.shrink()`}
${indent}  ],
${indent})`;
        }

        case 'widget_row': {
          const childWidgets = (b.children || []).map(c => this.generateSingleWidget(c, indentLevel + 2)).join(',\n');
          return `${indent}Row( // [Block: ${b.id}]
${indent}  mainAxisAlignment: MainAxisAlignment.${f.mainAxisAlignment || 'center'},
${indent}  children: [
${childWidgets || `${indent}    const SizedBox.shrink()`}
${indent}  ],
${indent})`;
        }

        case 'widget_image': {
          return `${indent}ClipRRect( // [Block: ${b.id}]
${indent}  borderRadius: BorderRadius.circular(${f.borderRadius || 8}.0),
${indent}  child: Image.network(
${indent}    '${f.url || 'https://via.placeholder.com/300x160'}',
${indent}    height: ${f.height || 160}.0,
${indent}    fit: BoxFit.cover,
${indent}  ),
${indent})`;
        }

        case 'widget_textfield': {
          return `${indent}TextField( // [Block: ${b.id}]
${indent}  decoration: InputDecoration(
${indent}    hintText: '${f.placeholder || 'Enter text...'}',
${indent}    border: const OutlineInputBorder(),
${indent}    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
${indent}  ),
${indent}  onChanged: (val) {
${indent}    setState(() {
${indent}      ${f.bindVariable || 'inputText'} = val;
${indent}    });
${indent}  },
${indent})`;
        }

        case 'widget_icon': {
          const hex = (f.color || '#e11d48').replace('#', '0xFF').toUpperCase();
          const iconName = f.iconName || 'favorite';
          return `${indent}Icon( // [Block: ${b.id}]
${indent}  Icons.${iconName},
${indent}  color: const Color(${hex}),
${indent}  size: ${f.size || 32}.0,
${indent})`;
        }

        case 'widget_listview': {
          const childWidgets = (b.children || []).map(c => this.generateSingleWidget(c, indentLevel + 2)).join(',\n');
          return `${indent}ListView( // [Block: ${b.id}]
${indent}  shrinkWrap: true,
${indent}  physics: const NeverScrollableScrollPhysics(),
${indent}  padding: const EdgeInsets.all(${f.padding || 12}.0),
${indent}  children: [
${childWidgets || `${indent}    const SizedBox.shrink()`}
${indent}  ],
${indent})`;
        }

        default:
          return `${indent}// Unsupported widget block: ${b.type}`;
      }
    }
  };

  window.BubbleDartGenerator = DartGenerator;
})(window);
