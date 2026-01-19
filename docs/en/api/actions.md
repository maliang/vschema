# Actions

All action types supported by VSchema.

## set - Modify State

```json
{ "set": "count", "value": "{{ count + 1 }}" }
{ "set": "user.name", "value": "John" }
{ "set": "items[0].checked", "value": true }
```

## call - Call Method

```json
{ "call": "handleSubmit" }
{ "call": "updateItem", "args": ["{{ item.id }}", "{{ newValue }}"] }
```

## emit - Emit Event

```json
{ "emit": "select", "payload": "{{ item }}" }
```

## fetch - API Call

```json
{
  "fetch": "/api/users/{{ userId }}",
  "method": "PUT",
  "body": { "name": "{{ form.name }}" },
  "then": { "set": "user", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

## copy - Copy to Clipboard

```json
{
  "copy": "{{ shareUrl }}",
  "then": { "set": "copied", "value": true }
}
```

## if - Conditional Execution

```json
{
  "if": "count > 10",
  "then": { "set": "message", "value": "Greater than 10" },
  "else": { "set": "message", "value": "Less than or equal to 10" }
}
```

## script - Custom Script

```json
{ "script": "await $methods.login(state.form.username, state.form.password);" }
```

Available variables: `state`, `computed`, `$event`, `$response`, `$error`, `$methods`

## ws - WebSocket

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onMessage": { "set": "lastMessage", "value": "{{ $response }}" }
}
```
