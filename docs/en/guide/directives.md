# Directives

VSchema supports Vue-like conditional and loop rendering directives.

## Conditional Rendering

### if Directive

Use `if` property for conditional rendering, similar to Vue's `v-if`:

```json
{
  "com": "div",
  "if": "isLoggedIn",
  "children": "Welcome back!"
}
```

When condition is `false`, element is not rendered to DOM.

### Complex Conditions

```json
{
  "com": "div",
  "if": "user && user.role === 'admin'",
  "children": "Admin Panel"
}
```

```json
{
  "com": "span",
  "if": "items.length > 0",
  "children": "Total {{ items.length }} items"
}
```

### Conditional Branches

Use multiple nodes to implement if-else logic:

```json
{
  "com": "div",
  "children": [
    {
      "com": "div",
      "if": "loading",
      "children": "Loading..."
    },
    {
      "com": "div",
      "if": "!loading && error",
      "children": "Error: {{ error }}"
    },
    {
      "com": "div",
      "if": "!loading && !error",
      "children": "{{ data }}"
    }
  ]
}
```

### show Directive

Use `show` to control visibility, similar to Vue's `v-show`:

```json
{
  "com": "div",
  "show": "isVisible",
  "children": "This content can be shown/hidden"
}
```

Difference from `if`:
- `if`: Does not render DOM when false
- `show`: Hides via CSS `display: none` when false

### When to Use

| Scenario | Recommended |
|----------|-------------|
| Frequent toggling | `show` - Avoid re-render overhead |
| Initially not rendered | `if` - Reduce initial render |
| Contains many child nodes | `if` - Skip entirely when false |

## Loop Rendering

### for Directive

Use `for` for loop rendering, similar to Vue's `v-for`:

```json
{
  "data": { "items": ["Apple", "Banana", "Orange"] },
  "com": "ul",
  "children": [
    {
      "for": "item in items",
      "com": "li",
      "children": "{{ item }}"
    }
  ]
}
```

### With Index

```json
{
  "for": "(item, index) in items",
  "com": "li",
  "children": "{{ index + 1 }}. {{ item }}"
}
```

### Object Array

```json
{
  "data": {
    "users": [
      { "id": 1, "name": "John" },
      { "id": 2, "name": "Jane" }
    ]
  },
  "com": "ul",
  "children": [
    {
      "for": "user in users",
      "key": "{{ user.id }}",
      "com": "li",
      "children": "{{ user.name }}"
    }
  ]
}
```

### key Property

Use `key` for unique identification, optimizes rendering performance:

```json
{
  "for": "item in items",
  "key": "{{ item.id }}",
  "com": "div",
  "children": "{{ item.name }}"
}
```

::: warning Important
Always provide `key` when list may be reordered or have add/remove operations.
:::

### Nested Loops

```json
{
  "data": {
    "categories": [
      { "name": "Fruits", "items": ["Apple", "Banana"] },
      { "name": "Vegetables", "items": ["Carrot", "Broccoli"] }
    ]
  },
  "com": "div",
  "children": [
    {
      "for": "category in categories",
      "com": "div",
      "children": [
        { "com": "h3", "children": "{{ category.name }}" },
        {
          "com": "ul",
          "children": [
            {
              "for": "item in category.items",
              "com": "li",
              "children": "{{ item }}"
            }
          ]
        }
      ]
    }
  ]
}
```

### Events in Loops

```json
{
  "for": "(item, index) in items",
  "key": "{{ item.id }}",
  "com": "div",
  "children": [
    { "com": "span", "children": "{{ item.name }}" },
    {
      "com": "button",
      "events": {
        "click": {
          "set": "items",
          "value": "{{ items.filter((_, i) => i !== index) }}"
        }
      },
      "children": "Delete"
    }
  ]
}
```

### Empty List Handling

```json
{
  "com": "div",
  "children": [
    {
      "com": "ul",
      "if": "items.length > 0",
      "children": [
        {
          "for": "item in items",
          "com": "li",
          "children": "{{ item.name }}"
        }
      ]
    },
    {
      "com": "p",
      "if": "items.length === 0",
      "children": "No data available"
    }
  ]
}
```

## Combined Usage

### if + for

```json
{
  "for": "item in items",
  "if": "item.visible",
  "com": "div",
  "children": "{{ item.name }}"
}
```

::: tip Execution Order
`if` executes after `for`, meaning loop first then check each element.
:::

### Filtering Lists

For filtering entire lists, use computed properties:

```json
{
  "data": { "items": [], "showActive": true },
  "computed": {
    "filteredItems": "showActive ? items.filter(i => i.active) : items"
  },
  "com": "ul",
  "children": [
    {
      "for": "item in filteredItems",
      "com": "li",
      "children": "{{ item.name }}"
    }
  ]
}
```

## Practical Examples

### Todo List

```json
{
  "data": {
    "todos": [
      { "id": 1, "text": "Learn VSchema", "done": false },
      { "id": 2, "text": "Write docs", "done": true }
    ],
    "filter": "all"
  },
  "computed": {
    "filteredTodos": "filter === 'all' ? todos : filter === 'active' ? todos.filter(t => !t.done) : todos.filter(t => t.done)"
  },
  "com": "div",
  "children": [
    {
      "com": "ul",
      "children": [
        {
          "for": "todo in filteredTodos",
          "key": "{{ todo.id }}",
          "com": "li",
          "props": { "class": "{{ todo.done ? 'completed' : '' }}" },
          "children": [
            {
              "com": "input",
              "props": { "type": "checkbox", "checked": "{{ todo.done }}" },
              "events": {
                "change": {
                  "set": "todos",
                  "value": "{{ todos.map(t => t.id === todo.id ? { ...t, done: !t.done } : t) }}"
                }
              }
            },
            { "com": "span", "children": "{{ todo.text }}" }
          ]
        }
      ]
    },
    {
      "com": "p",
      "if": "filteredTodos.length === 0",
      "children": "No todos"
    }
  ]
}
```

### Table Rendering

```json
{
  "data": {
    "columns": [
      { "key": "name", "title": "Name" },
      { "key": "age", "title": "Age" },
      { "key": "email", "title": "Email" }
    ],
    "rows": [
      { "name": "John", "age": 25, "email": "john@example.com" },
      { "name": "Jane", "age": 30, "email": "jane@example.com" }
    ]
  },
  "com": "table",
  "children": [
    {
      "com": "thead",
      "children": [
        {
          "com": "tr",
          "children": [
            {
              "for": "col in columns",
              "key": "{{ col.key }}",
              "com": "th",
              "children": "{{ col.title }}"
            }
          ]
        }
      ]
    },
    {
      "com": "tbody",
      "children": [
        {
          "for": "(row, rowIndex) in rows",
          "key": "{{ rowIndex }}",
          "com": "tr",
          "children": [
            {
              "for": "col in columns",
              "key": "{{ col.key }}",
              "com": "td",
              "children": "{{ row[col.key] }}"
            }
          ]
        }
      ]
    }
  ]
}
```
