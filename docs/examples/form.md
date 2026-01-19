# 表单示例

## 登录表单

```json
{
  "data": {
    "form": { "username": "", "password": "", "remember": false },
    "loading": false,
    "error": ""
  },
  "computed": {
    "canSubmit": "form.username && form.password && !loading"
  },
  "methods": {
    "handleLogin": [
      { "set": "loading", "value": true },
      { "set": "error", "value": "" },
      {
        "fetch": "/api/login",
        "method": "POST",
        "body": "{{ form }}",
        "then": { "emit": "login-success", "payload": "{{ $response }}" },
        "catch": { "set": "error", "value": "{{ $error.message }}" },
        "finally": { "set": "loading", "value": false }
      }
    ]
  },
  "com": "form",
  "props": { "class": "login-form" },
  "events": { "submit.prevent": { "call": "handleLogin" } },
  "children": [
    {
      "com": "div",
      "if": "error",
      "props": { "class": "error-alert" },
      "children": "{{ error }}"
    },
    {
      "com": "div",
      "props": { "class": "form-item" },
      "children": [
        { "com": "label", "children": "用户名" },
        { "com": "input", "model": "form.username", "props": { "placeholder": "请输入用户名" } }
      ]
    },
    {
      "com": "div",
      "props": { "class": "form-item" },
      "children": [
        { "com": "label", "children": "密码" },
        { "com": "input", "model": "form.password", "props": { "type": "password", "placeholder": "请输入密码" } }
      ]
    },
    {
      "com": "div",
      "props": { "class": "form-item" },
      "children": [
        {
          "com": "label",
          "children": [
            { "com": "input", "model": "form.remember", "props": { "type": "checkbox" } },
            " 记住我"
          ]
        }
      ]
    },
    {
      "com": "button",
      "props": { "type": "submit", "disabled": "{{ !canSubmit }}" },
      "children": "{{ loading ? '登录中...' : '登录' }}"
    }
  ]
}
```

## 搜索表单

```json
{
  "data": {
    "keyword": "",
    "category": "",
    "categories": [
      { "value": "", "label": "全部分类" },
      { "value": "tech", "label": "技术" },
      { "value": "life", "label": "生活" }
    ]
  },
  "methods": {
    "search": {
      "emit": "search",
      "payload": "{{ { keyword, category } }}"
    }
  },
  "com": "form",
  "events": { "submit.prevent": { "call": "search" } },
  "children": [
    { "com": "input", "model": "keyword", "props": { "placeholder": "搜索..." } },
    {
      "com": "select",
      "model": "category",
      "children": [
        {
          "for": "cat in categories",
          "com": "option",
          "props": { "value": "{{ cat.value }}" },
          "children": "{{ cat.label }}"
        }
      ]
    },
    { "com": "button", "props": { "type": "submit" }, "children": "搜索" }
  ]
}
```

## 动态表单

```json
{
  "data": {
    "fields": [
      { "name": "name", "label": "姓名", "type": "text", "required": true },
      { "name": "email", "label": "邮箱", "type": "email", "required": true },
      { "name": "phone", "label": "电话", "type": "tel", "required": false }
    ],
    "formData": {}
  },
  "com": "form",
  "children": [
    {
      "for": "field in fields",
      "key": "{{ field.name }}",
      "com": "div",
      "props": { "class": "form-item" },
      "children": [
        {
          "com": "label",
          "children": "{{ field.label }}{{ field.required ? ' *' : '' }}"
        },
        {
          "com": "input",
          "props": {
            "type": "{{ field.type }}",
            "value": "{{ formData[field.name] || '' }}",
            "required": "{{ field.required }}"
          },
          "events": {
            "input": { "set": "formData.{{ field.name }}", "value": "{{ $event.target.value }}" }
          }
        }
      ]
    }
  ]
}
```
