# Basic Examples

## Counter

```json
{
  "data": { "count": 0 },
  "computed": { "double": "count * 2" },
  "com": "div",
  "children": [
    { "com": "p", "children": "Count: {{ count }}" },
    { "com": "p", "children": "Double: {{ double }}" },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": "{{ count + 1 }}" } },
      "children": "Increment"
    },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": "{{ count - 1 }}" } },
      "children": "Decrement"
    },
    {
      "com": "button",
      "events": { "click": { "set": "count", "value": 0 } },
      "children": "Reset"
    }
  ]
}
```

## Hello World

```json
{
  "data": { "name": "World" },
  "com": "div",
  "children": [
    { "com": "h1", "children": "Hello, {{ name }}!" },
    { "com": "input", "model": "name", "props": { "placeholder": "Enter name" } }
  ]
}
```

## Conditional Rendering

```json
{
  "data": { "show": true },
  "com": "div",
  "children": [
    {
      "com": "button",
      "events": { "click": { "set": "show", "value": "{{ !show }}" } },
      "children": "{{ show ? 'Hide' : 'Show' }}"
    },
    { "com": "p", "if": "show", "children": "This text can be shown/hidden" }
  ]
}
```

## Simple List

```json
{
  "data": { "items": ["Apple", "Banana", "Orange"] },
  "com": "ul",
  "children": [
    {
      "for": "(item, index) in items",
      "com": "li",
      "children": "{{ index + 1 }}. {{ item }}"
    }
  ]
}
```
