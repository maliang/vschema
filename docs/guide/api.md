# API 调用

VSchema 提供多种方式与后端 API 交互。

## fetch 动作

在事件处理中使用 `fetch` 动作调用 API：

```json
{
  "events": {
    "click": {
      "fetch": "/api/users",
      "then": { "set": "users", "value": "{{ $response }}" }
    }
  }
}
```

### 完整配置

```json
{
  "fetch": "/api/users/{{ userId }}",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{ token }}"
  },
  "body": {
    "name": "{{ form.name }}",
    "email": "{{ form.email }}"
  },
  "then": { "set": "result", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" },
  "finally": { "set": "loading", "value": false }
}
```

### 配置项

| 属性 | 类型 | 说明 |
|------|------|------|
| `fetch` | `string` | API 地址，支持表达式 |
| `method` | `string` | 请求方法：GET, POST, PUT, DELETE 等 |
| `headers` | `object` | 请求头 |
| `params` | `object` | 查询参数（自动拼接到 URL） |
| `body` | `any` | 请求体 |
| `responseType` | `string` | 响应类型：json（默认）、text、blob、arrayBuffer |
| `then` | `Action` | 成功回调，可访问 `$response` |
| `catch` | `Action` | 失败回调，可访问 `$error` |
| `finally` | `Action` | 完成回调（无论成功失败） |
| `ignoreBaseURL` | `boolean` | 是否忽略全局 baseURL |

### 文件下载

使用 `responseType: 'blob'` 下载文件：

```json
{
  "fetch": "/api/export",
  "params": { "type": "excel", "ids": "{{ selectedIds.join(',') }}" },
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

> 注意：`blob`、`text`、`arrayBuffer` 类型的响应不会进行业务状态码检查。

## initApi

组件挂载时自动请求 API，返回数据与 `data` 合并：

```json
{
  "data": { "title": "加载中...", "content": "" },
  "initApi": "/api/article/{{ articleId }}",
  "com": "div",
  "children": [
    { "com": "h1", "children": "{{ title }}" },
    { "com": "p", "children": "{{ content }}" }
  ]
}
```


### 完整配置

```json
{
  "initApi": {
    "url": "/api/data",
    "method": "GET",
    "headers": { "Authorization": "Bearer {{ token }}" },
    "body": { "page": 1, "size": 10 },
    "then": { "set": "message", "value": "数据加载成功" },
    "catch": { "set": "error", "value": "{{ $error.message }}" },
    "ignoreBaseURL": false
  }
}
```

### 配置项

| 属性 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 请求 URL，支持表达式 |
| `method` | `string` | 请求方法：GET, POST, PUT, DELETE, PATCH |
| `headers` | `object` | 请求头 |
| `body` | `any` | 请求体 |
| `then` | `Action` | 成功回调，可访问 `$response` |
| `catch` | `Action` | 失败回调，可访问 `$error` |
| `ignoreBaseURL` | `boolean` | 是否忽略全局 baseURL |

### 响应数据映射

API 返回的数据会自动与 `data` 合并。如果响应结构是 `{ code: 0, data: {...} }`，可以通过全局配置 `responseDataPath` 指定数据路径：

```typescript
app.use(createVSchemaPlugin({
  responseDataPath: 'data'
}));
```

## uiApi

组件挂载时请求 API，返回的 JsonNode 替换 `children`：

```json
{
  "uiApi": "/api/page/{{ pageId }}",
  "com": "div",
  "children": "加载中..."
}
```

后端返回的 JSON 会被解析为 VSchema 节点并渲染。

### 完整配置

```json
{
  "uiApi": {
    "url": "/api/pages/{{ pageId }}",
    "method": "GET",
    "headers": { "Authorization": "Bearer {{ token }}" },
    "then": { "set": "pageLoaded", "value": true },
    "catch": { "set": "loadError", "value": "{{ $error.message }}" },
    "ignoreBaseURL": false
  }
}
```

### 动态页面示例

```json
{
  "data": { "pageId": "home" },
  "uiApi": "/api/pages/{{ pageId }}",
  "com": "div",
  "children": [
    { "com": "div", "props": { "class": "loading" }, "children": "页面加载中..." }
  ]
}
```

后端返回：

```json
{
  "com": "div",
  "children": [
    { "com": "h1", "children": "首页" },
    { "com": "p", "children": "欢迎访问" }
  ]
}
```

## 全局配置

```typescript
app.use(createVSchemaPlugin({
  // API 基础地址
  baseURL: 'https://api.example.com',
  // 默认请求头
  defaultHeaders: {
    'Authorization': 'Bearer token',
    'X-App-Version': '1.0.0'
  },
  // 响应数据路径
  responseDataPath: 'data',
  // 请求超时（毫秒）
  timeout: 30000
}));
```

## 实际示例

### 分页列表

```json
{
  "data": {
    "list": [],
    "pagination": { "page": 1, "size": 10, "total": 0 },
    "loading": false
  },
  "methods": {
    "loadData": [
      { "set": "loading", "value": true },
      {
        "fetch": "/api/items?page={{ pagination.page }}&size={{ pagination.size }}",
        "then": [
          { "set": "list", "value": "{{ $response.items }}" },
          { "set": "pagination.total", "value": "{{ $response.total }}" }
        ],
        "finally": { "set": "loading", "value": false }
      }
    ],
    "changePage": [
      { "set": "pagination.page", "value": "{{ $event }}" },
      { "call": "loadData" }
    ]
  },
  "onMounted": { "call": "loadData" },
  "com": "div",
  "children": "..."
}
```

### 表单提交

```json
{
  "data": {
    "form": { "title": "", "content": "" },
    "submitting": false,
    "message": ""
  },
  "methods": {
    "submit": [
      { "set": "submitting", "value": true },
      {
        "fetch": "/api/posts",
        "method": "POST",
        "body": "{{ form }}",
        "then": [
          { "set": "message", "value": "提交成功！" },
          { "set": "form", "value": "{{ { title: '', content: '' } }}" }
        ],
        "catch": { "set": "message", "value": "提交失败: {{ $error.message }}" },
        "finally": { "set": "submitting", "value": false }
      }
    ]
  },
  "com": "form",
  "events": { "submit.prevent": { "call": "submit" } },
  "children": "..."
}
```
