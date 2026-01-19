/**
 * ComponentRegistry - 组件注册表
 * 管理可用组件的注册和查询
 */

import type { Component } from 'vue';
import type { IComponentRegistry } from '../types/runtime';

/**
 * HTML 原生标签列表
 * 包含所有标准 HTML5 元素
 */
const HTML_NATIVE_TAGS = new Set([
  // 根元素
  'html',
  // 文档元数据
  'head', 'title', 'base', 'link', 'meta', 'style',
  // 分区根元素
  'body',
  // 内容分区
  'article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'address', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup',
  // 文本内容
  'div', 'p', 'hr', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'menu',
  // 内联文本语义
  'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'ruby', 'rt', 'rp', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'bdi', 'bdo', 'span', 'br', 'wbr',
  // 图片和多媒体
  'img', 'audio', 'video', 'track', 'map', 'area',
  // 嵌入内容
  'iframe', 'embed', 'object', 'param', 'picture', 'source', 'portal',
  // SVG 和 MathML
  'svg', 'math',
  // 脚本
  'script', 'noscript', 'template', 'slot', 'canvas',
  // 表格内容
  'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th',
  // 表单
  'form', 'label', 'input', 'button', 'select', 'datalist', 'optgroup', 'option', 'textarea', 'output', 'progress', 'meter', 'fieldset', 'legend',
  // 交互元素
  'details', 'summary', 'dialog',
]);

/**
 * 组件注册表实现
 */
export class ComponentRegistry implements IComponentRegistry {
  /** 已注册组件的存储 */
  private components: Map<string, Component> = new Map();

  /**
   * 注册单个组件
   * @param name - 组件名称
   * @param component - Vue 组件
   */
  register(name: string, component: Component): void {
    if (!name || typeof name !== 'string') {
      console.warn('[ComponentRegistry] 组件名称必须是非空字符串');
      return;
    }
    this.components.set(name, component);
  }

  /**
   * 批量注册组件
   * @param components - 组件名称到组件的映射对象
   */
  registerBulk(components: Record<string, Component>): void {
    if (!components || typeof components !== 'object') {
      console.warn('[ComponentRegistry] registerBulk 需要一个对象参数');
      return;
    }
    for (const [name, component] of Object.entries(components)) {
      this.register(name, component);
    }
  }

  /**
   * 获取已注册的组件
   * @param name - 组件名称
   * @returns 组件或 undefined
   */
  get(name: string): Component | undefined {
    return this.components.get(name);
  }

  /**
   * 检查组件是否已注册
   * @param name - 组件名称
   * @returns 是否已注册
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * 获取所有已注册的组件
   * @returns 组件名称到组件的映射对象
   */
  getAll(): Record<string, Component> {
    const result: Record<string, Component> = {};
    for (const [name, component] of this.components) {
      result[name] = component;
    }
    return result;
  }

  /**
   * 检查是否为 HTML 原生标签
   * @param name - 标签名称
   * @returns 是否为原生标签
   */
  isNativeTag(name: string): boolean {
    if (!name || typeof name !== 'string') {
      return false;
    }
    return HTML_NATIVE_TAGS.has(name.toLowerCase());
  }

  /**
   * 清空所有已注册的组件
   * 主要用于测试
   */
  clear(): void {
    this.components.clear();
  }

  /**
   * 获取已注册组件的数量
   * @returns 组件数量
   */
  get size(): number {
    return this.components.size;
  }
}

/**
 * 创建组件注册表实例
 * @returns 新的组件注册表实例
 */
export function createComponentRegistry(): ComponentRegistry {
  return new ComponentRegistry();
}
