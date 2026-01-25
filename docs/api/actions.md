# 动作类型

VSchema 支持的所有动作类型。

## set - 修改状态

```typescript
interface SetAction {
  set: string;      // 数据路径
  value: any;       // 新值（支持表达式）
}
```

示例：
```json
{ "set": "count", "value": "{{ count + 1 }}" }
{ "set": "user.name", "value": "张三" }
{ "set": "items[0].checked", "value": true }
```

## call - 调用方法

```typescript
interface CallAction {
  call: string;     // 方法名（支持嵌套路径）
  args?: any[];     // 参数列表
}
```

示例：
```json
{ "call": "handleSubmit" }
{ "call": "updateItem", "args": ["{{ item.id }}", "{{ newValue }}"] }
```

支持嵌套路径调用外部注入的方法：
```json
{ "call": "$methods.$nav.push", "args": ["/user/profile"] }
{ "call": "$methods.$tab.close" }
{ "call": "$methods.$window.open", "args": ["https://example.com"] }
```

方法查找顺序：
1. 首先在 `methods`（schema 中定义的方法）中查找
2. 如果未找到，在 `state`（包括外部注入的 `$methods`）中查找

## emit - 触发事件

```typescript
interface EmitAction {
  emit: string;     // 事件名
  payload?: any;    // 事件数据
}
```

示例：
```json
{ "emit": "select", "payload": "{{ item }}" }
{ "emit": "change", "payload": "{{ { id: item.id, value: newValue } }}" }
```

## fetch - API 调用

```typescript
interface FetchAction {
  fetch: string;           // API 地址，支持表达式
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';  // 请求方法
  headers?: object;        // 请求头
  params?: object;         // 查询参数（GET 请求）
  body?: any;              // 请求体
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';  // 响应类型，默认 'json'
  then?: Action | Action[];    // 成功回调，可访问 $response
  catch?: Action | Action[];   // 失败回调，可访问 $error
  finally?: Action | Action[]; // 完成回调（无论成功失败）
  ignoreBaseURL?: boolean;     // 是否忽略全局 baseURL
}
```

示例：
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

忽略全局 baseURL（用于本地 mock 等场景）：
```json
{
  "fetch": "/local-mock/data.json",
  "ignoreBaseURL": true,
  "then": { "set": "mockData", "value": "{{ $response }}" }
}
```

### responseType 响应类型

| 值 | 说明 |
|---|------|
| `json` | 默认值，自动解析 JSON 响应并进行业务状态码检查 |
| `text` | 返回原始文本，不进行 JSON 解析 |
| `blob` | 返回 Blob 对象，用于文件下载 |
| `arrayBuffer` | 返回 ArrayBuffer，用于二进制数据处理 |

文件下载示例：
```json
{
  "fetch": "/api/export",
  "params": { "type": "excel" },
  "responseType": "blob",
  "then": {
    "call": "$methods.$download",
    "args": ["{{ $response }}", "导出数据.xlsx"]
  },
  "catch": {
    "call": "$message.error",
    "args": ["{{ $error.message || '导出失败' }}"]
  }
}
```

> 注意：当 `responseType` 为 `blob`、`text` 或 `arrayBuffer` 时，响应不会进行业务状态码检查，`$response` 直接返回原始数据。

## copy - 复制到剪贴板

```typescript
interface CopyAction {
  copy: string;            // 要复制的内容
  then?: Action | Action[];
  catch?: Action | Action[];
}
```

示例：
```json
{
  "copy": "{{ shareUrl }}",
  "then": { "set": "copied", "value": true }
}
```

## if - 条件执行

```typescript
interface IfAction {
  if: string;              // 条件表达式
  then: Action | Action[]; // 条件为真时执行
  else?: Action | Action[]; // 条件为假时执行
}
```

示例：
```json
{
  "if": "count > 10",
  "then": { "set": "message", "value": "大于10" },
  "else": { "set": "message", "value": "小于等于10" }
}
```

## script - 自定义脚本

```typescript
interface ScriptAction {
  script: string;  // JavaScript 代码
}
```

可用变量：`state`, `computed`, `$event`, `$response`, `$error`, `$methods`

示例：
```json
{
  "script": "await $methods.login(state.form.username, state.form.password);"
}
```

## ws - WebSocket

```typescript
interface WebSocketAction {
  ws: string;              // 连接地址（connect 时）或连接 ID（send/close 时）
  op?: 'connect' | 'send' | 'close';  // 操作类型，默认 'connect'
  id?: string;             // 连接标识，connect 时设置后，后续 op 通过 ws 引用该 id

  // 连接配置（connect 时使用）
  protocols?: string | string[];  // WebSocket 子协议
  timeout?: number;               // 连接超时（毫秒）

  // 发送配置（send 时使用）
  message?: any;                  // 发送的消息内容
  sendAs?: 'text' | 'json';       // 消息序列化方式

  // 接收配置
  responseType?: 'text' | 'json' | 'auto';  // 消息解析方式，默认 'auto'

  // 生命周期回调
  onOpen?: Action | Action[];
  onMessage?: Action | Action[];
  onError?: Action | Action[];
  onClose?: Action | Action[];

  // 流程回调（每次 op 触发一次）
  then?: Action | Action[];
  catch?: Action | Action[];
  finally?: Action | Action[];

  // 关闭配置（close 时使用）
  code?: number;                  // 关闭状态码
  reason?: string;                // 关闭原因
}
```

示例：

建立连接：
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

发送消息：
```json
{
  "ws": "main",
  "op": "send",
  "message": { "type": "chat", "content": "{{ inputText }}" },
  "sendAs": "json"
}
```

关闭连接：
```json
{
  "ws": "main",
  "op": "close",
  "code": 1000,
  "reason": "用户主动断开"
}
```
