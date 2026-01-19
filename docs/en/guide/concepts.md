# Core Concepts

## Schema Structure

The core of VSchema is the `JsonNode` type, which describes complete information of a UI node:

```typescript
interface JsonNode {
  // Basic properties
  com: string;                    // Component type
  props?: Record<string, any>;    // Component props
  children?: JsonNode[] | string; // Child nodes or text

  // Data related
  data?: Record<string, any>;     // Reactive data
  computed?: Record<string, string>; // Computed properties
  methods?: Record<string, Action>;  // Method definitions

  // Directives
  if?: string;      // Conditional rendering (v-if)
  show?: string;    // Show/hide (v-show)
  for?: string;     // Loop rendering (v-for)
  key?: string;     // Loop key
  model?: string;   // Two-way binding (v-model)
  ref?: string;     // Template ref

  // Events and lifecycle
  events?: Record<string, Action | Action[]>;
  onMounted?: Action | Action[];
  onUnmounted?: Action | Action[];
  onUpdated?: Action | Action[];
  watch?: Record<string, WatchConfig>;

  // API configuration
  initApi?: string | ApiConfig;
  uiApi?: string | ApiConfig;

  // Slots
  slots?: Record<string, SlotConfig>;
}
```

## Component Type (com)

The `com` property specifies the component to render:

### HTML Tags

```json
{ "com": "div", "children": "A div element" }
{ "com": "button", "children": "Button" }
{ "com": "input", "props": { "type": "text" } }
```

### Registered Custom Components

```json
{ "com": "MyButton", "props": { "type": "primary" } }
{ "com": "ElInput", "model": "form.name" }
```

## Props

Pass props to components via `props`, supporting expressions:

```json
{
  "com": "button",
  "props": {
    "type": "button",
    "class": "{{ isActive ? 'btn-active' : 'btn-normal' }}",
    "disabled": "{{ loading }}"
  }
}
```

## Children

`children` can be a string or array of nodes:

### Text Content

```json
{ "com": "p", "children": "Static text" }
```

### Text with Expressions

```json
{ "com": "p", "children": "Hello, {{ user.name }}!" }
```

### Child Node Array

```json
{
  "com": "div",
  "children": [
    { "com": "h1", "children": "Title" },
    { "com": "p", "children": "Paragraph content" }
  ]
}
```

## Data Definition

Define reactive data at root or any node:

```json
{
  "data": {
    "count": 0,
    "user": { "name": "John", "age": 25 },
    "items": []
  },
  "com": "div",
  "children": "{{ user.name }}'s count: {{ count }}"
}
```

::: tip data vs state
- `data` is used to declare initial data in Schema
- Runtime access current state via `state`
- In expressions, use property names directly (e.g., `count`), internally reads from `state`
:::

## Computed Properties

Define derived state, values are expression strings:

```json
{
  "data": { "count": 0 },
  "computed": {
    "double": "count * 2",
    "isEven": "count % 2 === 0"
  },
  "com": "div",
  "children": "{{ count }} doubled is {{ double }}"
}
```

## Methods

Define reusable actions:

```json
{
  "data": { "count": 0 },
  "methods": {
    "increment": { "set": "count", "value": "{{ count + 1 }}" },
    "reset": { "set": "count", "value": 0 }
  },
  "com": "div",
  "children": [
    { "com": "span", "children": "{{ count }}" },
    {
      "com": "button",
      "events": { "click": { "call": "increment" } },
      "children": "Increment"
    }
  ]
}
```
