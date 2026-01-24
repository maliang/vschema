/**
 * Configuration type definitions for Vue JSON Renderer
 */

import type { Component } from 'vue';

/**
 * Request configuration for API calls
 */
export interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  /** 响应类型：json（默认）、text、blob、arrayBuffer */
  responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

/**
 * 标准 API 响应格式定义
 * Standard API response format definition
 * 
 * 默认格式: { code, msg, data }
 */
export interface ApiResponse<T = any> {
  /** 业务状态码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 响应数据 */
  data: T;
}

/**
 * API 响应格式配置
 * 用于自定义后端返回的字段名称
 */
export interface ResponseFormatConfig {
  /** 业务状态码字段名，默认 "code" */
  codeField?: string;
  /** 消息字段名，默认 "msg" */
  msgField?: string;
  /** 数据字段名，默认 "data" */
  dataField?: string;
  /** 业务成功状态码，默认 200 */
  successCode?: number | number[];
}

/**
 * Global configuration for the JSON Renderer plugin
 */
export interface GlobalConfig {
  /** Default path to extract data from API responses (e.g., "data" or "data.result") */
  responseDataPath?: string;

  /** 
   * API 响应格式配置
   * 用于配置后端返回数据的字段映射和成功码判断
   */
  responseFormat?: ResponseFormatConfig;

  /** Request interceptor - called before each request */
  requestInterceptor?: (
    config: RequestConfig
  ) => RequestConfig | Promise<RequestConfig>;

  /** Response interceptor - called after each successful response */
  responseInterceptor?: (response: any) => any | Promise<any>;

  /** Error interceptor - called when a request fails */
  errorInterceptor?: (error: any) => any | Promise<any>;

  /** Base URL for all API requests */
  baseURL?: string;

  /** Default headers for all API requests */
  defaultHeaders?: Record<string, string>;
}

/**
 * Plugin installation options
 */
export interface PluginOptions extends GlobalConfig {
  /** Custom components to register */
  components?: Record<string, Component>;
}
