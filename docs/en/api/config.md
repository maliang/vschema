# Global Configuration

VSchema plugin global configuration options.

## Configuration

```typescript
import { createVSchemaPlugin } from 'vschema-ui';

app.use(createVSchemaPlugin({
  baseURL: 'https://api.example.com',
  defaultHeaders: { 'Authorization': 'Bearer token' },
  responseDataPath: 'data',
  responseFormat: {
    codeField: 'code',
    msgField: 'msg',
    dataField: 'data',
    successCode: 200,
  },
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

::: tip
If `responseFormat` is configured, the system will prioritize using `responseFormat.dataField` to extract data. `responseDataPath` only takes effect when the response does not contain a business status code.
:::

### responseFormat

- Type: `ResponseFormatConfig`
- Default: `{ codeField: 'code', msgField: 'msg', dataField: 'data', successCode: 200 }`

API response format configuration for customizing backend field names and success code validation.

#### responseFormat.codeField

- Type: `string`
- Default: `'code'`

Business status code field name.

#### responseFormat.msgField

- Type: `string`
- Default: `'msg'`

Response message field name.

#### responseFormat.dataField

- Type: `string`
- Default: `'data'`

Response data field name.

#### responseFormat.successCode

- Type: `number | number[]`
- Default: `200`

Business success status code. Supports single value or array (multiple success codes).

**Examples:**

```typescript
// Single success code
responseFormat: {
  successCode: 0
}

// Multiple success codes
responseFormat: {
  successCode: [0, 200]
}

// Custom field names
responseFormat: {
  codeField: 'status',
  msgField: 'message',
  dataField: 'result',
  successCode: 0
}
```

### components

- Type: `Record<string, Component>`
- Default: `{}`

Registered custom components.

### requestInterceptor

- Type: `(config: RequestConfig) => RequestConfig | Promise<RequestConfig>`
- Default: `undefined`

Request interceptor, called before each request.

```typescript
requestInterceptor: (config) => {
  config.headers['X-Request-Id'] = generateId();
  return config;
}
```

### responseInterceptor

- Type: `(response: any) => any | Promise<any>`
- Default: `undefined`

Response interceptor, called after each successful response.

```typescript
responseInterceptor: (response) => {
  console.log('Response:', response);
  return response;
}
```

### errorInterceptor

- Type: `(error: any) => any | Promise<any>`
- Default: `undefined`

Error interceptor, called when request fails or business status code indicates failure.

```typescript
errorInterceptor: (error) => {
  if (error.code === 401) {
    router.push('/login');
  }
  throw error;
}
```

## Type Definition

```typescript
/**
 * Standard API response format
 */
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * Response format configuration
 */
interface ResponseFormatConfig {
  /** Business status code field name, default "code" */
  codeField?: string;
  /** Message field name, default "msg" */
  msgField?: string;
  /** Data field name, default "data" */
  dataField?: string;
  /** Business success status code, default 200 */
  successCode?: number | number[];
}

/**
 * Request configuration
 */
interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
}

/**
 * Global configuration
 */
interface GlobalConfig {
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  responseDataPath?: string;
  responseFormat?: ResponseFormatConfig;
  requestInterceptor?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  responseInterceptor?: (response: any) => any | Promise<any>;
  errorInterceptor?: (error: any) => any | Promise<any>;
  components?: Record<string, Component>;
}
