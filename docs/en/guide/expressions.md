# Expression Syntax

VSchema uses `{{ expression }}` syntax to embed JavaScript expressions in strings.

## Basic Syntax

### Simple Expressions

```json
{ "children": "{{ count }}" }
{ "children": "{{ user.name }}" }
{ "children": "{{ items[0] }}" }
```

### Text Interpolation

```json
{ "children": "Hello, {{ name }}! Welcome to {{ siteName }}" }
```

### Arithmetic Expressions

```json
{ "children": "{{ count + 1 }}" }
{ "children": "{{ price * quantity }}" }
```

### Ternary Expressions

```json
{ "children": "{{ isVip ? 'VIP User' : 'Regular User' }}" }
{ "props": { "class": "{{ active ? 'active' : '' }}" } }
```

## In Props

### Dynamic Class

```json
{ "props": { "class": "{{ isActive ? 'btn-active' : 'btn-normal' }}" } }
```

### Dynamic Style

```json
{
  "props": {
    "style": {
      "color": "{{ textColor }}",
      "fontSize": "{{ fontSize }}px"
    }
  }
}
```

## Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `state` | Current state object | `state.count` |
| `computed` | Computed properties | `computed.total` |
| `$event` | Event object (in event handlers) | `$event.target.value` |
| `$response` | API response (in fetch then) | `$response.data` |
| `$error` | Error object (in catch) | `$error.message` |
| `$methods` | Injected external methods | `$methods.login()` |

## Security Restrictions

For security, the expression evaluator prohibits:

- `eval`, `Function` - Code execution
- `window`, `document`, `globalThis` - Global objects
- `constructor`, `__proto__` - Prototype chain
- `fetch`, `XMLHttpRequest` - Network requests (use fetch action)
