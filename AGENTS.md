# AGENTS.md - VSchema Project Guidelines

This document provides guidance for AI agents working on the VSchema codebase.

## Project Overview

VSchema is a Vue 3 plugin that enables declarative UI construction through JSON Schema. It transforms JSON definitions into reactive Vue components at runtime.

## Architecture

```
src/
├── plugin/           # Vue plugin entry point
│   ├── index.ts      # Plugin registration, VSchema component
│   └── composables.ts # useJsonState, useJsonFetch hooks
├── renderer/         # Core rendering engine
│   └── Renderer.ts   # Converts JsonNode to Vue VNodes
├── parser/           # Schema parsing and validation
│   └── Parser.ts     # JSON parsing, validation
├── expression/       # Expression evaluation
│   └── ExpressionEvaluator.ts # {{ expression }} handling
├── event/            # Event and action handling
│   └── EventHandler.ts # Action execution (set, call, emit, fetch, etc.)
├── state/            # State management
│   └── StateManager.ts # Reactive state creation and updates
├── fetch/            # Data fetching
│   └── DataFetcher.ts # HTTP requests, initApi/uiApi
├── registry/         # Component registry
│   └── ComponentRegistry.ts # Custom component registration
└── types/            # TypeScript definitions
    ├── schema.ts     # JsonNode, Action types
    ├── runtime.ts    # ActionContext, EventModifiers
    ├── config.ts     # PluginOptions, GlobalConfig
    └── errors.ts     # Error types
```

## Key Concepts

### JsonNode
The core schema type representing a UI component:
```typescript
interface JsonNode {
  com: string;           // Component type
  props?: object;        // Component props
  children?: JsonNode[] | string;
  data?: object;         // Reactive state (declaration)
  computed?: object;     // Computed properties
  events?: object;       // Event handlers
  if?: string;           // Conditional rendering
  for?: string;          // Loop rendering
  model?: string;        // Two-way binding
  // ... more
}
```

### Actions
Actions define what happens on events:
- `SetAction`: `{ set: 'path', value: any }`
- `CallAction`: `{ call: 'methodName', args?: any[] }`
- `EmitAction`: `{ emit: 'eventName', payload?: any }`
- `FetchAction`: `{ fetch: 'url', then?: Action, catch?: Action }`
- `CopyAction`: `{ copy: 'text', then?: Action, catch?: Action }`
- `WebSocketAction`: `{ ws: 'url', op: 'connect'|'send'|'close', ... }`
- `IfAction`: `{ if: 'condition', then: Action, else?: Action }`
- `ScriptAction`: `{ script: 'code' }`

### Expression Evaluation
Expressions use `{{ }}` syntax and are evaluated safely:
```
{{ count + 1 }}
{{ user.name }}
{{ isActive ? 'yes' : 'no' }}
```

## Naming Conventions

- **data**: Used in Schema to declare initial state
- **state**: Used at runtime to access current reactive state
- **VSchema**: The main component name (previously JsonRenderer)
- **vschema**: Provide key for dependency injection

## Testing

Tests use Vitest with property-based testing (fast-check):
```bash
pnpm test        # Run tests in watch mode
pnpm test --run  # Run tests once
```

Test files are co-located with source files: `*.test.ts`

## Code Style

- TypeScript strict mode
- Chinese comments for implementation details
- English for public API documentation
- ESLint + Prettier for formatting

## Common Tasks

### Adding a New Action Type

1. Define type in `src/types/schema.ts`:
```typescript
export interface NewAction {
  newAction: string;
  // ... properties
}
```

2. Add to `Action` union type

3. Implement in `src/event/EventHandler.ts`:
```typescript
private async executeNewAction(action: NewAction, context: ActionContext): Promise<void> {
  // Implementation
}
```

4. Add validation in `src/parser/Parser.ts`

5. Add tests in `src/event/EventHandler.test.ts`

### Adding a New Directive

1. Add property to `JsonNode` in `src/types/schema.ts`
2. Handle in `src/renderer/Renderer.ts` `renderNode()` method
3. Add tests in `src/renderer/Renderer.test.ts`

## Security Considerations

- Expression evaluator blocks dangerous operations (eval, Function, global access)
- WebSocket connections are cleaned up on component unmount
- Copy action uses secure Clipboard API with fallback

## Dependencies

- Vue 3.x (peer dependency)
- No runtime dependencies (zero-dependency design goal)

## Build

```bash
pnpm build       # Build library
pnpm dev         # Start demo dev server
```

Output: ES modules in `dist/`
