import { initEventSystem } from '../framework/event.js';
import { defineRoutes, navigate, initRouter } from '../framework/router.js';
import { makeElement, render } from '../framework/dom.js';
import {
  getState,
  setState,
  subscribe,
  initState,
  resetHookIndex,
  useState,
} from '../framework/state.js';

const root = document.getElementById('app');

initEventSystem(root);

initState({
  todos:[],
  filter: 'all',
  editingId: null,
  editValue: '',
  hooks: []

});

// Count remaining todos
function remainingCount(todos) {
  return todos.filter(t => !t.completed).length;
}

// Singular/plural
function plural(n) {
  return n === 1 ? 'item' : 'items';
}

// Filter todos based on current filter
function visible(todos, filter) {
  if (filter === 'active') return todos.filter(t => !t.completed);
  if (filter === 'completed') return todos.filter(t => t.completed);
  return todos;  // 'all'
}

function TodoApp(){
    const state = getState();
    const [text, setText] = useState('');

    const left = remainingCount(state.todos);
    const anyDone = state.todos.some(t => t.completed);
    const allDone = left === 0;
    const list = visible(state.todos, state.filter);

    return makeElement('div', {}, [
      makeElement('section', {class: 'todoapp'}, [
        makeElement('header', {class: 'header'}, [
          makeElement('h1', {}, ['todos']),
          makeElement('input', {
            class: 'new-todo',
            placeholder: 'What needs to be done?',
            autofocus: true,
            type: 'text',
            value: text,
            onInput: (e) => setText(e.target.value),
            onKeyDown: (e) => {
              if (e.key === 'Enter'){
                const val = text.trim();
                if (val.length >=2){
                  setState({
                    ...getState(),
                    todos: [
                      ...getState().todos, 
                    {
                      id: Date.now(),
                      text: val,
                      completed: false
                    }]
                  });
                  setText('');
                  e.target.value = '';
                }
              }
            },
            autofocus: true,
          })
        ]),
        
        // ========== MAIN ==========
        makeElement('main', {
          class: 'main',
          style: state.todos.length ? 'display:block' : 'display:none'
        }, [
          
          // Toggle all checkbox
          makeElement('input', {
            class: 'toggle-all',
            id: 'toggle-all',
            type: 'checkbox',
            checked: allDone,
            onChange: () => {
              setState({
                ...getState(),
                todos: getState().todos.map(t => ({
                  ...t,
                  completed: !allDone
                }))
              });
            }
          }),
          
          makeElement('label', {
            class: 'toggle-all-label',
            for: 'toggle-all'
          }, 'Toggle All'),
          
          // Todo list
          makeElement('ul', { class: 'todo-list' },
            list.map(todo => {
              const editing = state.editingId === todo.id;
              const liClass = [
                todo.completed ? 'completed' : '',
                editing ? 'editing' : ''
              ].filter(Boolean).join(' ');
              
              return makeElement('li', {
                class: liClass,
                key: todo.id
              }, [
                
                // View mode
                makeElement('div', { class: 'view' }, [
                  
                  // Toggle checkbox
                  makeElement('input', {
                    class: 'toggle',
                    type: 'checkbox',
                    checked: todo.completed,
                    onChange: () => {
                      setState({
                        ...getState(),
                        todos: getState().todos.map(t =>
                          t.id === todo.id ? { ...t, completed: !t.completed } : t
                        )
                      });
                    }
                  }),
                  
                  // Todo text (double-click to edit)
                  makeElement('label', {
                    ondblclick: () => {
                      setState({
                        ...getState(),
                        editingId: todo.id,
                        editValue: todo.text
                      });
                    }
                  }, todo.text),
                  
                  // Delete button
                  makeElement('button', {
                    class: 'destroy',
                    onClick: () => {
                      setState({
                        ...getState(),
                        todos: getState().todos.filter(t => t.id !== todo.id)
                      });
                    }
                  })
                ]),
                
                // Edit mode (only show if editing)
                editing ? makeElement('input', {
                  class: 'edit',
                  value: state.editValue,
                  onInput: (e) => {
                    setState({ ...getState(), editValue: e.target.value });
                  },
                  onBlur: () => {
                    const val = getState().editValue.trim();
                    if (val && val.length >= 2) {
                      setState({
                        ...getState(),
                        todos: getState().todos.map(t =>
                          t.id === todo.id ? { ...t, text: val } : t
                        ),
                        editingId: null,
                        editValue: ''
                      });
                    }
                  },
                  onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                      e.target.blur();  // Trigger onBlur
                    }
                    if (e.key === 'Escape') {
                      setState({
                        ...getState(),
                        editingId: null,
                        editValue: ''
                      });
                    }
                  }
                }) : null
              ]);
            })
          )
        ]),
        // ========== FOOTER ==========
        makeElement('footer', {
          class: 'footer',
          style: state.todos.length ? 'display:block' : 'display:none'
        }, [
          
          // Item count
          makeElement('span', { class: 'todo-count' },
            `${left} ${plural(left)} left`
          ),
          
          // Filters
          makeElement('ul', { class: 'filters' }, [
            
            makeElement('li', {}, [
              makeElement('a', {
                class: state.filter === 'all' ? 'selected' : '',
                href: '#/',
                onClick: () => navigate('/all')
              }, 'All')
            ]),
            
            makeElement('li', {}, [
              makeElement('a', {
                class: state.filter === 'active' ? 'selected' : '',
                href: '#/active',
                onClick: () => navigate('/active')
              }, 'Active')
            ]),
            
            makeElement('li', {}, [
              makeElement('a', {
                class: state.filter === 'completed' ? 'selected' : '',
                href: '#/completed',
                onClick: () => navigate('/completed')
              }, 'Completed')
            ])
          ]),
          
          // Clear completed button
          anyDone ? makeElement('button', {
            class: 'clear-completed',
            onClick: () => {
              setState({
                ...getState(),
                todos: getState().todos.filter(t => !t.completed)
              });
            }
          }, 'Clear completed') : null
        ])
      ])
    ],
    // footer
    makeElement('footer', { class: 'info' }, [
      makeElement('p', {}, 'Double-click to edit a todo'),
      makeElement('p', {}, 'Created by the mini-framework team'),
      makeElement('p', {}, 'Part of TodoMVC')
    ])
  );
}


function NotFound() {
  return makeElement('div', { class: 'not-found' }, [
    makeElement('h1', {}, '404 - Page Not Found'),
    makeElement('p', {}, 'The page you are looking for does not exist.'),
    makeElement('a', {
      href: '#/',
      onClick: () => navigate('/')
    }, 'Go to Home')
  ]);
}

// / Subscribe to state changes - re-render on every change
subscribe(() => {
  resetHookIndex();
  render(TodoApp(), root);
});

// Define routes
defineRoutes([
  { path: '/', view: TodoApp },
  { path: '/all', view: TodoApp },
  { path: '/active', view: TodoApp },
  { path: '/completed', view: TodoApp },
  { path: '*', view: NotFound }
]);

// Start the router
initRouter();