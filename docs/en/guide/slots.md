# Slots

VSchema supports Vue's slot mechanism, including default, named, and scoped slots.

## Default Slot

```json
{
  "com": "MyCard",
  "slots": {
    "default": [
      { "com": "p", "children": "This is card content" }
    ]
  }
}
```

## Named Slots

```json
{
  "com": "MyCard",
  "slots": {
    "header": [
      { "com": "h3", "children": "Card Title" }
    ],
    "default": [
      { "com": "p", "children": "Card content" }
    ],
    "footer": [
      { "com": "button", "children": "OK" }
    ]
  }
}
```

## Scoped Slots

When component passes data to slot, use scoped slots to receive:

```json
{
  "com": "MyList",
  "props": { "items": "{{ items }}" },
  "slots": {
    "item": {
      "slotProps": "slotProps",
      "content": [
        {
          "com": "div",
          "children": [
            { "com": "span", "children": "{{ slotProps.item.name }}" },
            { "com": "span", "children": "{{ slotProps.index + 1 }}" }
          ]
        }
      ]
    }
  }
}
```

### slotProps Variable

- `slotProps` specifies the variable name to receive slot data
- Access component-passed data via this variable in `content`

## Practical Examples

### Custom Table Columns

```json
{
  "com": "MyTable",
  "props": { "data": "{{ users }}" },
  "slots": {
    "name": {
      "slotProps": "row",
      "content": [
        { "com": "strong", "children": "{{ row.name }}" }
      ]
    },
    "actions": {
      "slotProps": "row",
      "content": [
        {
          "com": "button",
          "events": { "click": { "call": "editUser", "args": ["{{ row.id }}"] } },
          "children": "Edit"
        }
      ]
    }
  }
}
```

### Modal Component

```json
{
  "com": "MyModal",
  "props": { "visible": "{{ showModal }}" },
  "slots": {
    "title": [{ "com": "span", "children": "Confirm Delete" }],
    "default": [{ "com": "p", "children": "Are you sure you want to delete this record?" }],
    "footer": [
      {
        "com": "button",
        "events": { "click": { "set": "showModal", "value": false } },
        "children": "Cancel"
      },
      {
        "com": "button",
        "events": { "click": { "call": "confirmDelete" } },
        "children": "Confirm"
      }
    ]
  }
}
```
