# Directives

VSchema supports Vue-like conditional and loop rendering directives.

## Conditional Rendering

### if Directive

Use `if` property for conditional rendering, similar to Vue's `v-if`:

```json
{
  "com": "div",
  "if": "isLoggedIn",
  "children": "Welcome back!"
}
```

### Complex Conditions

```json
{
  "com": "div",
  "if": "user && user.role === 'admin'",
  "children": "Admin Panel"
}
```

### show Directive

Use `show` to control visibility, similar to Vue's `v-show`:

```json
{
  "com": "div",
  "show": "isVisible",
  "children": "This content can be shown/hidden"
}
```

Difference from `if`:
- `if`: Does not render DOM when false
- `show`: Hides via CSS `display: none` when false

## Loop Rendering

### for Directive

Use `for` for loop rendering, similar to Vue's `v-for`:

```json
{
  "data": { "items": ["Apple", "Banana", "Orange"] },
  "com": "ul",
  "children": [
    {
      "for": "item in items",
      "com": "li",
      "children": "{{ item }}"
    }
  ]
}
```

### With Index

```json
{
  "for": "(item, index) in items",
  "com": "li",
  "children": "{{ index + 1 }}. {{ item }}"
}
```

### key Property

Use `key` for unique identification:

```json
{
  "for": "item in items",
  "key": "{{ item.id }}",
  "com": "div",
  "children": "{{ item.name }}"
}
```

### Nested Loops

```json
{
  "for": "category in categories",
  "com": "div",
  "children": [
    { "com": "h3", "children": "{{ category.name }}" },
    {
      "com": "ul",
      "children": [
        {
          "for": "item in category.items",
          "com": "li",
          "children": "{{ item }}"
        }
      ]
    }
  ]
}
```
