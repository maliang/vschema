/**
 * 路径工具模块测试
 */
import { describe, it, expect } from 'vitest';
import { parsePath, getByPath, setByPath, hasPath } from './path';

describe('路径工具模块', () => {
  describe('parsePath - 路径解析', () => {
    it('应该解析简单路径', () => {
      expect(parsePath('name')).toEqual([
        { key: 'name', isArrayIndex: false }
      ]);
    });

    it('应该解析嵌套路径', () => {
      expect(parsePath('user.profile.name')).toEqual([
        { key: 'user', isArrayIndex: false },
        { key: 'profile', isArrayIndex: false },
        { key: 'name', isArrayIndex: false }
      ]);
    });

    it('应该解析数组索引路径', () => {
      expect(parsePath('items[0]')).toEqual([
        { key: 'items', isArrayIndex: true, index: 0 }
      ]);
    });

    it('应该解析混合路径', () => {
      expect(parsePath('users[0].profile.tags[1]')).toEqual([
        { key: 'users', isArrayIndex: true, index: 0 },
        { key: 'profile', isArrayIndex: false },
        { key: 'tags', isArrayIndex: true, index: 1 }
      ]);
    });

    it('应该处理空路径', () => {
      expect(parsePath('')).toEqual([]);
    });
  });

  describe('getByPath - 路径获取', () => {
    const testObj = {
      name: 'Alice',
      user: {
        profile: {
          age: 25,
          city: 'Beijing'
        }
      },
      items: [
        { id: 1, text: 'First' },
        { id: 2, text: 'Second' }
      ],
      nested: {
        arr: [
          { values: [10, 20, 30] }
        ]
      }
    };

    it('应该获取简单属性', () => {
      expect(getByPath(testObj, 'name')).toBe('Alice');
    });

    it('应该获取嵌套属性', () => {
      expect(getByPath(testObj, 'user.profile.age')).toBe(25);
    });

    it('应该获取数组元素', () => {
      expect(getByPath(testObj, 'items[0]')).toEqual({ id: 1, text: 'First' });
    });

    it('应该获取数组元素的属性', () => {
      expect(getByPath(testObj, 'items[1].text')).toBe('Second');
    });

    it('应该获取深层嵌套的数组元素', () => {
      expect(getByPath(testObj, 'nested.arr[0].values[1]')).toBe(20);
    });

    it('应该对不存在的路径返回 undefined', () => {
      expect(getByPath(testObj, 'nonexistent')).toBeUndefined();
      expect(getByPath(testObj, 'user.nonexistent.deep')).toBeUndefined();
      expect(getByPath(testObj, 'items[99]')).toBeUndefined();
    });

    it('应该处理 null 和 undefined 对象', () => {
      expect(getByPath(null, 'name')).toBeUndefined();
      expect(getByPath(undefined, 'name')).toBeUndefined();
    });

    it('应该处理空路径', () => {
      expect(getByPath(testObj, '')).toBeUndefined();
    });
  });

  describe('setByPath - 路径设置', () => {
    it('应该设置简单属性', () => {
      const obj: any = {};
      setByPath(obj, 'name', 'Alice');
      expect(obj.name).toBe('Alice');
    });

    it('应该设置嵌套属性并自动创建中间对象', () => {
      const obj: any = {};
      setByPath(obj, 'user.profile.name', 'Alice');
      expect(obj.user.profile.name).toBe('Alice');
    });

    it('应该设置数组元素', () => {
      const obj: any = {};
      setByPath(obj, 'items[0]', { id: 1 });
      expect(obj.items[0]).toEqual({ id: 1 });
    });

    it('应该设置数组元素的属性', () => {
      const obj: any = { items: [{ id: 1 }] };
      setByPath(obj, 'items[0].text', 'Hello');
      expect(obj.items[0].text).toBe('Hello');
    });

    it('应该覆盖已存在的值', () => {
      const obj = { name: 'Alice' };
      setByPath(obj, 'name', 'Bob');
      expect(obj.name).toBe('Bob');
    });

    it('应该处理深层嵌套的数组', () => {
      const obj: any = {};
      setByPath(obj, 'data.users[0].tags[1]', 'vue');
      expect(obj.data.users[0].tags[1]).toBe('vue');
    });

    it('应该忽略空对象或空路径', () => {
      const obj = { name: 'Alice' };
      setByPath(null, 'name', 'Bob');
      setByPath(obj, '', 'Bob');
      expect(obj.name).toBe('Alice');
    });
  });

  describe('hasPath - 路径存在检查', () => {
    const testObj = {
      name: 'Alice',
      user: {
        profile: {
          age: 25
        }
      },
      items: [{ id: 1 }, { id: 2 }],
      nullValue: null,
      undefinedValue: undefined
    };

    it('应该检测存在的简单路径', () => {
      expect(hasPath(testObj, 'name')).toBe(true);
    });

    it('应该检测存在的嵌套路径', () => {
      expect(hasPath(testObj, 'user.profile.age')).toBe(true);
    });

    it('应该检测存在的数组路径', () => {
      expect(hasPath(testObj, 'items[0]')).toBe(true);
      expect(hasPath(testObj, 'items[1].id')).toBe(true);
    });

    it('应该检测不存在的路径', () => {
      expect(hasPath(testObj, 'nonexistent')).toBe(false);
      expect(hasPath(testObj, 'user.nonexistent')).toBe(false);
      expect(hasPath(testObj, 'items[99]')).toBe(false);
    });

    it('应该处理 null 和 undefined 值', () => {
      expect(hasPath(testObj, 'nullValue')).toBe(true);
      expect(hasPath(testObj, 'undefinedValue')).toBe(true);
      expect(hasPath(testObj, 'nullValue.deep')).toBe(false);
    });

    it('应该处理空对象或空路径', () => {
      expect(hasPath(null, 'name')).toBe(false);
      expect(hasPath(testObj, '')).toBe(false);
    });
  });
});
