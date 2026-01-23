# VSchema-UI

[![npm version](https://img.shields.io/npm/v/vschema.svg)](https://www.npmjs.com/package/vschema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Vue 3 plugin for building dynamic UIs declaratively through JSON Schema. Supports reactive data, computed properties, event handling, conditional rendering, loop rendering, API calls, WebSocket, and more.

English | [简体中文](./README.md)

## ✨ Features

- 🎯 **Declarative Configuration** - Define component structure via JSON Schema without writing Vue templates
- 🔄 **Reactive Data** - Full support for Vue 3 reactivity system
- 📊 **Computed Properties** - Expression evaluation and derived state support
- 🎪 **Event Handling** - Flexible event binding and action system
- 🔀 **Conditional Rendering** - Support for `if` and `show` directives
- 🔁 **Loop Rendering** - Support for `for` directive to iterate arrays
- 📝 **Form Binding** - Support for `model` two-way binding
- 🌐 **API Calls** - Built-in `fetch` action and `initApi`/`uiApi` configuration
- 🔌 **WebSocket** - Support for persistent connections and real-time communication
- 📋 **Clipboard** - Built-in `copy` action with cross-browser compatibility
- 🎰 **Slot Support** - Support for default slots, named slots, and scoped slots
- 🔄 **Lifecycle Hooks** - Support for `onMounted`, `onUnmounted`, `onUpdated` hooks
- 👁️ **Watchers** - Support for `watch` to observe state changes
- 🧩 **Component Registration** - Support for registering custom components
- 🔒 **Security** - Built-in expression security checks to prevent XSS attacks

## 📦 Installation

```bash
pnpm add vschema-ui
# or
npm install vschema-ui
# or
yarn add vschema-ui
```

## 🚀 Quick Start

### 1. Register Plugin

```typescript
import { createApp } from 'vue';
import { VSchemaPlugin } from 'vschema-ui';
import App from './App.vue';

const app = createApp(App);
app.use(VSchemaPlugin);
app.mount('#app');
```

### 2. Use Component

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import type { JsonNode } from 'vschema-ui';

const schema: JsonNode = {
  data: { count: 0 },
  com: 'div',
  children: [
    { com: 'p', children: 'Count: {{ count }}' },
    {
      com: 'button',
      events: { click: { set: 'count', value: '{{ count + 1 }}' } },
      children: 'Increment'
    }
  ]
};
</script>
```

### 3. Inject External Data and Methods

```vue
<template>
  <VSchema 
    :schema="schema" 
    :initial-data="initialData"
    :methods="externalMethods"
  />
</template>

<script setup lang="ts">
import type { JsonNode } from 'vschema-ui';

const schema: JsonNode = {
  data: { form: { username: '', password: '' } },
  com: 'div',
  children: [
    {
      com: 'input',
      model: 'form.username',
      props: { placeholder: 'Username' }
    },
    {
      com: 'button',
      events: {
        click: {
          script: 'await $methods.login(state.form.username, state.form.password);'
        }
      },
      children: 'Login'
    }
  ]
};

const initialData = { appName: 'My App' };

const externalMethods = {
  login: async (username: string, password: string) => {
    console.log('Login:', username, password);
  }
};
</script>
```

## 📖 Schema Structure

### VSchema Component Props

| Property | Type | Description |
|----------|------|-------------|
| `schema` | `JsonNode \| string` | JSON Schema definition (object or JSON string) |
| `config` | `GlobalConfig` | Component-level configuration (overrides global config) |
| `initialData` | `object` | Initial data, merged with schema.data |
| `methods` | `object` | External methods, accessible via `$methods` in script actions |

### Basic Properties

| Property | Type | Description |
|----------|------|-------------|
| `com` | `string` | Component type (HTML tag or registered component name) |
| `props` | `object` | Props passed to the component |
| `children` | `JsonNode[] \| string` | Child nodes or text content |
| `events` | `object` | Event handlers |
| `slots` | `object` | Slot definitions |

### Directive Properties

| Property | Type | Description |
|----------|------|-------------|
| `if` | `string` | Conditional rendering (v-if) |
| `show` | `string` | Show/hide (v-show) |
| `for` | `string` | Loop rendering, format: `"item in items"` or `"(item, index) in items"` |
| `key` | `string` | Key for loop items |
| `model` | `string` | Two-way binding (v-model) |
| `ref` | `string` | Template ref |

### Data and Logic

| Property | Type | Description |
|----------|------|-------------|
| `data` | `object` | Reactive data definition (declared in Schema) |
| `computed` | `object` | Computed properties (values are expression strings) |
| `watch` | `object` | Watchers |
| `methods` | `object` | Method definitions |

> 💡 **data vs state**: `data` is used to declare initial data in Schema, while `state` is used to access current state at runtime

### Lifecycle Hooks

| Property | Type | Description |
|----------|------|-------------|
| `onMounted` | `Action \| Action[]` | Execute after component mount |
| `onUnmounted` | `Action \| Action[]` | Execute before component unmount |
| `onUpdated` | `Action \| Action[]` | Execute after component update |

### API Configuration

| Property | Type | Description |
|----------|------|-------------|
| `initApi` | `string \| ApiConfig` | Fetch API on mount, merge response with `data` |
| `uiApi` | `string \| ApiConfig` | Fetch API on mount, replace `children` with returned JsonNode |

## 🎬 Action Types

### Set Action - Modify State

```json
{ "set": "count", "value": "{{ count + 1 }}" }
```

### Call Action - Invoke Method

```json
{ "call": "methodName", "args": ["{{ arg1 }}", "{{ arg2 }}"] }
```

### Emit Action - Trigger Event

```json
{ "emit": "eventName", "payload": "{{ data }}" }
```

### Fetch Action - API Call

```json
{
  "fetch": "https://api.example.com/data",
  "method": "POST",
  "body": { "key": "{{ value }}" },
  "then": { "set": "result", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

### Copy Action - Copy to Clipboard

```json
{
  "copy": "{{ shareUrl }}",
  "then": { "set": "copied", "value": true },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

Compatibility: Uses Clipboard API with automatic fallback to execCommand

### WebSocket Action - Persistent Connection

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onMessage": { "set": "lastMessage", "value": "{{ $response }}" }
}
```

### If Action - Conditional Execution

```json
{
  "if": "count > 10",
  "then": { "set": "message", "value": "Greater than 10" },
  "else": { "set": "message", "value": "Less than or equal to 10" }
}
```

### Script Action - Custom Script

```json
{
  "script": "await $methods.login(state.form.username, state.form.password);"
}
```

**Available variables:** `state`, `computed`, `$event`, `$response`, `$error`, `$methods`

## 📝 Expression Syntax

Use `{{ expression }}` syntax to embed expressions in strings:

```json
{
  "children": "Hello, {{ user.name }}!",
  "props": {
    "class": "{{ isActive ? 'active' : 'inactive' }}",
    "disabled": "{{ loading }}"
  }
}
```

## 🌐 initApi and uiApi

### initApi - Initialize Data

```json
{
  "data": { "title": "Loading..." },
  "initApi": "/api/posts",
  "com": "div",
  "children": "{{ title }}"
}
```

### uiApi - Dynamic UI Loading

```json
{
  "uiApi": "/api/page/{{ pageId }}",
  "com": "div",
  "children": "Loading..."
}
```

## 🎰 Slot Support

### Simple Slots

```json
{
  "com": "MyCard",
  "slots": {
    "default": [{ "com": "p", "children": "Content" }],
    "header": [{ "com": "h3", "children": "Title" }]
  }
}
```

### Scoped Slots

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

## 🧩 Register Custom Components

```typescript
import { useComponentRegistry } from 'vschema-ui';
import MyButton from './MyButton.vue';

const registry = useComponentRegistry();
registry.register('MyButton', MyButton);
```

## ⚙️ Global Configuration

```typescript
import { createApp } from 'vue';
import { createVSchemaPlugin } from 'vschema-ui';

const app = createApp(App);

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  responseDataPath: 'data',
  // API response format configuration
  responseFormat: {
    codeField: 'code',      // Business status code field, default 'code'
    msgField: 'msg',        // Message field, default 'msg'
    dataField: 'data',      // Data field, default 'data'
    successCode: 200,       // Success code, default 200, supports array like [0, 200]
  },
  components: {
    MyButton: MyButtonComponent
  }
}));
```

### Response Format Configuration

VSchema supports custom backend API response format, default format is `{ code, msg, data }`:

```typescript
// Custom response format
responseFormat: {
  codeField: 'status',      // Backend uses 'status' field
  msgField: 'message',      // Backend uses 'message' field
  dataField: 'result',      // Backend uses 'result' field
  successCode: [0, 200],    // Both 0 and 200 indicate success
}
```

When the API returns a business status code not equal to `successCode`, the `catch` callback is automatically triggered, and the error message is extracted from the `msgField` field.

## 🎹 Event Modifiers

Supports Vue event modifier syntax:

```json
{
  "events": {
    "click.prevent.stop": { "call": "handleClick" },
    "keyup.enter": { "call": "submit" },
    "keyup.ctrl.s": { "call": "save" }
  }
}
```

Supported modifiers: `.prevent`, `.stop`, `.capture`, `.self`, `.once`, `.passive`, `.enter`, `.tab`, `.esc`, `.space`, `.up`, `.down`, `.left`, `.right`, `.ctrl`, `.alt`, `.shift`, `.meta`

## 👁️ Watch

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

## 🔐 Security Features

The expression evaluator has built-in security checks that prohibit the following dangerous operations:

- `eval()`, `Function()` and other code execution
- `window`, `document`, `globalThis` and other global object access
- `constructor`, `__proto__` and other prototype chain operations
- Direct `fetch`, `XMLHttpRequest` calls (use fetch action instead)

## 📚 Complete Examples

### Counter

```json
{
  "data": { "count": 0 },
  "computed": { "double": "count * 2" },
  "com": "div",
  "children": [
    { "com": "p", "children": "Count: {{ count }}, Double: {{ double }}" },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": "{{ count + 1 }}" } },
      "children": "Increment"
    }
  ]
}
```

### Todo List

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
      "props": { "placeholder": "Add task..." },
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

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## 📄 License

[MIT](LICENSE)
