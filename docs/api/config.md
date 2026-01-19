# 全局配置

VSchema 插件的全局配置选项。

## 配置方式

```typescript
import { createVSchemaPlugin } from '@maliang47/vschema';

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer token'
  },
  responseDataPath: 'data',
  timeout: 30000,
  components: {
    MyButton,
    MyCard,
  }
}));
```

## 配置项

### baseURL

- 类型：`string`
- 默认值：`''`

API 请求的基础地址，会与 `fetch`、`initApi`、`uiApi` 中的相对路径拼接。

### defaultHeaders

- 类型：`Record<string, string>`
- 默认值：`{}`

所有 API 请求的默认请求头。

### responseDataPath

- 类型：`string`
- 默认值：`''`

API 响应数据的路径。例如后端返回 `{ code: 0, data: {...} }`，设置为 `'data'` 可直接获取数据部分。

### timeout

- 类型：`number`
- 默认值：`30000`

API 请求超时时间（毫秒）。

### components

- 类型：`Record<string, Component>`
- 默认值：`{}`

注册的自定义组件。

## 类型定义

```typescript
interface GlobalConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  responseDataPath?: string;
  timeout?: number;
  components?: Record<string, Component>;
}
```
