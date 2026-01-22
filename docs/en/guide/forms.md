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
  "data": {
    "form": {
      "username": "",
      "password": ""
    }
  },
  "com": "div",
  "children": [
    {
      "com": "input",
      "model": "form.username",
      "props": { "placeholder": "Username" }
    },
    {
      "com": "input",
      "model": "form.password",
      "props": { "type": "password", "placeholder": "Password" }
    }
  ]
}
```

## Different Input Types

### Textarea

```json
{
  "com": "textarea",
  "model": "content",
  "props": { "rows": 5 }
}
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

### Radio Buttons

```json
{
  "data": { "gender": "" },
  "com": "div",
  "children": [
    {
      "com": "label",
      "children": [
        {
          "com": "input",
          "model": "gender",
          "props": { "type": "radio", "value": "male" }
        },
        "Male"
      ]
    },
    {
      "com": "label",
      "children": [
        {
          "com": "input",
          "model": "gender",
          "props": { "type": "radio", "value": "female" }
        },
        "Female"
      ]
    }
  ]
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

### Dynamic Options

```json
{
  "data": {
    "selectedCity": "",
    "cities": [
      { "value": "ny", "label": "New York" },
      { "value": "la", "label": "Los Angeles" },
      { "value": "sf", "label": "San Francisco" }
    ]
  },
  "com": "select",
  "model": "selectedCity",
  "children": [
    { "com": "option", "props": { "value": "" }, "children": "Select a city" },
    {
      "for": "city in cities",
      "key": "{{ city.value }}",
      "com": "option",
      "props": { "value": "{{ city.value }}" },
      "children": "{{ city.label }}"
    }
  ]
}
```

## Form Validation

### Basic Validation

```json
{
  "data": {
    "form": { "email": "" },
    "errors": {}
  },
  "computed": {
    "isEmailValid": "/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)",
    "canSubmit": "form.email && isEmailValid"
  },
  "com": "div",
  "children": [
    {
      "com": "input",
      "model": "form.email",
      "props": {
        "type": "email",
        "class": "{{ errors.email ? 'error' : '' }}"
      },
      "events": {
        "blur": {
          "if": "!isEmailValid && form.email",
          "then": { "set": "errors.email", "value": "Invalid email format" },
          "else": { "set": "errors.email", "value": "" }
        }
      }
    },
    {
      "com": "span",
      "if": "errors.email",
      "props": { "class": "error-message" },
      "children": "{{ errors.email }}"
    }
  ]
}
```

### Real-time Validation

```json
{
  "data": {
    "password": "",
    "confirmPassword": ""
  },
  "computed": {
    "passwordStrength": "password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong'",
    "passwordMatch": "password === confirmPassword"
  },
  "com": "div",
  "children": [
    {
      "com": "input",
      "model": "password",
      "props": { "type": "password", "placeholder": "Password" }
    },
    {
      "com": "div",
      "if": "password",
      "children": "Password strength: {{ passwordStrength }}"
    },
    {
      "com": "input",
      "model": "confirmPassword",
      "props": { "type": "password", "placeholder": "Confirm password" }
    },
    {
      "com": "div",
      "if": "confirmPassword && !passwordMatch",
      "props": { "class": "error" },
      "children": "Passwords do not match"
    }
  ]
}
```

## Complete Form Examples

### Login Form

```json
{
  "data": {
    "form": {
      "username": "",
      "password": "",
      "remember": false
    },
    "loading": false,
    "error": ""
  },
  "computed": {
    "canSubmit": "form.username && form.password && !loading"
  },
  "methods": {
    "handleSubmit": [
      { "set": "loading", "value": true },
      { "set": "error", "value": "" },
      {
        "fetch": "/api/login",
        "method": "POST",
        "body": "{{ form }}",
        "then": { "emit": "login-success", "payload": "{{ $response }}" },
        "catch": { "set": "error", "value": "{{ $error.message }}" },
        "finally": { "set": "loading", "value": false }
      }
    ]
  },
  "com": "form",
  "events": { "submit.prevent": { "call": "handleSubmit" } },
  "children": [
    {
      "com": "div",
      "if": "error",
      "props": { "class": "alert alert-error" },
      "children": "{{ error }}"
    },
    {
      "com": "div",
      "props": { "class": "form-group" },
      "children": [
        { "com": "label", "children": "Username" },
        {
          "com": "input",
          "model": "form.username",
          "props": { "placeholder": "Enter username" }
        }
      ]
    },
    {
      "com": "div",
      "props": { "class": "form-group" },
      "children": [
        { "com": "label", "children": "Password" },
        {
          "com": "input",
          "model": "form.password",
          "props": { "type": "password", "placeholder": "Enter password" }
        }
      ]
    },
    {
      "com": "div",
      "props": { "class": "form-group" },
      "children": [
        {
          "com": "label",
          "children": [
            { "com": "input", "model": "form.remember", "props": { "type": "checkbox" } },
            " Remember me"
          ]
        }
      ]
    },
    {
      "com": "button",
      "props": {
        "type": "submit",
        "disabled": "{{ !canSubmit }}"
      },
      "children": "{{ loading ? 'Logging in...' : 'Login' }}"
    }
  ]
}
```

## Using with UI Libraries

### Element Plus

```json
{
  "com": "ElForm",
  "props": { "model": "{{ form }}", "labelWidth": "100px" },
  "children": [
    {
      "com": "ElFormItem",
      "props": { "label": "Username" },
      "children": [
        { "com": "ElInput", "model": "form.username" }
      ]
    },
    {
      "com": "ElFormItem",
      "props": { "label": "City" },
      "children": [
        {
          "com": "ElSelect",
          "model": "form.city",
          "children": [
            {
              "for": "city in cities",
              "com": "ElOption",
              "props": { "label": "{{ city.label }}", "value": "{{ city.value }}" }
            }
          ]
        }
      ]
    }
  ]
}
```

::: tip Note
When using UI libraries, register components first via `createVSchemaPlugin` or `createVSchema`.
:::
