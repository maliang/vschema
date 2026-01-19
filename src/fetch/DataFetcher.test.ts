/**
 * Data Fetcher Property-Based Tests
 * 数据获取器属性测试
 *
 * Property 19: API 响应数据映射
 * Property 20: 拦截器执行顺序
 * Property 21: Loading 状态一致性
 *
 * 验证: 需求 13.3, 13.5, 13.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { test } from '@fast-check/vitest';
import fc from 'fast-check';
import { DataFetcher, createDataFetcher } from './DataFetcher';
import type { GlobalConfig } from '../types/config';
import type { FetchAction } from '../types/schema';

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// 创建测试用的 DataFetcher 实例
let fetcher: DataFetcher;

beforeEach(() => {
  fetcher = createDataFetcher();
  mockFetch.mockReset();
});

afterEach(() => {
  fetcher.clearLoadingStates();
});

// 创建模拟的成功响应
function createMockResponse(data: any, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response;
}

// 创建模拟的错误响应
function createMockErrorResponse(status: number, message: string): Response {
  return {
    ok: false,
    status,
    statusText: message,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve({ error: message }),
    text: () => Promise.resolve(JSON.stringify({ error: message })),
  } as Response;
}

describe('DataFetcher - Unit Tests', () => {
  describe('configure', () => {
    it('should store configuration', () => {
      const config: GlobalConfig = {
        baseURL: 'https://api.example.com',
        defaultHeaders: { 'X-API-Key': 'test-key' },
      };

      fetcher.configure(config);
      const storedConfig = fetcher.getConfig();

      expect(storedConfig.baseURL).toBe('https://api.example.com');
      expect(storedConfig.defaultHeaders?.['X-API-Key']).toBe('test-key');
    });
  });

  describe('fetch - HTTP Methods', () => {
    it('should make GET request', async () => {
      const responseData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const action: FetchAction = { fetch: 'https://api.example.com/users/1' };
      const result = await fetcher.fetch(action, { state: {}, computed: {} });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST request with body', async () => {
      const responseData = { id: 1, name: 'Created' };
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData, 201));

      const action: FetchAction = {
        fetch: 'https://api.example.com/users',
        method: 'POST',
        body: { name: 'New User' },
      };
      const result = await fetcher.fetch(action, { state: {}, computed: {} });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New User' }),
        })
      );
    });

    it('should make PUT request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ updated: true }));

      const action: FetchAction = {
        fetch: 'https://api.example.com/users/1',
        method: 'PUT',
        body: { name: 'Updated User' },
      };
      await fetcher.fetch(action, { state: {}, computed: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ deleted: true }));

      const action: FetchAction = {
        fetch: 'https://api.example.com/users/1',
        method: 'DELETE',
      };
      await fetcher.fetch(action, { state: {}, computed: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should make PATCH request', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({ patched: true }));

      const action: FetchAction = {
        fetch: 'https://api.example.com/users/1',
        method: 'PATCH',
        body: { name: 'Patched' },
      };
      await fetcher.fetch(action, { state: {}, computed: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('fetch - URL handling', () => {
    it('should prepend baseURL to relative path', async () => {
      fetcher.configure({ baseURL: 'https://api.example.com' });
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await fetcher.fetch({ fetch: '/users' }, { state: {}, computed: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object)
      );
    });

    it('should not prepend baseURL to absolute URL', async () => {
      fetcher.configure({ baseURL: 'https://api.example.com' });
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await fetcher.fetch(
        { fetch: 'https://other.api.com/data' },
        { state: {}, computed: {} }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://other.api.com/data',
        expect.any(Object)
      );
    });

    it('should handle baseURL with trailing slash', async () => {
      fetcher.configure({ baseURL: 'https://api.example.com/' });
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await fetcher.fetch({ fetch: '/users' }, { state: {}, computed: {} });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.any(Object)
      );
    });
  });

  describe('fetch - Headers', () => {
    it('should merge default headers with action headers', async () => {
      fetcher.configure({
        defaultHeaders: { 'X-Default': 'default-value' },
      });
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await fetcher.fetch(
        {
          fetch: 'https://api.example.com/test',
          headers: { 'X-Custom': 'custom-value' },
        },
        { state: {}, computed: {} }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Default': 'default-value',
            'X-Custom': 'custom-value',
          }),
        })
      );
    });

    it('should add Content-Type for POST with body', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await fetcher.fetch(
        {
          fetch: 'https://api.example.com/test',
          method: 'POST',
          body: { data: 'test' },
        },
        { state: {}, computed: {} }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('fetch - Error handling', () => {
    it('should handle HTTP error status', async () => {
      mockFetch.mockResolvedValueOnce(createMockErrorResponse(404, 'Not Found'));

      const result = await fetcher.fetch(
        { fetch: 'https://api.example.com/notfound' },
        { state: {}, computed: {} }
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe(404);
      expect(result.error).toBeDefined();
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetcher.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Network error');
    });
  });
});


/**
 * Property 19: API 响应数据映射
 * *对于任意* API 响应和映射配置，Data_Fetcher 应将响应数据正确映射到指定的状态路径。
 *
 * **验证: 需求 13.3**
 */
