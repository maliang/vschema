/**
 * Event Handler Property-Based Tests
 * 事件处理器属性测试
 *
 * Property 7: 事件处理执行
 * *对于任意*定义了事件处理器的组件，当事件触发时，对应的动作应被执行。
 *
 * 验证: 需求 4.1, 4.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { test } from '@fast-check/vitest';
import fc from 'fast-check';
import { EventHandler, createEventHandler } from './EventHandler';
import { createExpressionEvaluator } from '../expression/ExpressionEvaluator';
import { createStateManager } from '../state/StateManager';
import type { ActionContext } from '../types/runtime';
import type { Action, SetAction, CallAction, EmitAction, IfAction, ScriptAction } from '../types/schema';

// 创建测试用的事件处理器实例
let eventHandler: EventHandler;

beforeEach(() => {
  eventHandler = createEventHandler();
});

// 创建模拟的 ActionContext
function createMockActionContext(initialState: Record<string, any> = {}): ActionContext {
  const stateManager = createStateManager();
  const state = stateManager.createState(initialState);

  return {
    state,
    computed: {},
    methods: {},
    emit: vi.fn(),
    fetcher: {
      fetch: vi.fn().mockResolvedValue({ success: true, data: {} }),
      configure: vi.fn(),
    },
    evaluator: createExpressionEvaluator(),
    stateManager,
  };
}

describe('EventHandler - Unit Tests', () => {
  describe('parseEventKey', () => {
    it('should parse simple event name', () => {
      const result = eventHandler.parseEventKey('click');
      expect(result.eventName).toBe('click');
      expect(result.modifiers).toEqual({});
    });

    it('should parse event with single modifier', () => {
      const result = eventHandler.parseEventKey('click.prevent');
      expect(result.eventName).toBe('click');
      expect(result.modifiers.prevent).toBe(true);
    });

    it('should parse event with multiple modifiers', () => {
      const result = eventHandler.parseEventKey('click.prevent.stop');
      expect(result.eventName).toBe('click');
      expect(result.modifiers.prevent).toBe(true);
      expect(result.modifiers.stop).toBe(true);
    });

    it('should parse keyboard event with key modifier', () => {
      const result = eventHandler.parseEventKey('keyup.enter');
      expect(result.eventName).toBe('keyup');
      expect(result.modifiers.enter).toBe(true);
    });

    it('should parse event with system modifier', () => {
      const result = eventHandler.parseEventKey('click.ctrl');
      expect(result.eventName).toBe('click');
      expect(result.modifiers.ctrl).toBe(true);
    });
  });


  describe('getListenerOptions', () => {
    it('should return empty options for no modifiers', () => {
      const options = eventHandler.getListenerOptions({});
      expect(options).toEqual({});
    });

    it('should return capture option', () => {
      const options = eventHandler.getListenerOptions({ capture: true });
      expect(options.capture).toBe(true);
    });

    it('should return once option', () => {
      const options = eventHandler.getListenerOptions({ once: true });
      expect(options.once).toBe(true);
    });

    it('should return passive option', () => {
      const options = eventHandler.getListenerOptions({ passive: true });
      expect(options.passive).toBe(true);
    });

    it('should return multiple options', () => {
      const options = eventHandler.getListenerOptions({
        capture: true,
        once: true,
        passive: true,
      });
      expect(options.capture).toBe(true);
      expect(options.once).toBe(true);
      expect(options.passive).toBe(true);
    });
  });

  describe('executeAction - SetAction', () => {
    it('should set state value', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: SetAction = { set: 'count', value: 10 };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().count).toBe(10);
    });

    it('should evaluate expression in value', async () => {
      const context = createMockActionContext({ count: 5 });
      const action: SetAction = { set: 'count', value: '{{ count + 1 }}' };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().count).toBe(6);
    });

    it('should set nested state value', async () => {
      const context = createMockActionContext({ user: { name: 'John' } });
      const action: SetAction = { set: 'user.name', value: 'Jane' };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().user.name).toBe('Jane');
    });
  });

  describe('executeAction - CallAction', () => {
    it('should call method', async () => {
      const context = createMockActionContext({});
      const mockMethod = vi.fn();
      context.methods = { myMethod: mockMethod };

      const action: CallAction = { call: 'myMethod' };

      await eventHandler.executeAction(action, context);

      expect(mockMethod).toHaveBeenCalled();
    });

    it('should call method with arguments', async () => {
      const context = createMockActionContext({});
      const mockMethod = vi.fn();
      context.methods = { myMethod: mockMethod };

      const action: CallAction = { call: 'myMethod', args: [1, 'test', true] };

      await eventHandler.executeAction(action, context);

      expect(mockMethod).toHaveBeenCalledWith(1, 'test', true);
    });

    it('should evaluate expression in arguments', async () => {
      const context = createMockActionContext({ count: 5 });
      const mockMethod = vi.fn();
      context.methods = { myMethod: mockMethod };

      const action: CallAction = { call: 'myMethod', args: ['{{ count * 2 }}'] };

      await eventHandler.executeAction(action, context);

      expect(mockMethod).toHaveBeenCalledWith(10);
    });

    it('should handle async methods', async () => {
      const context = createMockActionContext({});
      const mockMethod = vi.fn().mockResolvedValue('done');
      context.methods = { asyncMethod: mockMethod };

      const action: CallAction = { call: 'asyncMethod' };

      await eventHandler.executeAction(action, context);

      expect(mockMethod).toHaveBeenCalled();
    });

    it('should warn for non-existent method', async () => {
      const context = createMockActionContext({});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const action: CallAction = { call: 'nonExistent' };

      await eventHandler.executeAction(action, context);

      expect(warnSpy).toHaveBeenCalledWith('未找到方法（Method）"nonExistent"');
      warnSpy.mockRestore();
    });
  });

  describe('executeAction - EmitAction', () => {
    it('should emit event', async () => {
      const context = createMockActionContext({});
      const action: EmitAction = { emit: 'myEvent' };

      await eventHandler.executeAction(action, context);

      expect(context.emit).toHaveBeenCalledWith('myEvent', undefined);
    });

    it('should emit event with payload', async () => {
      const context = createMockActionContext({});
      const action: EmitAction = { emit: 'myEvent', payload: { data: 'test' } };

      await eventHandler.executeAction(action, context);

      expect(context.emit).toHaveBeenCalledWith('myEvent', { data: 'test' });
    });

    it('should evaluate expression in payload', async () => {
      const context = createMockActionContext({ count: 5 });
      const action: EmitAction = { emit: 'myEvent', payload: '{{ count }}' };

      await eventHandler.executeAction(action, context);

      expect(context.emit).toHaveBeenCalledWith('myEvent', 5);
    });
  });

  describe('executeAction - IfAction', () => {
    it('should execute then branch when condition is true', async () => {
      const context = createMockActionContext({ count: 10 });
      const action: IfAction = {
        if: 'count > 5',
        then: { set: 'result', value: 'greater' },
        else: { set: 'result', value: 'less' },
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().result).toBe('greater');
    });

    it('should execute else branch when condition is false', async () => {
      const context = createMockActionContext({ count: 3 });
      const action: IfAction = {
        if: 'count > 5',
        then: { set: 'result', value: 'greater' },
        else: { set: 'result', value: 'less' },
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().result).toBe('less');
    });

    it('should handle missing else branch', async () => {
      const context = createMockActionContext({ count: 3, result: 'initial' });
      const action: IfAction = {
        if: 'count > 5',
        then: { set: 'result', value: 'greater' },
      };

      await eventHandler.executeAction(action, context);

      // result 应该保持不变
      expect(context.stateManager.getState().result).toBe('initial');
    });

    it('should execute multiple actions in then branch', async () => {
      const context = createMockActionContext({ count: 10 });
      const action: IfAction = {
        if: 'count > 5',
        then: [
          { set: 'a', value: 1 },
          { set: 'b', value: 2 },
        ],
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().a).toBe(1);
      expect(context.stateManager.getState().b).toBe(2);
    });
  });

  describe('executeAction - ScriptAction', () => {
    it('should execute simple script', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: ScriptAction = {
        script: 'state.count = 10;',
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().count).toBe(10);
    });

    it('should access state variables in script', async () => {
      const context = createMockActionContext({ a: 5, b: 3, result: 0 });
      const action: ScriptAction = {
        script: 'state.result = state.a + state.b;',
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().result).toBe(8);
    });

    it('should call external methods via $methods', async () => {
      const mockLogin = vi.fn().mockResolvedValue(true);
      const context = createMockActionContext({ username: 'admin', password: '123456' });
      context.methods = { login: mockLogin };
      // 将 methods 注入到 state.$methods 中（模拟 JsonRenderer 的行为）
      context.state.$methods = context.methods;

      const action: ScriptAction = {
        script: 'await $methods.login(state.username, state.password);',
      };

      await eventHandler.executeAction(action, context);

      expect(mockLogin).toHaveBeenCalledWith('admin', '123456');
    });

    it('should support async/await in script', async () => {
      const context = createMockActionContext({ result: '' });
      const action: ScriptAction = {
        script: `
          const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          await delay(10);
          state.result = 'done';
        `,
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().result).toBe('done');
    });

    it('should handle script errors gracefully', async () => {
      const context = createMockActionContext({ count: 0 });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const action: ScriptAction = {
        script: 'throw new Error("test error");',
      };

      // 不应该抛出异常
      await eventHandler.executeAction(action, context);

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should access $event in script', async () => {
      const context = createMockActionContext({ eventType: '' });
      context.state.$event = { type: 'click', target: { id: 'btn' } };

      const action: ScriptAction = {
        script: 'state.eventType = $event.type;',
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().eventType).toBe('click');
    });

    it('should access $response in script', async () => {
      const context = createMockActionContext({ data: null });
      context.state.$response = { id: 1, name: 'test' };

      const action: ScriptAction = {
        script: 'state.data = $response;',
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().data).toEqual({ id: 1, name: 'test' });
    });

    it('should use built-in utilities in script', async () => {
      const context = createMockActionContext({ result: '' });
      const action: ScriptAction = {
        script: `
          const obj = { a: 1, b: 2 };
          state.result = JSON.stringify(obj);
        `,
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().result).toBe('{"a":1,"b":2}');
    });

    it('should handle complex logic in script', async () => {
      const context = createMockActionContext({
        items: [1, 2, 3, 4, 5],
        sum: 0,
        filtered: [],
      });

      const action: ScriptAction = {
        script: `
          state.sum = state.items.reduce((a, b) => a + b, 0);
          state.filtered = state.items.filter(x => x > 2);
        `,
      };

      await eventHandler.executeAction(action, context);

      expect(context.stateManager.getState().sum).toBe(15);
      expect(context.stateManager.getState().filtered).toEqual([3, 4, 5]);
    });

    it('should warn for empty script', async () => {
      const context = createMockActionContext({});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const action: ScriptAction = { script: '' };

      await eventHandler.executeAction(action, context);

      expect(warnSpy).toHaveBeenCalledWith('ScriptAction（脚本动作）：script 必须是非空字符串');
      warnSpy.mockRestore();
    });
  });

  describe('executeAction - WebSocketAction（WebSocket 动作）', () => {
    it('应当连接并在 onMessage 中使用解析后的 $response 执行动作', async () => {
      class MockWebSocket {
        static instances: MockWebSocket[] = [];

        readyState = 0;
        url: string;

        onopen: null | (() => void) = null;
        onmessage: null | ((ev: { data: any }) => void) = null;
        onerror: null | ((ev: any) => void) = null;
        onclose: null | (() => void) = null;

        constructor(url: string) {
          this.url = url;
          MockWebSocket.instances.push(this);
          queueMicrotask(() => {
            this.readyState = 1;
            this.onopen?.();
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        send(_data: any) {}

        close() {
          this.readyState = 3;
          this.onclose?.();
        }
      }

      const prev = (globalThis as any).WebSocket;
      (globalThis as any).WebSocket = MockWebSocket as any;

      try {
        const context = createMockActionContext({ last: null });

        await eventHandler.executeAction(
          {
            ws: 'wss://example.com/socket',
            op: 'connect',
            id: 'main',
            responseType: 'json',
            onMessage: { set: 'last', value: '{{ $response.ok }}' },
          } as any,
          context
        );

        expect(MockWebSocket.instances.length).toBe(1);

        // Simulate server message
        MockWebSocket.instances[0].onmessage?.({ data: '{"ok":true}' });

        // allow async onMessage handler to run
        await Promise.resolve();
        await Promise.resolve();

        expect(context.stateManager.getState().last).toBe(true);
      } finally {
        (globalThis as any).WebSocket = prev;
      }
    });
  });


  describe('executeActions', () => {
    it('should execute multiple actions in sequence', async () => {
      const context = createMockActionContext({ count: 0 });
      const actions: Action[] = [
        { set: 'count', value: 1 },
        { set: 'count', value: '{{ count + 1 }}' },
        { set: 'count', value: '{{ count + 1 }}' },
      ];

      await eventHandler.executeActions(actions, context);

      expect(context.stateManager.getState().count).toBe(3);
    });
  });

  describe('createHandler', () => {
    it('should create handler that executes action', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: SetAction = { set: 'count', value: 10 };

      const handler = eventHandler.createHandler(action, context);
      await handler();

      expect(context.stateManager.getState().count).toBe(10);
    });

    it('should create handler that executes multiple actions', async () => {
      const context = createMockActionContext({ a: 0, b: 0 });
      const actions: Action[] = [
        { set: 'a', value: 1 },
        { set: 'b', value: 2 },
      ];

      const handler = eventHandler.createHandler(actions, context);
      await handler();

      expect(context.stateManager.getState().a).toBe(1);
      expect(context.stateManager.getState().b).toBe(2);
    });

    it('should pass event object to context', async () => {
      const context = createMockActionContext({});
      const mockMethod = vi.fn();
      context.methods = { handleEvent: mockMethod };

      const action: CallAction = { call: 'handleEvent' };
      const handler = eventHandler.createHandler(action, context);

      const mockEvent = new Event('click');
      await handler(mockEvent);

      expect(mockMethod).toHaveBeenCalled();
    });
  });

  describe('createHandlerWithModifiers', () => {
    it('should call preventDefault for .prevent modifier', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: SetAction = { set: 'count', value: 1 };

      const handler = eventHandler.createHandlerWithModifiers('click.prevent', action, context);

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: {},
        currentTarget: {},
      } as unknown as Event;

      await handler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(context.stateManager.getState().count).toBe(1);
    });

    it('should call stopPropagation for .stop modifier', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: SetAction = { set: 'count', value: 1 };

      const handler = eventHandler.createHandlerWithModifiers('click.stop', action, context);

      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: {},
        currentTarget: {},
      } as unknown as Event;

      await handler(mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(context.stateManager.getState().count).toBe(1);
    });

    it('should not execute for .self when target !== currentTarget', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: SetAction = { set: 'count', value: 1 };

      const handler = eventHandler.createHandlerWithModifiers('click.self', action, context);

      const target = {};
      const currentTarget = {};
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target,
        currentTarget,
      } as unknown as Event;

      await handler(mockEvent);

      // 动作不应该执行
      expect(context.stateManager.getState().count).toBe(0);
    });

    it('should execute for .self when target === currentTarget', async () => {
      const context = createMockActionContext({ count: 0 });
      const action: SetAction = { set: 'count', value: 1 };

      const handler = eventHandler.createHandlerWithModifiers('click.self', action, context);

      const element = {};
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        target: element,
        currentTarget: element,
      } as unknown as Event;

      await handler(mockEvent);

      expect(context.stateManager.getState().count).toBe(1);
    });
  });
});


/**
 * Property 7: 事件处理执行
 * *对于任意*定义了事件处理器的组件，当事件触发时，对应的动作应被执行。
 *
 * **验证: 需求 4.1, 4.2**
 */
