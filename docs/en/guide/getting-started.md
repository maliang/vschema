# Getting Started

VSchema is a powerful Vue 3 plugin that lets you build dynamic UI declaratively with JSON Schema.

## What is VSchema?

VSchema allows you to describe UI structure with JSON objects instead of writing Vue templates. This is particularly useful for:

- **Low-code platforms** - Visual drag-and-drop generates JSON, dynamically renders pages
- **Dynamic forms** - Backend returns form configuration, frontend renders dynamically
- **Configurable pages** - Define page structure through configuration files
- **Cross-platform rendering** - JSON Schema can be shared across different platforms

## First Example

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import { VSchema } from 'vschema-ui';
import type { JsonNode } from 'vschema-ui';

const schema: JsonNode = {
  data: { count: 0 },
  com: 'div',
  children: [
    { com: 'p', children: 'Current count: {{ count }}' },
    {
      com: 'button',
      events: { click: { set: 'count', value: '{{ count + 1 }}' } },
      children: 'Click to increase'
    }
  ]
};
</script>
```

This example demonstrates:

1. **data** - Define reactive data `count`
2. **com** - Specify the component to render (HTML tag or custom component)
3. **children** - Child nodes, supporting text interpolation `{{ count }}`
4. **events** - Event handling, execute `set` action on click to modify data

## Core Concepts

### Schema Structure

Each Schema node is a `JsonNode` object:

```typescript
interface JsonNode {
  com: string;              // Component type
  props?: object;           // Component props
  children?: JsonNode[] | string;  // Child nodes
  data?: object;            // Reactive data
  computed?: object;        // Computed properties
  events?: object;          // Event handlers
  // ... more properties
}
```

### Expression Syntax

Use <span v-pre>`{{ expression }}`</span> to embed JavaScript expressions in strings:

```json
{
  "children": "Hello, {{ user.name }}!",
  "props": {
    "class": "{{ isActive ? 'active' : '' }}",
    "disabled": "{{ loading }}"
  }
}
```

### Action System

VSchema provides various action types for handling user interactions:

| Action | Description |
|--------|-------------|
| `set` | Modify state |
| `call` | Call method |
| `emit` | Emit event |
| `fetch` | API call |
| `ws` | WebSocket operations |
| `if` | Conditional execution |
| `script` | Custom script |
| `copy` | Copy to clipboard |

## Next Steps

- [Installation](/en/guide/installation) - Detailed installation steps
- [Core Concepts](/en/guide/concepts) - Deep dive into Schema structure
- [Examples](/en/examples/basic) - More practical examples
