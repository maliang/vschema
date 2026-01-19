# 组件 Props

VSchema 组件接受的属性。

## Props 列表

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `schema` | `JsonNode \| string` | 是 | JSON Schema 定义 |
| `config` | `GlobalConfig` | 否 | 组件级配置（覆盖全局） |
| `initialData` | `object` | 否 | 初始数据，与 schema.data 合并 |
| `methods` | `object` | 否 | 外部方法，通过 `$methods` 访问 |

## schema

Schema 定义，可以是 JsonNode 对象或 JSON 字符串：

```vue
<template>
  <!-- 对象形式 -->
  <VSchema :schema="schemaObject" />
  
  <!-- 字符串形式 -->
  <VSchema :schema="jsonString" />
</template>
```

## config

组件级配置，会覆盖全局配置：

```vue
<template>
  <VSchema 
    :schema="schema" 
    :config="{ baseURL: 'https://other-api.com' }"
  />
</template>
```

## initialData

注入外部数据，与 schema.data 合并：

```vue
<template>
  <VSchema 
    :schema="schema" 
    :initial-data="{ userId: 123, token: 'abc' }"
  />
</template>
```

在 Schema 中访问：
```json
{ "children": "用户ID: {{ userId }}" }
```

## methods

注入外部方法，在 script 动作中通过 `$methods` 访问：

```vue
<template>
  <VSchema :schema="schema" :methods="externalMethods" />
</template>

<script setup>
const externalMethods = {
  login: async (username, password) => {
    // 登录逻辑
  },
  logout: () => {
    // 登出逻辑
  }
};
</script>
```

在 Schema 中调用：
```json
{
  "events": {
    "click": {
      "script": "await $methods.login(state.form.username, state.form.password);"
    }
  }
}
```

## 事件

### @error

渲染或解析错误时触发：

```vue
<template>
  <VSchema :schema="schema" @error="handleError" />
</template>

<script setup>
const handleError = (error) => {
  console.error('VSchema 错误:', error);
};
</script>
```

错误对象结构：
```typescript
interface VSchemaError {
  type: 'parse' | 'render';
  errors?: ParseError[];  // 解析错误
  error?: Error;          // 渲染错误
}
```
