/**
 * Vue JSON Renderer Composables
 * 提供 Composition API 风格的状态管理和数据获取功能
 */

import { ref, computed, watch, onUnmounted, type Ref, type ComputedRef } from 'vue';
import type { GlobalConfig } from '../types/config';
import type { FetchAction, Action } from '../types/schema';
import type { EvaluationContext } from '../types/runtime';
import { StateManager } from '../state/StateManager';
import { DataFetcher } from '../fetch/DataFetcher';
import { ExpressionEvaluator } from '../expression/ExpressionEvaluator';
import { getGlobalConfig } from './index';

/**
 * useJsonState 返回类型
 */
export interface UseJsonStateReturn<T extends Record<string, any>> {
  /** 响应式状态 */
  state: T;
  /** 计算属性 */
  computed: Record<string, ComputedRef<any>>;
  /** 设置状态值 */
  setState: (path: string, value: any) => void;
  /** 获取状态值 */
  getState: (path?: string) => any;
  /** 添加监听器 */
  watch: (path: string, callback: (newValue: any, oldValue: any) => void, options?: { immediate?: boolean; deep?: boolean }) => void;
  /** 清理资源 */
  dispose: () => void;
}

/**
 * useJsonState - JSON 状态管理 Composable
 * 
 * 提供类似 JSON Schema 中 state/computed/watch 的功能，
 * 但以 Composition API 的方式使用。
 * 
 * @param initialState 初始状态定义
 * @param computedDefs 计算属性定义（可选）
 * @returns 状态管理对象
 * 
 * @example
 * ```ts
 * const { state, computed, setState } = useJsonState(
 *   { count: 0, name: 'test' },
 *   { double: 'count * 2' }
 * );
 * 
 * // 访问状态
 * console.log(state.count); // 0
 * console.log(computed.double.value); // 0
 * 
 * // 修改状态
 * setState('count', 1);
 * console.log(computed.double.value); // 2
 * ```
 */
export function useJsonState<T extends Record<string, any>>(
  initialState: T,
  computedDefs?: Record<string, string>
): UseJsonStateReturn<T> {
  const evaluator = new ExpressionEvaluator();
  const stateManager = new StateManager(evaluator);
  
  // 创建响应式状态
  const state = stateManager.createState(initialState) as T;
  
  // 创建计算属性
  const computedRefs: Record<string, ComputedRef<any>> = {};
  
  if (computedDefs) {
    for (const [key, expression] of Object.entries(computedDefs)) {
      computedRefs[key] = computed(() => {
        const context: EvaluationContext = {
          state,
          computed: computedRefs,
        };
        const result = evaluator.evaluate(expression, context);
        return result.success ? result.value : undefined;
      });
    }
  }

  // 监听器停止函数列表
  const watchStopHandles: Array<() => void> = [];

  /**
   * 设置状态值
   */
  const setState = (path: string, value: any): void => {
    stateManager.setState(path, value);
  };

  /**
   * 获取状态值
   */
  const getState = (path?: string): any => {
    if (!path) {
      return state;
    }
    return stateManager.getByPath(path);
  };

  /**
   * 添加监听器
   */
  const watchState = (
    path: string,
    callback: (newValue: any, oldValue: any) => void,
    options?: { immediate?: boolean; deep?: boolean }
  ): void => {
    const getter = () => stateManager.getByPath(path);
    
    const stopHandle = watch(
      getter,
      (newValue, oldValue) => {
        callback(newValue, oldValue);
      },
      {
        immediate: options?.immediate ?? false,
        deep: options?.deep ?? false,
      }
    );
    
    watchStopHandles.push(stopHandle);
  };

  /**
   * 清理资源
   */
  const dispose = (): void => {
    // 停止所有监听器
    for (const stop of watchStopHandles) {
      stop();
    }
    watchStopHandles.length = 0;
    
    // 清理状态管理器
    stateManager.dispose();
  };

  // 组件卸载时自动清理
  onUnmounted(() => {
    dispose();
  });

  return {
    state,
    computed: computedRefs,
    setState,
    getState,
    watch: watchState,
    dispose,
  };
}

/**
 * useJsonFetch 选项
 */
export interface UseJsonFetchOptions extends Partial<GlobalConfig> {
  /** 是否立即执行请求 */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: any;
}

/**
 * useJsonFetch 返回类型
 */
