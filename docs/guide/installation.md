# 安装

## 包管理器安装

::: code-group

```bash [pnpm]
pnpm add vschema
```

```bash [npm]
npm install vschema
```

```bash [yarn]
yarn add vschema
```

:::

## 使用方式

VSchema 提供三种使用方式，根据需求选择：

### 方式一：全局注册插件

适合整个应用都需要使用 VSchema 的场景：

```typescript
// main.ts
import { createApp } from 'vue';
import { VSchemaPlugin } from 'vschema';
import App from './App.vue';

const app = createApp(App);
app.use(VSchemaPlugin);
app.mount('#app');
```

然后在任意组件中直接使用：

```vue
<template>
  <VSchema :schema="schema" />
</template>
```

### 方式二：按需导入组件

适合只在部分页面使用的场景，减少打包体积：

```vue
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import { VSchema } from 'vschema';
import type { JsonNode } from 'vschema';

const schema: JsonNode = {
  com: 'div',
  children: 'Hello VSchema!'
};
</script>
```

### 方式三：创建自定义配置实例

适合需要预配置 API 地址、注册自定义组件的场景：

```typescript
// components/ConfiguredVSchema.ts
import { createVSchema } from 'vschema';
import MyButton from './MyButton.vue';
import MyCard from './MyCard.vue';

export const VSchema = createVSchema({
  // API 基础地址
  baseURL: 'https://api.example.com',
  // 默认请求头
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  // 注册自定义组件
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

## 带配置的全局注册

如果需要全局注册并配置：

```typescript
// main.ts
import { createApp } from 'vue';
import { createVSchemaPlugin } from 'vschema';
import MyButton from './components/MyButton.vue';

const app = createApp(App);

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  responseDataPath: 'data',  // API 响应数据路径
  components: {
    MyButton,
  }
}));

app.mount('#app');
```

## TypeScript 支持

VSchema 完全使用 TypeScript 编写，提供完整的类型定义：

```typescript
import type { JsonNode, GlobalConfig, Action } from 'vschema';

const schema: JsonNode = {
  com: 'div',
  data: { count: 0 },
  children: '{{ count }}'
};
```

## 浏览器兼容性

VSchema 支持所有现代浏览器：

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

::: warning 注意
VSchema 依赖 Vue 3.3+，请确保你的 Vue 版本符合要求。
:::
