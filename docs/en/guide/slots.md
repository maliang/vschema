# Slots

VSchema supports Vue's slot mechanism, including default, named, and scoped slots.

## Default Slot

```json
{
  "com": "MyCard",
  "slots": {
    "default": [{ "com": "p", "children": "Card content" }]
  }
}
```

## Named Slots

```json
{
  "com": "MyCard",
  "slots": {
    "header": [{ "com": "h3", "children": "Card Title" }],
    "default": [{ "com": "p", "children": "Card content" }],
    "footer": [{ "com": "button", "children": "OK" }]
  }
}
```

## Scoped Slots

When component passes data to slot:

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
