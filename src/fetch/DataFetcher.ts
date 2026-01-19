/**
 * Data Fetcher - 数据获取器
 * 负责处理远程 API 调用和数据转换
 */

import type {
  IDataFetcher,
  EvaluationContext,
  FetchResult,
} from '../types/runtime';
import type { GlobalConfig, RequestConfig } from '../types/config';
import type { FetchAction } from '../types/schema';

export class DataFetcher implements IDataFetcher {
  private config: GlobalConfig = {};
  
  // Loading 状态追踪（用于外部访问）
  private loadingStates: Map<string, boolean> = new Map();

  /**
   * 配置数据获取器
   * @param config 全局配置
   */
  configure(config: GlobalConfig): void {
    this.config = { ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): GlobalConfig {
    return { ...this.config };
  }

  /**
   * 获取 loading 状态
   * @param requestId 请求标识
   */
  isLoading(requestId?: string): boolean {
    if (requestId) {
      return this.loadingStates.get(requestId) || false;
    }
    // 如果没有指定 requestId，检查是否有任何请求在进行中
    for (const loading of this.loadingStates.values()) {
      if (loading) return true;
    }
    return false;
  }

  /**
   * 执行 API 调用
   * @param action FetchAction 配置
   * @param context 求值上下文
   * @returns 请求结果
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetch(action: FetchAction, _context: EvaluationContext): Promise<FetchResult> {
    const requestId = this.generateRequestId();
    
    try {
      // 设置 loading 状态为 true
      this.loadingStates.set(requestId, true);

      // 构建请求配置
      let requestConfig = this.buildRequestConfig(action);

      // 执行请求拦截器
      if (this.config.requestInterceptor) {
        try {
          requestConfig = await Promise.resolve(
            this.config.requestInterceptor(requestConfig)
          );
        } catch (interceptorError) {
          // 请求拦截器错误
          this.loadingStates.set(requestId, false);
          return {
            success: false,
            error: interceptorError instanceof Error 
              ? interceptorError 
              : new Error(String(interceptorError)),
          };
        }
      }

      // 执行 HTTP 请求
      const response = await this.executeRequest(requestConfig);

      // 处理响应
      return await this.handleResponse(response, requestId);
    } catch (error) {
      // 处理错误
      return await this.handleError(error, requestId);
    }
  }

  /**
   * 构建请求配置
   */
  private buildRequestConfig(action: FetchAction): RequestConfig {
    // 构建完整 URL
    let url = action.fetch;
    // 如果指定了 ignoreBaseURL，则不添加 baseURL
    if (this.config.baseURL && !action.ignoreBaseURL) {
      // 如果 URL 不是绝对路径，则添加 baseURL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        const base = this.config.baseURL.endsWith('/')
          ? this.config.baseURL.slice(0, -1)
          : this.config.baseURL;
        const path = url.startsWith('/') ? url : '/' + url;
        url = base + path;
      }
    }

    // 合并请求头
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...this.normalizeHeaders(action.headers),
    };

    // 如果有请求体且没有设置 Content-Type，默认使用 JSON
    if (action.body !== undefined && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    return {
      url,
      method: action.method || 'GET',
      headers,
      body: action.body,
    };
  }

  /**
   * 标准化请求头（确保所有值都是字符串）
   */
  private normalizeHeaders(headers?: Record<string, any>): Record<string, string> {
    if (!headers) return {};
    
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key] = String(value);
    }
    return normalized;
  }

  /**
   * 执行 HTTP 请求
   */
  private async executeRequest(config: RequestConfig): Promise<Response> {
    const fetchOptions: RequestInit = {
      method: config.method,
      headers: config.headers,
    };

    // 添加请求体（GET 和 HEAD 请求不应该有 body）
    if (config.body !== undefined && config.method !== 'GET' && config.method !== 'HEAD') {
      fetchOptions.body = typeof config.body === 'string' 
        ? config.body 
        : JSON.stringify(config.body);
    }

    return fetch(config.url, fetchOptions);
  }

  /**
   * 处理响应
   */
  private async handleResponse(response: Response, requestId: string): Promise<FetchResult> {
    try {
      // 解析响应体
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // 检查 HTTP 状态码
      if (!response.ok) {
        // HTTP 错误状态（4xx, 5xx）
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).response = data;

        // 执行错误拦截器
        if (this.config.errorInterceptor) {
          try {
            await Promise.resolve(this.config.errorInterceptor(error));
          } catch (interceptorError) {
            // 错误拦截器可能会重新抛出或转换错误
            this.loadingStates.set(requestId, false);
            return {
              success: false,
              error: interceptorError instanceof Error 
                ? interceptorError 
                : new Error(String(interceptorError)),
              status: response.status,
              response: data,
            };
          }
        }

        this.loadingStates.set(requestId, false);
        return {
          success: false,
          error,
          status: response.status,
          response: data,
        };
      }

      // 执行响应拦截器
      if (this.config.responseInterceptor) {
        try {
          data = await Promise.resolve(this.config.responseInterceptor(data));
        } catch (interceptorError) {
          this.loadingStates.set(requestId, false);
          return {
            success: false,
            error: interceptorError instanceof Error 
              ? interceptorError 
              : new Error(String(interceptorError)),
            status: response.status,
            response: data,
          };
        }
      }

      // 提取数据（根据 responseDataPath 配置）
      const extractedData = this.extractData(data);

      this.loadingStates.set(requestId, false);
      return {
        success: true,
        data: extractedData,
        status: response.status,
        response: data,  // 完整响应，供 $response 使用
      };
    } catch (parseError) {
      this.loadingStates.set(requestId, false);
      return {
        success: false,
        error: parseError instanceof Error 
          ? parseError 
          : new Error('Failed to parse response'),
        status: response.status,
      };
    }
  }

  /**
   * 处理错误
   */
  private async handleError(error: unknown, requestId: string): Promise<FetchResult> {
    const normalizedError = error instanceof Error 
      ? error 
      : new Error(String(error));

    // 执行错误拦截器
    if (this.config.errorInterceptor) {
      try {
        await Promise.resolve(this.config.errorInterceptor(normalizedError));
      } catch (interceptorError) {
        this.loadingStates.set(requestId, false);
        return {
          success: false,
          error: interceptorError instanceof Error 
            ? interceptorError 
            : new Error(String(interceptorError)),
        };
      }
    }

    this.loadingStates.set(requestId, false);
    return {
      success: false,
      error: normalizedError,
    };
  }

  /**
   * 根据 responseDataPath 提取数据
   */
  private extractData(data: any): any {
    if (!this.config.responseDataPath || !data) {
      return data;
    }

    const path = this.config.responseDataPath;
    const parts = path.split('.');
    let current = data;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * 生成唯一的请求 ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 清理所有 loading 状态
   */
  clearLoadingStates(): void {
    this.loadingStates.clear();
  }
}

/**
 * 创建数据获取器实例
 */
export function createDataFetcher(config?: GlobalConfig): DataFetcher {
  const fetcher = new DataFetcher();
  if (config) {
    fetcher.configure(config);
  }
  return fetcher;
}
