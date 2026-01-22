# Schema 结构

完整的 JsonNode 类型定义。

## 基础属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `com` | `string` | 是 | 组件类型（HTML 标签或注册的组件名） |
| `props` | `object` | 否 | 传递给组件的属性 |
| `children` | `JsonNode[] \| string` | 否 | 子节点或文本内容 |

## 数据属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `data` | `Record<string, any>` | 响应式数据定义 |
| `computed` | `Record<string, string>` | 计算属性，值为表达式字符串 |
| `methods` | `Record<string, Action>` | 方法定义 |

## 指令属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `if` | `string` | 条件渲染表达式 |
| `show` | `string` | 显示/隐藏表达式 |
| `for` | `string` | 循环表达式，如 `"item in items"` |
| `key` | `string` | 循环项的唯一标识 |
| `model` | `string` | 双向绑定的数据路径 |
| `ref` | `string` | 模板引用名称 |

## 事件属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `events` | `Record<string, Action \| Action[]>` | 事件处理器 |

## 生命周期

| 属性 | 类型 | 说明 |
|------|------|------|
| `onMounted` | `Action \| Action[]` | 挂载后执行 |
| `onUnmounted` | `Action \| Action[]` | 卸载前执行 |
| `onUpdated` | `Action \| Action[]` | 更新后执行 |
| `watch` | `Record<string, WatchConfig>` | 数据监听器 |

## API 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `initApi` | `string \| ApiConfig` | 初始化数据 API |
| `uiApi` | `string \| ApiConfig` | 动态 UI API |

## 插槽属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `slots` | `Record<string, SlotConfig>` | 插槽定义 |

## 完整类型定义

```typescript
interface JsonNode {
  com: string;
  props?: Record<string, any>;
  children?: JsonNode[] | string;
  
  data?: Record<string, any>;
  computed?: Record<string, string>;
  methods?: Record<string, Action | Action[]>;
  
  if?: string;
  show?: string;
  for?: string;
  key?: string;
  model?: string;
  ref?: string;
  
  events?: Record<string, Action | Action[]>;
  
  onMounted?: Action | Action[];
  onUnmounted?: Action | Action[];
  onUpdated?: Action | Action[];
  watch?: Record<string, WatchConfig | Action>;
  
  initApi?: string | ApiConfig;
  uiApi?: string | ApiConfig;
  
  slots?: Record<string, JsonNode[] | SlotConfig>;
}

interface WatchConfig {
  handler: Action | Action[];
  immediate?: boolean;
  deep?: boolean;
}

interface ApiConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  then?: Action | Action[];
  catch?: Action | Action[];
  ignoreBaseURL?: boolean;
}

interface SlotConfig {
  content: JsonNode[];
  slotProps?: string;
}
```
