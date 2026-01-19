# 快速开始

VSchema 是一个强大的 Vue 3 插件，让你通过 JSON Schema 声明式构建动态 UI。

## 什么是 VSchema？

VSchema 允许你用 JSON 对象描述 UI 结构，而不是编写 Vue 模板。这在以下场景特别有用：

- **低代码平台** - 可视化拖拽生成 JSON，动态渲染页面
- **动态表单** - 后端返回表单配置，前端动态渲染
- **配置化页面** - 通过配置文件定义页面结构
- **跨平台渲染** - JSON Schema 可在不同平台间共享

## 第一个示例

```vue-html
<template>
  <VSchema :schema="schema" />
</template>

<script setup lang="ts">
import { VSchema } from 'vschema';
import type { JsonNode } from 'vschema';

const schema: JsonNode = {
  data: { count: 0 },
  com: 'div',
  children: [
    { com: 'p', children: '当前计数: {{ count }}' },
    {
      com: 'button',
      events: { click: { set: 'count', value: '{{ count + 1 }}' } },
      children: '点击增加'
    }
  ]
};
</script>
```

这个示例展示了：

1. **data** - 定义响应式数据 `count`
2. **com** - 指定渲染的组件（HTML 标签或自定义组件）
3. **children** - 子节点，支持文本插值
4. **events** - 事件处理，点击时执行 `set` 动作修改数据

## 核心概念

### Schema 结构

每个 Schema 节点都是一个 `JsonNode` 对象：

```typescript
interface JsonNode {
  com: string;              // 组件类型
  props?: object;           // 组件属性
  children?: JsonNode[] | string;  // 子节点
  data?: object;            // 响应式数据
  computed?: object;        // 计算属性
  events?: object;          // 事件处理
  // ... 更多属性
}
```

### 表达式语法

使用 <span v-pre>`{{ expression }}`</span> 语法在字符串中嵌入 JavaScript 表达式：

```json
{
  "children": "你好，{{ user.name }}！",
  "props": {
    "class": "{{ isActive ? 'active' : '' }}",
    "disabled": "{{ loading }}"
  }
}
```

### 动作系统

VSchema 提供多种动作类型处理用户交互：

| 动作 | 说明 |
|------|------|
| `set` | 修改状态 |
| `call` | 调用方法 |
| `emit` | 触发事件 |
| `fetch` | API 调用 |

## 下一步

- [安装指南](/guide/installation) - 详细的安装步骤
- [基础概念](/guide/concepts) - 深入了解 Schema 结构
- [示例](/examples/basic) - 更多实际示例
