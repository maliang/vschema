# CLAUDE.md - VSchema Project Guidelines

本文档为 Claude AI 提供项目上下文和开发指南。

## 项目概述

VSchema (vschema-ui) 是一个 Vue 3 插件，通过 JSON Schema 实现声明式 UI 构建。它在运行时将 JSON 定义转换为响应式 Vue 组件，支持状态管理、事件处理、API 请求、WebSocket 通信等功能。

- 版本：1.3.11
- 零运行时依赖设计
- 支持 Vue 3.3.0+

## 架构

```
src/
├── plugin/              # Vue 插件入口
│   ├── index.ts         # createVSchemaPlugin, VSchema 组件
│   └── composables.ts   # useJsonState, useJsonFetch, useJsonActions
├── renderer/            # 核心渲染引擎
│   └── Renderer.ts      # JsonNode → Vue VNodes 转换
├── parser/              # Schema 解析验证
│   └── Parser.ts        # JSON 解析、验证
├── expression/          # 表达式求值
│   └── ExpressionEvaluator.ts  # {{ expression }} 处理
├── event/               # 事件和动作处理
│   └── EventHandler.ts  # Action 执行、WebSocket 管理
├── state/               # 状态管理
│   └── StateManager.ts  # 响应式状态、watch
├── fetch/               # 数据获取
│   └── DataFetcher.ts   # HTTP 请求、initApi/uiApi
├── registry/            # 组件注册表
│   └── ComponentRegistry.ts
└── types/               # TypeScript 类型定义
    ├── schema.ts        # JsonNode, Action 类型
    ├── runtime.ts       # ActionContext, EvaluationContext
    ├── config.ts        # PluginOptions, GlobalConfig
    └── errors.ts        # 错误类型
```

## 核心类型

### JsonNode
```typescript
interface JsonNode {
  com?: string;                    // 组件类型
  props?: Record<string, any>;     // 组件属性
  children?: JsonNode[] | string;  // 子节点或文本
  data?: Record<string, any>;      // 响应式状态
  computed?: Record<string, string>; // 计算属性
  events?: Record<string, Action | Action[]>; // 事件处理
  slots?: Record<string, JsonNode[] | SlotDefinition>; // 插槽
  
  // 指令
  if?: string;           // 条件渲染
  show?: string;         // v-show
  for?: string;          // 循环 "item in items"
  key?: string;          // 循环 key
  model?: string | Record<string, string>; // 双向绑定（支持修饰符）
  ref?: string;          // 模板引用
  
  // 生命周期
  onMounted?: Action | Action[];
  onUnmounted?: Action | Action[];
  onUpdated?: Action | Action[];
  
  // API
  initApi?: ApiConfig;   // 初始化数据请求
  uiApi?: ApiConfig;     // 动态 UI 请求
  
  // 监听和方法
  watch?: Record<string, WatchConfig | Action>;
  methods?: Record<string, Action | Action[]>;
}
```

### Action 类型
```typescript
// 状态设置
{ set: 'path', value: any }

// 方法调用
{ call: 'methodName', args?: any[] }

// 事件触发
{ emit: 'eventName', payload?: any }

// HTTP 请求
{ fetch: 'url', method?: string, body?: any, then?: Action, catch?: Action, finally?: Action }

// WebSocket
{ ws: 'url', op?: 'connect'|'send'|'close', onMessage?: Action, ... }

// 条件动作
{ if: 'condition', then: Action, else?: Action }

// 脚本执行
{ script: 'javascript code' }

// 剪贴板复制
{ copy: 'text', then?: Action, catch?: Action }
```

### 表达式语法
```
{{ count + 1 }}
{{ user.name }}
{{ isActive ? 'yes' : 'no' }}
{{ $response.data }}
{{ $event.target.value }}
{{ $parent.state.value }}
```

### v-model 修饰符
```
model: "username"           // 基础绑定
model: "username.trim"      // 去除空格
model: "age.number"         // 转换为数字
model: "content.trim.lazy"  // 组合修饰符
model: { "modelValue": "data", "columns": "cols" }  // 多参数绑定
```

## 插件配置

```typescript
createVSchemaPlugin({
  baseURL: '/api',
  responseDataPath: 'data',
  responseFormat: {
    codeField: 'code',
    msgField: 'msg',
    dataField: 'data',
    successCode: 0
  },
  requestInterceptor: (config) => config,
  responseInterceptor: (response) => response,
  errorInterceptor: (error) => error,
  components: { CustomComponent }
})
```

## Composables

```typescript
// 状态管理
const { state, computed, setState, watch } = useJsonState(
  { count: 0 },
  { double: 'count * 2' }
);

// 数据获取
const { data, loading, error, execute } = useJsonFetch(
  { fetch: '/api/users' },
  { immediate: true }
);

// 动作执行
const { executeAction, executeActions } = useJsonActions();
```

## 测试

测试文件与源文件同目录：`*.test.ts`

```bash
pnpm test        # 监听模式
pnpm test --run  # 单次运行
pnpm test:coverage  # 覆盖率
```

使用 Vitest + fast-check 进行属性测试。

## 常用命令

```bash
pnpm dev         # 启动 demo
pnpm build       # 构建库
pnpm typecheck   # 类型检查
pnpm lint:fix    # 代码格式化
pnpm docs:dev    # 文档开发
```

## 开发规范

- TypeScript 严格模式
- 实现细节使用中文注释
- 公共 API 文档使用英文
- ESLint + Prettier 格式化

## 添加新 Action 类型

1. 在 `src/types/schema.ts` 定义接口和类型守卫
2. 添加到 `Action` 联合类型
3. 在 `src/event/EventHandler.ts` 实现 `executeXxxAction`
4. 添加测试

## 添加新指令

1. 在 `JsonNode` 接口添加属性
2. 在 `Renderer.ts` 的 `renderNode()` 处理
3. 添加测试

## 安全考虑

- 表达式求值器阻止危险操作（eval, Function, 全局访问）
- WebSocket 连接在组件卸载时自动清理
- Copy 动作使用安全的 Clipboard API

## 文档

文档位于 `docs/` 目录，使用 VitePress：
- `docs/` - 中文文档
- `docs/en/` - 英文文档
