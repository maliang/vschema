/**
 * VSchema Plugin Tests
 * 插件集成测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { 
  createVSchemaPlugin, 
  getGlobalRenderer, 
  getGlobalConfig,
  useJsonState,
  useJsonFetch,
} from './index';
import type { PluginOptions } from '../types/config';

describe('VSchema Plugin', () => {
  describe('Plugin Installation', () => {
    it('should install plugin with default options', () => {
      const app = createApp({ render: () => null });
      const plugin = createVSchemaPlugin();
      
      app.use(plugin);
      
      // 验证全局渲染器已创建
      expect(getGlobalRenderer()).not.toBeNull();
    });

    it('should register VSchema as global component', () => {
      const app = createApp({ render: () => null });
      const plugin = createVSchemaPlugin();
      
      app.use(plugin);
      
      // 验证全局组件已注册
      expect(app._context.components['VSchema']).toBeDefined();
    });

    it('should accept GlobalConfig options', () => {
      const app = createApp({ render: () => null });
      const options: PluginOptions = {
        baseURL: 'https://api.example.com',
        responseDataPath: 'data.result',
        defaultHeaders: {
          'Authorization': 'Bearer token123',
        },
      };
      
      const plugin = createVSchemaPlugin(options);
      app.use(plugin);
      
      // 验证配置已保存
      const config = getGlobalConfig();
      expect(config.baseURL).toBe('https://api.example.com');
      expect(config.responseDataPath).toBe('data.result');
      expect(config.defaultHeaders?.['Authorization']).toBe('Bearer token123');
    });

    it('should register custom components', () => {
      const app = createApp({ render: () => null });
      const CustomButton = defineComponent({
        name: 'CustomButton',
        render() {
          return h('button', { class: 'custom-btn' }, 'Custom');
        },
      });
      
      const plugin = createVSchemaPlugin({
        components: {
          'CustomButton': CustomButton,
        },
      });
      
      app.use(plugin);
      
      // 验证自定义组件已注册到渲染器
      const renderer = getGlobalRenderer();
      expect(renderer).not.toBeNull();
      expect(renderer!.getRegistry().has('CustomButton')).toBe(true);
    });

    it('should provide renderer via inject', () => {
      const app = createApp({ render: () => null });
      const plugin = createVSchemaPlugin();
      
      app.use(plugin);
      
      // 验证 provide 已设置
      expect(app._context.provides['vschema']).toBeDefined();
      expect(app._context.provides['vschemaConfig']).toBeDefined();
      expect(app._context.provides['vschemaRegistry']).toBeDefined();
    });

    it('should configure request interceptor', () => {
      const app = createApp({ render: () => null });
      const requestInterceptor = vi.fn((config) => config);
      
      const plugin = createVSchemaPlugin({
        requestInterceptor,
      });
      
      app.use(plugin);
      
      const config = getGlobalConfig();
      expect(config.requestInterceptor).toBe(requestInterceptor);
    });

    it('should configure response interceptor', () => {
      const app = createApp({ render: () => null });
      const responseInterceptor = vi.fn((response) => response);
      
      const plugin = createVSchemaPlugin({
        responseInterceptor,
      });
      
      app.use(plugin);
      
      const config = getGlobalConfig();
      expect(config.responseInterceptor).toBe(responseInterceptor);
    });

    it('should configure error interceptor', () => {
      const app = createApp({ render: () => null });
      const errorInterceptor = vi.fn((error) => Promise.reject(error));
      
      const plugin = createVSchemaPlugin({
        errorInterceptor,
      });
      
      app.use(plugin);
      
      const config = getGlobalConfig();
      expect(config.errorInterceptor).toBe(errorInterceptor);
    });
  });

  describe('VSchema Component', () => {
    beforeEach(() => {
      // 重置全局状态
      const app = createApp({ render: () => null });
      const plugin = createVSchemaPlugin();
      app.use(plugin);
    });

    it('should render simple JSON schema', async () => {
      const TestComponent = defineComponent({
        components: {
          VSchema: (await import('./index')).getGlobalRenderer() 
            ? defineComponent({
                props: ['schema'],
                setup(props) {
                  const renderer = getGlobalRenderer()!;
                  return () => {
                    const Component = renderer.render(props.schema);
                    return h(Component);
                  };
                },
              })
            : { render: () => null },
        },
        template: '<VSchema :schema="schema" />',
        data() {
          return {
            schema: {
              com: 'div',
              props: { class: 'test-div' },
              children: 'Hello World',
            },
          };
        },
      });

      const wrapper = mount(TestComponent);
      await nextTick();
      
      expect(wrapper.find('.test-div').exists()).toBe(true);
      expect(wrapper.text()).toContain('Hello World');
    });

    it('should render nested components', async () => {
      const renderer = getGlobalRenderer()!;
      
      const schema = {
        com: 'div',
        props: { class: 'parent' },
        children: [
          {
            com: 'span',
            props: { class: 'child' },
            children: 'Child Content',
          },
        ],
      };

      const Component = renderer.render(schema);
      const wrapper = mount(Component);
      await nextTick();

      expect(wrapper.find('.parent').exists()).toBe(true);
      expect(wrapper.find('.child').exists()).toBe(true);
      expect(wrapper.find('.child').text()).toBe('Child Content');
    });

    it('should handle state and reactivity', async () => {
      const renderer = getGlobalRenderer()!;
      
      const schema = {
        data: { count: 0 },
        com: 'div',
        children: [
          {
            com: 'span',
            props: { class: 'count' },
            children: '{{ count }}',
          },
          {
            com: 'button',
            props: { class: 'increment' },
            events: {
              click: { set: 'count', value: '{{ count + 1 }}' },
            },
            children: '+',
          },
        ],
      };

      const Component = renderer.render(schema);
      const wrapper = mount(Component);
      await nextTick();

      expect(wrapper.find('.count').text()).toBe('0');
      
      await wrapper.find('.increment').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.count').text()).toBe('1');
    });
  });

  describe('useJsonState Composable', () => {
    it('should create reactive state', () => {
      const TestComponent = defineComponent({
        setup() {
          const { state, setState, getState } = useJsonState({
            count: 0,
            name: 'test',
          });

          return { state, setState, getState };
        },
        render() {
          return h('div', {}, this.state.count);
        },
      });

      const wrapper = mount(TestComponent);
      
      expect(wrapper.vm.state.count).toBe(0);
      expect(wrapper.vm.state.name).toBe('test');
      expect(wrapper.vm.getState('count')).toBe(0);
    });

    it('should update state via setState', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { state, setState } = useJsonState({
            count: 0,
          });

          return { state, setState };
        },
        render() {
          return h('div', { class: 'count' }, String(this.state.count));
        },
      });

      const wrapper = mount(TestComponent);
      
      expect(wrapper.find('.count').text()).toBe('0');
      
      wrapper.vm.setState('count', 5);
      await nextTick();
      
      expect(wrapper.find('.count').text()).toBe('5');
    });

    it('should support computed properties', () => {
      const TestComponent = defineComponent({
        setup() {
          const { state, computed } = useJsonState(
            { count: 2 },
            { double: 'count * 2', triple: 'count * 3' }
          );

          return { state, computed };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      expect(wrapper.vm.computed.double.value).toBe(4);
      expect(wrapper.vm.computed.triple.value).toBe(6);
    });

    it('should support nested state paths', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { state, setState, getState } = useJsonState({
            user: {
              name: 'John',
              profile: {
                age: 25,
              },
            },
          });

          return { state, setState, getState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      expect(wrapper.vm.getState('user.name')).toBe('John');
      expect(wrapper.vm.getState('user.profile.age')).toBe(25);
      
      wrapper.vm.setState('user.profile.age', 30);
      await nextTick();
      
      expect(wrapper.vm.getState('user.profile.age')).toBe(30);
    });

    it('should support watch functionality', async () => {
      const callback = vi.fn();
      
      const TestComponent = defineComponent({
        setup() {
          const { state, setState, watch: watchState } = useJsonState({
            count: 0,
          });

          watchState('count', callback);

          return { state, setState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      wrapper.vm.setState('count', 1);
      await nextTick();
      
      expect(callback).toHaveBeenCalledWith(1, 0);
    });

    it('should cleanup on unmount', async () => {
      const TestComponent = defineComponent({
        setup() {
          const jsonState = useJsonState({ count: 0 });
          return { jsonState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      // 组件卸载应该不会抛出错误
      wrapper.unmount();
    });
  });

  describe('useJsonFetch Composable', () => {
    beforeEach(() => {
      // Mock fetch
      global.fetch = vi.fn();
    });

    it('should initialize with default values', () => {
      const TestComponent = defineComponent({
        setup() {
          const { data, loading, error } = useJsonFetch({
            fetch: '/api/test',
          });

          return { data, loading, error };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      expect(wrapper.vm.data).toBeNull();
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.error).toBeNull();
    });

    it('should execute fetch and update state', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const TestComponent = defineComponent({
        setup() {
          const fetchState = useJsonFetch({
            fetch: '/api/test',
          });

          return { fetchState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      await wrapper.vm.fetchState.execute();
      await nextTick();
      
      expect(wrapper.vm.fetchState.data.value).toEqual(mockData);
      expect(wrapper.vm.fetchState.loading.value).toBe(false);
      expect(wrapper.vm.fetchState.error.value).toBeNull();
    });

    it('should handle fetch errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const TestComponent = defineComponent({
        setup() {
          const fetchState = useJsonFetch({
            fetch: '/api/test',
          });

          return { fetchState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      await wrapper.vm.fetchState.execute();
      await nextTick();
      
      expect(wrapper.vm.fetchState.data.value).toBeNull();
      expect(wrapper.vm.fetchState.error.value).not.toBeNull();
      expect(wrapper.vm.fetchState.error.value?.message).toBe('Network error');
    });

    it('should support immediate option', async () => {
      const mockData = { success: true };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const TestComponent = defineComponent({
        setup() {
          const fetchState = useJsonFetch(
            { fetch: '/api/test' },
            { immediate: true }
          );

          return { fetchState };
        },
        render() {
          return h('div');
        },
      });

      mount(TestComponent);
      
      // 等待异步请求完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should support reset functionality', async () => {
      const mockData = { id: 1 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const TestComponent = defineComponent({
        setup() {
          const fetchState = useJsonFetch(
            { fetch: '/api/test' },
            { initialData: { default: true } }
          );

          return { fetchState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      await wrapper.vm.fetchState.execute();
      await nextTick();
      
      expect(wrapper.vm.fetchState.data.value).toEqual(mockData);
      
      wrapper.vm.fetchState.reset();
      
      expect(wrapper.vm.fetchState.data.value).toEqual({ default: true });
      expect(wrapper.vm.fetchState.loading.value).toBe(false);
      expect(wrapper.vm.fetchState.error.value).toBeNull();
    });

    it('should support override config in execute', async () => {
      const mockData = { id: 2 };
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve(mockData),
      });

      const TestComponent = defineComponent({
        setup() {
          const fetchState = useJsonFetch({
            fetch: '/api/test',
            method: 'GET',
          });

          return { fetchState };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      
      await wrapper.vm.fetchState.execute({ fetch: '/api/other' });
      
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/other',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });
});
