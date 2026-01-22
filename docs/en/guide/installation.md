# Installation

## Package Manager

::: code-group

```bash [pnpm]
pnpm add @maliang47/vschema
```

```bash [npm]
npm install @maliang47/vschema
```

```bash [yarn]
yarn add @maliang47/vschema
```

:::

## Usage Methods

VSchema provides three usage methods, choose based on your needs:

### Method 1: Global Plugin Registration

Suitable when VSchema is needed throughout the application:

```typescript
// main.ts
import { createApp } from 'vue';
import { VSchemaPlugin } from '@maliang47/vschema';
import App from './App.vue';

const app = createApp(App);
app.use(VSchemaPlugin);
app.mount('#app');
```

Then use directly in any component:

```vue
<template>
  <VSchema :schema="schema" />
</template>
```

### Method 2: On-demand Import

Suitable when only used in some pages, reduces bundle size:

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import { VSchema } from '@maliang47/vschema';
import type { JsonNode } from '@maliang47/vschema';

const schema: JsonNode = {
  com: 'div',
  children: 'Hello VSchema!'
};
</script>
```

### Method 3: Create Custom Configured Instance

Suitable when you need to pre-configure API URL or register custom components:

```typescript
// components/ConfiguredVSchema.ts
import { createVSchema } from '@maliang47/vschema';
import MyButton from './MyButton.vue';
import MyCard from './MyCard.vue';

export const VSchema = createVSchema({
  // API base URL
  baseURL: 'https://api.example.com',
  // Default request headers
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  // Register custom components
  components: {
    MyButton,
    MyCard,
  },
});
```

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup>
import { VSchema } from './components/ConfiguredVSchema';
</script>
```

## Global Registration with Config

If you need global registration with configuration:

```typescript
// main.ts
import { createApp } from 'vue';
import { createVSchemaPlugin } from '@maliang47/vschema';
import MyButton from './components/MyButton.vue';

const app = createApp(App);

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  responseDataPath: 'data',  // API response data path
  components: {
    MyButton,
  }
}));

app.mount('#app');
```

## TypeScript Support

VSchema is fully written in TypeScript with complete type definitions:

```typescript
import type { JsonNode, GlobalConfig, Action } from '@maliang47/vschema';

const schema: JsonNode = {
  com: 'div',
  data: { count: 0 },
  children: '{{ count }}'
};
```

## Browser Compatibility

VSchema supports all modern browsers:

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

::: warning Note
VSchema requires Vue 3.3+, ensure your Vue version meets the requirement.
:::