describe('Property 19: API Response Data Mapping', () => {
  // 生成嵌套响应数据
  const nestedResponseArbitrary = fc.record({
    data: fc.record({
      result: fc.record({
        items: fc.array(
          fc.record({
            id: fc.integer(),
            name: fc.string(),
          }),
          { minLength: 0, maxLength: 5 }
        ),
      }),
    }),
    meta: fc.record({
      total: fc.integer({ min: 0, max: 100 }),
    }),
  });

  test.prop([nestedResponseArbitrary], { numRuns: 100 })(
    'should extract data using responseDataPath',
    async (responseData) => {
      const f = createDataFetcher({
        responseDataPath: 'data.result',
      });

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      expect(result.success).toBe(true);
      // 提取的数据应该是 data.result
      expect(result.data).toEqual(responseData.data.result);
      // 完整响应应该保留
      expect(result.response).toEqual(responseData);

      f.clearLoadingStates();
    }
  );

  // 生成简单响应数据
  const simpleResponseArbitrary = fc.record({
    id: fc.integer(),
    name: fc.string(),
    value: fc.integer(),
  });

  test.prop([simpleResponseArbitrary], { numRuns: 100 })(
    'should return full response when no responseDataPath configured',
    async (responseData) => {
      const f = createDataFetcher(); // 无 responseDataPath 配置

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      expect(result.success).toBe(true);
      // 没有配置 responseDataPath 时，data 应该是完整响应
      expect(result.data).toEqual(responseData);

      f.clearLoadingStates();
    }
  );

  // 测试单层路径
  const wrappedResponseArbitrary = fc.record({
    data: fc.array(fc.integer(), { minLength: 1, maxLength: 10 }),
  });

  test.prop([wrappedResponseArbitrary], { numRuns: 100 })(
    'should extract data with single-level path',
    async (responseData) => {
      const f = createDataFetcher({
        responseDataPath: 'data',
      });

      mockFetch.mockResolvedValueOnce(createMockResponse(responseData));

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(responseData.data);

      f.clearLoadingStates();
    }
  );
});

/**
 * Property 20: 拦截器执行顺序
 * *对于任意*配置了拦截器的 API 调用，请求拦截器应在发送前执行，响应拦截器应在接收后执行。
 *
 * **验证: 需求 13.5**
 */
