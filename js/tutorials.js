/**
 * BUBBLE - Guided Mini-Projects & Starter App Templates
 * Pre-configured block programs for Hello World, Counter, Calculator, Login Form, and To-Do.
 */

(function (window) {
  'use strict';

  const Tutorials = {
    // 1. Hello World Starter
    getHelloWorld() {
      return {
        id: 'hello_world',
        title: 'Hello World App',
        icon: '👋',
        level: 'Beginner',
        description: 'Learn the basics of the Flutter Scaffold, AppBar, styled Text, and an interactive greeting button.',
        concept: 'Widgets, Scaffold, and Button Taps',
        blocks: [
          {
            id: 'block_hw_scaffold',
            type: 'widget_scaffold',
            category: 'layout',
            fields: { appBarTitle: 'Hello World App', appBarColor: '#0284c7', backgroundColor: '#f8fafc' },
            children: [
              {
                id: 'block_hw_icon',
                type: 'widget_icon',
                category: 'widgets',
                fields: { iconName: 'favorite', color: '#e11d48', size: 48 }
              },
              {
                id: 'block_hw_text',
                type: 'widget_text',
                category: 'widgets',
                fields: { text: 'Welcome to Mobile App Coding!', fontSize: 22, fontWeight: 'bold', color: '#0f172a', isVariable: true, variableName: 'message' }
              },
              {
                id: 'block_hw_btn',
                type: 'widget_button',
                category: 'widgets',
                fields: { label: 'Say Hello 👋', color: '#0284c7', textColor: '#ffffff', actionHandler: 'custom_event' }
              }
            ]
          },
          {
            id: 'block_hw_var',
            type: 'var_declare',
            category: 'variables',
            fields: { varName: 'message', varType: 'String', initValue: 'Welcome to Mobile App Coding!' }
          },
          {
            id: 'block_hw_event',
            type: 'event_button_pressed',
            category: 'events',
            fields: { buttonLabel: 'Say Hello 👋' },
            children: [
              {
                id: 'block_hw_upd',
                type: 'state_update_text',
                category: 'state',
                fields: { targetVariable: 'message', newText: 'Hello from Flutter! You built your first app! 🎉' }
              },
              {
                id: 'block_hw_snack',
                type: 'action_show_snackbar',
                category: 'events',
                fields: { message: 'Greeting updated successfully!' }
              }
            ]
          }
        ]
      };
    },

    // 2. Flutter Classic Counter App
    getCounterApp() {
      return {
        id: 'counter_app',
        title: 'Interactive Counter App',
        icon: '🔢',
        level: 'Core Concept',
        description: 'The iconic Flutter starter project! Uses an int state variable, increment logic, and dynamic screen updates.',
        concept: 'Stateful Widgets & setState()',
        blocks: [
          {
            id: 'block_cnt_scaffold',
            type: 'widget_scaffold',
            category: 'layout',
            fields: { appBarTitle: 'Flutter Counter', appBarColor: '#0284c7', backgroundColor: '#f0f9ff' },
            children: [
              {
                id: 'block_cnt_t1',
                type: 'widget_text',
                category: 'widgets',
                fields: { text: 'You have pushed the button this many times:', fontSize: 15, fontWeight: 'normal', color: '#64748b', isVariable: false }
              },
              {
                id: 'block_cnt_t2',
                type: 'widget_text',
                category: 'widgets',
                fields: { text: '0', fontSize: 44, fontWeight: 'bold', color: '#0284c7', isVariable: true, variableName: 'counter' }
              },
              {
                id: 'block_cnt_btn',
                type: 'widget_button',
                category: 'widgets',
                fields: { label: 'Tap to Increment (+1)', color: '#0284c7', textColor: '#ffffff', actionHandler: 'increment_counter' }
              }
            ]
          },
          {
            id: 'block_cnt_var',
            type: 'var_declare',
            category: 'variables',
            fields: { varName: 'counter', varType: 'int', initValue: '0' }
          },
          {
            id: 'block_cnt_event',
            type: 'event_button_pressed',
            category: 'events',
            fields: { buttonLabel: 'Tap to Increment (+1)' },
            children: [
              {
                id: 'block_cnt_inc',
                type: 'state_increment',
                category: 'state',
                fields: { varName: 'counter' }
              }
            ]
          }
        ]
      };
    },

    // 3. Simple Calculator App
    getCalculatorApp() {
      return {
        id: 'calculator_app',
        title: 'Calculator App',
        icon: '🧮',
        level: 'Intermediate',
        description: 'Perform arithmetic operations, display numeric results, and handle mathematical expressions.',
        concept: 'Operators, Math, and Inputs',
        blocks: [
          {
            id: 'block_calc_scaffold',
            type: 'widget_scaffold',
            category: 'layout',
            fields: { appBarTitle: 'Pocket Calculator', appBarColor: '#059669', backgroundColor: '#f8fafc' },
            children: [
              {
                id: 'block_calc_card',
                type: 'widget_container',
                category: 'layout',
                fields: { padding: 20, margin: 8, color: '#ecfdf5', borderRadius: 16 },
                children: [
                  {
                    id: 'block_calc_label',
                    type: 'widget_text',
                    category: 'widgets',
                    fields: { text: 'Result: 42', fontSize: 28, fontWeight: 'bold', color: '#065f46', isVariable: true, variableName: 'result' }
                  }
                ]
              },
              {
                id: 'block_calc_btn_add',
                type: 'widget_button',
                category: 'widgets',
                fields: { label: 'Add (+5)', color: '#059669', textColor: '#ffffff' }
              },
              {
                id: 'block_calc_btn_reset',
                type: 'widget_button',
                category: 'widgets',
                fields: { label: 'Reset to Zero', color: '#dc2626', textColor: '#ffffff' }
              }
            ]
          },
          {
            id: 'block_calc_var',
            type: 'var_declare',
            category: 'variables',
            fields: { varName: 'result', varType: 'int', initValue: '42' }
          },
          {
            id: 'block_calc_event_add',
            type: 'event_button_pressed',
            category: 'events',
            fields: { buttonLabel: 'Add (+5)' },
            children: [
              {
                id: 'block_calc_set',
                type: 'var_set',
                category: 'variables',
                fields: { varName: 'result', value: 'result + 5' }
              }
            ]
          }
        ]
      };
    },

    // 4. Login Form UI
    getLoginForm() {
      return {
        id: 'login_form',
        title: 'Mobile Login Form',
        icon: '🔑',
        level: 'Intermediate',
        description: 'Build a realistic mobile login interface with TextFields, password protection, and validation alert.',
        concept: 'TextFields, User Input, and Validation',
        blocks: [
          {
            id: 'block_login_scaffold',
            type: 'widget_scaffold',
            category: 'layout',
            fields: { appBarTitle: 'Account Sign In', appBarColor: '#4f46e5', backgroundColor: '#f5f3ff' },
            children: [
              {
                id: 'block_login_icon',
                type: 'widget_icon',
                category: 'widgets',
                fields: { iconName: 'home', color: '#4f46e5', size: 40 }
              },
              {
                id: 'block_login_title',
                type: 'widget_text',
                category: 'widgets',
                fields: { text: 'Welcome Back!', fontSize: 24, fontWeight: 'bold', color: '#1e1b4b', isVariable: false }
              },
              {
                id: 'block_login_email',
                type: 'widget_textfield',
                category: 'widgets',
                fields: { placeholder: 'Enter your email address', bindVariable: 'emailInput' }
              },
              {
                id: 'block_login_btn',
                type: 'widget_button',
                category: 'widgets',
                fields: { label: 'Sign In to Account', color: '#4f46e5', textColor: '#ffffff' }
              }
            ]
          },
          {
            id: 'block_login_var',
            type: 'var_declare',
            category: 'variables',
            fields: { varName: 'emailInput', varType: 'String', initValue: 'alex@example.com' }
          },
          {
            id: 'block_login_event',
            type: 'event_button_pressed',
            category: 'events',
            fields: { buttonLabel: 'Sign In to Account' },
            children: [
              {
                id: 'block_login_snack',
                type: 'action_show_snackbar',
                category: 'events',
                fields: { message: 'Signed in successfully! Welcome.' }
              }
            ]
          }
        ]
      };
    },

    // 5. To-Do List App
    getTodoList() {
      return {
        id: 'todo_app',
        title: 'Task Tracker & To-Do',
        icon: '📝',
        level: 'Advanced',
        description: 'A mobile task management app using Dart Lists, scrollable ListView widgets, and dynamic item additions.',
        concept: 'List<String>, ListView, and Collections',
        blocks: [
          {
            id: 'block_todo_scaffold',
            type: 'widget_scaffold',
            category: 'layout',
            fields: { appBarTitle: 'Daily Tasks', appBarColor: '#7c3aed', backgroundColor: '#faf5ff' },
            children: [
              {
                id: 'block_todo_inp',
                type: 'widget_textfield',
                category: 'widgets',
                fields: { placeholder: 'What needs to be done?', bindVariable: 'newTask' }
              },
              {
                id: 'block_todo_btn',
                type: 'widget_button',
                category: 'widgets',
                fields: { label: '+ Add New Task', color: '#7c3aed', textColor: '#ffffff' }
              },
              {
                id: 'block_todo_list',
                type: 'widget_listview',
                category: 'layout',
                fields: { padding: 8 },
                children: [
                  {
                    id: 'block_todo_item1',
                    type: 'widget_text',
                    category: 'widgets',
                    fields: { text: '✓ Design app interface with blocks', fontSize: 16, fontWeight: 'normal', color: '#475569', isVariable: false }
                  },
                  {
                    id: 'block_todo_item2',
                    type: 'widget_text',
                    category: 'widgets',
                    fields: { text: '✓ Inspect generated Flutter Dart code', fontSize: 16, fontWeight: 'normal', color: '#475569', isVariable: false }
                  },
                  {
                    id: 'block_todo_item3',
                    type: 'widget_text',
                    category: 'widgets',
                    fields: { text: '○ Test live phone simulator interactions', fontSize: 16, fontWeight: 'bold', color: '#7c3aed', isVariable: false }
                  }
                ]
              }
            ]
          },
          {
            id: 'block_todo_var_list',
            type: 'list_create',
            category: 'lists',
            fields: { listName: 'tasks', initialItems: 'Design UI, Learn Dart, Build App' }
          },
          {
            id: 'block_todo_event',
            type: 'event_button_pressed',
            category: 'events',
            fields: { buttonLabel: '+ Add New Task' },
            children: [
              {
                id: 'block_todo_snack',
                type: 'action_show_snackbar',
                category: 'events',
                fields: { message: 'New task added to your Flutter list!' }
              }
            ]
          }
        ]
      };
    },

    // Blank Flutter App
    getBlankApp() {
      return {
        id: 'blank_app',
        title: 'Blank Flutter App',
        icon: '📱',
        level: 'Custom',
        description: 'Start from scratch with a clean Flutter Scaffold and build whatever mobile app you imagine.',
        concept: 'Custom Flutter Application',
        blocks: [
          {
            id: 'block_blank_scaffold',
            type: 'widget_scaffold',
            category: 'layout',
            fields: { appBarTitle: 'My Flutter App', appBarColor: '#0284c7', backgroundColor: '#f8fafc' },
            children: [
              {
                id: 'block_blank_text',
                type: 'widget_text',
                category: 'widgets',
                fields: { text: 'Drag blocks from the library to build your app!', fontSize: 16, fontWeight: 'normal', color: '#64748b' }
              }
            ]
          }
        ]
      };
    },

    getAllTutorials() {
      return [
        this.getBlankApp(),
        this.getHelloWorld(),
        this.getCounterApp(),
        this.getCalculatorApp(),
        this.getLoginForm(),
        this.getTodoList()
      ];
    },

    getTutorialById(id) {
      const all = this.getAllTutorials();
      return all.find(t => t.id === id) || this.getBlankApp();
    }
  };

  window.BubbleTutorials = Tutorials;
})(window);
