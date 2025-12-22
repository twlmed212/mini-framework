import { makeElement, render } from '/src/framework/dom.js';

const root = document.getElementById('app');

// Test 1: Initial render
console.log('Test 1: Initial render');
const vnode1 = makeElement('div', { class: 'container' }, [
  makeElement('h1', {}, 'Hello'),
  makeElement('p', {}, 'This is a test')
]);

render(vnode1, root);

// Test 2: Update text
setTimeout(() => {
  console.log('Test 2: Update text');
  const vnode2 = makeElement('div', { class: 'container' }, [
    makeElement('h1', {}, 'Hello World'),  // Changed text
    makeElement('p', {}, 'This is a test')
  ]);
  render(vnode2, root);
}, 1000);

// Test 3: Add element
setTimeout(() => {
  console.log('Test 3: Add element');
  const vnode3 = makeElement('div', { class: 'container' }, [
    makeElement('h1', {}, 'Hello World'),
    makeElement('p', {}, 'This is a test'),
    makeElement('button', {}, 'Click me')  // New element
  ]);
  render(vnode3, root);
}, 2000);