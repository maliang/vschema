# Custom Components

VSchema supports registering and using custom Vue components.

## Registration Methods

### Global Registration (Plugin Config)

```typescript
import { createVSchemaPlugin } from 'vschema';
import MyButton from './components/MyButton.vue';

app.use(createVSchemaPlugin({
  components: { MyButton }
}));
```

### On-demand Registration (createVSchema)

```typescript
import { createVSchema } from 'vschema';
import MyButton from './components/MyButton.vue';

const VSchema = createVSchema({
  components: { MyButton }
});
```

### Runtime Registration

```typescript
import { useComponentRegistry } from 'vschema';
import MyButton from './components/MyButton.vue';

const registry = useComponentRegistry();
registry.register('MyButton', MyButton);
```

## Using Custom Components

After registration, use via `com` property:

```json
{
  "com": "MyButton",
  "props": { "type": "primary", "size": "large" },
  "children": "Click me"
}
```

## Using UI Libraries

### Element Plus

```typescript
import { ElButton, ElInput } from 'element-plus';

app.use(createVSchemaPlugin({
  components: { ElButton, ElInput }
}));
```

```json
{
  "com": "ElButton",
  "props": { "type": "primary" },
  "children": "Element Button"
}
```
