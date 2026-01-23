# 自定义组件

VSchema 支持注册和使用自定义 Vue 组件。

## 注册方式

### 全局注册（插件配置）

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

### 按需注册（createVSchema）

```typescript
import { createVSchema } from 'vschema-ui';
import MyButton from './components/MyButton.vue';

const VSchema = createVSchema({
  components: { MyButton }
});
```

### 运行时注册

```typescript
import { useComponentRegistry } from 'vschema-ui';
import MyButton from './components/MyButton.vue';

const registry = useComponentRegistry();
registry.register('MyButton', MyButton);

// 批量注册
registry.registerBulk({
  MyButton,
  MyCard,
  MyInput,
});
```

## 使用自定义组件

注册后，在 Schema 中通过 `com` 属性使用：

```json
{
  "com": "MyButton",
  "props": {
    "type": "primary",
    "size": "large"
  },
  "children": "点击我"
}
```

## 组件开发规范

### Props 定义

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

### 事件触发

```vue
<script setup lang="ts">
const emit = defineEmits<{
  click: [event: MouseEvent];
  change: [value: string];
}>();
</script>
```

在 Schema 中监听：

```json
{
  "com": "MyInput",
  "events": {
    "change": { "set": "value", "value": "{{ $event }}" }
  }
}
```

### 插槽支持

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

## 使用 UI 组件库

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
  "children": "Element 按钮"
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

## 最佳实践

1. **命名规范** - 使用 PascalCase 命名组件
2. **类型定义** - 为 Props 提供完整的 TypeScript 类型
3. **文档注释** - 为组件添加使用说明
4. **按需注册** - 只注册实际使用的组件，减少打包体积
