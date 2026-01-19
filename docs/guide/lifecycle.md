# 生命周期

VSchema 支持 Vue 组件的生命周期钩子。

## 可用钩子

| 钩子 | 说明 |
|------|------|
| `onMounted` | 组件挂载后执行 |
| `onUnmounted` | 组件卸载前执行 |
| `onUpdated` | 组件更新后执行 |

## onMounted

组件挂载后执行，常用于初始化数据：

```json
{
  "data": { "users": [], "loading": true },
  "onMounted": {
    "fetch": "/api/users",
    "then": { "set": "users", "value": "{{ $response }}" },
    "finally": { "set": "loading", "value": false }
  },
  "com": "div",
  "children": "..."
}
```

### 多个动作

```json
{
  "onMounted": [
    { "call": "loadUserInfo" },
    { "call": "loadNotifications" },
    { "ws": "wss://example.com/socket", "op": "connect", "id": "main" }
  ]
}
```

## onUnmounted

组件卸载前执行，常用于清理资源：

```json
{
  "onMounted": {
    "ws": "wss://example.com/socket",
    "op": "connect",
    "id": "chat"
  },
  "onUnmounted": {
    "ws": "chat",
    "op": "close"
  }
}
```

## onUpdated

组件更新后执行：

```json
{
  "data": { "content": "" },
  "onUpdated": {
    "script": "console.log('组件已更新');"
  }
}
```

::: warning 注意
`onUpdated` 会在每次组件更新时触发，避免在其中执行耗时操作。
:::

## 实际示例

### 页面初始化

```json
{
  "data": {
    "user": null,
    "permissions": [],
    "loading": true
  },
  "onMounted": [
    {
      "fetch": "/api/user/current",
      "then": { "set": "user", "value": "{{ $response }}" }
    },
    {
      "fetch": "/api/user/permissions",
      "then": { "set": "permissions", "value": "{{ $response }}" },
      "finally": { "set": "loading", "value": false }
    }
  ],
  "com": "div",
  "children": "..."
}
```

### 定时刷新

```json
{
  "data": { "data": null, "timerId": null },
  "methods": {
    "refresh": {
      "fetch": "/api/realtime-data",
      "then": { "set": "data", "value": "{{ $response }}" }
    }
  },
  "onMounted": {
    "script": "state.timerId = setInterval(() => { /* 刷新逻辑 */ }, 5000);"
  },
  "onUnmounted": {
    "script": "clearInterval(state.timerId);"
  }
}
```
