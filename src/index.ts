// VSchema - 主入口
// 一个通过 JSON Schema 构建动态 UI 的 Vue 3 插件

export * from './types';
export * from './expression';
export * from './state';
export * from './event';
export * from './fetch';
export * from './registry';
export * from './parser';
export * from './renderer';
export * from './plugin';
export * from './utils';
export * from './components';

// 默认导出插件创建函数
export { default as createVSchemaPlugin } from './plugin';
