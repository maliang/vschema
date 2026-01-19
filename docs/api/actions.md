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
  call: string;     // 方法名
  args?: any[];     // 参数列表
}
```

示例：
```json
{ "call": "handleSubmit" }
{ "call": "updateItem", "args": ["{{ item.id }}", "{{ newValue }}"] }
```

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
  fetch: string;           // API 地址
  method?: string;         // 请求方法
  headers?: object;        // 请求头
  body?: any;              // 请求体
  then?: Action | Action[];    // 成功回调
  catch?: Action | Action[];   // 失败回调
  finally?: Action | Action[]; // 完成回调
}
```

示例：
```json
{
  "fetch": "/api/users/{{ userId }}",
  "method": "PUT",
  "body": { "name": "{{ form.name }}" },
  "then": { "set": "user", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" }
}
```

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
interface WsAction {
  ws: string;              // 连接地址或连接 ID
  op: 'connect' | 'send' | 'close';
  id?: string;             // 连接标识
  data?: any;              // 发送的数据
  onOpen?: Action;
  onMessage?: Action;
  onError?: Action;
  onClose?: Action;
}
```

示例：
```json
{
  "ws": "wss://example.com/socket",
  "op": "connect",
  "id": "main",
  "onMessage": { "set": "lastMessage", "value": "{{ $response }}" }
}
```
