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
    "onMessage": {
      "set": "messages",
      "value": "{{ [...messages, $response] }}"
    },
    "onClose": { "set": "connected", "value": false }
  }
}
```

## Full Configuration

```typescript
interface WebSocketAction {
  ws: string;              // URL (for connect) or connection ID (for send/close)
  op?: 'connect' | 'send' | 'close';  // Operation type, defaults to 'connect'
  id?: string;             // Connection identifier

  // Connection options
  protocols?: string | string[];  // WebSocket sub-protocols
  timeout?: number;               // Connection timeout (milliseconds)

  // Send options
  message?: any;                  // Message content to send
  sendAs?: 'text' | 'json';       // Message serialization format

  // Receive options
  responseType?: 'text' | 'json' | 'auto';  // Message parsing mode, defaults to 'auto'

  // Lifecycle callbacks
  onOpen?: Action | Action[];
  onMessage?: Action | Action[];
  onError?: Action | Action[];
  onClose?: Action | Action[];

  // Flow callbacks
  then?: Action | Action[];
  catch?: Action | Action[];
  finally?: Action | Action[];

  // Close options
  code?: number;
  reason?: string;
}
```

## Operations

### connect - Establish Connection

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "timeout": 5000,
  "protocols": ["v1.chat"],
  "onOpen": { "set": "status", "value": "connected" },
  "onMessage": { "call": "handleMessage" },
  "onError": { "set": "error", "value": "{{ $error.message }}" },
  "onClose": { "set": "status", "value": "disconnected" }
}
```

### send - Send Message

```json
{
  "ws": "main",
  "op": "send",
  "message": { "type": "chat", "content": "{{ inputText }}" },
  "sendAs": "json"
}
```

Send plain text:
```json
{
  "ws": "main",
  "op": "send",
  "message": "{{ inputText }}",
  "sendAs": "text"
}
```

### close - Close Connection

```json
{
  "ws": "main",
  "op": "close",
  "code": 1000,
  "reason": "User disconnected"
}
```

## Message Parsing

Use `responseType` to control how `$response` is parsed in `onMessage`:

- `auto` (default): Attempts JSON parsing, falls back to raw text on failure
- `json`: Forces JSON parsing
- `text`: Always returns raw text

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "data",
  "responseType": "json",
  "onMessage": {
    "set": "data",
    "value": "{{ $response.payload }}"
  }
}
```

## Flow Callbacks

Similar to `fetch` action, `ws` also supports `then/catch/finally` callbacks:

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "then": { "set": "status", "value": "Connection successful" },
  "catch": { "set": "error", "value": "{{ $error.message }}" },
  "finally": { "set": "loading", "value": false }
}
```
