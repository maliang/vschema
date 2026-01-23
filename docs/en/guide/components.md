# Custom Components

VSchema supports registering and using custom Vue components.

## Registration Methods

### Global Registration (Plugin Config)

```typescript
import { createApp } from 'vue';
import { createVSchemaPlugin } from 'vschema-ui';
import MyButton from './components/MyButton.vue';
import MyCard from './components/MyCard.vue';

const app = createApp(App);

app.use(createVSchemaPlugin({
  components: {
    MyButton,
    MyCard,
  }
}));
```

### On-demand Registration (createVSchema)

```typescript
import { createVSchema } from 'vschema-ui';
import MyButton from './components/MyButton.vue';

const VSchema = createVSchema({
  components: { MyButton }
});
```

### Runtime Registration

```typescript
import { useComponentRegistry } from 'vschema-ui';
import MyButton from './components/MyButton.vue';

const registry = useComponentRegistry();
registry.register('MyButton', MyButton);

// Bulk registration
registry.registerBulk({
  MyButton,
  MyCard,
  MyInput,
});
```

## Using Custom Components

After registration, use via `com` property:

```json
{
  "com": "MyButton",
  "props": {
    "type": "primary",
    "size": "large"
  },
  "children": "Click me"
}
```

## Component Development Guidelines

### Props Definition

```vue
<!-- MyButton.vue -->
<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'default' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}>();
</script>

<template>
  <button :class="['btn', `btn-${type}`, `btn-${size}`]" :disabled="disabled">
    <slot />
  </button>
</template>
```

### Event Emitting

```vue
<script setup lang="ts">
const emit = defineEmits<{
  click: [event: MouseEvent];
  change: [value: string];
}>();
</script>
```

Listen in Schema:

```json
{
  "com": "MyInput",
  "events": {
    "change": { "set": "value", "value": "{{ $event }}" }
  }
}
```

### Slot Support

```vue
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

## Using UI Libraries

### Element Plus

```typescript
import { createVSchemaPlugin } from 'vschema-ui';
import { ElButton, ElInput, ElSelect, ElOption } from 'element-plus';

app.use(createVSchemaPlugin({
  components: {
    ElButton,
    ElInput,
    ElSelect,
    ElOption,
  }
}));
```

```json
{
  "com": "ElButton",
  "props": { "type": "primary" },
  "children": "Element Button"
}
```

### Ant Design Vue

```typescript
import { Button, Input, Select } from 'ant-design-vue';

app.use(createVSchemaPlugin({
  components: {
    AButton: Button,
    AInput: Input,
    ASelect: Select,
  }
}));
```

## Best Practices

1. **Naming Convention** - Use PascalCase for component names
2. **Type Definitions** - Provide complete TypeScript types for Props
3. **Documentation** - Add usage instructions for components
4. **On-demand Registration** - Only register components actually used to reduce bundle size
