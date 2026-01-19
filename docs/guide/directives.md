# 条件与循环

VSchema 支持类似 Vue 的条件渲染和循环渲染指令。

## 条件渲染

### if 指令

使用 `if` 属性进行条件渲染，类似 Vue 的 `v-if`：

```json
{
  "com": "div",
  "if": "isLoggedIn",
  "children": "欢迎回来！"
}
```

当条件为 `false` 时，元素不会被渲染到 DOM 中。

### 复杂条件

```json
{
  "com": "div",
  "if": "user && user.role === 'admin'",
  "children": "管理员面板"
}
```

```json
{
  "com": "span",
  "if": "items.length > 0",
  "children": "共 {{ items.length }} 条数据"
}
```

### 条件分支

使用多个节点实现 if-else 逻辑：

```json
{
  "com": "div",
  "children": [
    {
      "com": "div",
      "if": "loading",
      "children": "加载中..."
    },
    {
      "com": "div",
      "if": "!loading && error",
      "children": "错误: {{ error }}"
    },
    {
      "com": "div",
      "if": "!loading && !error",
      "children": "{{ data }}"
    }
  ]
}
```

### show 指令

使用 `show` 属性控制显示/隐藏，类似 Vue 的 `v-show`：

```json
{
  "com": "div",
  "show": "isVisible",
  "children": "这段内容可以显示/隐藏"
}
```

与 `if` 的区别：
- `if`: 条件为 false 时不渲染 DOM
- `show`: 条件为 false 时通过 CSS `display: none` 隐藏

### 何时使用

| 场景 | 推荐 |
|------|------|
| 频繁切换 | `show` - 避免重复渲染开销 |
| 初始不渲染 | `if` - 减少初始渲染量 |
| 包含大量子节点 | `if` - 条件为 false 时完全跳过 |

## 循环渲染

### for 指令

使用 `for` 属性进行循环渲染，类似 Vue 的 `v-for`：

```json
{
  "data": {
    "items": ["苹果", "香蕉", "橙子"]
  },
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

### 带索引的循环

```json
{
  "for": "(item, index) in items",
  "com": "li",
  "children": "{{ index + 1 }}. {{ item }}"
}
```

### 对象数组

```json
{
  "data": {
    "users": [
      { "id": 1, "name": "张三" },
      { "id": 2, "name": "李四" }
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

### key 属性

使用 `key` 属性提供唯一标识，优化渲染性能：

```json
{
  "for": "item in items",
  "key": "{{ item.id }}",
  "com": "div",
  "children": "{{ item.name }}"
}
```

::: warning 重要
当列表可能重新排序或有增删操作时，务必提供 `key`。
:::

### 嵌套循环

```json
{
  "data": {
    "categories": [
      {
        "name": "水果",
        "items": ["苹果", "香蕉"]
      },
      {
        "name": "蔬菜",
        "items": ["白菜", "萝卜"]
      }
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

### 循环中的事件

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
      "children": "删除"
    }
  ]
}
```

### 空列表处理

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
      "children": "暂无数据"
    }
  ]
}
```

## 组合使用

### if + for

```json
{
  "for": "item in items",
  "if": "item.visible",
  "com": "div",
  "children": "{{ item.name }}"
}
```

::: tip 执行顺序
`if` 在 `for` 之后执行，即先循环再判断每个元素是否渲染。
:::

### 过滤列表

如果需要过滤整个列表，推荐使用计算属性：

```json
{
  "data": { "items": [...], "showActive": true },
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

## 实际示例

### 待办事项列表

```json
{
  "data": {
    "todos": [
      { "id": 1, "text": "学习 VSchema", "done": false },
      { "id": 2, "text": "写文档", "done": true }
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
          "props": {
            "class": "{{ todo.done ? 'completed' : '' }}"
          },
          "children": [
            {
              "com": "input",
              "props": {
                "type": "checkbox",
                "checked": "{{ todo.done }}"
              },
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
      "children": "没有待办事项"
    }
  ]
}
```

### 表格渲染

```json
{
  "data": {
    "columns": [
      { "key": "name", "title": "姓名" },
      { "key": "age", "title": "年龄" },
      { "key": "email", "title": "邮箱" }
    ],
    "rows": [
      { "name": "张三", "age": 25, "email": "zhangsan@example.com" },
      { "name": "李四", "age": 30, "email": "lisi@example.com" }
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
