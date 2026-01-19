/**
 * ComponentRegistry Property-Based Tests
 * 组件注册表属性测试
 *
 * Property 4: 组件注册一致性
 * *对于任意*注册的组件，注册后通过相同名称查询应返回该组件。
 *
 * 验证: 需求 2.4, 2.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { test } from '@fast-check/vitest';
import fc from 'fast-check';
import { defineComponent, h } from 'vue';
import { ComponentRegistry, createComponentRegistry } from './ComponentRegistry';

// 创建测试用的组件注册表实例
let registry: ComponentRegistry;

beforeEach(() => {
  registry = createComponentRegistry();
});

// 创建一个简单的 Vue 组件用于测试
function createTestComponent(name: string) {
  return defineComponent({
    name,
    render() {
      return h('div', name);
    },
  });
}

describe('ComponentRegistry - Unit Tests', () => {
  describe('register', () => {
    it('should register a component', () => {
      const component = createTestComponent('TestComponent');
      registry.register('TestComponent', component);

      expect(registry.has('TestComponent')).toBe(true);
      expect(registry.get('TestComponent')).toBe(component);
    });

    it('should overwrite existing component with same name', () => {
      const component1 = createTestComponent('Test1');
      const component2 = createTestComponent('Test2');

      registry.register('MyComponent', component1);
      registry.register('MyComponent', component2);

      expect(registry.get('MyComponent')).toBe(component2);
    });

    it('should handle empty string name gracefully', () => {
      const component = createTestComponent('Test');
      registry.register('', component);

      // 空字符串名称应该被忽略
      expect(registry.has('')).toBe(false);
    });
  });

  describe('registerBulk', () => {
    it('should register multiple components', () => {
      const components = {
        ComponentA: createTestComponent('A'),
        ComponentB: createTestComponent('B'),
        ComponentC: createTestComponent('C'),
      };

      registry.registerBulk(components);

      expect(registry.has('ComponentA')).toBe(true);
      expect(registry.has('ComponentB')).toBe(true);
      expect(registry.has('ComponentC')).toBe(true);
      expect(registry.size).toBe(3);
    });

    it('should handle empty object', () => {
      registry.registerBulk({});
      expect(registry.size).toBe(0);
    });
  });

  describe('get', () => {
    it('should return undefined for unregistered component', () => {
      expect(registry.get('NonExistent')).toBeUndefined();
    });

    it('should return the registered component', () => {
      const component = createTestComponent('Test');
      registry.register('Test', component);

      expect(registry.get('Test')).toBe(component);
    });
  });

  describe('has', () => {
    it('should return false for unregistered component', () => {
      expect(registry.has('NonExistent')).toBe(false);
    });

    it('should return true for registered component', () => {
      registry.register('Test', createTestComponent('Test'));
      expect(registry.has('Test')).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return empty object when no components registered', () => {
      expect(registry.getAll()).toEqual({});
    });

    it('should return all registered components', () => {
      const componentA = createTestComponent('A');
      const componentB = createTestComponent('B');

      registry.register('A', componentA);
      registry.register('B', componentB);

      const all = registry.getAll();
      expect(all).toEqual({ A: componentA, B: componentB });
    });
  });

  describe('isNativeTag', () => {
    it('should return true for common HTML tags', () => {
      expect(registry.isNativeTag('div')).toBe(true);
      expect(registry.isNativeTag('span')).toBe(true);
      expect(registry.isNativeTag('input')).toBe(true);
      expect(registry.isNativeTag('button')).toBe(true);
      expect(registry.isNativeTag('form')).toBe(true);
      expect(registry.isNativeTag('table')).toBe(true);
      expect(registry.isNativeTag('ul')).toBe(true);
      expect(registry.isNativeTag('li')).toBe(true);
    });

    it('should return true for case-insensitive HTML tags', () => {
      expect(registry.isNativeTag('DIV')).toBe(true);
      expect(registry.isNativeTag('Span')).toBe(true);
      expect(registry.isNativeTag('INPUT')).toBe(true);
    });

    it('should return false for custom component names', () => {
      expect(registry.isNativeTag('MyComponent')).toBe(false);
      expect(registry.isNativeTag('custom-element')).toBe(false);
      expect(registry.isNativeTag('AppHeader')).toBe(false);
    });

    it('should return false for empty or invalid input', () => {
      expect(registry.isNativeTag('')).toBe(false);
      expect(registry.isNativeTag(null as any)).toBe(false);
      expect(registry.isNativeTag(undefined as any)).toBe(false);
    });

    it('should recognize all semantic HTML5 elements', () => {
      const semanticTags = [
        'article', 'section', 'nav', 'aside', 'header', 'footer', 'main',
        'figure', 'figcaption', 'details', 'summary', 'dialog',
      ];

      for (const tag of semanticTags) {
        expect(registry.isNativeTag(tag)).toBe(true);
      }
    });

    it('should recognize form elements', () => {
      const formTags = [
        'form', 'input', 'button', 'select', 'textarea', 'label',
        'fieldset', 'legend', 'datalist', 'output', 'option', 'optgroup',
      ];

      for (const tag of formTags) {
        expect(registry.isNativeTag(tag)).toBe(true);
      }
    });

    it('should recognize media elements', () => {
      const mediaTags = ['img', 'audio', 'video', 'source', 'track', 'canvas'];

      for (const tag of mediaTags) {
        expect(registry.isNativeTag(tag)).toBe(true);
      }
    });
  });

  describe('clear', () => {
    it('should remove all registered components', () => {
      registry.register('A', createTestComponent('A'));
      registry.register('B', createTestComponent('B'));

      expect(registry.size).toBe(2);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.has('A')).toBe(false);
      expect(registry.has('B')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty registry', () => {
      expect(registry.size).toBe(0);
    });

    it('should return correct count after registrations', () => {
      registry.register('A', createTestComponent('A'));
      expect(registry.size).toBe(1);

      registry.register('B', createTestComponent('B'));
      expect(registry.size).toBe(2);

      registry.register('C', createTestComponent('C'));
      expect(registry.size).toBe(3);
    });
  });
});

/**
 * Property 4: 组件注册一致性
 * *对于任意*注册的组件，注册后通过相同名称查询应返回该组件。
 *
 * registry.register(name, component)
 * registry.get(name) === component
 *
 * **验证: 需求 2.5**
 */
