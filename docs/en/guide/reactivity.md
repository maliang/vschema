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
{ "set": "user.name", "value": "Jane" }
```

### Array Operations

```json
{
  "data": { "items": [] },
  "methods": {
    "addItem": {
      "set": "items",
      "value": "{{ [...items, { id: Date.now(), text: newItem }] }}"
    }
  }
}
```

## Computed Properties

Use `computed` to define derived state:

```json
{
  "data": { "firstName": "John", "lastName": "Doe" },
  "computed": {
    "fullName": "firstName + ' ' + lastName",
    "hasItems": "items.length > 0"
  },
  "com": "div",
  "children": "{{ fullName }}"
}
```

## Watchers

Use `watch` to observe data changes and execute actions:

```json
{
  "data": { "searchText": "" },
  "watch": {
    "searchText": { "call": "doSearch" }
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
