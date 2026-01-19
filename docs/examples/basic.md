# 基础示例

## 计数器

```json
{
  "data": { "count": 0 },
  "computed": { "double": "count * 2" },
  "com": "div",
  "props": { "class": "counter" },
  "children": [
    { "com": "p", "children": "计数: {{ count }}" },
    { "com": "p", "children": "双倍: {{ double }}" },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": "{{ count + 1 }}" } },
      "children": "增加"
    },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": "{{ count - 1 }}" } },
      "children": "减少"
    },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": 0 } },
      "children": "重置"
    }
  ]
}
```

## Hello World

```json
{
  "data": { "name": "World" },
  "com": "div",
  "children": [
    { "com": "h1", "children": "Hello, {{ name }}!" },
    {
      "com": "input",
      "model": "name",
      "props": { "placeholder": "输入名字" }
    }
  ]
}
```

## 条件渲染

```json
{
  "data": { "show": true },
  "com": "div",
  "children": [
    {
      "com": "button",
      "events": { "click": { "set": "show", "value": "{{ !show }}" } },
      "children": "{{ show ? '隐藏' : '显示' }}"
    },
    {
      "com": "p",
      "if": "show",
      "children": "这段文字可以显示/隐藏"
    }
  ]
}
```

## 简单列表

```json
{
  "data": {
    "items": ["苹果", "香蕉", "橙子"]
  },
  "com": "ul",
  "children": [
    {
      "for": "(item, index) in items",
      "com": "li",
      "children": "{{ index + 1 }}. {{ item }}"
    }
  ]
}
```

## 样式绑定

```json
{
  "data": {
    "isActive": false,
    "color": "blue"
  },
  "com": "div",
  "children": [
    {
      "com": "button",
      "events": { "click": { "set": "isActive", "value": "{{ !isActive }}" } },
      "children": "切换状态"
    },
    {
      "com": "div",
      "props": {
        "class": "{{ isActive ? 'box active' : 'box' }}",
        "style": {
          "backgroundColor": "{{ color }}",
          "padding": "20px",
          "color": "white"
        }
      },
      "children": "状态: {{ isActive ? '激活' : '未激活' }}"
    }
  ]
}
```
