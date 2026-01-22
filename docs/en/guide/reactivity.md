# Reactivity

VSchema fully supports Vue 3's reactivity system, data changes automatically trigger view updates.

## Defining Data

Define reactive data in Schema's `data` property:

```json
{
  "data": {
    "count": 0,
    "message": "Hello",
    "user": { "name": "John", "email": "john@example.com" },
    "items": ["Apple", "Banana", "Orange"]
  },
  "com": "div",
  "children": "..."
}
```

## Accessing Data

Access data directly using property names in expressions:

```json
{
  "data": { "count": 0, "user": { "name": "John" } },
  "com": "div",
  "children": [
    { "com": "p", "children": "Count: {{ count }}" },
    { "com": "p", "children": "User: {{ user.name }}" }
  ]
}
```

## Modifying Data

Use `set` action to modify data:

### Simple Values

```json
{
  "events": {
    "click": { "set": "count", "value": "{{ count + 1 }}" }
  }
}
```

### Nested Properties

Support dot notation for nested properties:

```json
{
  "events": {
    "click": { "set": "user.name", "value": "Jane" }
  }
}
```

### Array Operations

```json
{
  "data": { "items": [] },
  "methods": {
    "addItem": {
      "set": "items",
      "value": "{{ [...items, { id: Date.now(), text: newItem }] }}"
    },
    "removeItem": {
      "set": "items",
      "value": "{{ items.filter(item => item.id !== targetId) }}"
    }
  }
}
```

### Array Index

Support array index syntax:

```json
{
  "events": {
    "click": { "set": "items[0].name", "value": "New Name" }
  }
}
```

## Computed Properties

Use `computed` to define derived state:

```json
{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "items": [
      { "price": 10, "quantity": 2 },
      { "price": 20, "quantity": 1 }
    ]
  },
  "computed": {
    "fullName": "firstName + ' ' + lastName",
    "total": "items.reduce((sum, item) => sum + item.price * item.quantity, 0)",
    "hasItems": "items.length > 0"
  },
  "com": "div",
  "children": [
    { "com": "p", "children": "Name: {{ fullName }}" },
    { "com": "p", "children": "Total: ${{ total }}" }
  ]
}
```

Computed properties automatically track dependencies and recalculate when dependencies change.

## Watchers

Use `watch` to observe data changes and execute actions:

### Basic Usage

```json
{
  "data": { "searchText": "" },
  "watch": {
    "searchText": { "call": "doSearch" }
  },
  "methods": {
    "doSearch": {
      "fetch": "/api/search?q={{ searchText }}",
      "then": { "set": "results", "value": "{{ $response }}" }
    }
  }
}
```

### Full Configuration

```json
{
  "watch": {
    "user": {
      "handler": { "call": "onUserChange" },
      "immediate": true,
      "deep": true
    }
  }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `handler` | `Action` | Action to execute on change |
| `immediate` | `boolean` | Execute immediately on mount |
| `deep` | `boolean` | Deep watch object changes |

### Watching Multiple Properties

```json
{
  "watch": {
    "form.username": { "call": "validateUsername" },
    "form.password": { "call": "validatePassword" },
    "form": {
      "handler": { "call": "onFormChange" },
      "deep": true
    }
  }
}
```

## Injecting External Data

Inject external data via `initialData` prop:

```vue
<template>
  <VSchema :schema="schema" :initial-data="externalData" />
</template>

<script setup>
const externalData = {
  userId: 123,
  token: 'abc',
  config: { theme: 'dark' }
};
</script>
```

Injected data merges with Schema's `data` and can be accessed directly in expressions.

## Best Practices

### 1. Organize Data Structure

```json
{
  "data": {
    "ui": {
      "loading": false,
      "error": null
    },
    "form": {
      "username": "",
      "password": ""
    },
    "list": {
      "items": [],
      "total": 0,
      "page": 1
    }
  }
}
```

### 2. Use Computed Properties to Simplify Templates

```json
{
  "data": { "items": [], "loading": false },
  "computed": {
    "isEmpty": "!loading && items.length === 0",
    "showList": "!loading && items.length > 0"
  }
}
```

### 3. Avoid Complex Calculations in Expressions

```json
// ❌ Not recommended
{ "children": "{{ items.filter(i => i.active).map(i => i.name).join(', ') }}" }

// ✅ Recommended: Use computed properties
{
  "computed": {
    "activeNames": "items.filter(i => i.active).map(i => i.name).join(', ')"
  },
  "children": "{{ activeNames }}"
}
```
