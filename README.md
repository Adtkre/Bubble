# Bubble — Block-Based Mobile App & Flutter Dart Learning Platform

Bubble is a visual programming environment for beginners that teaches mobile app development through **visual programming blocks** and **Dart code generation** for the **Flutter** framework.

Instead of an ordinary website builder, Bubble connects three core elements:
1. **Visual Programming Blocks**: Drag-and-drop interlocking blocks representing programming logic, Flutter UI widgets, state updates, and user events.
2. **Interactive Live Mobile Simulator**: A realistic smartphone frame showing an interactive simulated mobile app that responds to live button taps and state changes.
3. **Synchronized Dart Code Generator**: Syntactically valid, readable Flutter `main.dart` code generated in real-time with block-to-code source mapping.

---

## 📱 The 4 Core Editor Areas

### 1. Left Panel — Dart Block Library
Over 30 distinct visual blocks organized into 12 color-coded categories:
- **UI Widgets**: `Text`, `ElevatedButton`, `Image.network`, `TextField`, `Icon`.
- **Layout**: `Scaffold & AppBar`, `Column`, `Row`, `Container`, `ListView`.
- **Variables**: `Create Variable`, `Set Variable Value`.
- **Data Types**: `String`, `int / double`, `Boolean (true/false)`.
- **Operators**: Arithmetic (`+`, `-`, `*`, `/`), Comparisons (`==`, `!=`, `>`, `<`, `>=`, `<=`).
- **Conditions**: `if (condition) then`, `if / else`.
- **Loops**: `Repeat N Times`, `For Each in List`.
- **Functions**: `Define Function`, `Call Function()`.
- **Events**: `When Button Is Pressed`, `On Text Changed`.
- **State Updates**: `setState(() { ... })`, `Update Displayed Text`, `Increment Counter (+1)`.
- **Lists & Collections**: `Create List<String>`, `Add to List`.
- **Navigation**: `Navigate to Screen`, `Go Back (Pop Screen)`.

### 2. Center Panel — Visual Block Workspace
- Puzzle-notched statements and C-shaped nesting clamps for conditions, loops, and event handlers.
- Drag-and-drop placement, nesting, and reordering.
- Block action tools: Move up `▲`, Move down `▼`, Duplicate `⧉`, and Delete `✕`.
- Undo (`Ctrl+Z`) and Redo (`Ctrl+Y` / `Ctrl+Shift+Z`).

### 3. Right Panel — Live Mobile Phone Simulator & Property Inspector
- Realistic smartphone chassis with bezel, speaker notch, and status bar.
- Interactive Flutter widgets: tapping buttons triggers the visual program's logic (increments counters, updates messages, calculates values, displays floating SnackBar toasts).
- Block Property Inspector to customize labels, font sizes, colors, variable bindings, and event handlers.

### 4. Bottom Collapsible Panel — Dart Code Explorer
- **`main.dart` (Flutter)**: Clean syntax highlighting for generated Flutter code (`MaterialApp`, `StatefulWidget`, `State`, `setState`, and widget trees).
- **Synchronized Source Mapping**: Selecting any visual block highlights and scrolls to its corresponding line of Dart code.
- **Architecture Explanations**: Beginner-friendly breakdown of how `StatelessWidget`, `StatefulWidget`, and `setState()` work together.
- Actions: **Copy Dart Code** and **Download `main.dart`**.

---

## ⚡ Guided Starter Mini-Projects & Tutorials

Bubble includes 5 guided starter templates:
1. 👋 **Hello World App**: Scaffold, AppBar, styled Text, and an interactive greeting button.
2. 🔢 **Flutter Classic Counter App**: Iconic Flutter starter with state variable `counter`, increment logic, and dynamic screen updates.
3. 🧮 **Simple Calculator App**: Arithmetic operations, inputs, and state calculation.
4. 🔑 **Mobile Login Form UI**: TextFields, user input binding, and validation SnackBar.
5. 📝 **Task Tracker & To-Do List**: Dynamic Dart `List<String>`, `ListView`, and item additions.
6. 📱 **Blank Flutter App**: Clean canvas for building custom mobile apps from scratch.

---

## 🛠 Technology Stack

- **Frontend**: Plain HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+ modular architecture).
- **Target Language**: Dart 3.x / Flutter 3.x (`main.dart`).
- **Persistence**: Browser `localStorage` with versioned keys (`bubble.apps.v1`).
- **Zero External Dependencies**: No React, Vue, Angular, TypeScript, Tailwind, Bootstrap, databases, or cloud accounts.
- **Server**: Minimal zero-dependency local Node.js static server (`server.js`).

---

## 🚀 How to Run Locally

From the project root:
```bash
npm start
```
Then visit:
👉 **[http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)**

### Running the Test Suite
```bash
node test-runner.js
```
*57 of 57 unit and integration tests passing (100%).*
