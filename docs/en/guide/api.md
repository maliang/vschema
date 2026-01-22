# API Calls

VSchema provides multiple ways to interact with backend APIs.

## fetch Action

Use `fetch` action in event handlers:

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

### Full Configuration

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
  "finally": { "set": "loading", "value": false },
  "ignoreBaseURL": false
}
```

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `fetch` | `string` | API URL, supports expressions |
| `method` | `string` | HTTP method: GET, POST, PUT, DELETE, PATCH |
| `headers` | `object` | Request headers |
| `body` | `any` | Request body |
| `then` | `Action` | Success callback, access `$response` |
| `catch` | `Action` | Error callback, access `$error` |
| `finally` | `Action` | Always callback (success or failure) |
| `ignoreBaseURL` | `boolean` | Whether to ignore global baseURL |

## initApi

Auto-fetch API on component mount, response data merges with `data`:

```json
{
  "data": { "title": "Loading...", "content": "" },
  "initApi": "/api/article/{{ articleId }}",
  "com": "div",
  "children": [
    { "com": "h1", "children": "{{ title }}" },
    { "com": "p", "children": "{{ content }}" }
  ]
}
```

### Full Configuration

```json
{
  "initApi": {
    "url": "/api/data",
    "method": "GET",
    "headers": { "Authorization": "Bearer {{ token }}" },
    "body": { "page": 1, "size": 10 },
    "then": { "set": "message", "value": "Data loaded successfully" },
    "catch": { "set": "error", "value": "{{ $error.message }}" },
    "ignoreBaseURL": false
  }
}
```

### Configuration Options

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | Request URL, supports expressions |
| `method` | `string` | HTTP method: GET, POST, PUT, DELETE, PATCH |
| `headers` | `object` | Request headers |
| `body` | `any` | Request body |
| `then` | `Action` | Success callback, access `$response` |
| `catch` | `Action` | Error callback, access `$error` |
| `ignoreBaseURL` | `boolean` | Whether to ignore global baseURL |

### Response Data Mapping

API response data automatically merges with `data`. If response structure is `{ code: 0, data: {...} }`, configure `responseDataPath` globally:

```typescript
app.use(createVSchemaPlugin({
  responseDataPath: 'data'
}));
```

## uiApi

Fetch API on mount, returned JsonNode replaces `children`:

```json
{
  "uiApi": "/api/page/{{ pageId }}",
  "com": "div",
  "children": "Loading..."
}
```

Backend returns JSON that will be parsed as VSchema nodes and rendered.

### Full Configuration

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

### Dynamic Page Example

```json
{
  "data": { "pageId": "home" },
  "uiApi": "/api/pages/{{ pageId }}",
  "com": "div",
  "children": [
    { "com": "div", "props": { "class": "loading" }, "children": "Loading page..." }
  ]
}
```

Backend returns:

```json
{
  "com": "div",
  "children": [
    { "com": "h1", "children": "Home" },
    { "com": "p", "children": "Welcome" }
  ]
}
```

## Global Configuration

```typescript
app.use(createVSchemaPlugin({
  // API base URL
  baseURL: 'https://api.example.com',
  // Default request headers
  defaultHeaders: {
    'Authorization': 'Bearer token',
    'X-App-Version': '1.0.0'
  },
  // Response data path
  responseDataPath: 'data',
  // Request timeout (milliseconds)
  timeout: 30000
}));
```

## Practical Examples

### Paginated List

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

### Form Submission

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
          { "set": "message", "value": "Submitted successfully!" },
          { "set": "form", "value": "{{ { title: '', content: '' } }}" }
        ],
        "catch": { "set": "message", "value": "Submit failed: {{ $error.message }}" },
        "finally": { "set": "submitting", "value": false }
      }
    ]
  },
  "com": "form",
  "events": { "submit.prevent": { "call": "submit" } },
  "children": "..."
}
```