describe('Property 20: Interceptor Execution Order', () => {
  test.prop([fc.string({ minLength: 1, maxLength: 20 })], { numRuns: 100 })(
    'request interceptor should be called before fetch',
    async (authToken) => {
      const executionOrder: string[] = [];

      const f = createDataFetcher({
        requestInterceptor: (config) => {
          executionOrder.push('request-interceptor');
          config.headers['Authorization'] = `Bearer ${authToken}`;
          return config;
        },
      });

      mockFetch.mockImplementation(async () => {
        executionOrder.push('fetch');
        return createMockResponse({ success: true });
      });

      await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      // 请求拦截器应该在 fetch 之前执行
      expect(executionOrder).toEqual(['request-interceptor', 'fetch']);

      // 验证 Authorization header 被添加
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${authToken}`,
          }),
        })
      );

      f.clearLoadingStates();
    }
  );

  test.prop([fc.integer({ min: 1, max: 100 })], { numRuns: 100 })(
    'response interceptor should be called after fetch',
    async (multiplier) => {
      const executionOrder: string[] = [];

      const f = createDataFetcher({
        responseInterceptor: (response) => {
          executionOrder.push('response-interceptor');
          // 转换响应数据
          return {
            ...response,
            transformed: response.value * multiplier,
          };
        },
      });

      mockFetch.mockImplementation(async () => {
        executionOrder.push('fetch');
        return createMockResponse({ value: 10 });
      });

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      // fetch 应该在响应拦截器之前执行
      expect(executionOrder).toEqual(['fetch', 'response-interceptor']);

      // 验证响应被转换
      expect(result.data.transformed).toBe(10 * multiplier);

      f.clearLoadingStates();
    }
  );

  test.prop([fc.string({ minLength: 1, maxLength: 50 })], { numRuns: 100 })(
    'error interceptor should be called on error',
    async (errorMessage) => {
      const executionOrder: string[] = [];

      const f = createDataFetcher({
        errorInterceptor: (error) => {
          executionOrder.push('error-interceptor');
          // 可以转换错误或记录日志
          return Promise.reject(error);
        },
      });

      mockFetch.mockImplementation(async () => {
        executionOrder.push('fetch');
        return createMockErrorResponse(500, errorMessage);
      });

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      // fetch 应该在错误拦截器之前执行
      expect(executionOrder).toEqual(['fetch', 'error-interceptor']);
      expect(result.success).toBe(false);

      f.clearLoadingStates();
    }
  );

  // 测试完整的拦截器链
  it('should execute interceptors in correct order: request -> fetch -> response', async () => {
    const executionOrder: string[] = [];

    const f = createDataFetcher({
      requestInterceptor: (config) => {
        executionOrder.push('request');
        return config;
      },
      responseInterceptor: (response) => {
        executionOrder.push('response');
        return response;
      },
    });

    mockFetch.mockImplementation(async () => {
      executionOrder.push('fetch');
      return createMockResponse({ data: 'test' });
    });

    await f.fetch(
      { fetch: 'https://api.example.com/test' },
      { state: {}, computed: {} }
    );

    expect(executionOrder).toEqual(['request', 'fetch', 'response']);

    f.clearLoadingStates();
  });
});

/**
 * Property 21: Loading 状态一致性
 * *对于任意* API 调用，调用开始时 loading 状态应为 true，调用结束（成功或失败）后 loading 状态应为 false。
 *
 * **验证: 需求 13.6**
 */
describe('Property 21: Loading State Consistency', () => {
  test.prop([fc.integer({ min: 10, max: 100 })], { numRuns: 100 })(
    'loading should be false after successful request',
    async (responseValue) => {
      const f = createDataFetcher();

      mockFetch.mockResolvedValueOnce(createMockResponse({ value: responseValue }));

      // 请求前 loading 应该为 false
      expect(f.isLoading()).toBe(false);

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      // 请求完成后 loading 应该为 false
      expect(result.success).toBe(true);
      expect(f.isLoading()).toBe(false);

      f.clearLoadingStates();
    }
  );

  test.prop([fc.integer({ min: 400, max: 599 })], { numRuns: 100 })(
    'loading should be false after failed request (HTTP error)',
    async (errorStatus) => {
      const f = createDataFetcher();

      mockFetch.mockResolvedValueOnce(
        createMockErrorResponse(errorStatus, 'Error')
      );

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      // 请求失败后 loading 也应该为 false
      expect(result.success).toBe(false);
      expect(f.isLoading()).toBe(false);

      f.clearLoadingStates();
    }
  );

  test.prop([fc.string({ minLength: 1, maxLength: 50 })], { numRuns: 100 })(
    'loading should be false after network error',
    async (errorMessage) => {
      const f = createDataFetcher();

      mockFetch.mockRejectedValueOnce(new Error(errorMessage));

      const result = await f.fetch(
        { fetch: 'https://api.example.com/test' },
        { state: {}, computed: {} }
      );

      // 网络错误后 loading 也应该为 false
      expect(result.success).toBe(false);
      expect(f.isLoading()).toBe(false);

      f.clearLoadingStates();
    }
  );

  // 测试 loading 状态在请求期间为 true
  it('loading should be true during request', async () => {
    const f = createDataFetcher();
    let loadingDuringRequest = false;

    mockFetch.mockImplementation(async () => {
      // 在请求期间检查 loading 状态
      loadingDuringRequest = f.isLoading();
      return createMockResponse({ data: 'test' });
    });

    await f.fetch(
      { fetch: 'https://api.example.com/test' },
      { state: {}, computed: {} }
    );

    // 请求期间 loading 应该为 true
    expect(loadingDuringRequest).toBe(true);
    // 请求完成后 loading 应该为 false
    expect(f.isLoading()).toBe(false);

    f.clearLoadingStates();
  });

  // 测试请求拦截器错误时 loading 状态
  it('loading should be false after request interceptor error', async () => {
    const f = createDataFetcher({
      requestInterceptor: () => {
        throw new Error('Interceptor error');
      },
    });

    const result = await f.fetch(
      { fetch: 'https://api.example.com/test' },
      { state: {}, computed: {} }
    );

    expect(result.success).toBe(false);
    expect(f.isLoading()).toBe(false);

    f.clearLoadingStates();
  });
});

// 集成测试
describe('DataFetcher - Integration Tests', () => {
  it('should work with all interceptors and responseDataPath', async () => {
    const f = createDataFetcher({
      baseURL: 'https://api.example.com',
      responseDataPath: 'data',
      defaultHeaders: { 'X-App': 'test' },
      requestInterceptor: (config) => {
        config.headers['X-Request-Id'] = 'req-123';
        return config;
      },
      responseInterceptor: (response) => {
        // 响应拦截器修改完整响应
        return {
          ...response,
          data: {
            ...response.data,
            intercepted: true,
          },
        };
      },
    });

    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        data: { items: [1, 2, 3] },
        meta: { total: 3 },
      })
    );

    const result = await f.fetch(
      { fetch: '/items', method: 'GET' },
      { state: {}, computed: {} }
    );

    expect(result.success).toBe(true);
    // 数据应该被提取（responseDataPath: 'data'）
    expect(result.data.items).toEqual([1, 2, 3]);
    // 响应拦截器应该添加了 intercepted 标记到 data 中
    expect(result.data.intercepted).toBe(true);

    // 验证请求配置
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/items',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-App': 'test',
          'X-Request-Id': 'req-123',
        }),
      })
    );

    f.clearLoadingStates();
  });

  it('should provide $response and $error context correctly', async () => {
    // 测试成功响应
    const f1 = createDataFetcher();
    const successResponse = { data: { id: 1, name: 'Test' }, status: 'ok' };
    mockFetch.mockResolvedValueOnce(createMockResponse(successResponse));

    const successResult = await f1.fetch(
      { fetch: 'https://api.example.com/test' },
      { state: {}, computed: {} }
    );

    expect(successResult.success).toBe(true);
    // response 应该包含完整响应，供 $response 使用
    expect(successResult.response).toEqual(successResponse);

    f1.clearLoadingStates();

    // 测试错误响应
    const f2 = createDataFetcher();
    mockFetch.mockResolvedValueOnce(createMockErrorResponse(404, 'Not Found'));

    const errorResult = await f2.fetch(
      { fetch: 'https://api.example.com/notfound' },
      { state: {}, computed: {} }
    );

    expect(errorResult.success).toBe(false);
    // error 应该包含错误信息，供 $error 使用
    expect(errorResult.error).toBeDefined();
    expect(errorResult.error?.message).toContain('404');

    f2.clearLoadingStates();
  });
});
