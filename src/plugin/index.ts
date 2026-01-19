/**
 * VSchema Plugin
 * Vue 插件入口，提供安装和配置功能
 */

import type { App, Component, Plugin } from 'vue';
import { defineComponent, h } from 'vue';
import type { PluginOptions, GlobalConfig } from '../types/config';
import type { JsonNode } from '../types/schema';
import { Renderer, createRenderer } from '../renderer/Renderer';
import { ComponentRegistry } from '../registry/ComponentRegistry';
import { DataFetcher } from '../fetch/DataFetcher';
import { Parser } from '../parser/Parser';

/**
 * 全局渲染器实例（用于 composables）
 */
let globalRenderer: Renderer | null = null;
let globalConfig: GlobalConfig = {};

/**
 * 获取全局渲染器实例
 */
export function getGlobalRenderer(): Renderer | null {
  return globalRenderer;
}

/**
 * 获取全局配置
 */
export function getGlobalConfig(): GlobalConfig {
  return { ...globalConfig };
}

/**
 * VSchema 组件 Props
 */
export interface VSchemaProps {
  /** JSON Schema 定义（对象或 JSON 字符串） */
  schema: JsonNode | string;
  /** 组件级别的配置（覆盖全局配置） */
  config?: GlobalConfig;
  /** 初始化数据，会与 schema.data 合并 */
  initialData?: Record<string, any>;
  /** 外部注入的方法，可在 script 动作中通过 $methods 访问 */
  methods?: Record<string, Function>;
}

/**
 * 创建 VSchema 全局组件
 * @param renderer 渲染器实例
 */
function createVSchemaComponent(renderer: Renderer): Component {
  return defineComponent({
    name: 'VSchema',
    props: {
      schema: {
        type: [Object, String] as any,
        required: true,
      },
      config: {
        type: Object as () => GlobalConfig,
        default: undefined,
      },
      initialData: {
        type: Object as () => Record<string, any>,
        default: undefined,
      },
      methods: {
        type: Object as () => Record<string, Function>,
        default: undefined,
      },
    },
    emits: null as any,
    setup(props, { emit, attrs }) {
      const parser = new Parser();

      return () => {
        try {
          let node: JsonNode;
          
          if (typeof props.schema === 'string') {
            const parseResult = parser.parse(props.schema);
            if (!parseResult.success || !parseResult.node) {
              emit('error', {
                type: 'parse',
                errors: parseResult.errors,
              });
              return h('div', { 
                style: { color: 'red', padding: '8px' } 
              }, `JSON 解析错误: ${parseResult.errors?.map(e => e.message).join(', ')}`);
            }
            node = parseResult.node;
          } else {
            node = props.schema as JsonNode;
          }

          if (props.initialData || props.methods) {
            node = {
              ...node,
              data: {
                ...node.data,
                ...props.initialData,
                $methods: props.methods || {},
              },
            };
          }

          const RenderedComponent = renderer.render(node);
          
          const eventListeners: Record<string, any> = {};
          for (const key in attrs) {
            if (key.startsWith('on') && typeof attrs[key] === 'function') {
              eventListeners[key] = attrs[key];
            }
          }
          
          return h(RenderedComponent, eventListeners);
        } catch (error) {
          emit('error', {
            type: 'render',
            error,
          });
          return h('div', { 
            style: { color: 'red', padding: '8px' } 
          }, `渲染错误: ${error instanceof Error ? error.message : String(error)}`);
        }
      };
    },
  });
}

/**
 * 创建 VSchema 插件
 * @param options 插件配置选项
 * @returns Vue 插件对象
 */
export function createVSchemaPlugin(options: PluginOptions = {}): Plugin {
  return {
    install(app: App) {
      globalConfig = {
        responseDataPath: options.responseDataPath,
        requestInterceptor: options.requestInterceptor,
        responseInterceptor: options.responseInterceptor,
        errorInterceptor: options.errorInterceptor,
        baseURL: options.baseURL,
        defaultHeaders: options.defaultHeaders,
      };

      const registry = new ComponentRegistry();

      if (options.components) {
        registry.registerBulk(options.components);
      }

      const fetcher = new DataFetcher();
      fetcher.configure(globalConfig);

      globalRenderer = createRenderer({
        registry,
        fetcher,
      });

      const VSchemaComponent = createVSchemaComponent(globalRenderer);
      app.component('VSchema', VSchemaComponent);

      app.provide('vschema', globalRenderer);
      app.provide('vschemaConfig', globalConfig);
      app.provide('vschemaRegistry', registry);
    },
  };
}

/**
 * 默认插件实例
 */
export const VSchemaPlugin = createVSchemaPlugin();

/**
 * 导出 composables
 */
export * from './composables';

/**
 * 默认导出
 */
export default createVSchemaPlugin;
