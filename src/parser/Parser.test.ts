/**
 * Parser Property-Based Tests
 * JSON 解析器属性测试
 *
 * Property 1: JSON Schema 往返一致性
 * Property 3: 无效输入错误处理
 *
 * 验证: 需求 1.2, 1.4, 1.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { test } from '@fast-check/vitest';
import fc from 'fast-check';
import { createParser } from './Parser';
import type { JsonNode, Action } from '../types/schema';
import type { IParser } from '../types/runtime';

let parser: IParser;

beforeEach(() => {
  parser = createParser();
});

// ============ Arbitrary Generators ============

/**
 * 生成有效的 SetAction
 */
const setActionArbitrary: fc.Arbitrary<Action> = fc.record({
  set: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(s)),
  value: fc.oneof(fc.integer(), fc.string(), fc.boolean(), fc.constant(null)),
});

/**
 * 生成有效的 CallAction
 */
const callActionArbitrary: fc.Arbitrary<Action> = fc.record({
  call: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
  args: fc.option(fc.array(fc.oneof(fc.integer(), fc.string(), fc.boolean()), { maxLength: 3 })),
}).map(({ call, args }) => args ? { call, args } : { call });


/**
 * 生成有效的 EmitAction
 */
const emitActionArbitrary: fc.Arbitrary<Action> = fc.record({
  emit: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(s)),
  payload: fc.option(fc.oneof(fc.integer(), fc.string(), fc.boolean())),
}).map(({ emit, payload }) => payload !== null ? { emit, payload } : { emit });

/**
 * 生成有效的 Action（不包含嵌套的 FetchAction 和 IfAction 以避免无限递归）
 */
const simpleActionArbitrary: fc.Arbitrary<Action> = fc.oneof(
  setActionArbitrary,
  callActionArbitrary,
  emitActionArbitrary
);

/**
 * JavaScript 特殊属性名，需要过滤掉
 */
const RESERVED_KEYS = ['__proto__', 'constructor', 'prototype', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

/**
 * 生成有效的属性键名（过滤掉 JavaScript 特殊属性）
 */
const safeKeyArbitrary = fc.string({ minLength: 1, maxLength: 15 })
  .filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !RESERVED_KEYS.includes(s));

/**
 * 生成有效的组件名称
 */
const componentNameArbitrary = fc.oneof(
  // HTML 标签
  fc.constantFrom('div', 'span', 'p', 'button', 'input', 'form', 'ul', 'li', 'h1', 'h2', 'a'),
  // 自定义组件名
  fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[A-Z][a-zA-Z0-9]*$/.test(s))
);

/**
 * 生成有效的 props
 */
const propsArbitrary = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(s) && !RESERVED_KEYS.includes(s)),
  fc.oneof(
    fc.string({ maxLength: 50 }),
    fc.integer(),
    fc.boolean(),
    fc.constant('{{ count }}'),
    fc.constant('{{ item.name }}')
  ),
  { minKeys: 0, maxKeys: 5 }
);

/**
 * 生成有效的状态定义
 */
const stateArbitrary = fc.dictionary(
  safeKeyArbitrary,
  fc.oneof(
    fc.integer(),
    fc.string({ maxLength: 30 }),
    fc.boolean(),
    fc.array(fc.integer(), { maxLength: 5 }),
    fc.constant(null)
  ),
  { minKeys: 0, maxKeys: 5 }
);


/**
 * 生成有效的计算属性定义
 */
const computedArbitrary = fc.dictionary(
  safeKeyArbitrary,
  fc.constantFrom('count * 2', 'items.length', 'name.toUpperCase()', 'a + b'),
  { minKeys: 0, maxKeys: 3 }
);

/**
 * 生成简单的 JsonNode（无嵌套子节点）
 */
const simpleJsonNodeArbitrary: fc.Arbitrary<JsonNode> = fc.record({
  com: fc.option(componentNameArbitrary),
  props: fc.option(propsArbitrary),
  children: fc.option(fc.string({ maxLength: 100 })),
  data: fc.option(stateArbitrary),
  computed: fc.option(computedArbitrary),
  if: fc.option(fc.constantFrom('visible', 'count > 0', 'items.length > 0')),
  show: fc.option(fc.constantFrom('active', 'expanded')),
  for: fc.option(fc.constantFrom('item in items', '(item, index) in items')),
  key: fc.option(fc.constantFrom('{{ item.id }}', '{{ index }}')),
  model: fc.option(fc.constantFrom('value', 'form.name', 'selected')),
  ref: fc.option(safeKeyArbitrary),
}).map(node => {
  // 移除 null/undefined 值
  const result: JsonNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value !== null && value !== undefined) {
      (result as any)[key] = value;
    }
  }
  return result;
});


