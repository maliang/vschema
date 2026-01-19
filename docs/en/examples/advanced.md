# Advanced Examples

## Real-time Chat

```json
{
  "data": {
    "messages": [],
    "newMessage": "",
    "connected": false,
    "username": "User" + Math.floor(Math.random() * 1000)
  },
  "methods": {
    "sendMessage": {
      "if": "newMessage.trim() && connected",
      "then": [
        {
          "ws": "chat",
          "op": "send",
          "data": { "type": "message", "username": "{{ username }}", "content": "{{ newMessage }}" }
        },
        { "set": "newMessage", "value": "" }
      ]
    }
  },
  "onMounted": {
    "ws": "wss://example.com/chat",
    "op": "connect",
    "id": "chat",
    "onOpen": { "set": "connected", "value": true },
    "onMessage": { "set": "messages", "value": "{{ [...messages, $response].slice(-100) }}" },
    "onClose": { "set": "connected", "value": false }
  },
  "onUnmounted": { "ws": "chat", "op": "close" },
  "com": "div",
  "children": [
    { "com": "div", "children": "{{ connected ? 'Connected' : 'Disconnected' }}" },
    {
      "com": "div",
      "children": [
        {
          "for": "msg in messages",
          "com": "div",
          "children": "[{{ msg.username }}]: {{ msg.content }}"
        }
      ]
    },
    {
      "com": "div",
      "children": [
        {
          "com": "input",
          "model": "newMessage",
          "props": { "placeholder": "Type message...", "disabled": "{{ !connected }}" },
          "events": { "keyup.enter": { "call": "sendMessage" } }
        },
        {
          "com": "button",
          "props": { "disabled": "{{ !connected }}" },
          "events": { "click": { "call": "sendMessage" } },
          "children": "Send"
        }
      ]
    }
  ]
}
```

## Paginated List

```json
{
  "data": {
    "items": [],
    "loading": false,
    "pagination": { "page": 1, "size": 10, "total": 0 }
  },
  "computed": { "totalPages": "Math.ceil(pagination.total / pagination.size)" },
  "methods": {
    "loadData": [
      { "set": "loading", "value": true },
      {
        "fetch": "/api/items?page={{ pagination.page }}&size={{ pagination.size }}",
        "then": [
          { "set": "items", "value": "{{ $response.items }}" },
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