describe('Property 7: Event Handler Execution', () => {
  // 生成 SetAction
  const setActionArbitrary = fc.record({
    set: fc.constantFrom('count', 'value', 'result', 'flag'),
    value: fc.oneof(
      fc.integer({ min: 0, max: 1000 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.boolean()
    ),
  });

  // 生成 CallAction
  const callActionArbitrary = fc.record({
    call: fc.constantFrom('method1', 'method2', 'handler'),
    args: fc.option(fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 0, maxLength: 3 })),
  }).map(({ call, args }) => ({
    call,
    ...(args ? { args } : {}),
  }));

  // 生成 EmitAction
  const emitActionArbitrary = fc.record({
    emit: fc.constantFrom('event1', 'event2', 'customEvent'),
    payload: fc.option(fc.oneof(
      fc.integer(),
      fc.string({ minLength: 1, maxLength: 20 }),
      fc.record({ data: fc.integer() })
    )),
  }).map(({ emit, payload }) => ({
    emit,
    ...(payload !== null ? { payload } : {}),
  }));

  test.prop([setActionArbitrary], { numRuns: 100 })(
    'SetAction should update state with the specified value',
    async (action) => {
      const context = createMockActionContext({ count: 0, value: '', result: '', flag: false });

      await eventHandler.executeAction(action as SetAction, context);

      // 状态应该被更新为指定的值
      expect(context.stateManager.getState()[action.set]).toBe(action.value);
    }
  );

  test.prop([callActionArbitrary], { numRuns: 100 })(
    'CallAction should invoke the specified method',
    async (action) => {
      const context = createMockActionContext({});
      const mockMethod = vi.fn();
      context.methods = {
        method1: mockMethod,
        method2: mockMethod,
        handler: mockMethod,
      };

      await eventHandler.executeAction(action as CallAction, context);

      // 方法应该被调用
      expect(mockMethod).toHaveBeenCalled();

      // 如果有参数，应该传递正确的参数
      if (action.args && action.args.length > 0) {
        expect(mockMethod).toHaveBeenCalledWith(...action.args);
      }
    }
  );

  test.prop([emitActionArbitrary], { numRuns: 100 })(
    'EmitAction should emit the specified event',
    async (action) => {
      const context = createMockActionContext({});

      await eventHandler.executeAction(action as EmitAction, context);

      // 事件应该被触发
      expect(context.emit).toHaveBeenCalledWith(
        action.emit,
        action.payload !== undefined ? action.payload : undefined
      );
    }
  );

  // 测试 IfAction 条件执行
  const ifActionArbitrary = fc.record({
    condition: fc.boolean(),
    thenValue: fc.integer({ min: 0, max: 100 }),
    elseValue: fc.integer({ min: 100, max: 200 }),
  });

  test.prop([ifActionArbitrary], { numRuns: 100 })(
    'IfAction should execute correct branch based on condition',
    async ({ condition, thenValue, elseValue }) => {
      const context = createMockActionContext({ condition, result: -1 });

      const action: IfAction = {
        if: 'condition',
        then: { set: 'result', value: thenValue },
        else: { set: 'result', value: elseValue },
      };

      await eventHandler.executeAction(action, context);

      // 应该执行正确的分支
      const expectedValue = condition ? thenValue : elseValue;
      expect(context.stateManager.getState().result).toBe(expectedValue);
    }
  );

  // 测试多个动作顺序执行
  test.prop(
    [fc.array(fc.integer({ min: 1, max: 10 }), { minLength: 1, maxLength: 5 })],
    { numRuns: 100 }
  )(
    'executeActions should execute all actions in sequence',
    async (increments) => {
      const context = createMockActionContext({ count: 0 });

      // 创建一系列递增动作
      const actions: SetAction[] = [];
      let expectedValue = 0;
      for (const inc of increments) {
        expectedValue += inc;
        actions.push({ set: 'count', value: expectedValue });
      }

      await eventHandler.executeActions(actions, context);

      // 最终值应该是最后一个动作设置的值
      expect(context.stateManager.getState().count).toBe(expectedValue);
    }
  );

  // 测试事件处理器创建和执行
  test.prop([setActionArbitrary], { numRuns: 100 })(
    'createHandler should create a function that executes the action',
    async (action) => {
      const context = createMockActionContext({ count: 0, value: '', result: '', flag: false });

      const handler = eventHandler.createHandler(action as SetAction, context);

      // handler 应该是一个函数
      expect(typeof handler).toBe('function');

      // 执行 handler
      await handler();

      // 状态应该被更新
      expect(context.stateManager.getState()[action.set]).toBe(action.value);
    }
  );

  // 测试事件修饰符解析
  const modifierArbitrary = fc.constantFrom(
    'prevent', 'stop', 'capture', 'self', 'once', 'passive',
    'enter', 'tab', 'esc', 'space', 'up', 'down', 'left', 'right',
    'ctrl', 'alt', 'shift', 'meta'
  );

  test.prop(
    [fc.constantFrom('click', 'keyup', 'keydown', 'submit', 'input'), fc.array(modifierArbitrary, { minLength: 0, maxLength: 3 })],
    { numRuns: 100 }
  )(
    'parseEventKey should correctly parse event name and modifiers',
    (eventName, modifiers) => {
      // 构建事件键
      const eventKey = [eventName, ...modifiers].join('.');

      const result = eventHandler.parseEventKey(eventKey);

      // 事件名应该正确
      expect(result.eventName).toBe(eventName);

      // 所有修饰符应该被解析
      for (const mod of modifiers) {
        expect(result.modifiers[mod as keyof typeof result.modifiers]).toBe(true);
      }
    }
  );
});