/**
 * 生成带有子节点的 JsonNode
 */
const jsonNodeWithChildrenArbitrary: fc.Arbitrary<JsonNode> = fc.record({
  com: componentNameArbitrary,
  props: fc.option(propsArbitrary),
  children: fc.option(
    fc.oneof(
      fc.string({ maxLength: 50 }),
      fc.array(simpleJsonNodeArbitrary, { minLength: 0, maxLength: 3 })
    )
  ),
  data: fc.option(stateArbitrary),
  computed: fc.option(computedArbitrary),
}).map(node => {
  const result: JsonNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value !== null && value !== undefined) {
      (result as any)[key] = value;
    }
  }
  return result;
});

/**
 * 生成带有事件的 JsonNode
 */
const jsonNodeWithEventsArbitrary: fc.Arbitrary<JsonNode> = fc.record({
  com: componentNameArbitrary,
  props: fc.option(propsArbitrary),
  children: fc.option(fc.string({ maxLength: 50 })),
  events: fc.option(
    fc.dictionary(
      fc.constantFrom('click', 'submit', 'input', 'change', 'keyup.enter'),
      fc.oneof(simpleActionArbitrary, fc.array(simpleActionArbitrary, { minLength: 1, maxLength: 2 })),
      { minKeys: 1, maxKeys: 3 }
    )
  ),
}).map(node => {
  const result: JsonNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value !== null && value !== undefined) {
      (result as any)[key] = value;
    }
  }
  return result;
});


// ============ Unit Tests ============

