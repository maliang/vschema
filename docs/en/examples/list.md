# List Examples

## Todo List

```json
{
  "data": { "todos": [], "newTodo": "", "filter": "all" },
  "computed": {
    "filteredTodos": "filter === 'all' ? todos : filter === 'active' ? todos.filter(t => !t.done) : todos.filter(t => t.done)",
    "remaining": "todos.filter(t => !t.done).length"
  },
  "methods": {
    "addTodo": {
      "if": "newTodo.trim()",
      "then": [
        { "set": "todos", "value": "{{ [...todos, { id: Date.now(), text: newTodo.trim(), done: false }] }}" },
        { "set": "newTodo", "value": "" }
      ]
    },
    "toggleTodo": {
      "set": "todos",
      "value": "{{ todos.map(t => t.id === $event ? { ...t, done: !t.done } : t) }}"
    },
    "removeTodo": {
      "set": "todos",
      "value": "{{ todos.filter(t => t.id !== $event) }}"
    }
  },
  "com": "div",
  "children": [
    { "com": "h2", "children": "Todo List ({{ remaining }} remaining)" },
    {
      "com": "div",
      "children": [
        {
          "com": "input",
          "model": "newTodo",
          "props": { "placeholder": "Add new task..." },
          "events": { "keyup.enter": { "call": "addTodo" } }
        },
        { "com": "button", "events": { "click": { "call": "addTodo" } }, "children": "Add" }
      ]
    },
    {
      "com": "ul",
      "children": [
        {
          "for": "todo in filteredTodos",
          "key": "{{ todo.id }}",
          "com": "li",
          "children": [
            {
              "com": "input",
              "props": { "type": "checkbox", "checked": "{{ todo.done }}" },
              "events": { "change": { "call": "toggleTodo", "args": ["{{ todo.id }}"] } }
            },
            { "com": "span", "children": "{{ todo.text }}" },
            {
              "com": "button",
              "events": { "click": { "call": "removeTodo", "args": ["{{ todo.id }}"] } },
              "children": "Delete"
            }
          ]
        }
      ]
    }
  ]
}
```
