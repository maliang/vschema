# 表达式语法

VSchema 使用 `{{ expression }}` 语法在字符串中嵌入 JavaScript 表达式。

## 基础语法

### 简单表达式

```json
{ "children": "{{ count }}" }
{ "children": "{{ user.name }}" }
{ "children": "{{ items[0] }}" }
```

### 文本插值

```json
{ "children": "你好，{{ name }}！欢迎来到 {{ siteName }}" }
```

### 运算表达式

```json
{ "children": "{{ count + 1 }}" }
{ "children": "{{ price * quantity }}" }
{ "children": "{{ firstName + ' ' + lastName }}" }
```

### 三元表达式

```json
{ "children": "{{ isVip ? 'VIP用户' : '普通用户' }}" }
{ "props": { "class": "{{ active ? 'active' : '' }}" } }
```

### 方法调用

```json
{ "children": "{{ name.toUpperCase() }}" }
{ "children": "{{ items.length }}" }
{ "children": "{{ price.toFixed(2) }}" }
```

## 在 Props 中使用

### 动态 class

```json
{
  "props": {
    "class": "{{ isActive ? 'btn-active' : 'btn-normal' }}"
  }
}
```

### 动态 style

```json
{
  "props": {
    "style": {
      "color": "{{ textColor }}",
      "fontSize": "{{ fontSize }}px",
      "display": "{{ visible ? 'block' : 'none' }}"
    }
  }
}
```

### 动态属性

```json
{
  "props": {
    "disabled": "{{ loading || !isValid }}",
    "placeholder": "{{ '请输入' + fieldName }}",
    "maxlength": "{{ maxLength }}"
  }
}
```

## 在动作中使用

### set 动作

```json
{
  "set": "count",
  "value": "{{ count + 1 }}"
}
```

### fetch 动作

```json
{
  "fetch": "/api/users/{{ userId }}",
  "body": {
    "name": "{{ form.name }}",
    "email": "{{ form.email }}"
  }
}
```

### 条件动作

```json
{
  "if": "count > 10",
  "then": { "set": "message", "value": "大于10" },
  "else": { "set": "message", "value": "小于等于10" }
}
```

## 可用变量

在表达式中可以访问以下变量：

| 变量 | 说明 | 示例 |
|------|------|------|
| `state` | 当前状态对象 | `state.count` |
| `computed` | 计算属性对象 | `computed.total` |
| `$event` | 事件对象（事件处理中） | `$event.target.value` |
| `$response` | API 响应数据（fetch then 中） | `$response.data` |
| `$error` | 错误对象（catch 中） | `$error.message` |
| `$methods` | 外部注入的方法 | `$methods.login()` |

::: tip 简写访问
在表达式中可以直接使用属性名（如 `count`），VSchema 会自动从 `state` 中查找。
:::

## 循环变量

在 `for` 循环中，可以访问循环变量：

```json
{
  "for": "item in items",
  "children": "{{ item.name }}"
}

{
  "for": "(item, index) in items",
  "children": "{{ index + 1 }}. {{ item.name }}"
}
```

## 数组方法

支持常用的数组方法：

```json
{
  "computed": {
    "activeItems": "items.filter(item => item.active)",
    "names": "items.map(item => item.name)",
    "total": "items.reduce((sum, item) => sum + item.price, 0)",
    "hasActive": "items.some(item => item.active)",
    "allActive": "items.every(item => item.active)",
    "found": "items.find(item => item.id === targetId)"
  }
}
```

## 安全限制

为了安全，表达式求值器禁止以下操作：

### 禁止的关键字

- `eval`, `Function` - 代码执行
- `window`, `document`, `globalThis` - 全局对象
- `constructor`, `__proto__`, `prototype` - 原型链
- `fetch`, `XMLHttpRequest` - 网络请求（请使用 fetch 动作）
- `localStorage`, `sessionStorage` - 存储访问
- `setTimeout`, `setInterval` - 定时器

### 示例

```json
// ❌ 禁止
{ "children": "{{ eval('alert(1)') }}" }
{ "children": "{{ window.location.href }}" }
{ "children": "{{ constructor.constructor('return this')() }}" }

// ✅ 允许
{ "children": "{{ count + 1 }}" }
{ "children": "{{ items.filter(i => i.active) }}" }
{ "children": "{{ user.name.toUpperCase() }}" }
```

## 调试技巧

### 使用 JSON.stringify

```json
{ "children": "调试: {{ JSON.stringify(user) }}" }
```

### 检查类型

```json
{ "children": "类型: {{ typeof value }}" }
{ "children": "是数组: {{ Array.isArray(items) }}" }
```

## 最佳实践

### 1. 保持表达式简单

```json
// ❌ 复杂表达式
{ "children": "{{ items.filter(i => i.active && i.price > 100).map(i => i.name).slice(0, 5).join(', ') }}" }

// ✅ 使用计算属性
{
  "computed": {
    "topActiveItems": "items.filter(i => i.active && i.price > 100).map(i => i.name).slice(0, 5).join(', ')"
  },
  "children": "{{ topActiveItems }}"
}
```

### 2. 处理空值

```json
{ "children": "{{ user?.name || '未知用户' }}" }
{ "children": "{{ items?.length ?? 0 }}" }
```

### 3. 格式化输出

```json
{ "children": "价格: ¥{{ price.toFixed(2) }}" }
{ "children": "日期: {{ new Date(timestamp).toLocaleDateString() }}" }
```