describe('Parser - Unit Tests', () => {
  describe('parse', () => {
    it('should parse valid JSON string', () => {
      const json = '{"com": "div", "children": "Hello"}';
      const result = parser.parse(json);

      expect(result.success).toBe(true);
      expect(result.node?.com).toBe('div');
      expect(result.node?.children).toBe('Hello');
    });

    it('should parse valid object', () => {
      const obj = { com: 'span', props: { class: 'test' } };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.com).toBe('span');
      expect(result.node?.props?.class).toBe('test');
    });

    it('should handle nested children', () => {
      const obj = {
        com: 'div',
        children: [
          { com: 'span', children: 'Child 1' },
          { com: 'span', children: 'Child 2' },
        ],
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.node?.children)).toBe(true);
      expect((result.node?.children as JsonNode[]).length).toBe(2);
    });

    it('should parse data and computed', () => {
      const obj = {
        data: { count: 0 },
        computed: { double: 'count * 2' },
        com: 'div',
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.data?.count).toBe(0);
      expect(result.node?.computed?.double).toBe('count * 2');
    });


    it('should parse events with actions', () => {
      const obj = {
        com: 'button',
        events: {
          click: { set: 'count', value: '{{ count + 1 }}' },
        },
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.events?.click).toBeDefined();
    });

    it('应当接受 ws 动作（WebSocket Action）', () => {
      const schema = {
        com: 'button',
        events: {
          click: {
            ws: 'wss://example.com/socket',
            op: 'connect',
            id: 'main',
            onMessage: { set: 'last', value: '{{ $response.ok }}' },
          },
        },
      };

      const result = parser.parse(schema);
      expect(result.success).toBe(true);
    });

    it('应当接受 script 动作（ScriptAction）', () => {
      const schema = {
        com: 'button',
        events: {
          click: { script: 'state.count = (state.count || 0) + 1' },
        },
      };

      const result = parser.parse(schema);
      expect(result.success).toBe(true);
    });

    it('应当接受 copy 动作（CopyAction）', () => {
      const schema = {
        com: 'button',
        events: {
          click: {
            copy: '{{ shareUrl }}',
            then: { set: 'copied', value: true },
            catch: { set: 'error', value: '{{ $error.message }}' },
          },
        },
      };

      const result = parser.parse(schema);
      expect(result.success).toBe(true);
      expect(result.node?.events?.click).toEqual({
        copy: '{{ shareUrl }}',
        then: { set: 'copied', value: true },
        catch: { set: 'error', value: '{{ $error.message }}' },
      });
    });

    it('应当接受简单的 copy 动作', () => {
      const schema = {
        com: 'button',
        events: {
          click: { copy: 'Hello World' },
        },
      };

      const result = parser.parse(schema);
      expect(result.success).toBe(true);
      expect(result.node?.events?.click).toEqual({ copy: 'Hello World' });
    });

    it('should parse lifecycle hooks', () => {
      const obj = {
        com: 'div',
        onMounted: { call: 'init' },
        onUnmounted: { call: 'cleanup' },
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.onMounted).toBeDefined();
      expect(result.node?.onUnmounted).toBeDefined();
    });

    it('should parse directives', () => {
      const obj = {
        com: 'div',
        if: 'visible',
        for: 'item in items',
        key: '{{ item.id }}',
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.if).toBe('visible');
      expect(result.node?.for).toBe('item in items');
      expect(result.node?.key).toBe('{{ item.id }}');
    });

    it('should parse initApi as string', () => {
      const obj = {
        com: 'div',
        initApi: '/api/data',
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.initApi).toBe('/api/data');
    });

    it('should parse initApi as object', () => {
      const obj = {
        com: 'div',
        initApi: {
          url: '/api/data',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { id: 1 },
        },
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.initApi).toEqual({
        url: '/api/data',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { id: 1 },
      });
    });

    it('should parse uiApi as string', () => {
      const obj = {
        com: 'div',
        uiApi: '/api/ui',
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.uiApi).toBe('/api/ui');
    });

    it('should parse uiApi as object', () => {
      const obj = {
        com: 'div',
        uiApi: {
          url: '/api/ui/{{ pageId }}',
          method: 'GET',
        },
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.uiApi).toEqual({
        url: '/api/ui/{{ pageId }}',
        method: 'GET',
      });
    });

    it('should parse both initApi and uiApi together', () => {
      const obj = {
        com: 'div',
        initApi: '/api/data',
        uiApi: '/api/ui',
        data: { pageId: 1 },
      };
      const result = parser.parse(obj);

      expect(result.success).toBe(true);
      expect(result.node?.initApi).toBe('/api/data');
      expect(result.node?.uiApi).toBe('/api/ui');
      expect(result.node?.data?.pageId).toBe(1);
    });
  });

  describe('error handling', () => {
    it('should return error for invalid JSON string', () => {
      const result = parser.parse('{ invalid json }');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0].message).toContain('JSON 解析错误');
    });

    it('should return error for null input', () => {
      const result = parser.parse(null as any);

      expect(result.success).toBe(false);
      expect(result.errors![0].message).toContain('null');
    });


    it('should return error for array input', () => {
      const result = parser.parse([{ com: 'div' }] as any);

      expect(result.success).toBe(false);
      expect(result.errors![0].message).toContain('根节点必须是一个对象');
    });

    it('should return error for unknown properties', () => {
      const result = parser.parse({ com: 'div', unknownProp: 'value' });

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.message.includes('未知属性'))).toBe(true);
    });

    it('should return error for invalid com type', () => {
      const result = parser.parse({ com: 123 });

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.message.includes('com 必须是字符串'))).toBe(true);
    });

    it('should return error for invalid props type', () => {
      const result = parser.parse({ com: 'div', props: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.message.includes('props 必须是一个对象'))).toBe(true);
    });

    it('should return error for invalid action', () => {
      const result = parser.parse({
        com: 'button',
        events: { click: { invalid: 'action' } },
      });

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.message.includes('无效的 Action'))).toBe(true);
    });

    it('should include path in error messages', () => {
      const result = parser.parse({
        com: 'div',
        children: [{ com: 'span', props: 'invalid' }],
      });

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.path?.includes('children[0]'))).toBe(true);
    });
  });


  describe('validate', () => {
    it('should validate valid node', () => {
      const node: JsonNode = { com: 'div', children: 'Hello' };
      const result = parser.validate(node);

      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid node', () => {
      const node = { com: 123 } as any;
      const result = parser.validate(node);

      expect(result.valid).toBe(false);
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('serialize', () => {
    it('should serialize node to JSON string', () => {
      const node: JsonNode = { com: 'div', children: 'Hello' };
      const json = parser.serialize(node);

      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.com).toBe('div');
      expect(parsed.children).toBe('Hello');
    });

    it('should handle nested nodes', () => {
      const node: JsonNode = {
        com: 'div',
        children: [{ com: 'span', children: 'Child' }],
      };
      const json = parser.serialize(node);
      const parsed = JSON.parse(json);

      expect(parsed.children[0].com).toBe('span');
    });

    it('should remove undefined values', () => {
      const node: JsonNode = { com: 'div' };
      const json = parser.serialize(node);
      const parsed = JSON.parse(json);

      expect(parsed.children).toBeUndefined();
      expect(parsed.props).toBeUndefined();
    });
  });
});


// ============ Property-Based Tests ============

/**
 * Property 1: JSON Schema 往返一致性
 * *对于任意*有效的 JSON Schema，解析后再序列化应产生与原始 schema 语义等价的结果。
 *
 * parse(serialize(schema)) ≡ schema
 *
 * **验证: 需求 1.5**
 * **Feature: vschema, Property 1: JSON Schema 往返一致性**
 */
describe('Property 1: JSON Schema Round-Trip Consistency', () => {
  /**
   * 辅助函数：深度比较两个对象是否语义等价
   * 忽略 undefined 值和空对象的差异
   */
  function semanticallyEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === undefined && b === undefined) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => semanticallyEqual(item, b[index]));
    }

    if (typeof a === 'object') {
      const keysA = Object.keys(a).filter(k => a[k] !== undefined);
      const keysB = Object.keys(b).filter(k => b[k] !== undefined);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => semanticallyEqual(a[key], b[key]));
    }

    return a === b;
  }

  test.prop([simpleJsonNodeArbitrary], { numRuns: 100 })(
    'simple node round-trip should preserve semantics',
    (originalNode) => {
      // 先解析原始节点（确保它是有效的）
      const parseResult = parser.parse(originalNode);

      // 如果解析失败，跳过这个测试用例
      if (!parseResult.success || !parseResult.node) {
        return true;
      }

      // 序列化
      const serialized = parser.serialize(parseResult.node);

      // 重新解析
      const reparsed = parser.parse(serialized);

      // 验证往返一致性
      expect(reparsed.success).toBe(true);
      expect(semanticallyEqual(parseResult.node, reparsed.node)).toBe(true);
    }
  );


  test.prop([jsonNodeWithChildrenArbitrary], { numRuns: 100 })(
    'node with children round-trip should preserve semantics',
    (originalNode) => {
      const parseResult = parser.parse(originalNode);

      if (!parseResult.success || !parseResult.node) {
        return true;
      }

      const serialized = parser.serialize(parseResult.node);
      const reparsed = parser.parse(serialized);

      expect(reparsed.success).toBe(true);
      expect(semanticallyEqual(parseResult.node, reparsed.node)).toBe(true);
    }
  );

  test.prop([jsonNodeWithEventsArbitrary], { numRuns: 100 })(
    'node with events round-trip should preserve semantics',
    (originalNode) => {
      const parseResult = parser.parse(originalNode);

      if (!parseResult.success || !parseResult.node) {
        return true;
      }

      const serialized = parser.serialize(parseResult.node);
      const reparsed = parser.parse(serialized);

      expect(reparsed.success).toBe(true);
      expect(semanticallyEqual(parseResult.node, reparsed.node)).toBe(true);
    }
  );

  // 测试复杂嵌套结构的往返一致性
  it('complex nested structure round-trip', () => {
    const complexNode: JsonNode = {
      data: { count: 0, items: [] },
      computed: { double: 'count * 2' },
      com: 'div',
      children: [
        {
          com: 'button',
          events: {
            click: { set: 'count', value: '{{ count + 1 }}' },
          },
          children: 'Increment',
        },
        {
          com: 'ul',
          children: [
            {
              com: 'li',
              for: 'item in items',
              key: '{{ item.id }}',
              children: '{{ item.name }}',
            },
          ],
        },
      ],
    };

    const parseResult = parser.parse(complexNode);
    expect(parseResult.success).toBe(true);

    const serialized = parser.serialize(parseResult.node!);
    const reparsed = parser.parse(serialized);

    expect(reparsed.success).toBe(true);
    expect(reparsed.node?.data?.count).toBe(0);
    expect(reparsed.node?.computed?.double).toBe('count * 2');
  });
});