// 集成测试
describe('EventHandler - Integration Tests', () => {
  it('should handle complex action sequence', async () => {
    const context = createMockActionContext({
      items: [],
      loading: false,
      error: null,
    });

    const mockMethod = vi.fn();
    context.methods = { validate: mockMethod };

    const actions: Action[] = [
      { set: 'loading', value: true },
      { call: 'validate' },
      { set: 'items', value: [1, 2, 3] },
      { set: 'loading', value: false },
      { emit: 'dataLoaded', payload: { count: 3 } },
    ];

    await eventHandler.executeActions(actions, context);

    expect(context.stateManager.getState().loading).toBe(false);
    expect(context.stateManager.getState().items).toEqual([1, 2, 3]);
    expect(mockMethod).toHaveBeenCalled();
    expect(context.emit).toHaveBeenCalledWith('dataLoaded', { count: 3 });
  });

  it('should handle nested IfAction', async () => {
    const context = createMockActionContext({
      level: 3,
      result: '',
    });

    const action: IfAction = {
      if: 'level > 2',
      then: {
        if: 'level > 4',
        then: { set: 'result', value: 'high' },
        else: { set: 'result', value: 'medium' },
      },
      else: { set: 'result', value: 'low' },
    };

    await eventHandler.executeAction(action, context);

    expect(context.stateManager.getState().result).toBe('medium');
  });

  it('should handle expression evaluation in actions', async () => {
    const context = createMockActionContext({
      count: 5,
      multiplier: 3,
    });

    const action: SetAction = {
      set: 'result',
      value: '{{ count * multiplier }}',
    };

    await eventHandler.executeAction(action, context);

    expect(context.stateManager.getState().result).toBe(15);
  });
});


