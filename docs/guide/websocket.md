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

## 完整配置

```typescript
interface WebSocketAction {
  ws: string;              // 连接地址（connect 时）或连接 ID（send/close 时）
  op?: 'connect' | 'send' | 'close';  // 操作类型，默认 'connect'
  id?: string;             // 连接标识

  // 连接配置
  protocols?: string | string[];  // WebSocket 子协议
  timeout?: number;               // 连接超时（毫秒）

  // 发送配置
  message?: any;                  // 发送的消息内容
  sendAs?: 'text' | 'json';       // 消息序列化方式

  // 接收配置
  responseType?: 'text' | 'json' | 'auto';  // 消息解析方式，默认 'auto'

  // 生命周期回调
  onOpen?: Action | Action[];
  onMessage?: Action | Action[];
  onError?: Action | Action[];
  onClose?: Action | Action[];

  // 流程回调
  then?: Action | Action[];
  catch?: Action | Action[];
  finally?: Action | Action[];

  // 关闭配置
  code?: number;
  reason?: string;
}
```

## 操作类型

### connect - 建立连接

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

### send - 发送消息

```json
{
  "ws": "main",
  "op": "send",
  "message": { "type": "chat", "content": "{{ inputText }}" },
  "sendAs": "json"
}
```

发送纯文本：
```json
{
  "ws": "main",
  "op": "send",
  "message": "{{ inputText }}",
  "sendAs": "text"
}
```

### close - 关闭连接

```json
{
  "ws": "main",
  "op": "close",
  "code": 1000,
  "reason": "用户主动断开"
}
```

## 消息解析

通过 `responseType` 控制 `onMessage` 中 `$response` 的解析方式：

- `auto`（默认）：自动尝试 JSON 解析，失败则返回原始文本
- `json`：强制 JSON 解析
- `text`：始终返回原始文本

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

## 流程回调

类似 `fetch` 动作，`ws` 也支持 `then/catch/finally` 回调：

```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "then": { "set": "status", "value": "连接成功" },
  "catch": { "set": "error", "value": "{{ $error.message }}" },
  "finally": { "set": "loading", "value": false }
}
```
