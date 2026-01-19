# Global Configuration

VSchema plugin global configuration options.

## Configuration

```typescript
import { createVSchemaPlugin } from '@maliang47/vschema';

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: { 'Authorization': 'Bearer token' },
  responseDataPath: 'data',
  timeout: 30000,
  components: { MyButton, MyCard }
}));
```

## Options

### baseURL

- Type: `string`
- Default: `''`

Base URL for API requests, concatenated with relative paths in `fetch`, `initApi`, `uiApi`.

### defaultHeaders

- Type: `Record<string, string>`
- Default: `{}`

Default headers for all API requests.

### responseDataPath

- Type: `string`
- Default: `''`

Path to response data. E.g., if backend returns `{ code: 0, data: {...} }`, set to `'data'`.

### timeout

- Type: `number`
- Default: `30000`

API request timeout in milliseconds.

### components

- Type: `Record<string, Component>`
- Default: `{}`

Registered custom components.

## Type Definition

```typescript
interface GlobalConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  responseDataPath?: string;
  timeout?: number;
  components?: Record<string, Component>;
}
```