// WebSocket 清理测试
describe('EventHandler - WebSocket Cleanup', () => {
  it('should close all WebSocket connections on dispose', async () => {
    const context = createMockActionContext({});
    
    // 创建 mock WebSocket
    const mockClose = vi.fn();
    const mockWebSocket = {
      readyState: 1, // WebSocket.OPEN
      close: mockClose,
      onopen: null as any,
      onmessage: null as any,
      onerror: null as any,
      onclose: null as any,
    };
    
    // Mock WebSocket 构造函数
    const originalWebSocket = global.WebSocket;
    (global as any).WebSocket = vi.fn().mockImplementation(() => {
      // 模拟连接立即打开
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen({});
        }
      }, 0);
      return mockWebSocket;
    });
    (global as any).WebSocket.OPEN = 1;
    (global as any).WebSocket.CONNECTING = 0;
    (global as any).WebSocket.CLOSED = 3;
    
    try {
      // 创建 WebSocket 连接
      await eventHandler.executeAction(
        {
          ws: 'wss://example.com/socket',
          op: 'connect',
          id: 'test-ws',
        },
        context
      );
      
      // 调用 dispose
      eventHandler.dispose();
      
      // 验证 close 被调用
      expect(mockClose).toHaveBeenCalledWith(1000, 'Component unmounted');
    } finally {
      // 恢复原始 WebSocket
      (global as any).WebSocket = originalWebSocket;
    }
  });

  it('should handle dispose when no WebSocket connections exist', () => {
    // 不应该抛出错误
    expect(() => eventHandler.dispose()).not.toThrow();
  });

  it('should clear WebSocket map after dispose', async () => {
    const context = createMockActionContext({});
    
    // 创建 mock WebSocket
    const mockWebSocket = {
      readyState: 1,
      close: vi.fn(),
      onopen: null as any,
      onmessage: null as any,
      onerror: null as any,
      onclose: null as any,
    };
    
    const originalWebSocket = global.WebSocket;
    (global as any).WebSocket = vi.fn().mockImplementation(() => {
      setTimeout(() => {
        if (mockWebSocket.onopen) {
          mockWebSocket.onopen({});
        }
      }, 0);
      return mockWebSocket;
    });
    (global as any).WebSocket.OPEN = 1;
    (global as any).WebSocket.CONNECTING = 0;
    (global as any).WebSocket.CLOSED = 3;
    
    try {
      // 创建连接
      await eventHandler.executeAction(
        {
          ws: 'wss://example.com/socket',
          op: 'connect',
          id: 'test-ws',
        },
        context
      );
      
      // 调用 dispose
      eventHandler.dispose();
      
      // 尝试发送消息应该失败（因为连接已被清理）
      // 由于 withFinally 会捕获错误并输出到控制台，我们需要监听 console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await eventHandler.executeAction(
        {
          ws: 'test-ws',
          op: 'send',
          message: 'hello',
        },
        context
      );
      
      // 验证错误被输出到控制台
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'WebSocketAction（WebSocket 动作）执行出错：',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    } finally {
      (global as any).WebSocket = originalWebSocket;
    }
  });
});


