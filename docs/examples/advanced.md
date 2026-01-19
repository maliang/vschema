# 综合示例

## 用户管理页面

```json
{
  "data": {
    "users": [],
    "loading": false,
    "pagination": { "page": 1, "size": 10, "total": 0 },
    "searchKeyword": "",
    "showModal": false,
    "editingUser": null,
    "form": { "name": "", "email": "", "role": "user" }
  },
  "computed": {
    "totalPages": "Math.ceil(pagination.total / pagination.size)",
    "isEditing": "editingUser !== null"
  },
  "methods": {
    "loadUsers": [
      { "set": "loading", "value": true },
      {
        "fetch": "/api/users?page={{ pagination.page }}&size={{ pagination.size }}&keyword={{ searchKeyword }}",
        "then": [
          { "set": "users", "value": "{{ $response.items }}" },
          { "set": "pagination.total", "value": "{{ $response.total }}" }
        ],
        "finally": { "set": "loading", "value": false }
      }
    ],
    "openCreateModal": [
      { "set": "editingUser", "value": null },
      { "set": "form", "value": "{{ { name: '', email: '', role: 'user' } }}" },
      { "set": "showModal", "value": true }
    ],
    "openEditModal": [
      { "set": "editingUser", "value": "{{ $event }}" },
      { "set": "form", "value": "{{ { name: $event.name, email: $event.email, role: $event.role } }}" },
      { "set": "showModal", "value": true }
    ],
    "closeModal": { "set": "showModal", "value": false },
    "saveUser": [
      {
        "if": "isEditing",
        "then": {
          "fetch": "/api/users/{{ editingUser.id }}",
          "method": "PUT",
          "body": "{{ form }}",
          "then": [
            { "call": "closeModal" },
            { "call": "loadUsers" }
          ]
        },
        "else": {
          "fetch": "/api/users",
          "method": "POST",
          "body": "{{ form }}",
          "then": [
            { "call": "closeModal" },
            { "call": "loadUsers" }
          ]
        }
      }
    ],
    "deleteUser": {
      "if": "confirm('确定要删除该用户吗？')",
      "then": {
        "fetch": "/api/users/{{ $event }}",
        "method": "DELETE",
        "then": { "call": "loadUsers" }
      }
    },
    "changePage": [
      { "set": "pagination.page", "value": "{{ $event }}" },
      { "call": "loadUsers" }
    ]
  },
  "onMounted": { "call": "loadUsers" },
  "com": "div",
  "props": { "class": "user-management" },
  "children": [
    {
      "com": "div",
      "props": { "class": "toolbar" },
      "children": [
        {
          "com": "input",
          "model": "searchKeyword",
          "props": { "placeholder": "搜索用户..." },
          "events": { "keyup.enter": { "call": "loadUsers" } }
        },
        {
          "com": "button",
          "events": { "click": { "call": "openCreateModal" } },
          "children": "新建用户"
        }
      ]
    },
    {
      "com": "div",
      "if": "loading",
      "children": "加载中..."
    },
    {
      "com": "table",
      "if": "!loading",
      "children": "..."
    },
    {
      "com": "div",
      "if": "showModal",
      "props": { "class": "modal-overlay" },
      "children": [
        {
          "com": "div",
          "props": { "class": "modal" },
          "children": [
            { "com": "h3", "children": "{{ isEditing ? '编辑用户' : '新建用户' }}" },
            {
              "com": "form",
              "events": { "submit.prevent": { "call": "saveUser" } },
              "children": [
                {
                  "com": "div",
                  "children": [
                    { "com": "label", "children": "姓名" },
                    { "com": "input", "model": "form.name" }
                  ]
                },
                {
                  "com": "div",
                  "children": [
                    { "com": "label", "children": "邮箱" },
                    { "com": "input", "model": "form.email", "props": { "type": "email" } }
                  ]
                },
                {
                  "com": "div",
                  "children": [
                    { "com": "button", "props": { "type": "submit" }, "children": "保存" },
                    {
                      "com": "button",
                      "props": { "type": "button" },
                      "events": { "click": { "call": "closeModal" } },
                      "children": "取消"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## 实时聊天

```json
{
  "data": {
    "messages": [],
    "newMessage": "",
    "connected": false,
    "username": "用户" + Math.floor(Math.random() * 1000)
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
    "onMessage": {
      "set": "messages",
      "value": "{{ [...messages, $response].slice(-100) }}"
    },
    "onClose": { "set": "connected", "value": false }
  },
  "onUnmounted": { "ws": "chat", "op": "close" },
  "com": "div",
  "props": { "class": "chat-app" },
  "children": [
    {
      "com": "div",
      "props": { "class": "status" },
      "children": "{{ connected ? '已连接' : '未连接' }}"
    },
    {
      "com": "div",
      "props": { "class": "messages" },
      "children": [
        {
          "for": "msg in messages",
          "com": "div",
          "props": { "class": "message" },
          "children": "[{{ msg.username }}]: {{ msg.content }}"
        }
      ]
    },
    {
      "com": "div",
      "props": { "class": "input-area" },
      "children": [
        {
          "com": "input",
          "model": "newMessage",
          "props": { "placeholder": "输入消息...", "disabled": "{{ !connected }}" },
          "events": { "keyup.enter": { "call": "sendMessage" } }
        },
        {
          "com": "button",
          "props": { "disabled": "{{ !connected }}" },
          "events": { "click": { "call": "sendMessage" } },
          "children": "发送"
        }
      ]
    }
  ]
}
```
