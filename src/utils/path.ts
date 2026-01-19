/**
 * 路径解析工具模块
 * 提供统一的对象路径解析、获取和设置功能
 */

/**
 * 路径部分的结构定义
 */
export interface PathPart {
  /** 属性名 */
  key: string;
  /** 是否包含数组索引 */
  isArrayIndex: boolean;
  /** 数组索引值（仅当 isArrayIndex 为 true 时有效） */
  index?: number;
}

/**
 * 解析路径字符串为路径部分数组
 * 支持点号访问和数组索引，如 "user.items[0].name"
 * 
 * @param path 路径字符串
 * @returns 路径部分数组
 * 
 * @example
 * parsePath('user.name') // [{ key: 'user', isArrayIndex: false }, { key: 'name', isArrayIndex: false }]
 * parsePath('items[0].text') // [{ key: 'items', isArrayIndex: true, index: 0 }, { key: 'text', isArrayIndex: false }]
 */
export function parsePath(path: string): PathPart[] {
  if (!path) return [];

  const result: PathPart[] = [];
  // 匹配属性名和可选的数组索引
  const regex = /([^.\[\]]+)(?:\[(\d+)\])?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(path)) !== null) {
    const key = match[1];
    const indexStr = match[2];

    if (indexStr !== undefined) {
      // 有数组索引
      result.push({
        key,
        isArrayIndex: true,
        index: parseInt(indexStr, 10),
      });
    } else {
      result.push({
        key,
        isArrayIndex: false,
      });
    }
  }

  return result;
}

/**
 * 通过路径获取嵌套属性值
 * 
 * @param obj 目标对象
 * @param path 路径字符串，如 "user.profile.name" 或 "items[0].text"
 * @returns 属性值，路径不存在时返回 undefined
 * 
 * @example
 * const obj = { user: { name: 'Alice' }, items: [{ text: 'Hello' }] };
 * getByPath(obj, 'user.name') // 'Alice'
 * getByPath(obj, 'items[0].text') // 'Hello'
 * getByPath(obj, 'user.age') // undefined
 */
export function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  const parts = parsePath(path);
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined;
    }

    current = current[part.key];

    if (part.isArrayIndex && part.index !== undefined) {
      if (!Array.isArray(current)) {
        return undefined;
      }
      current = current[part.index];
    }
  }

  return current;
}

/**
 * 通过路径设置嵌套属性值
 * 如果路径中的中间节点不存在，会自动创建
 * 
 * @param obj 目标对象
 * @param path 路径字符串
 * @param value 要设置的值
 * 
 * @example
 * const obj = { user: {} };
 * setByPath(obj, 'user.name', 'Alice');
 * // obj = { user: { name: 'Alice' } }
 * 
 * setByPath(obj, 'items[0].text', 'Hello');
 * // obj = { user: { name: 'Alice' }, items: [{ text: 'Hello' }] }
 */
export function setByPath(obj: any, path: string, value: any): void {
  if (!obj || !path) return;

  const parts = parsePath(path);
  let current = obj;

  // 遍历到倒数第二层
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    if (current[part.key] === undefined || current[part.key] === null) {
      // 根据下一个部分决定创建对象还是数组
      const nextPart = parts[i + 1];
      current[part.key] = nextPart.isArrayIndex ? [] : {};
    }

    current = current[part.key];

    // 如果当前部分有数组索引，继续深入
    if (part.isArrayIndex && part.index !== undefined) {
      if (!Array.isArray(current)) {
        current = [];
      }
      if (current[part.index] === undefined) {
        const nextPart = parts[i + 1];
        current[part.index] = nextPart?.isArrayIndex ? [] : {};
      }
      current = current[part.index];
    }
  }

  // 设置最后一层的值
  const lastPart = parts[parts.length - 1];
  if (lastPart.isArrayIndex && lastPart.index !== undefined) {
    if (!current[lastPart.key]) {
      current[lastPart.key] = [];
    }
    current[lastPart.key][lastPart.index] = value;
  } else {
    current[lastPart.key] = value;
  }
}

/**
 * 检查路径是否存在
 * 
 * @param obj 目标对象
 * @param path 路径字符串
 * @returns 路径是否存在
 */
export function hasPath(obj: any, path: string): boolean {
  if (!obj || !path) return false;

  const parts = parsePath(path);
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) {
      return false;
    }

    if (!(part.key in current)) {
      return false;
    }

    current = current[part.key];

    if (part.isArrayIndex && part.index !== undefined) {
      if (!Array.isArray(current) || part.index >= current.length) {
        return false;
      }
      current = current[part.index];
    }
  }

  return true;
}
