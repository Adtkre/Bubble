/**
 * BUBBLE - Dart & Flutter Learn Mode Knowledge Base
 * Educational lessons, Dart syntax breakdowns, and beginner advice for visual blocks.
 */

(function (window) {
  'use strict';

  const DartLearn = {
    lessons: {
      'widget_text': {
        title: 'Flutter Text Widget',
        summary: 'Displays a run of styled text in your mobile app.',
        dartSnippet: `Text(
  'Hello World',
  style: TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
  ),
)`,
        explanation: 'In Flutter, almost everything on screen is a Widget. The Text widget is the primary way to present text to users. When bound to a state variable (e.g. "$message"), Flutter automatically updates what users see whenever setState() is called!',
        beginnerMistake: 'Forgetting string interpolation! If you want to display a variable inside text, write "$counter" rather than "counter".',
        flutterTip: 'Use TextStyle to customize size, weight, letter spacing, and font colors.'
      },

      'widget_button': {
        title: 'ElevatedButton & Taps',
        summary: 'A 3D elevated Material button that responds to user touch.',
        dartSnippet: `ElevatedButton(
  onPressed: () {
    print('Button tapped!');
  },
  child: const Text('Click Me'),
)`,
        explanation: 'ElevatedButtons have an "onPressed" parameter. In Dart, this is a callback function—a bundle of code that sits waiting until someone touches the button on their phone.',
        beginnerMistake: 'Passing a function call with parentheses instead of the function itself! If you write onPressed: myFunction(), it runs immediately when the page loads instead of on tap.',
        flutterTip: 'Setting onPressed: null automatically disables the button and grays it out.'
      },

      'widget_scaffold': {
        title: 'Scaffold & Screen Structure',
        summary: 'The foundational canvas for an entire mobile screen.',
        dartSnippet: `Scaffold(
  appBar: AppBar(title: const Text('Home')),
  body: Center(child: Text('Screen Content')),
  floatingActionButton: FloatingActionButton(onPressed: () {}),
)`,
        explanation: 'The Scaffold implements the basic Material Design visual layout structure for a mobile screen. It provides standard slots for an AppBar header, screen body, drawer menu, and bottom navigation.',
        beginnerMistake: 'Trying to add buttons directly to MaterialApp without a Scaffold, which causes text to have ugly yellow double-underlines.',
        flutterTip: 'Almost every new screen in a Flutter app begins with a Scaffold.'
      },

      'var_declare': {
        title: 'State Variables in Dart',
        summary: 'Containers in computer memory that hold data that can change.',
        dartSnippet: `int counter = 0;
String username = 'Alex';
bool isOnline = true;`,
        explanation: 'Dart is a strongly-typed language. Every variable has a type: "int" for whole numbers, "double" for decimals, "String" for text, and "bool" for true/false. Storing values in state variables allows your app to remember user actions.',
        beginnerMistake: 'Attempting to store text inside an int variable (e.g., int age = "twenty";). Dart will show a type mismatch compile error.',
        flutterTip: 'State variables live inside the State class so they persist across re-renders.'
      },

      'state_set': {
        title: 'setState(() { ... }) in Flutter',
        summary: 'Tells the Flutter framework that state has changed and to re-draw the UI.',
        dartSnippet: `setState(() {
  counter++;
});`,
        explanation: 'When a variable changes in a mobile app, the phone screen doesn\'t automatically know. Calling setState() notifies Flutter to execute your changes and immediately rebuild the widget tree with new values.',
        beginnerMistake: 'Modifying state variables outside of setState(). The value in memory changes, but the phone screen never updates to show it!',
        flutterTip: 'Keep code inside setState() short and focused purely on state mutations.'
      },

      'event_button_pressed': {
        title: 'Event Handlers & User Gestures',
        summary: 'Listens for physical touch events on mobile screens.',
        dartSnippet: `void _onButtonPress() {
  setState(() {
    message = "Welcome!";
  });
}`,
        explanation: 'Event-driven programming powers all modern mobile operating systems. Rather than running code top-to-bottom once, mobile apps wait for events (taps, swipes, text typing) and respond dynamically.',
        beginnerMistake: 'Running heavy operations (like massive loops or file downloads) directly on the UI thread, which can freeze screen animations.',
        flutterTip: 'Connect event blocks directly to state update blocks to see immediate results.'
      },

      'logic_if': {
        title: 'Conditional Logic (if / else)',
        summary: 'Makes smart decisions based on true or false conditions.',
        dartSnippet: `if (score >= 10) {
  message = "You won!";
} else {
  message = "Keep playing!";
}`,
        explanation: 'Computers make decisions using boolean logic. If the test condition evaluates to true, the code inside the block executes; otherwise, it skips or branches into the else block.',
        beginnerMistake: 'Using a single equals "=" (assignment) instead of double equals "==" (comparison) when checking if two values match!',
        flutterTip: 'Use comparisons like ">", "<", "==", and "!=" to build game rules and validation.'
      },

      'widget_textfield': {
        title: 'TextField & User Input',
        summary: 'Lets users type text, numbers, and messages using the mobile keyboard.',
        dartSnippet: `TextField(
  decoration: InputDecoration(hintText: 'Enter name'),
  onChanged: (text) {
    setState(() => userName = text);
  },
)`,
        explanation: 'TextField captures keystrokes from the software keyboard. The onChanged listener fires every time a letter is added or deleted.',
        beginnerMistake: 'Not handling empty inputs when users press submit before typing anything.',
        flutterTip: 'Always provide a clear placeholder / hintText so users understand what to type.'
      }
    },

    getLesson(blockType) {
      return this.lessons[blockType] || {
        title: `Dart Concept: ${blockType}`,
        summary: 'A visual block representing Dart programming logic or a Flutter widget.',
        dartSnippet: `// Dart implementation for ${blockType}`,
        explanation: 'This block connects your visual mobile app logic directly to clean Flutter Dart code.',
        beginnerMistake: 'Check block property settings to ensure all required fields are set.',
        flutterTip: 'Inspect the generated Dart tab below to see how this block translates to code.'
      };
    }
  };

  window.BubbleDartLearn = DartLearn;
})(window);