/**
 * Property 3: 无效输入错误处理
 * *对于任意*无效的 JSON 输入，Parser 应返回错误结果而不是崩溃，
 * 且错误信息应包含路径信息。
 *
 * **验证: 需求 1.2, 1.4**
 * **Feature: vschema, Property 3: 无效输入错误处理**
 */
describe('Property 3: Invalid Input Error Handling', () => {
  /**
   * 生成无效的 JSON 字符串
   */
  const invalidJsonStringArbitrary = fc.oneof(
    // 语法错误的 JSON
    fc.constant('{ invalid }'),
    fc.constant('{ "key": }'),
    fc.constant('{ "key": undefined }'),
    fc.constant('[1, 2, 3'),
    fc.constant('{"unclosed": "string'),
    // 随机字符串（大概率不是有效 JSON）
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => {
      try {
        JSON.parse(s);
        return false; // 如果能解析，则过滤掉
      } catch {
        return true;
      }
    })
  );

  test.prop([invalidJsonStringArbitrary], { numRuns: 50 })(
    'should not crash on invalid JSON strings',
    (invalidJson) => {
      // 不应该抛出异常
      const result = parser.parse(invalidJson);

      // 应该返回失败结果
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    }
  );

  /**
   * 生成无效的 schema 对象（类型错误）
   */
  const invalidSchemaArbitrary = fc.oneof(
    // com 类型错误
    fc.record({ com: fc.integer() }),
    fc.record({ com: fc.boolean() }),
    fc.record({ com: fc.array(fc.string()) }),
    // props 类型错误
    fc.record({ com: fc.constant('div'), props: fc.string() }),
    fc.record({ com: fc.constant('div'), props: fc.array(fc.integer()) }),
    // children 类型错误
    fc.record({ com: fc.constant('div'), children: fc.integer() }),
    fc.record({ com: fc.constant('div'), children: fc.boolean() }),
    // state 类型错误
    fc.record({ com: fc.constant('div'), data: fc.string() }),
    fc.record({ com: fc.constant('div'), data: fc.array(fc.integer()) }),
    // computed 类型错误
    fc.record({ com: fc.constant('div'), computed: fc.string() }),
    fc.record({ com: fc.constant('div'), computed: fc.record({ key: fc.integer() }) }),
    // events 类型错误
    fc.record({ com: fc.constant('div'), events: fc.string() }),
    fc.record({ com: fc.constant('div'), events: fc.array(fc.string()) }),
  );


  test.prop([invalidSchemaArbitrary], { numRuns: 100 })(
    'should return errors for invalid schema objects',
    (invalidSchema) => {
      // 不应该抛出异常
      const result = parser.parse(invalidSchema);

      // 应该返回失败结果
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    }
  );

  test.prop([fc.record({ com: fc.constant('div'), invalidKey: fc.string() })], { numRuns: 50 })(
    'should report unknown properties',
    (objWithUnknown) => {
      const result = parser.parse(objWithUnknown);

      expect(result.success).toBe(false);
      expect(result.errors!.some(e => e.message.includes('未知属性'))).toBe(true);
    }
  );

  /**
   * 生成无效的 Action
   */
  const invalidActionArbitrary = fc.oneof(
    // 缺少必要属性
    fc.constant({}),
    fc.constant({ unknown: 'action' }),
    // set 类型错误
    fc.record({ set: fc.integer(), value: fc.string() }),
    // call 类型错误
    fc.record({ call: fc.integer() }),
    // emit 类型错误
    fc.record({ emit: fc.integer() }),
    // fetch 类型错误
    fc.record({ fetch: fc.integer() }),
    // if 缺少 then
    fc.record({ if: fc.constant('condition') }),
    // method 类型错误
    fc.record({ fetch: fc.constant('/api'), method: fc.constant('INVALID') }),
  );

  test.prop([invalidActionArbitrary], { numRuns: 50 })(
    'should return errors for invalid actions',
    (invalidAction) => {
      const schema = {
        com: 'button',
        events: { click: invalidAction },
      };

      const result = parser.parse(schema);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    }
  );


  // 测试错误路径信息
  test.prop([fc.integer({ min: 0, max: 5 })], { numRuns: 20 })(
    'error messages should include path information',
    (depth) => {
      // 构建嵌套结构，在最深层放置错误
      let schema: any = { com: 123 }; // 错误节点

      for (let i = 0; i < depth; i++) {
        schema = {
          com: 'div',
          children: [schema],
        };
      }

      const result = parser.parse(schema);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();

      // 如果有嵌套，错误路径应该包含 children
      if (depth > 0) {
        expect(result.errors!.some(e => e.path?.includes('children'))).toBe(true);
      }
    }
  );

  // 测试 null 和 undefined 输入
  it('should handle null input gracefully', () => {
    const result = parser.parse(null as any);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should handle undefined input gracefully', () => {
    const result = parser.parse(undefined as any);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  // 测试数组作为根节点
  it('should reject array as root node', () => {
    const result = parser.parse([{ com: 'div' }] as any);

    expect(result.success).toBe(false);
    expect(result.errors!.some(e => e.message.includes('根节点必须是一个对象'))).toBe(true);
  });

  // 测试原始类型作为根节点
  test.prop([fc.oneof(fc.string(), fc.integer(), fc.boolean())], { numRuns: 20 })(
    'should reject primitive types as root node',
    (primitive) => {
      const result = parser.parse(primitive as any);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    }
  );
});
