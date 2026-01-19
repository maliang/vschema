# 插槽

VSchema 支持 Vue 的插槽机制，包括默认插槽、具名插槽和作用域插槽。

## 默认插槽

```json
{
  "com": "MyCard",
  "slots": {
    "default": [
      { "com": "p", "children": "这是卡片内容" }
    ]
  }
}
```

## 具名插槽

```json
{
  "com": "MyCard",
  "slots": {
    "header": [
      { "com": "h3", "children": "卡片标题" }
    ],
    "default": [
      { "com": "p", "children": "卡片内容" }
    ],
    "footer": [
      { "com": "button", "children": "确定" }
    ]
  }
}
```

## 作用域插槽

当组件向插槽传递数据时，使用作用域插槽接收：

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

### slotProps 变量

- `slotProps` 指定接收插槽数据的变量名
- 在 `content` 中通过该变量访问组件传递的数据

## 实际示例

### 自定义表格列

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
          "children": "编辑"
        }
      ]
    }
  }
}
```

### 弹窗组件

```json
{
  "com": "MyModal",
  "props": { "visible": "{{ showModal }}" },
  "slots": {
    "title": [{ "com": "span", "children": "确认删除" }],
    "default": [{ "com": "p", "children": "确定要删除这条记录吗？" }],
    "footer": [
      {
        "com": "button",
        "events": { "click": { "set": "showModal", "value": false } },
        "children": "取消"
      },
      {
        "com": "button",
        "events": { "click": { "call": "confirmDelete" } },
        "children": "确定"
      }
    ]
  }
}
```
