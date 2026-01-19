# Form Binding

VSchema supports `model` property for two-way data binding, similar to Vue's `v-model`.

## Basic Usage

### Text Input

```json
{
  "data": { "username": "" },
  "com": "input",
  "model": "username",
  "props": { "placeholder": "Enter username" }
}
```

### Nested Path

```json
{
  "data": { "form": { "username": "", "password": "" } },
  "com": "div",
  "children": [
    { "com": "input", "model": "form.username" },
    { "com": "input", "model": "form.password", "props": { "type": "password" } }
  ]
}
```

## Different Input Types

### Textarea

```json
{ "com": "textarea", "model": "content", "props": { "rows": 5 } }
```

### Checkbox

```json
{
  "data": { "agreed": false },
  "com": "input",
  "model": "agreed",
  "props": { "type": "checkbox" }
}
```

### Select

```json
{
  "data": { "city": "" },
  "com": "select",
  "model": "city",
  "children": [
    { "com": "option", "props": { "value": "" }, "children": "Select" },
    { "com": "option", "props": { "value": "ny" }, "children": "New York" },
    { "com": "option", "props": { "value": "la" }, "children": "Los Angeles" }
  ]
}
```

## Form Validation

```json
{
  "data": { "form": { "email": "" }, "errors": {} },
  "computed": {
    "isEmailValid": "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)"
  },
  "com": "div",
  "children": [
    {
      "com": "input",
      "model": "form.email",
      "props": { "type": "email" },
      "events": {
        "blur": {
          "if": "!isEmailValid && form.email",
          "then": { "set": "errors.email", "value": "Invalid email format" }
        }
      }
    },
    {
      "com": "span",
      "if": "errors.email",
      "children": "{{ errors.email }}"
    }
  ]
}
```
