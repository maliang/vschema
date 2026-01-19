# WebSocket

VSchema has built-in WebSocket support for real-time communication.

## Basic Usage

```json
{
  "data": { "messages": [], "connected": false },
  "onMounted": {
    "ws": "wss://example.com/socket",
    "op": "connect",
    "id": "chat",
    "onOpen": { "set": "connected", "value": true },
    "onMessage": { "set": "messages", "value": "{{ [...messages, $response] }}" },
    "onClose": { "set": "connected", "value": false }
  }
}
```

## Operations

### connect

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onOpen": { "set": "status", "value": "connected" },
  "onMessage": { "call": "handleMessage" }
}
```

### send

```json
{
  "ws": "main",
  "op": "send",
  "data": { "type": "chat", "content": "{{ message }}" }
}
```

### close

```json
{ "ws": "main", "op": "close" }
```
