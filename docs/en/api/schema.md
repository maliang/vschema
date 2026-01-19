# Schema Structure

Complete JsonNode type definition.

## Basic Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `com` | `string` | Yes | Component type (HTML tag or registered component) |
| `props` | `object` | No | Props passed to component |
| `children` | `JsonNode[] \| string` | No | Child nodes or text content |

## Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Record<string, any>` | Reactive data definition |
| `computed` | `Record<string, string>` | Computed properties (expression strings) |
| `methods` | `Record<string, Action>` | Method definitions |

## Directive Properties

| Property | Type | Description |
|----------|------|-------------|
| `if` | `string` | Conditional rendering expression |
| `show` | `string` | Show/hide expression |
| `for` | `string` | Loop expression, e.g., `"item in items"` |
| `key` | `string` | Unique key for loop items |
| `model` | `string` | Two-way binding data path |
| `ref` | `string` | Template ref name |

## Event Properties

| Property | Type | Description |
|----------|------|-------------|
| `events` | `Record<string, Action \| Action[]>` | Event handlers |

## Lifecycle

| Property | Type | Description |
|----------|------|-------------|
| `onMounted` | `Action \| Action[]` | Execute after mount |
| `onUnmounted` | `Action \| Action[]` | Execute before unmount |
| `onUpdated` | `Action \| Action[]` | Execute after update |
| `watch` | `Record<string, WatchConfig>` | Data watchers |

## API Properties

| Property | Type | Description |
|----------|------|-------------|
| `initApi` | `string \| ApiConfig` | Initialize data API |
| `uiApi` | `string \| ApiConfig` | Dynamic UI API |

## Slot Properties

| Property | Type | Description |
|----------|------|-------------|
| `slots` | `Record<string, SlotConfig>` | Slot definitions |
