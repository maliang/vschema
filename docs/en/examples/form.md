# Form Examples

## Login Form

```json
{
  "data": {
    "form": { "username": "", "password": "", "remember": false },
    "loading": false,
    "error": ""
  },
  "computed": { "canSubmit": "form.username && form.password && !loading" },
  "methods": {
    "handleLogin": [
      { "set": "loading", "value": true },
      { "set": "error", "value": "" },
      {
        "fetch": "/api/login",
        "method": "POST",
        "body": "{{ form }}",
        "then": { "emit": "login-success", "payload": "{{ $response }}" },
        "catch": { "set": "error", "value": "{{ $error.message }}" },
        "finally": { "set": "loading", "value": false }
      }
    ]
  },
  "com": "form",
  "events": { "submit.prevent": { "call": "handleLogin" } },
  "children": [
    { "com": "div", "if": "error", "children": "{{ error }}" },
    {
      "com": "div",
      "children": [
        { "com": "label", "children": "Username" },
        { "com": "input", "model": "form.username" }
      ]
    },
    {
      "com": "div",
      "children": [
        { "com": "label", "children": "Password" },
        { "com": "input", "model": "form.password", "props": { "type": "password" } }
      ]
    },
    {
      "com": "label",
      "children": [
        { "com": "input", "model": "form.remember", "props": { "type": "checkbox" } },
        " Remember me"
      ]
    },
    {
      "com": "button",
      "props": { "type": "submit", "disabled": "{{ !canSubmit }}" },
      "children": "{{ loading ? 'Logging in...' : 'Login' }}"
    }
  ]
}
```

## Search Form

```json
{
  "data": { "keyword": "", "category": "" },
  "methods": { "search": { "emit": "search", "payload": "{{ { keyword, category } }}" } },
  "com": "form",
  "events": { "submit.prevent": { "call": "search" } },
  "children": [
    { "com": "input", "model": "keyword", "props": { "placeholder": "Search..." } },
    { "com": "button", "props": { "type": "submit" }, "children": "Search" }
  ]
}
```
