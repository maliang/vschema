# Lifecycle

VSchema supports Vue component lifecycle hooks.

## Available Hooks

| Hook | Description |
|------|-------------|
| `onMounted` | Execute after component mount |
| `onUnmounted` | Execute before component unmount |
| `onUpdated` | Execute after component update |

## onMounted

Execute after mount, commonly used for data initialization:

```json
{
  "data": { "users": [], "loading": true },
  "onMounted": {
    "fetch": "/api/users",
    "then": { "set": "users", "value": "{{ $response }}" },
    "finally": { "set": "loading", "value": false }
  }
}
```

### Multiple Actions

```json
{
  "onMounted": [
    { "call": "loadUserInfo" },
    { "call": "loadNotifications" }
  ]
}
```

## onUnmounted

Execute before unmount, commonly used for cleanup:

```json
{
  "onMounted": { "ws": "wss://example.com/socket", "op": "connect", "id": "chat" },
  "onUnmounted": { "ws": "chat", "op": "close" }
}
```

## onUpdated

Execute after component update:

```json
{
  "onUpdated": { "script": "console.log('Component updated');" }
}
```
