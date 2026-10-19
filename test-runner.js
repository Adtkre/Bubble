/**
 * BUBBLE - Comprehensive Test Runner for Mobile App & Dart Platform
 * Validates block definitions, Dart generator, mobile simulation, tutorials, and storage.
 */

const fs = require('fs');

// Mock browser environment for headless testing
const mockStorage = {};
global.window = {
  localStorage: {
    getItem(k) { return mockStorage[k] || null; },
    setItem(k, v) { mockStorage[k] = String(v); },
    removeItem(k) { delete mockStorage[k]; }
  }
};
global.document = {
  createElement() { return {}; },
  body: { appendChild() {}, removeChild() {} }
};

// Load modules
require('./js/utils.js');
require('./js/storage.js');
require('./js/block-definitions.js');
require('./js/dart-generator.js');
require('./js/tutorials.js');
require('./js/dart-learn.js');
require('./js/mobile-preview.js');
require('./js/history.js');

console.log('[Test Suite] Starting Bubble Flutter & Dart Studio Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Block Definitions & Categories
console.log('--- Test Group 1: Block Registry & 12 Categories ---');
const categories = window.BubbleBlockRegistry.getCategories();
assert(categories.length >= 10, `Categories defined: ${categories.length} (>= 10 required)`);

const requiredBlockTypes = [
  'widget_text', 'widget_button', 'widget_container', 'widget_column', 'widget_row',
  'widget_image', 'widget_textfield', 'widget_scaffold', 'widget_listview', 'widget_icon',
  'var_declare', 'var_set', 'val_string', 'val_number', 'val_boolean',
  'op_arithmetic', 'op_compare', 'logic_if', 'logic_if_else', 'loop_repeat',
  'func_define', 'func_call', 'state_set', 'state_update_text', 'state_increment',
  'event_button_pressed', 'action_show_snackbar', 'list_create', 'list_add', 'nav_push'
];

requiredBlockTypes.forEach(type => {
  const def = window.BubbleBlockRegistry.getDefinition(type);
  assert(def && def.type === type && def.fields, `Block definition "${type}" verified with fields`);
});

// 2. Instance Creation & Nesting
console.log('\n--- Test Group 2: Block Instances & Nesting ---');
const scaffoldBlock = window.BubbleBlockRegistry.createBlockInstance('widget_scaffold', { appBarTitle: 'Test App' });
assert(scaffoldBlock.id.startsWith('block_'), 'Generated unique block ID');
assert(scaffoldBlock.fields.appBarTitle === 'Test App', 'Custom field initialized');
assert(Array.isArray(scaffoldBlock.children), 'C-clamp container block has children array initialized');

const textBlock = window.BubbleBlockRegistry.createBlockInstance('widget_text', { text: 'Hello Bubble!' });
scaffoldBlock.children.push(textBlock);
assert(scaffoldBlock.children.length === 1 && scaffoldBlock.children[0].id === textBlock.id, 'Text widget nested inside Scaffold container');

// 3. Dart Code Generator
console.log('\n--- Test Group 3: Dart & Flutter Code Generator ---');
const testBlocks = [
  scaffoldBlock,
  {
    id: 'b_var',
    type: 'var_declare',
    category: 'variables',
    fields: { varName: 'counter', varType: 'int', initValue: '0' }
  },
  {
    id: 'b_btn',
    type: 'widget_button',
    category: 'widgets',
    fields: { label: 'Tap Me', color: '#0284c7', textColor: '#ffffff' }
  },
  {
    id: 'b_event',
    type: 'event_button_pressed',
    category: 'events',
    fields: { buttonLabel: 'Tap Me' },
    children: [
      {
        id: 'b_inc',
        type: 'state_increment',
        category: 'state',
        fields: { varName: 'counter' }
      }
    ]
  }
];

const dartCode = window.BubbleDartGenerator.generateFullDartCode(testBlocks, 'TestApp');
assert(dartCode.includes('import \'package:flutter/material.dart\';'), 'Imports flutter/material.dart');
assert(dartCode.includes('class TestApp extends StatelessWidget'), 'Generates root StatelessWidget');
assert(dartCode.includes('class MainScreen extends StatefulWidget'), 'Generates StatefulWidget for state management');
assert(dartCode.includes('int counter = 0;'), 'Declares state variables');
assert(dartCode.includes('setState(() {'), 'Generates setState() inside event callback');
assert(dartCode.includes('counter++;'), 'Generates state increment logic');
assert(dartCode.includes('Scaffold(') && dartCode.includes('appBar: AppBar('), 'Generates Flutter Scaffold & AppBar widget tree');
assert(dartCode.includes('ElevatedButton('), 'Generates ElevatedButton widget');

// 4. Guided Mini-Projects & Tutorials
console.log('\n--- Test Group 4: Guided Starter Mini-Projects ---');
const tutorials = window.BubbleTutorials.getAllTutorials();
assert(tutorials.length >= 5, `Mini-project tutorials count: ${tutorials.length} (>= 5 required)`);

const tutIds = ['hello_world', 'counter_app', 'calculator_app', 'login_form', 'todo_app'];
tutIds.forEach(id => {
  const tut = window.BubbleTutorials.getTutorialById(id);
  assert(tut && tut.id === id && Array.isArray(tut.blocks) && tut.blocks.length > 0, `Tutorial "${tut.title}" valid with blocks`);
});

// 5. Mobile Simulator Runtime State
console.log('\n--- Test Group 5: Mobile Simulator State Execution ---');
const sim = new window.BubbleMobileSimulator(null);
sim.update(testBlocks);
assert(sim.stateVariables.counter === 0, 'Simulator initialized counter state variable to 0');

// Trigger button event in simulator
sim.handleButtonTap();
assert(sim.stateVariables.counter === 1, `Simulator executed event increment block (expected 1, got ${sim.stateVariables.counter})`);

// 6. Learn Mode Knowledge Base
console.log('\n--- Test Group 6: Learn Mode & Lessons ---');
const textLesson = window.BubbleDartLearn.getLesson('widget_text');
assert(textLesson && textLesson.dartSnippet.includes('Text('), 'Text widget lesson contains Dart snippet');
assert(textLesson && textLesson.beginnerMistake, 'Lesson includes beginner advice and common mistakes');

const scaffoldLesson = window.BubbleDartLearn.getLesson('widget_scaffold');
assert(scaffoldLesson && scaffoldLesson.dartSnippet.includes('Scaffold('), 'Scaffold lesson available');

// 7. Project Storage & JSON Portability
console.log('\n--- Test Group 7: Storage & Project Backup ---');
const testApp = {
  id: 'app_test_123',
  name: 'My Custom App',
  blocks: testBlocks
};

window.BubbleStorage.saveProject(testApp);
const loaded = window.BubbleStorage.getProjectById('app_test_123');
assert(loaded && loaded.name === 'My Custom App', 'App project saved and loaded from Local Storage');

const exportedJson = window.BubbleStorage.exportProjectAsJson('app_test_123');
assert(exportedJson.includes('bubble_platform') && exportedJson.includes('My Custom App'), 'JSON project export contains schema metadata');

const importedApp = window.BubbleStorage.importProjectFromJson(exportedJson, 'Imported Copy');
assert(importedApp && importedApp.name === 'Imported Copy' && importedApp.id !== 'app_test_123', 'Imported JSON project creates fresh unique ID and validates schema');

console.log(`\n======================================================`);
console.log(`  Tests Passed: ${passedTests} / ${totalTests} (${Math.round((passedTests/totalTests)*100)}%)`);
console.log(`======================================================\n`);
