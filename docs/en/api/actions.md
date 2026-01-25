# Actions

All action types supported by VSchema.

## set - Modify State

```json
{ "set": "count", "value": "{{ count + 1 }}" }
{ "set": "user.name", "value": "John" }
{ "set": "items[0].checked", "value": true }
```

## call - Call Method

```typescript
interface CallAction {
  call: string;     // Method name (supports nested paths)
  args?: any[];     // Arguments list
}
```

Examples:
```json
{ "call": "handleSubmit" }
{ "call": "updateItem", "args": ["{{ item.id }}", "{{ newValue }}"] }
```

Supports nested path to call externally injected methods:
```json
{ "call": "$methods.$nav.push", "args": ["/user/profile"] }
{ "call": "$methods.$tab.close" }
{ "call": "$methods.$window.open", "args": ["https://example.com"] }
```

Method lookup order:
1. First looks in `methods` (methods defined in schema)
2. If not found, looks in `state` (including externally injected `$methods`)

## emit - Emit Event

```json
{ "emit": "select", "payload": "{{ item }}" }
```

## fetch - API Call

```typescript
interface FetchAction {
  fetch: string;           // API URL, supports expressions
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';  // HTTP method
  headers?: object;        // Request headers
  params?: object;         // Query parameters (for GET requests)
  body?: any;              // Request body
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';  // Response type, defaults to 'json'
  then?: Action | Action[];    // Success callback, access $response
  catch?: Action | Action[];   // Error callback, access $error
  finally?: Action | Action[]; // Always callback (success or failure)
  ignoreBaseURL?: boolean;     // Whether to ignore global baseURL
}
```

Examples:
```json
{
  "fetch": "/api/users/{{ userId }}",
  "method": "PUT",
  "body": { "name": "{{ form.name }}" },
  "then": { "set": "user", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" },
  "finally": { "set": "loading", "value": false }
}
```

Ignore global baseURL (for local mock, etc.):
```json
{
  "fetch": "/local-mock/data.json",
  "ignoreBaseURL": true,
  "then": { "set": "mockData", "value": "{{ $response }}" }
}
```

### responseType - Response Types

| Value | Description |
|-------|-------------|
| `json` | Default. Parses JSON response and performs business status code check |
| `text` | Returns raw text without JSON parsing |
| `blob` | Returns Blob object for file downloads |
| `arrayBuffer` | Returns ArrayBuffer for binary data processing |

File download example:
```json
{
  "fetch": "/api/export",
  "params": { "type": "excel" },
  "responseType": "blob",
  "then": {
    "call": "$methods.$download",
    "args": ["{{ $response }}", "export-data.xlsx"]
  },
  "catch": {
    "call": "$message.error",
    "args": ["{{ $error.message || 'Export failed' }}"]
  }
}
```

> Note: When `responseType` is `blob`, `text`, or `arrayBuffer`, the response bypasses business status code checking, and `$response` returns the raw data directly.

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

```typescript
interface WebSocketAction {
  ws: string;              // URL (for connect) or connection ID (for send/close)
  op?: 'connect' | 'send' | 'close';  // Operation type, defaults to 'connect'
  id?: string;             // Connection identifier, set on connect, reference by ws in subsequent ops

  // Connection options (for connect)
  protocols?: string | string[];  // WebSocket sub-protocols
  timeout?: number;               // Connection timeout (milliseconds)

  // Send options (for send)
  message?: any;                  // Message content to send
  sendAs?: 'text' | 'json';       // Message serialization format

  // Receive options
  responseType?: 'text' | 'json' | 'auto';  // Message parsing mode, defaults to 'auto'

  // Lifecycle callbacks
  onOpen?: Action | Action[];
  onMessage?: Action | Action[];
  onError?: Action | Action[];
  onClose?: Action | Action[];

  // Flow callbacks (triggered once per op)
  then?: Action | Action[];
  catch?: Action | Action[];
  finally?: Action | Action[];

  // Close options (for close)
  code?: number;                  // Close status code
  reason?: string;                // Close reason
}
```

Examples:

Establish connection:
```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "timeout": 5000,
  "onOpen": { "set": "connected", "value": true },
  "onMessage": { "set": "lastMessage", "value": "{{ $response }}" },
  "onError": { "set": "error", "value": "{{ $error.message }}" }
}
```

Send message:
```json
{
  "ws": "main",
  "op": "send",
  "message": { "type": "chat", "content": "{{ inputText }}" },
  "sendAs": "json"
}
```

Close connection:
```json
{
  "ws": "main",
  "op": "close",
  "code": 1000,
  "reason": "User disconnected"
}
```
