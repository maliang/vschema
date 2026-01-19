# 列表示例

## 待办事项

```json
{
  "data": {
    "todos": [],
    "newTodo": "",
    "filter": "all"
  },
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
  "props": { "class": "todo-app" },
  "children": [
    { "com": "h2", "children": "待办事项 ({{ remaining }} 项未完成)" },
    {
      "com": "div",
      "children": [
        {
          "com": "input",
          "model": "newTodo",
          "props": { "placeholder": "添加新任务..." },
          "events": { "keyup.enter": { "call": "addTodo" } }
        },
        {
          "com": "button",
          "events": { "click": { "call": "addTodo" } },
          "children": "添加"
        }
      ]
    },
    {
      "com": "div",
      "props": { "class": "filters" },
      "children": [
        { "com": "button", "events": { "click": { "set": "filter", "value": "all" } }, "children": "全部" },
        { "com": "button", "events": { "click": { "set": "filter", "value": "active" } }, "children": "未完成" },
        { "com": "button", "events": { "click": { "set": "filter", "value": "completed" } }, "children": "已完成" }
      ]
    },
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
              "events": { "change": { "call": "toggleTodo", "args": ["{{ todo.id }}"] } }
            },
            { "com": "span", "children": "{{ todo.text }}" },
            {
              "com": "button",
              "events": { "click": { "call": "removeTodo", "args": ["{{ todo.id }}"] } },
              "children": "删除"
            }
          ]
        }
      ]
    }
  ]
}
```

## 数据表格

```json
{
  "data": {
    "columns": [
      { "key": "id", "title": "ID", "width": "80px" },
      { "key": "name", "title": "姓名" },
      { "key": "email", "title": "邮箱" },
      { "key": "status", "title": "状态" }
    ],
    "users": [
      { "id": 1, "name": "张三", "email": "zhangsan@example.com", "status": "active" },
      { "id": 2, "name": "李四", "email": "lisi@example.com", "status": "inactive" }
    ]
  },
  "com": "table",
  "props": { "class": "data-table" },
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
              "props": { "style": { "width": "{{ col.width || 'auto' }}" } },
              "children": "{{ col.title }}"
            },
            { "com": "th", "children": "操作" }
          ]
        }
      ]
    },
    {
      "com": "tbody",
      "children": [
        {
          "for": "user in users",
          "key": "{{ user.id }}",
          "com": "tr",
          "children": [
            {
              "for": "col in columns",
              "key": "{{ col.key }}",
              "com": "td",
              "children": "{{ user[col.key] }}"
            },
            {
              "com": "td",
              "children": [
                { "com": "button", "children": "编辑" },
                { "com": "button", "children": "删除" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```
