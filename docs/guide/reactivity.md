# 响应式数据

VSchema 完整支持 Vue 3 的响应式系统，数据变化会自动触发视图更新。

## 定义数据

在 Schema 的 `data` 属性中定义响应式数据：

```json
{
  "data": {
    "count": 0,
    "message": "Hello",
    "user": {
      "name": "张三",
      "email": "zhangsan@example.com"
    },
    "items": ["苹果", "香蕉", "橙子"]
  },
  "com": "div",
  "children": "..."
}
```

## 访问数据

在表达式中直接使用属性名访问数据：

```json
{
  "data": { "count": 0, "user": { "name": "张三" } },
  "com": "div",
  "children": [
    { "com": "p", "children": "计数: {{ count }}" },
    { "com": "p", "children": "用户: {{ user.name }}" }
  ]
}
```

## 修改数据

使用 `set` 动作修改数据：

### 简单值

```json
{
  "events": {
    "click": { "set": "count", "value": "{{ count + 1 }}" }
  }
}
```

### 嵌套属性

支持点号路径访问嵌套属性：

```json
{
  "events": {
    "click": { "set": "user.name", "value": "李四" }
  }
}
```

### 数组操作

```json
{
  "data": { "items": [] },
  "methods": {
    "addItem": {
      "set": "items",
      "value": "{{ [...items, { id: Date.now(), text: newItem }] }}"
    },
    "removeItem": {
      "set": "items",
      "value": "{{ items.filter(item => item.id !== targetId) }}"
    }
  }
}
```

### 数组索引

支持数组索引语法：

```json
{
  "events": {
    "click": { "set": "items[0].name", "value": "新名称" }
  }
}
```

## 计算属性

使用 `computed` 定义派生状态：

```json
{
  "data": {
    "firstName": "张",
    "lastName": "三",
    "items": [
      { "price": 10, "quantity": 2 },
      { "price": 20, "quantity": 1 }
    ]
  },
  "computed": {
    "fullName": "firstName + lastName",
    "total": "items.reduce((sum, item) => sum + item.price * item.quantity, 0)",
    "hasItems": "items.length > 0"
  },
  "com": "div",
  "children": [
    { "com": "p", "children": "姓名: {{ fullName }}" },
    { "com": "p", "children": "总价: ¥{{ total }}" }
  ]
}
```

计算属性会自动追踪依赖，当依赖的数据变化时自动重新计算。

## 监听器 (watch)

使用 `watch` 监听数据变化并执行动作：

### 基础用法

```json
{
  "data": { "searchText": "" },
  "watch": {
    "searchText": { "call": "doSearch" }
  },
  "methods": {
    "doSearch": {
      "fetch": "/api/search?q={{ searchText }}",
      "then": { "set": "results", "value": "{{ $response }}" }
    }
  }
}
```

### 完整配置

```json
{
  "watch": {
    "user": {
      "handler": { "call": "onUserChange" },
      "immediate": true,
      "deep": true
    }
  }
}
```

| 选项 | 类型 | 说明 |
|------|------|------|
| `handler` | `Action` | 变化时执行的动作 |
| `immediate` | `boolean` | 是否立即执行一次 |
| `deep` | `boolean` | 是否深度监听对象变化 |

### 监听多个属性

```json
{
  "watch": {
    "form.username": { "call": "validateUsername" },
    "form.password": { "call": "validatePassword" },
    "form": {
      "handler": { "call": "onFormChange" },
      "deep": true
    }
  }
}
```

## 注入外部数据

通过 `initialData` prop 注入外部数据：

```vue
<template>
  <VSchema :schema="schema" :initial-data="externalData" />
</template>

<script setup>
const externalData = {
  userId: 123,
  token: 'abc',
  config: { theme: 'dark' }
};
</script>
```

注入的数据会与 Schema 中的 `data` 合并，可在表达式中直接访问。

## 最佳实践

### 1. 合理组织数据结构

```json
{
  "data": {
    "ui": {
      "loading": false,
      "error": null
    },
    "form": {
      "username": "",
      "password": ""
    },
    "list": {
      "items": [],
      "total": 0,
      "page": 1
    }
  }
}
```

### 2. 使用计算属性简化模板

```json
{
  "data": { "items": [], "loading": false },
  "computed": {
    "isEmpty": "!loading && items.length === 0",
    "showList": "!loading && items.length > 0"
  }
}
```

### 3. 避免在表达式中进行复杂计算

```json
// ❌ 不推荐
{ "children": "{{ items.filter(i => i.active).map(i => i.name).join(', ') }}" }

// ✅ 推荐：使用计算属性
{
  "computed": {
    "activeNames": "items.filter(i => i.active).map(i => i.name).join(', ')"
  },
  "children": "{{ activeNames }}"
}
```
