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
}

/**
 * Global configuration for the JSON Renderer plugin
 */
export interface GlobalConfig {
  /** Default path to extract data from API responses (e.g., "data" or "data.result") */
  responseDataPath?: string;

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
