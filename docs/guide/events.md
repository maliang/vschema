# 事件处理

VSchema 提供灵活的事件绑定和动作系统，支持 Vue 事件修饰符。

## 基础用法

使用 `events` 属性绑定事件：

```json
{
  "com": "button",
  "events": {
    "click": { "set": "count", "value": "{{ count + 1 }}" }
  },
  "children": "点击"
}
```

## 动作类型

### set - 修改状态

```json
{
  "events": {
    "click": { "set": "count", "value": "{{ count + 1 }}" }
  }
}
```

支持嵌套路径：

```json
{ "set": "user.profile.name", "value": "新名称" }
{ "set": "items[0].checked", "value": true }
```

### call - 调用方法

```json
{
  "methods": {
    "handleSubmit": [
      { "set": "loading", "value": true },
      { "fetch": "/api/submit", "body": "{{ form }}" },
      { "set": "loading", "value": false }
    ]
  },
  "events": {
    "click": { "call": "handleSubmit" }
  }
}
```

带参数调用：

```json
{ "call": "updateItem", "args": ["{{ item.id }}", "{{ newValue }}"] }
```

### emit - 触发事件

向父组件触发事件：

```json
{
  "events": {
    "click": { "emit": "select", "payload": "{{ item }}" }
  }
}
```

### fetch - API 调用

```json
{
  "events": {
    "click": {
      "fetch": "/api/users/{{ userId }}",
      "method": "GET",
      "then": { "set": "user", "value": "{{ $response }}" },
      "catch": { "set": "error", "value": "{{ $error.message }}" }
    }
  }
}
```

完整配置：

```json
{
  "fetch": "/api/data",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
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

### copy - 复制到剪贴板

```json
{
  "events": {
    "click": {
      "copy": "{{ shareUrl }}",
      "then": { "set": "copied", "value": true },
      "catch": { "set": "error", "value": "复制失败" }
    }
  }
}
```

### if - 条件执行

```json
{
  "events": {
    "click": {
      "if": "count > 10",
      "then": { "set": "message", "value": "大于10" },
      "else": { "set": "message", "value": "小于等于10" }
    }
  }
}
```

### script - 自定义脚本

```json
{
  "events": {
    "click": {
      "script": "await $methods.login(state.form.username, state.form.password);"
    }
  }
}
```

可用变量：`state`, `computed`, `$event`, `$response`, `$error`, `$methods`

## 多个动作

使用数组执行多个动作：

```json
{
  "events": {
    "click": [
      { "set": "loading", "value": true },
      { "fetch": "/api/data", "then": { "set": "data", "value": "{{ $response }}" } },
      { "set": "loading", "value": false }
    ]
  }
}
```

## 事件修饰符

支持 Vue 事件修饰符语法：

### 基础修饰符

```json
{
  "events": {
    "click.prevent": { "call": "handleClick" },
    "click.stop": { "call": "handleClick" },
    "click.prevent.stop": { "call": "handleClick" },
    "submit.prevent": { "call": "handleSubmit" }
  }
}
```

| 修饰符 | 说明 |
|--------|------|
| `.prevent` | 阻止默认行为 |
| `.stop` | 阻止事件冒泡 |
| `.capture` | 使用捕获模式 |
| `.self` | 只在元素自身触发 |
| `.once` | 只触发一次 |
| `.passive` | 被动监听 |

### 按键修饰符

```json
{
  "events": {
    "keyup.enter": { "call": "submit" },
    "keyup.esc": { "call": "cancel" },
    "keydown.ctrl.s": { "call": "save" },
    "keydown.alt.enter": { "call": "newLine" }
  }
}
```

| 修饰符 | 说明 |
|--------|------|
| `.enter` | Enter 键 |
| `.tab` | Tab 键 |
| `.esc` | Escape 键 |
| `.space` | 空格键 |
| `.up` | 上箭头 |
| `.down` | 下箭头 |
| `.left` | 左箭头 |
| `.right` | 右箭头 |
| `.ctrl` | Ctrl 键 |
| `.alt` | Alt 键 |
| `.shift` | Shift 键 |
| `.meta` | Meta 键 (Mac: Command, Windows: Win) |

### 组合修饰符

```json
{
  "events": {
    "keydown.ctrl.shift.s": { "call": "saveAs" },
    "click.ctrl": { "call": "multiSelect" }
  }
}
```

## 访问事件对象

使用 `$event` 访问原生事件对象：

```json
{
  "events": {
    "input": { "set": "value", "value": "{{ $event.target.value }}" },
    "click": { "set": "position", "value": "{{ { x: $event.clientX, y: $event.clientY } }}" }
  }
}
```

## 实际示例

### 表单提交

```json
{
  "com": "form",
  "events": {
    "submit.prevent": [
      { "set": "loading", "value": true },
      {
        "fetch": "/api/login",
        "method": "POST",
        "body": "{{ form }}",
        "then": [
          { "set": "user", "value": "{{ $response.user }}" },
          { "emit": "login-success" }
        ],
        "catch": { "set": "error", "value": "{{ $error.message }}" },
        "finally": { "set": "loading", "value": false }
      }
    ]
  }
}
```

### 防抖搜索

```json
{
  "data": { "searchText": "", "timer": null },
  "methods": {
    "debouncedSearch": {
      "script": "clearTimeout(state.timer); state.timer = setTimeout(() => { /* 搜索逻辑 */ }, 300);"
    }
  },
  "com": "input",
  "model": "searchText",
  "events": {
    "input": { "call": "debouncedSearch" }
  }
}
```

### 确认删除

```json
{
  "events": {
    "click": {
      "if": "confirm('确定要删除吗？')",
      "then": {
        "fetch": "/api/items/{{ item.id }}",
        "method": "DELETE",
        "then": { "set": "items", "value": "{{ items.filter(i => i.id !== item.id) }}" }
      }
    }
  }
}
```
