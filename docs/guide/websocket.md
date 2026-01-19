# WebSocket

VSchema 内置 WebSocket 支持，用于实时通信场景。

## 基础用法

使用 `ws` 动作建立 WebSocket 连接：

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

## 操作类型

### connect - 建立连接

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onOpen": { "set": "status", "value": "connected" },
  "onMessage": { "call": "handleMessage" },
  "onError": { "set": "error", "value": "{{ $error.message }}" },
  "onClose": { "set": "status", "value": "disconnected" }
}
```

### send - 发送消息

```json
{
  "ws": "main",
  "op": "send",
  "data": { "type": "chat", "content": "{{ message }}" }
}
```

### close - 关闭连接

```json
{
  "ws": "main",
  "op": "close"
}
```
