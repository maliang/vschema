# 基础概念

## Schema 结构

VSchema 的核心是 `JsonNode` 类型，它描述了一个 UI 节点的完整信息：

```typescript
interface JsonNode {
  // 基础属性
  com: string;                    // 组件类型
  props?: Record<string, any>;    // 组件属性
  children?: JsonNode[] | string; // 子节点或文本

  // 数据相关
  data?: Record<string, any>;     // 响应式数据
  computed?: Record<string, string>; // 计算属性
  methods?: Record<string, Action>;  // 方法定义

  // 指令
  if?: string;      // 条件渲染 (v-if)
  show?: string;    // 显示隐藏 (v-show)
  for?: string;     // 循环渲染 (v-for)
  key?: string;     // 循环 key
  model?: string;   // 双向绑定 (v-model)
  ref?: string;     // 模板引用

  // 事件与生命周期
  events?: Record<string, Action | Action[]>;
  onMounted?: Action | Action[];
  onUnmounted?: Action | Action[];
  onUpdated?: Action | Action[];
  watch?: Record<string, WatchConfig>;

  // API 配置
  initApi?: string | ApiConfig;
  uiApi?: string | ApiConfig;

  // 插槽
  slots?: Record<string, SlotConfig>;
}
```

## 组件类型 (com)

`com` 属性指定要渲染的组件，可以是：

### HTML 标签

```json
{ "com": "div", "children": "普通 div" }
{ "com": "button", "children": "按钮" }
{ "com": "input", "props": { "type": "text" } }
```

### 注册的自定义组件

```json
{ "com": "MyButton", "props": { "type": "primary" } }
{ "com": "ElInput", "model": "form.name" }
```

## 属性传递 (props)

通过 `props` 向组件传递属性，支持表达式：

```json
{
  "com": "button",
  "props": {
    "type": "button",
    "class": "{{ isActive ? 'btn-active' : 'btn-normal' }}",
    "disabled": "{{ loading }}",
    "style": {
      "color": "{{ textColor }}",
      "fontSize": "14px"
    }
  }
}
```

## 子节点 (children)

`children` 可以是字符串或节点数组：

### 文本内容

```json
{
  "com": "p",
  "children": "静态文本"
}
```

### 带表达式的文本

```json
{
  "com": "p",
  "children": "你好，{{ user.name }}！今天是 {{ date }}"
}
```

### 子节点数组

```json
{
  "com": "div",
  "children": [
    { "com": "h1", "children": "标题" },
    { "com": "p", "children": "段落内容" }
  ]
}
```

## 数据定义 (data)

在根节点或任意节点定义响应式数据：

```json
{
  "data": {
    "count": 0,
    "user": {
      "name": "张三",
      "age": 25
    },
    "items": []
  },
  "com": "div",
  "children": "{{ user.name }} 的计数: {{ count }}"
}
```

::: tip data vs state
- `data` 用于 Schema 中声明初始数据
- 运行时通过 `state` 访问当前状态值
- 在表达式中直接使用属性名（如 `count`），内部会自动从 `state` 读取
:::

## 计算属性 (computed)

定义派生状态，值为表达式字符串：

```json
{
  "data": { "count": 0 },
  "computed": {
    "double": "count * 2",
    "isEven": "count % 2 === 0",
    "message": "count > 10 ? '大于10' : '小于等于10'"
  },
  "com": "div",
  "children": "{{ count }} 的两倍是 {{ double }}"
}
```

## 方法定义 (methods)

定义可复用的动作：

```json
{
  "data": { "count": 0 },
  "methods": {
    "increment": { "set": "count", "value": "{{ count + 1 }}" },
    "reset": { "set": "count", "value": 0 }
  },
  "com": "div",
  "children": [
    { "com": "span", "children": "{{ count }}" },
    {
      "com": "button",
      "events": { "click": { "call": "increment" } },
      "children": "增加"
    },
    {
      "com": "button",
      "events": { "click": { "call": "reset" } },
      "children": "重置"
    }
  ]
}
```

## 作用域

VSchema 使用作用域链管理数据访问：

1. **当前节点作用域** - 循环变量、插槽变量
2. **父节点作用域** - 向上查找
3. **根节点作用域** - 全局 data 和 computed

```json
{
  "data": { "items": [{ "name": "A" }, { "name": "B" }] },
  "com": "ul",
  "children": [
    {
      "for": "item in items",
      "com": "li",
      "children": "{{ item.name }}"
    }
  ]
}
```

在循环中，`item` 是当前作用域变量，`items` 来自父作用域。