describe('Property 4: Component Registration Consistency', () => {
  // 生成有效的组件名称（非空字符串，不包含特殊字符）
  const componentNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => s.trim().length > 0 && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(s));

  test.prop([componentNameArbitrary], { numRuns: 100 })(
    'registered component should be retrievable by same name',
    (name) => {
      const reg = createComponentRegistry();
      const component = createTestComponent(name);

      // 注册组件
      reg.register(name, component);

      // 通过相同名称查询应返回该组件
      expect(reg.get(name)).toBe(component);
      expect(reg.has(name)).toBe(true);
    }
  );

  test.prop([componentNameArbitrary, componentNameArbitrary], { numRuns: 100 })(
    'multiple components should be independently retrievable',
    (name1, name2) => {
      // 确保两个名称不同
      fc.pre(name1 !== name2);

      const reg = createComponentRegistry();
      const component1 = createTestComponent(name1);
      const component2 = createTestComponent(name2);

      // 注册两个组件
      reg.register(name1, component1);
      reg.register(name2, component2);

      // 两个组件都应该可以独立查询
      expect(reg.get(name1)).toBe(component1);
      expect(reg.get(name2)).toBe(component2);
      expect(reg.has(name1)).toBe(true);
      expect(reg.has(name2)).toBe(true);
    }
  );

  test.prop(
    [fc.array(componentNameArbitrary, { minLength: 1, maxLength: 20 })],
    { numRuns: 100 }
  )(
    'bulk registered components should all be retrievable',
    (names) => {
      // 去重
      const uniqueNames = [...new Set(names)];

      const reg = createComponentRegistry();
      const components: Record<string, ReturnType<typeof createTestComponent>> = {};

      // 创建组件映射
      for (const name of uniqueNames) {
        components[name] = createTestComponent(name);
      }

      // 批量注册
      reg.registerBulk(components);

      // 所有组件都应该可以查询
      for (const name of uniqueNames) {
        expect(reg.get(name)).toBe(components[name]);
        expect(reg.has(name)).toBe(true);
      }

      // 注册数量应该正确
      expect(reg.size).toBe(uniqueNames.length);
    }
  );

  test.prop([componentNameArbitrary], { numRuns: 100 })(
    'getAll should include all registered components',
    (name) => {
      const reg = createComponentRegistry();
      const component = createTestComponent(name);

      reg.register(name, component);

      const all = reg.getAll();
      expect(all[name]).toBe(component);
      expect(Object.keys(all).length).toBe(1);
    }
  );

  test.prop([componentNameArbitrary], { numRuns: 100 })(
    'unregistered component should return undefined',
    (name) => {
      const reg = createComponentRegistry();

      // 未注册的组件应该返回 undefined
      expect(reg.get(name)).toBeUndefined();
      expect(reg.has(name)).toBe(false);
    }
  );

  test.prop([componentNameArbitrary], { numRuns: 100 })(
    'overwriting component should return new component',
    (name) => {
      const reg = createComponentRegistry();
      const component1 = createTestComponent(name + '1');
      const component2 = createTestComponent(name + '2');

      // 注册第一个组件
      reg.register(name, component1);
      expect(reg.get(name)).toBe(component1);

      // 用相同名称注册第二个组件
      reg.register(name, component2);

      // 应该返回新组件
      expect(reg.get(name)).toBe(component2);
      expect(reg.size).toBe(1);
    }
  );
});

