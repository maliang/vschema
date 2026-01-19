# Component Props

Props accepted by VSchema component.

## Props List

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `schema` | `JsonNode \| string` | Yes | JSON Schema definition |
| `config` | `GlobalConfig` | No | Component-level config (overrides global) |
| `initialData` | `object` | No | Initial data, merges with schema.data |
| `methods` | `object` | No | External methods, accessed via `$methods` |

## schema

Schema definition, can be JsonNode object or JSON string:

```vue
<template>
  <VSchema :schema="schemaObject" />
  <VSchema :schema="jsonString" />
</template>
```

## config

Component-level config, overrides global config:

```vue
<template>
  <VSchema :schema="schema" :config="{ baseURL: 'https://other-api.com' }" />
</template>
```

## initialData

Inject external data, merges with schema.data:

```vue
<template>
  <VSchema :schema="schema" :initial-data="{ userId: 123 }" />
</template>
```

## methods

Inject external methods, accessed via `$methods` in script actions:

```vue
<template>
  <VSchema :schema="schema" :methods="externalMethods" />
</template>

<script setup>
const externalMethods = {
  login: async (username, password) => { /* login logic */ }
};
</script>
```

## Events

### @error

Emitted on render or parse errors:

```vue
<template>
  <VSchema :schema="schema" @error="handleError" />
</template>
```