export interface UseJsonFetchReturn<T = any> {
  /** 响应数据 */
  data: Ref<T | null>;
  /** 加载状态 */
  loading: Ref<boolean>;
  /** 错误信息 */
  error: Ref<Error | null>;
  /** 完整响应对象 */
  response: Ref<any>;
  /** 执行请求 */
  execute: (overrideConfig?: Partial<FetchAction>) => Promise<T | null>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * useJsonFetch - JSON 数据获取 Composable
 * 
 * 提供类似 JSON Schema 中 fetch action 的功能，
 * 但以 Composition API 的方式使用。
 * 
 * @param fetchConfig Fetch 配置
 * @param options 选项
 * @returns 数据获取对象
 * 
 * @example
 * ```ts
 * // 基础用法
 * const { data, loading, error, execute } = useJsonFetch({
 *   fetch: '/api/users',
 *   method: 'GET',
 * });
 * 
 * // 立即执行
 * const { data, loading } = useJsonFetch(
 *   { fetch: '/api/users' },
 *   { immediate: true }
 * );
 * 
 * // 手动执行
 * await execute();
 * console.log(data.value);
 * 
 * // 带参数执行
 * await execute({ fetch: '/api/users/1' });
 * ```
 */
export function useJsonFetch<T = any>(
  fetchConfig: FetchAction,
  options: UseJsonFetchOptions = {}
): UseJsonFetchReturn<T> {
  // 合并全局配置和选项配置
  const globalConfig = getGlobalConfig();
  const mergedConfig: GlobalConfig = {
    ...globalConfig,
    ...options,
  };

  // 创建数据获取器
  const fetcher = new DataFetcher();
  fetcher.configure(mergedConfig);

  // 响应式状态
  const data = ref<T | null>(options.initialData ?? null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const response = ref<any>(null);

  /**
   * 执行请求
   */
  const execute = async (overrideConfig?: Partial<FetchAction>): Promise<T | null> => {
    // 合并配置
    const config: FetchAction = {
      ...fetchConfig,
      ...overrideConfig,
    };

    // 设置加载状态
    loading.value = true;
    error.value = null;

    try {
      // 创建求值上下文
      const context: EvaluationContext = {
        state: {},
        computed: {},
      };

      // 执行请求
      const result = await fetcher.fetch(config, context);

      if (result.success) {
        data.value = result.data as T;
        response.value = result.response;
        error.value = null;
        return result.data as T;
      } else {
        error.value = result.error || new Error('Unknown error');
        response.value = result.response;
        return null;
      }
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置状态
   */
  const reset = (): void => {
    data.value = options.initialData ?? null;
    loading.value = false;
    error.value = null;
    response.value = null;
  };

  // 如果设置了 immediate，立即执行请求
  if (options.immediate) {
    execute();
  }

  return {
    data,
    loading,
    error,
    response,
    execute,
    reset,
  };
}

/**
 * useJsonActions - JSON 动作执行 Composable
 * 
 * 提供执行 JSON Schema 中定义的动作的能力
 * 
 * @example
 * ```ts
 * const { executeAction, executeActions } = useJsonActions();
 * 
 * // 执行单个动作
 * await executeAction({ set: 'count', value: 1 }, context);
 * 
 * // 执行多个动作
 * await executeActions([
 *   { set: 'loading', value: true },
 *   { fetch: '/api/data', then: { set: 'data', value: '{{ $response }}' } },
 *   { set: 'loading', value: false },
 * ], context);
 * ```
 */
export function useJsonActions() {
  const evaluator = new ExpressionEvaluator();

  /**
   * 执行单个动作
   */
  const executeAction = async (
    action: Action,
    state: Record<string, any>,
    options?: {
      methods?: Record<string, Function>;
      emit?: (event: string, payload?: any) => void;
    }
  ): Promise<void> => {
    const stateManager = new StateManager(evaluator);
    stateManager.createState(state);

    if ('set' in action) {
      // SetAction
      let value = action.value;
      if (typeof value === 'string' && evaluator.isTemplateExpression(value)) {
        value = evaluator.evaluateTemplate(value, { state, computed: {} });
      }
      stateManager.setState(action.set, value);
      // 同步回原始状态对象
      Object.assign(state, stateManager.getState());
    } else if ('call' in action) {
      // CallAction
      const method = options?.methods?.[action.call];
      if (method) {
        await method(...(action.args || []));
      }
    } else if ('emit' in action) {
      // EmitAction
      options?.emit?.(action.emit, action.payload);
    }
  };

  /**
   * 执行多个动作
   */
  const executeActions = async (
    actions: Action[],
    state: Record<string, any>,
    options?: {
      methods?: Record<string, Function>;
      emit?: (event: string, payload?: any) => void;
    }
  ): Promise<void> => {
    for (const action of actions) {
      await executeAction(action, state, options);
    }
  };

  return {
    executeAction,
    executeActions,
  };
}