// CopyAction 测试
describe('EventHandler - CopyAction', () => {
  // Mock clipboard API
  const mockWriteText = vi.fn();
  
  beforeEach(() => {
    mockWriteText.mockReset();
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it('should copy text to clipboard using Clipboard API', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const context = createMockActionContext({ content: 'Hello World' });

    await eventHandler.executeAction(
      { copy: '{{ content }}' },
      context
    );

    expect(mockWriteText).toHaveBeenCalledWith('Hello World');
  });

  it('should copy static text', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const context = createMockActionContext({});

    await eventHandler.executeAction(
      { copy: 'Static text' },
      context
    );

    expect(mockWriteText).toHaveBeenCalledWith('Static text');
  });

  it('should execute then callback on success', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const context = createMockActionContext({ copied: false });

    await eventHandler.executeAction(
      {
        copy: 'test',
        then: { set: 'copied', value: true },
      },
      context
    );

    expect(context.stateManager.getState().copied).toBe(true);
  });

  it('should execute catch callback on failure', async () => {
    mockWriteText.mockRejectedValue(new Error('Permission denied'));
    
    // 同时 mock execCommand 失败
    const originalExecCommand = document.execCommand;
    document.execCommand = vi.fn().mockReturnValue(false);
    
    const context = createMockActionContext({ error: '' });

    await eventHandler.executeAction(
      {
        copy: 'test',
        catch: { set: 'error', value: '{{ $error.message }}' },
      },
      context
    );

    expect(context.stateManager.getState().error).toBe('execCommand copy 失败');
    
    document.execCommand = originalExecCommand;
  });

  it('should handle null and undefined values', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const context = createMockActionContext({ value: null });

    await eventHandler.executeAction(
      { copy: '{{ value }}' },
      context
    );

    expect(mockWriteText).toHaveBeenCalledWith('');
  });

  it('should convert non-string values to string', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const context = createMockActionContext({ count: 42 });

    await eventHandler.executeAction(
      { copy: '{{ count }}' },
      context
    );

    expect(mockWriteText).toHaveBeenCalledWith('42');
  });

  it('should fallback to execCommand when Clipboard API fails', async () => {
    mockWriteText.mockRejectedValue(new Error('Not allowed'));
    
    const originalExecCommand = document.execCommand;
    document.execCommand = vi.fn().mockReturnValue(true);
    
    const context = createMockActionContext({});

    await eventHandler.executeAction(
      { copy: 'fallback test' },
      context
    );

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    
    document.execCommand = originalExecCommand;
  });

  it('should fallback to execCommand when Clipboard API is not available', async () => {
    // 移除 clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    
    const originalExecCommand = document.execCommand;
    document.execCommand = vi.fn().mockReturnValue(true);
    
    const context = createMockActionContext({});

    await eventHandler.executeAction(
      { copy: 'no clipboard api' },
      context
    );

    expect(document.execCommand).toHaveBeenCalledWith('copy');
    
    document.execCommand = originalExecCommand;
  });
});
