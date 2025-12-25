# Mini Framework Documentation

## Features

This framework has four main features:

1. **DOM Abstraction** - Creates and updates HTML efficiently using a Virtual DOM
2. **State Management** - Stores application data in one place
3. **Event Handling** - Manages user interactions like clicks and typing
4. **Routing** - Changes pages without reloading the browser

## How to Create an Element

Use the `makeElement` function to create elements:
```javascript
makeElement(tag, attributes, children)
```

### Example 1: Simple element
```javascript
const heading = makeElement('h1', {}, 'Hello World');
```

Creates:
```html
<h1>Hello World</h1>
```

### Example 2: Element with attributes
```javascript
const button = makeElement('button', { 
  class: 'btn',
  id: 'submit'
}, 'Submit');
```

Creates:
```html
<button class="btn" id="submit">Submit</button>
```

### Example 3: Element with children
```javascript
const card = makeElement('div', { class: 'card' }, [
  makeElement('h2', {}, 'Title'),
  makeElement('p', {}, 'Description')
]);
```

Creates:
```html
<div class="card">
  <h2>Title</h2>
  <p>Description</p>
</div>
```

## How to Nest Elements

Put elements inside the children array of another element:
```javascript
const page = makeElement('div', { class: 'container' }, [
  makeElement('header', {}, [
    makeElement('h1', {}, 'My Website'),
    makeElement('nav', {}, [
      makeElement('a', { href: '#home' }, 'Home'),
      makeElement('a', { href: '#about' }, 'About')
    ])
  ]),
  makeElement('main', {}, [
    makeElement('p', {}, 'Welcome')
  ])
]);
```

Creates:
```html
<div class="container">
  <header>
    <h1>My Website</h1>
    <nav>
      <a href="#home">Home</a>
      <a href="#about">About</a>
    </nav>
  </header>
  <main>
    <p>Welcome</p>
  </main>
</div>
```

## How to Add Attributes

Pass attributes as an object in the second parameter:
```javascript
const input = makeElement('input', {
  type: 'text',
  class: 'form-input',
  id: 'username',
  placeholder: 'Enter name',
  value: 'Ahmed'
}, []);
```

Creates:
```html
<input type="text" class="form-input" id="username" placeholder="Enter name" value="Ahmed">
```

## How to Create Events

Add events as attributes that start with `on`:

### Example 1: Click event
```javascript
const button = makeElement('button', {
  onClick: () => {
    console.log('Clicked!');
  }
}, 'Click Me');
```

### Example 2: Input event
```javascript
const input = makeElement('input', {
  type: 'text',
  onInput: (event) => {
    console.log('User typed:', event.target.value);
  }
});
```

### Example 3: Keyboard event
```javascript
const input = makeElement('input', {
  onKeyDown: (event) => {
    if (event.key === 'Enter') {
      console.log('Enter pressed!');
    }
  }
});
```

### Available events:

- `onClick` - Element clicked
- `onInput` - Input value changed
- `onChange` - Input lost focus after change
- `onKeyDown` - Key pressed down
- `onKeyUp` - Key released
- `onFocus` - Element focused
- `onBlur` - Element lost focus

## Why Things Work This Way

### Virtual DOM

The real DOM is slow. When you change HTML, the browser recalculates everything.

Our approach:
1. Create a JavaScript object (Virtual DOM) - fast
2. Compare old and new objects - fast
3. Find what changed - fast
4. Update only changed parts in real DOM - one update instead of many

This makes updates much faster.

### Event Delegation

Without delegation: If you have 100 buttons, you attach 100 listeners. This uses lots of memory.

With delegation:
1. Attach ONE listener to parent container
2. When button clicked, event goes up to parent
3. Parent checks which button was clicked
4. Parent calls correct handler

Uses less memory and is faster.

### Centralized State

All data is stored in one place. When state changes, the page updates automatically.

Benefits:
- Easy to track data
- Easy to debug
- Components update automatically
- No scattered data

### Hash Routing

Uses URL part after `#` symbol: `website.com/#/about`

Benefits:
- Works without server setup
- Page does not reload
- Back/forward buttons work
- Easy to implement

When hash changes, browser fires `hashchange` event. We listen and update the view.

## Code Example: Complete App
```javascript
import { makeElement, render } from './framework/dom.js';
import { initState, getState, setState, subscribe, resetHookIndex, useState } from './framework/state.js';
import { initEventSystem } from './framework/event.js';

const root = document.getElementById('app');

initEventSystem(root);

initState({
  count: 0,
  hooks: []
});

function App() {
  const state = getState();
  
  return makeElement('div', {}, [
    makeElement('h1', {}, `Count: ${state.count}`),
    makeElement('button', {
      onClick: () => {
        setState({ count: state.count + 1 });
      }
    }, 'Increment')
  ]);
}

subscribe(() => {
  resetHookIndex();
  render(App(), root);
});

resetHookIndex();
render(App(), root);
```