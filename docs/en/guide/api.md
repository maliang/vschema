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
  "headers": { "Content-Type": "application/json" },
  "body": { "name": "{{ form.name }}" },
  "then": { "set": "result", "value": "{{ $response }}" },
  "catch": { "set": "error", "value": "{{ $error.message }}" },
  "finally": { "set": "loading", "value": false }
}
```

## initApi

Auto-fetch API on component mount, response data merges with `data`:

```json
{
  "data": { "title": "Loading..." },
  "initApi": "/api/article/{{ articleId }}",
  "com": "div",
  "children": "{{ title }}"
}
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

## Global Configuration

```typescript
app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: { 'Authorization': 'Bearer token' },
  responseDataPath: 'data',
  timeout: 30000
}));
```