// HTML 原生标签测试
describe('Native Tag Detection', () => {
  // HTML 原生标签集合（用于排除）
  const HTML_NATIVE_TAGS_SET = new Set([
    'html', 'head', 'title', 'base', 'link', 'meta', 'style', 'body',
    'article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'address',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
    'div', 'p', 'hr', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd',
    'figure', 'figcaption', 'menu',
    'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'ruby', 'rt',
    'rp', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b',
    'u', 'mark', 'bdi', 'bdo', 'span', 'br', 'wbr',
    'img', 'audio', 'video', 'track', 'map', 'area',
    'iframe', 'embed', 'object', 'param', 'picture', 'source', 'portal',
    'svg', 'math', 'script', 'noscript', 'template', 'slot', 'canvas',
    'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
    'form', 'label', 'input', 'button', 'select', 'datalist', 'optgroup', 'option',
    'textarea', 'output', 'progress', 'meter', 'fieldset', 'legend',
    'details', 'summary', 'dialog',
  ]);

  // 检查是否为原生标签（不区分大小写）
  const isNativeTag = (name: string) => HTML_NATIVE_TAGS_SET.has(name.toLowerCase());

  // 常见 HTML 标签
  const htmlTagsArbitrary = fc.constantFrom(
    'div', 'span', 'p', 'a', 'button', 'input', 'form', 'table', 'tr', 'td',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'img', 'video', 'audio', 'canvas',
    'header', 'footer', 'nav', 'main', 'section', 'article', 'aside'
  );

  // 自定义组件名称（PascalCase 或 kebab-case）
  // 必须排除 HTML 原生标签（包括大写形式如 HR、DIV 等）
  const customComponentNameArbitrary = fc.oneof(
    // PascalCase: MyComponent, AppHeader（至少两个大写字母开头的单词）
    fc.string({ minLength: 3, maxLength: 20 })
      .filter(s => /^[A-Z][a-z]+[A-Z][a-zA-Z0-9]*$/.test(s))
      .filter(s => !isNativeTag(s)),
    // kebab-case: my-component, app-header
    fc.string({ minLength: 3, maxLength: 30 })
      .filter(s => /^[a-z]+-[a-z]+(-[a-z]+)*$/.test(s))
      .filter(s => !isNativeTag(s))
  );

  test.prop([htmlTagsArbitrary], { numRuns: 100 })(
    'should recognize HTML native tags',
    (tag) => {
      const reg = createComponentRegistry();
      expect(reg.isNativeTag(tag)).toBe(true);
    }
  );

  test.prop([htmlTagsArbitrary], { numRuns: 100 })(
    'should recognize HTML tags case-insensitively',
    (tag) => {
      const reg = createComponentRegistry();
      expect(reg.isNativeTag(tag.toUpperCase())).toBe(true);
      expect(reg.isNativeTag(tag.toLowerCase())).toBe(true);
    }
  );

  test.prop([customComponentNameArbitrary], { numRuns: 100 })(
    'should not recognize custom component names as native tags',
    (name) => {
      const reg = createComponentRegistry();
      expect(reg.isNativeTag(name)).toBe(false);
    }
  );
});
