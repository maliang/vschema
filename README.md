# VSchema

[![npm version](https://img.shields.io/npm/v/vschema.svg)](https://www.npmjs.com/package/vschema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个强大的 Vue 3 插件，通过 JSON Schema 声明式构建动态 UI。支持响应式数据、计算属性、事件处理、条件渲染、循环渲染、API 调用、WebSocket 等完整功能。

[English](./README.en.md) | 简体中文

## ✨ 特性

- 🎯 **声明式配置** - 通过 JSON Schema 定义组件结构，无需编写 Vue 模板
- 🔄 **响应式数据** - 完整支持 Vue 3 响应式系统
- 📊 **计算属性** - 支持表达式计算和派生状态
- 🎪 **事件处理** - 灵活的事件绑定和动作系统
- 🔀 **条件渲染** - 支持 `if` 和 `show` 指令
- 🔁 **循环渲染** - 支持 `for` 指令遍历数组
- 📝 **表单绑定** - 支持 `model` 双向绑定
- 🌐 **API 调用** - 内置 `fetch` 动作和 `initApi`/`uiApi` 配置
- 🔌 **WebSocket** - 支持长连接和实时通信
- 📋 **剪贴板** - 内置 `copy` 动作，兼容各种浏览器
- 🎰 **插槽支持** - 支持默认插槽、具名插槽和作用域插槽
- 🔄 **生命周期** - 支持 `onMounted`、`onUnmounted`、`onUpdated` 钩子
- 👁️ **监听器** - 支持 `watch` 监听状态变化
- 🧩 **组件注册** - 支持注册自定义组件
- 🔒 **安全** - 内置表达式安全检查，防止 XSS 攻击

## 📦 安装

```bash
pnpm add vschema
# 或
npm install vschema
# 或
yarn add vschema
```

## 🚀 快速开始

### 方式一：全局注册插件

```typescript
import { createApp } from 'vue';
import { VSchemaPlugin } from 'vschema';
import App from './App.vue';

const app = createApp(App);
app.use(VSchemaPlugin);
app.mount('#app');
```

```vue
<template>
  <VSchema :schema="schema" />
</template>
```

### 方式二：按需导入组件

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import { VSchema } from 'vschema';
import type { JsonNode } from 'vschema';

const schema: JsonNode = {
  data: { count: 0 },
  com: 'div',
  children: [
    { com: 'p', children: '计数: {{ count }}' },
    {
      com: 'button',
      events: { click: { set: 'count', value: '{{ count + 1 }}' } },
      children: '增加'
    }
  ]
};
</script>
```

### 方式三：创建自定义配置的组件

```typescript
import { createVSchema } from 'vschema';
import MyButton from './components/MyButton.vue';

// 创建带配置的 VSchema 组件
const VSchema = createVSchema({
  baseURL: 'https://api.example.com',
  components: {
    MyButton,  // 注册自定义组件
  },
  defaultHeaders: {
    'Authorization': 'Bearer token'
  }
});

export default VSchema;
```

### 基础示例

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import type { JsonNode } from 'vschema';

const schema: JsonNode = {
  data: { count: 0 },
  com: 'div',
  children: [
    { com: 'p', children: '计数: {{ count }}' },
    {
      com: 'button',
      events: { click: { set: 'count', value: '{{ count + 1 }}' } },
      children: '增加'
    }
  ]
};
</script>
```

### 3. 注入外部数据和方法

```vue
<template>
  <VSchema 
    :schema="schema" 
    :initial-data="initialData"
    :methods="externalMethods"
  />
</template>

<script setup lang="ts">
import type { JsonNode } from 'vschema';

const schema: JsonNode = {
  data: { form: { username: '', password: '' } },
  com: 'div',
  children: [
    {
      com: 'input',
      model: 'form.username',
      props: { placeholder: '用户名' }
    },
    {
      com: 'button',
      events: {
        click: {
          script: 'await $methods.login(state.form.username, state.form.password);'
        }
      },
      children: '登录'
    }
  ]
};

const initialData = { appName: 'My App' };

const externalMethods = {
  login: async (username: string, password: string) => {
    console.log('登录:', username, password);
  }
};
</script>
```

## 📖 Schema 结构

### VSchema 组件 Props

| 属性 | 类型 | 说明 |
|------|------|------|
| `schema` | `JsonNode \| string` | JSON Schema 定义（对象或 JSON 字符串） |
| `config` | `GlobalConfig` | 组件级别的配置（覆盖全局配置） |
| `initialData` | `object` | 初始化数据，会与 schema.data 合并 |
| `methods` | `object` | 外部注入的方法，可在 script 动作中通过 `$methods` 访问 |

### 基础属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `com` | `string` | 组件类型（HTML 标签或注册的组件名） |
| `props` | `object` | 传递给组件的 props |
| `children` | `JsonNode[] \| string` | 子节点或文本内容 |
| `events` | `object` | 事件处理器 |
| `slots` | `object` | 插槽定义 |

### 指令属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `if` | `string` | 条件渲染（v-if） |
| `show` | `string` | 显示/隐藏（v-show） |
| `for` | `string` | 循环渲染，格式: `"item in items"` 或 `"(item, index) in items"` |
| `key` | `string` | 循环项的 key |
| `model` | `string` | 双向绑定（v-model） |
| `ref` | `string` | 模板引用 |

### 数据和逻辑

| 属性 | 类型 | 说明 |
|------|------|------|
| `data` | `object` | 响应式数据定义（Schema 中声明） |
| `computed` | `object` | 计算属性（值为表达式字符串） |
| `watch` | `object` | 监听器 |
| `methods` | `object` | 方法定义 |

> 💡 **data vs state**: `data` 用于 Schema 中声明初始数据，运行时通过 `state` 访问当前状态

### 生命周期钩子

| 属性 | 类型 | 说明 |
|------|------|------|
| `onMounted` | `Action \| Action[]` | 组件挂载后执行 |
| `onUnmounted` | `Action \| Action[]` | 组件卸载前执行 |
| `onUpdated` | `Action \| Action[]` | 组件更新后执行 |

### API 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `initApi` | `string \| ApiConfig` | 组件挂载时请求 API，返回数据与 `data` 合并 |
| `uiApi` | `string \| ApiConfig` | 组件挂载时请求 API，返回 JsonNode 替换 `children` |

## 🎬 动作类型 (Actions)

### Set 动作 - 修改状态

```json
{ "set": "count", "value": "{{ count + 1 }}" }
```

### Call 动作 - 调用方法

```json
{ "call": "methodName", "args": ["{{ arg1 }}", "{{ arg2 }}"] }
```

### Emit 动作 - 触发事件

```json
{ "emit": "eventName", "payload": "{{ data }}" }
```

### Fetch 动作 - API 调用

```json
{
  "fetch": "https://api.example.com/data",
  "method": "POST",
  "body": { "key": "{{ value }}" },
  "then": { "set": "result", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

### Copy 动作 - 复制到剪贴板

```json
{
  "copy": "{{ shareUrl }}",
  "then": { "set": "copied", "value": true },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

兼容性：优先使用 Clipboard API，自动降级到 execCommand

### WebSocket 动作 - 长连接

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onMessage": { "set": "lastMessage", "value": "{{ $response }}" }
}
```

### If 动作 - 条件执行

```json
{
  "if": "count > 10",
  "then": { "set": "message", "value": "大于10" },
  "else": { "set": "message", "value": "小于等于10" }
}
```

### Script 动作 - 自定义脚本

```json
{
  "script": "await $methods.login(state.form.username, state.form.password);"
}
```

**可用变量：** `state`, `computed`, `$event`, `$response`, `$error`, `$methods`

## 📝 表达式语法

使用 `{{ expression }}` 语法在字符串中嵌入表达式：

```json
{
  "children": "你好，{{ user.name }}！",
  "props": {
    "class": "{{ isActive ? 'active' : 'inactive' }}",
    "disabled": "{{ loading }}"
  }
}
```

## 🌐 initApi 和 uiApi

### initApi - 初始化数据

```json
{
  "data": { "title": "加载中..." },
  "initApi": "/api/posts",
  "com": "div",
  "children": "{{ title }}"
}
```

### uiApi - 动态 UI 加载

```json
{
  "uiApi": "/api/page/{{ pageId }}",
  "com": "div",
  "children": "加载中..."
}
```

## 🎰 插槽支持

### 简单插槽

```json
{
  "com": "MyCard",
  "slots": {
    "default": [{ "com": "p", "children": "内容" }],
    "header": [{ "com": "h3", "children": "标题" }]
  }
}
```

### 作用域插槽

```json
{
  "com": "MyList",
  "slots": {
    "item": {
      "content": [{ "com": "span", "children": "{{ slotProps.item.name }}" }],
      "slotProps": "slotProps"
    }
  }
}
```

## 🧩 注册自定义组件

```typescript
import { useComponentRegistry } from 'vschema';
import MyButton from './MyButton.vue';

const registry = useComponentRegistry();
registry.register('MyButton', MyButton);
```

## ⚙️ 全局配置

```typescript
import { createApp } from 'vue';
import { createVSchemaPlugin } from 'vschema';

const app = createApp(App);

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  responseDataPath: 'data',
  components: {
    MyButton: MyButtonComponent
  }
}));
```

## 🎹 事件修饰符

支持 Vue 事件修饰符语法：

```json
{
  "events": {
    "click.prevent.stop": { "call": "handleClick" },
    "keyup.enter": { "call": "submit" },
    "keyup.ctrl.s": { "call": "save" }
  }
}
```

支持的修饰符：`.prevent`, `.stop`, `.capture`, `.self`, `.once`, `.passive`, `.enter`, `.tab`, `.esc`, `.space`, `.up`, `.down`, `.left`, `.right`, `.ctrl`, `.alt`, `.shift`, `.meta`

## 👁️ Watch 监听器

```json
{
  "watch": {
    "searchText": { "call": "doSearch" },
    "user": {
      "handler": { "call": "onUserChange" },
      "immediate": true,
      "deep": true
    }
  }
}
```

## 🔐 安全特性

表达式求值器内置安全检查，禁止以下危险操作：

- `eval()`, `Function()` 等代码执行
- `window`, `document`, `globalThis` 等全局对象访问
- `constructor`, `__proto__` 等原型链操作
- 直接的 `fetch`, `XMLHttpRequest` 调用（请使用 fetch 动作）

## 📚 完整示例

### 计数器

```json
{
  "data": { "count": 0 },
  "computed": { "double": "count * 2" },
  "com": "div",
  "children": [
    { "com": "p", "children": "计数: {{ count }}, 双倍: {{ double }}" },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": "{{ count + 1 }}" } },
      "children": "增加"
    }
  ]
}
```

### 待办事项

```json
{
  "data": { "todos": [], "newTodo": "" },
  "methods": {
    "addTodo": {
      "if": "newTodo.trim()",
      "then": [
        { "set": "todos", "value": "{{ [...todos, { id: Date.now(), text: newTodo }] }}" },
        { "set": "newTodo", "value": "" }
      ]
    }
  },
  "com": "div",
  "children": [
    {
      "com": "input",
      "model": "newTodo",
      "props": { "placeholder": "添加任务..." },
      "events": { "keyup.enter": { "call": "addTodo" } }
    },
    {
      "com": "ul",
      "children": [
        {
          "for": "todo in todos",
          "key": "{{ todo.id }}",
          "com": "li",
          "children": "{{ todo.text }}"
        }
      ]
    }
  ]
}
```

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

## 📄 License

[MIT](LICENSE)
