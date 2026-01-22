# Event Handling

VSchema provides flexible event binding and action system with Vue event modifiers support.

## Basic Usage

Use `events` property to bindEvents:

```json
{
  "com": "button",
  "events": {
    "click": { "set": "count", "value": "{{ count + 1 }}" }
  },
  "children": "Click"
}
```

## Action Types

### set - Modify State

```json
{ "set": "count", "value": "{{ count + 1 }}" }
{ "set": "user.name", "value": "Jane" }
```

### call - Call Method

```json
{ "call": "handleSubmit" }
{ "call": "updateItem", "args": ["{{ item.id }}", "{{ newValue }}"] }
```

### emit - Emit Event

```json
{ "emit": "select", "payload": "{{ item }}" }
```

### fetch - API Call

```json
{
  "fetch": "/api/users/{{ userId }}",
  "method": "POST",
  "body": { "name": "{{ form.name }}" },
  "then": { "set": "result", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

### copy - Copy to Clipboard

```json
{
  "copy": "{{ shareUrl }}",
  "then": { "set": "copied", "value": true }
}
```

### if - Conditional Execution

```json
{
  "if": "count > 10",
  "then": { "set": "message", "value": "Greater than 10" },
  "else": { "set": "message", "value": "Less than or equal to 10" }
}
```

### script - Custom Script

```json
{
  "script": "await $methods.login(state.form.username, state.form.password);"
}
```

Available variables: `state`, `computed`, `$event`, `$response`, `$error`, `$methods`

### ws - WebSocket

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onMessage": { "set": "lastMessage", "value": "{{ $response }}" }
}
```

See [WebSocket Guide](/en/guide/websocket) for full documentation.

## Event Modifiers

Support Vue event modifier syntax:

```json
{
  "events": {
    "click.prevent": { "call": "handleClick" },
    "click.stop": { "call": "handleClick" },
    "submit.prevent": { "call": "handleSubmit" },
    "keyup.enter": { "call": "submit" },
    "keydown.ctrl.s": { "call": "save" }
  }
}
```

### Available Modifiers

| Modifier | Description |
|----------|-------------|
| `.prevent` | Prevent default behavior |
| `.stop` | Stop event propagation |
| `.capture` | Use capture mode |
| `.self` | Only trigger on element itself |
| `.once` | Trigger only once |
| `.enter` | Enter key |
| `.esc` | Escape key |
| `.ctrl` | Ctrl key |
| `.alt` | Alt key |
| `.shift` | Shift key |

## Accessing Event Object

Use `$event` to access native event object:

```json
{
  "events": {
    "input": { "set": "value", "value": "{{ $event.target.value }}" }
  }
}
```
