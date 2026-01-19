/**
 * Runtime type definitions for Vue JSON Renderer
 */

import type { ComputedRef, Reactive, Component } from 'vue';
import type { Action, JsonNode, WatchConfig } from './schema';
import type { GlobalConfig } from './config';

/**
 * Evaluation context for expressions
 */
export interface EvaluationContext {
  /** Current scope state */
  state: any;
  /** Computed properties */
  computed: any;
  /** Event object (in event handlers) */
  $event?: any;
  /** Loop item (in v-for) */
  $item?: any;
  /** Loop index (in v-for) */
  $index?: number;
  /** API response (in fetch then/catch) */
  $response?: any;
  /** API error (in fetch catch) */
  $error?: any;
  /** Parent context */
  $parent?: EvaluationContext;
  /** Component props */
  $props?: any;
}

/**
 * Result of expression evaluation
 */
export interface EvaluationResult {
  success: boolean;
  value?: any;
  error?: string;
}

/**
 * Action execution context
 */
export interface ActionContext {
  state: any;
  computed: any;
  methods: Record<string, Function>;
  emit: (event: string, payload?: any) => void;
  fetcher: IDataFetcher;
  evaluator: IExpressionEvaluator;
  stateManager: IStateManager;
  /** Event handler for executing actions (including WebSocket) */
  eventHandler?: IEventHandler;
}

/**
 * Runtime context for component rendering
 */
export interface RuntimeContext {
  /** Reactive state */
  state: Reactive<any>;
  /** Computed properties */
  computed: Record<string, ComputedRef>;
  /** Methods */
  methods: Record<string, Function>;
  /** Component refs */
  refs: Record<string, any>;
  /** Parent props (for nested components) */
  $props?: Record<string, any>;
  /** Parent context */
  $parent?: RuntimeContext;
  /** Loop item */
  $item?: any;
  /** Loop index */
  $index?: number;
  /** API response (in fetch handlers) */
  $response?: any;
  /** API error (in fetch handlers) */
  $error?: Error;
}


// ============ Module Interfaces ============

/**
 * Parse error information
 */
export interface ParseError {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

/**
 * Parse result
 */
export interface ParseResult {
  success: boolean;
  node?: JsonNode;
  errors?: ParseError[];
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Parser interface
 */
export interface IParser {
  parse(json: string | object): ParseResult;
  validate(node: JsonNode): ValidationResult;
  serialize(node: JsonNode): string;
}

/**
 * State Manager interface
 */
export interface IStateManager {
  createState(definition: Record<string, any>): Reactive<any>;
  createComputed(
    definition: Record<string, string>,
    state: any
  ): Record<string, ComputedRef>;
  createWatchers(
    definition: Record<string, WatchConfig | Action>,
    state: any,
    context: ActionContext
  ): void;
  getState(): any;
  setState(path: string, value: any): void;
  dispose(): void;
}

/**
 * Expression Evaluator interface
 */
export interface IExpressionEvaluator {
  evaluate(expression: string, context: EvaluationContext): EvaluationResult;
  validateSyntax(expression: string): ValidationResult;
  parseTemplate(template: string): string[];
  /** 检查值是否包含模板表达式 {{ }} */
  isTemplateExpression(value: any): boolean;
  /** 求值模板字符串，替换所有 {{ }} 表达式 */
  evaluateTemplate(template: string, context: EvaluationContext): any;
}

/**
 * Event modifiers parsed from event key
 */
export interface EventModifiers {
  prevent?: boolean;
  stop?: boolean;
  capture?: boolean;
  self?: boolean;
  once?: boolean;
  passive?: boolean;
  enter?: boolean;
  tab?: boolean;
  delete?: boolean;
  esc?: boolean;
  space?: boolean;
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  middle?: boolean;
}

/**
 * Event Handler interface
 */
export interface IEventHandler {
  createHandler(action: Action | Action[], context: ActionContext): Function;
  createHandlerWithModifiers(eventKey: string, action: Action | Action[], context: ActionContext): Function;
  parseEventKey(eventKey: string): { eventName: string; modifiers: EventModifiers };
  executeAction(action: Action, context: ActionContext): Promise<void>;
  executeActions(actions: Action[], context: ActionContext): Promise<void>;
  dispose(): void;
}

/**
 * Fetch result
 */
export interface FetchResult {
  success: boolean;
  data?: any;
  error?: Error;
  status?: number;
  response?: any;
}

/**
 * Data Fetcher interface
 */
export interface IDataFetcher {
  fetch(config: any, context: EvaluationContext): Promise<FetchResult>;
  configure(config: GlobalConfig): void;
}

/**
 * Component Registry interface
 */
export interface IComponentRegistry {
  register(name: string, component: Component): void;
  registerBulk(components: Record<string, Component>): void;
  get(name: string): Component | undefined;
  has(name: string): boolean;
  getAll(): Record<string, Component>;
  isNativeTag(name: string): boolean;
}
