<script setup lang="ts">
import type { JsonNode } from '../src';

// 整个 Demo 页面的 JSON Schema
// 使用 data 替代 state，每个示例有自己的独立数据
const demoPageSchema: JsonNode = {
  data: {
    currentDemo: 'counter',
    demos: [
      { key: 'counter', title: '计数器' },
      { key: 'todo', title: '待办事项' },
      { key: 'form', title: '表单绑定' },
      { key: 'condition', title: '条件渲染' },
      { key: 'accordion', title: '嵌套状态' },
      { key: 'watch', title: '监听器' },
      { key: 'lifecycle', title: '生命周期' },
      { key: 'tabs', title: '标签页' },
      { key: 'api', title: 'API调用' },
      { key: 'initApi', title: 'initApi' },
      { key: 'uiApi', title: 'uiApi' },
      { key: 'combinedApi', title: '组合API' },
      { key: 'ws', title: 'WebSocket长连接' }
    ]
  },
  com: 'div',
  props: { class: 'demo-app' },
  children: [
    // 页面头部
    {
      com: 'div',
      props: { class: 'demo-header' },
      children: [
        { com: 'h1', children: '🎨 Vue JSON Renderer' },
        { com: 'p', children: '通过 JSON 配置动态渲染 Vue 组件的强大工具' },
        { com: 'p', props: { style: 'font-size: 14px; opacity: 0.8;' }, children: '✨ 整个页面由一个 JsonRenderer 组件渲染，每个示例有独立的 data 作用域' }
      ]
    },
    // 示例选择器
    {
      com: 'div',
      props: { class: 'demo-section' },
      children: [
        { com: 'h2', children: '选择示例' },
        {
          com: 'div',
          props: { class: 'filter-buttons' },
          children: [
            {
              for: 'demo in demos',
              key: '{{ demo.key }}',
              com: 'button',
              props: { class: "{{ currentDemo === demo.key ? 'active' : '' }}" },
              events: { click: { set: 'currentDemo', value: '{{ demo.key }}' } },
              children: '{{ demo.title }}'
            }
          ]
        }
      ]
    },

    // ===== 计数器示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'counter'",
      com: 'div',
      props: { class: 'demo-section' },
      // 计数器有自己的独立数据
      data: { count: 0 },
      computed: {
        double: 'count * 2',
        triple: 'count * 3',
        isEven: 'count % 2 === 0'
      },
      children: [
        { com: 'h2', children: '📊 计数器示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示状态管理、计算属性、事件处理（独立 data 作用域）' },
        {
          com: 'div',
          props: { class: 'counter-box' },
          children: [
            {
              com: 'button',
              events: { click: { set: 'count', value: '{{ count - 1 }}' } },
              children: '➖'
            },
            {
              com: 'span',
              props: { class: 'counter-value' },
              children: '{{ count }}'
            },
            {
              com: 'button',
              events: { click: { set: 'count', value: '{{ count + 1 }}' } },
              children: '➕'
            },
            {
              com: 'button',
              events: { click: { set: 'count', value: 0 } },
              props: { style: 'margin-left: 16px; background: #ff9800;' },
              children: '重置'
            }
          ]
        },
        {
          com: 'div',
          props: { class: 'computed-info', style: 'margin-top: 16px;' },
          children: [
            { com: 'div', children: '双倍值: {{ double }}' },
            { com: 'div', children: '三倍值: {{ triple }}' },
            { com: 'div', children: '是否为偶数: {{ isEven ? "是" : "否" }}' }
          ]
        }
      ]
    },

    // ===== 待办事项示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'todo'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        todos: [
          { id: 1, text: '学习 Vue JSON Renderer', done: true },
          { id: 2, text: '创建示例页面', done: false },
          { id: 3, text: '编写文档', done: false }
        ],
        newTodo: '',
        filter: 'all',
        nextId: 4
      },
      computed: {
        filteredTodos: `filter === 'all' ? todos : todos.filter(t => filter === 'done' ? t.done : !t.done)`,
        totalCount: 'todos.length',
        doneCount: 'todos.filter(t => t.done).length',
        pendingCount: 'todos.filter(t => !t.done).length'
      },
      methods: {
        addTodo: [
          {
            if: 'newTodo.trim()',
            then: [
              { set: 'todos', value: '{{ [...todos, { id: nextId, text: newTodo.trim(), done: false }] }}' },
              { set: 'nextId', value: '{{ nextId + 1 }}' },
              { set: 'newTodo', value: '' }
            ]
          }
        ],
        toggleTodo: { set: 'todos', value: '{{ todos.map(t => t.id === $event ? { ...t, done: !t.done } : t) }}' },
        deleteTodo: { set: 'todos', value: '{{ todos.filter(t => t.id !== $event) }}' }
      },
      children: [
        { com: 'h2', children: '✅ 待办事项示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示循环渲染、条件渲染、复杂状态管理（独立 data 作用域）' },
        {
          com: 'div',
          props: { class: 'todo-app' },
          children: [
            {
              com: 'div',
              props: { class: 'todo-input-row' },
              children: [
                {
                  com: 'input',
                  model: 'newTodo',
                  props: { placeholder: '添加新任务...', type: 'text' },
                  events: { 'keyup.enter': { call: 'addTodo' } }
                },
                {
                  com: 'button',
                  events: { click: { call: 'addTodo' } },
                  children: '添加'
                }
              ]
            },
            {
              com: 'div',
              props: { class: 'filter-buttons' },
              children: [
                {
                  com: 'button',
                  props: { class: "{{ filter === 'all' ? 'active' : '' }}" },
                  events: { click: { set: 'filter', value: 'all' } },
                  children: '全部 ({{ totalCount }})'
                },
                {
                  com: 'button',
                  props: { class: "{{ filter === 'pending' ? 'active' : '' }}" },
                  events: { click: { set: 'filter', value: 'pending' } },
                  children: '待完成 ({{ pendingCount }})'
                },
                {
                  com: 'button',
                  props: { class: "{{ filter === 'done' ? 'active' : '' }}" },
                  events: { click: { set: 'filter', value: 'done' } },
                  children: '已完成 ({{ doneCount }})'
                }
              ]
            },
            {
              com: 'ul',
              props: { class: 'todo-list' },
              children: [
                {
                  for: 'todo in filteredTodos',
                  key: '{{ todo.id }}',
                  com: 'li',
                  props: { class: "{{ todo.done ? 'todo-item done' : 'todo-item' }}" },
                  children: [
                    {
                      com: 'input',
                      props: { type: 'checkbox', checked: '{{ todo.done }}' },
                      events: { change: { call: 'toggleTodo', args: ['{{ todo.id }}'] } }
                    },
                    { com: 'span', props: { class: 'todo-text' }, children: '{{ todo.text }}' },
                    {
                      com: 'button',
                      props: { class: 'todo-delete' },
                      events: { click: { call: 'deleteTodo', args: ['{{ todo.id }}'] } },
                      children: '删除'
                    }
                  ]
                }
              ]
            },
            {
              com: 'div',
              props: { class: 'todo-stats' },
              children: '📊 总计: {{ totalCount }} | ✅ 已完成: {{ doneCount }} | ⏳ 待完成: {{ pendingCount }}'
            }
          ]
        }
      ]
    },

    // ===== 表单绑定示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'form'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        form: {
          name: '',
          email: '',
          age: 18,
          gender: 'male',
          bio: '',
          subscribe: false
        }
      },
      computed: {
        formJson: 'JSON.stringify(form, null, 2)'
      },
      children: [
        { com: 'h2', children: '📝 表单双向绑定示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示 v-model 双向绑定各种表单元素（独立 data 作用域）' },
        {
          com: 'div',
          props: { class: 'form-demo' },
          children: [
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                { com: 'label', children: '姓名' },
                { com: 'input', model: 'form.name', props: { placeholder: '请输入姓名' } }
              ]
            },
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                { com: 'label', children: '邮箱' },
                { com: 'input', model: 'form.email', props: { type: 'email', placeholder: '请输入邮箱' } }
              ]
            },
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                { com: 'label', children: '年龄: {{ form.age }}' },
                { com: 'input', model: 'form.age', props: { type: 'range', min: '1', max: '100' } }
              ]
            },
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                { com: 'label', children: '性别' },
                {
                  com: 'select',
                  model: 'form.gender',
                  children: [
                    { com: 'option', props: { value: 'male' }, children: '男' },
                    { com: 'option', props: { value: 'female' }, children: '女' },
                    { com: 'option', props: { value: 'other' }, children: '其他' }
                  ]
                }
              ]
            },
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                { com: 'label', children: '个人简介' },
                { com: 'textarea', model: 'form.bio', props: { rows: '3', placeholder: '介绍一下自己...' } }
              ]
            },
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                {
                  com: 'label',
                  props: { style: 'display: flex; align-items: center; gap: 8px; cursor: pointer;' },
                  children: [
                    { com: 'input', model: 'form.subscribe', props: { type: 'checkbox' } },
                    { com: 'span', children: '订阅邮件通知' }
                  ]
                }
              ]
            },
            {
              com: 'div',
              props: { class: 'form-preview' },
              children: [
                { com: 'h4', children: '表单数据预览:' },
                { com: 'pre', children: '{{ formJson }}' }
              ]
            }
          ]
        }
      ]
    },

    // ===== 条件渲染示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'condition'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        showContent: true,
        contentType: 'info'
      },
      children: [
        { com: 'h2', children: '🔀 条件渲染示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示 v-if 和 v-show 的使用（独立 data 作用域）' },
        {
          com: 'div',
          props: { class: 'condition-demo' },
          children: [
            {
              com: 'div',
              props: { class: 'toggle-buttons' },
              children: [
                {
                  com: 'button',
                  props: { class: "{{ showContent ? 'primary' : 'secondary' }}" },
                  events: { click: { set: 'showContent', value: '{{ !showContent }}' } },
                  children: '{{ showContent ? "隐藏内容" : "显示内容" }}'
                },
                {
                  com: 'button',
                  props: { class: 'secondary' },
                  events: { click: { set: 'contentType', value: 'info' } },
                  children: '信息'
                },
                {
                  com: 'button',
                  props: { class: 'secondary' },
                  events: { click: { set: 'contentType', value: 'success' } },
                  children: '成功'
                },
                {
                  com: 'button',
                  props: { class: 'secondary' },
                  events: { click: { set: 'contentType', value: 'warning' } },
                  children: '警告'
                }
              ]
            },
            {
              if: 'showContent',
              com: 'div',
              children: [
                {
                  if: "contentType === 'info'",
                  com: 'div',
                  props: { class: 'content-box info' },
                  children: '📘 这是一条信息提示，使用 v-if 条件渲染'
                },
                {
                  if: "contentType === 'success'",
                  com: 'div',
                  props: { class: 'content-box success' },
                  children: '✅ 操作成功！这是成功提示'
                },
                {
                  if: "contentType === 'warning'",
                  com: 'div',
                  props: { class: 'content-box warning' },
                  children: '⚠️ 警告：请注意这条信息'
                }
              ]
            },
            { com: 'h4', props: { style: 'margin-top: 20px;' }, children: 'v-show 示例 (元素始终存在，只是隐藏)' },
            {
              show: 'showContent',
              com: 'div',
              props: { class: 'content-box info' },
              children: '这个元素使用 v-show，隐藏时仍在 DOM 中'
            }
          ]
        }
      ]
    },

    // ===== 嵌套状态示例 (手风琴) - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'accordion'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        accordionItems: [
          { id: 1, title: '什么是 Vue JSON Renderer?', content: 'Vue JSON Renderer 是一个 Vue 3 插件，允许通过 JSON 配置动态渲染 Vue 组件。' },
          { id: 2, title: '支持哪些功能?', content: '支持组件渲染、Props 绑定、事件处理、响应式状态、计算属性、条件渲染、循环渲染等。' },
          { id: 3, title: '如何安装使用?', content: '通过 npm install 安装，然后使用 app.use() 安装插件即可。' }
        ]
      },
      children: [
        { com: 'h2', children: '📂 嵌套状态示例 (手风琴)' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '每个手风琴项有独立的展开状态，子节点可访问父节点数据' },
        {
          com: 'div',
          props: { class: 'accordion' },
          children: [
            {
              for: 'item in accordionItems',
              key: '{{ item.id }}',
              // 每个手风琴项有自己的独立 data
              data: { expanded: false },
              com: 'div',
              props: { class: 'accordion-item' },
              children: [
                {
                  com: 'div',
                  props: { class: 'accordion-header' },
                  events: { click: { set: 'expanded', value: '{{ !expanded }}' } },
                  children: [
                    // 子节点可以访问父节点注入的 item 数据
                    { com: 'span', children: '{{ item.title }}' },
                    {
                      com: 'span',
                      props: { class: "{{ expanded ? 'accordion-icon expanded' : 'accordion-icon' }}" },
                      children: '▼'
                    }
                  ]
                },
                {
                  if: 'expanded',
                  com: 'div',
                  props: { class: 'accordion-content' },
                  children: '{{ item.content }}'
                }
              ]
            }
          ]
        }
      ]
    },

    // ===== 监听器示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'watch'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        searchText: '',
        searchHistory: [],
        lastSearch: ''
      },
      watch: {
        searchText: {
          handler: {
            if: 'searchText.length > 2',
            then: [
              { set: 'lastSearch', value: '{{ searchText }}' },
              { set: 'searchHistory', value: '{{ [...searchHistory.slice(-4), searchText] }}' }
            ]
          },
          immediate: false
        }
      },
      children: [
        { com: 'h2', children: '👁️ 监听器 (Watch) 示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '监听状态变化并执行副作用（独立 data 作用域）' },
        {
          com: 'div',
          props: { style: 'padding: 16px;' },
          children: [
            {
              com: 'div',
              props: { class: 'form-group' },
              children: [
                { com: 'label', children: '搜索 (输入超过2个字符会记录历史)' },
                { com: 'input', model: 'searchText', props: { placeholder: '输入搜索内容...' } }
              ]
            },
            {
              if: 'lastSearch',
              com: 'div',
              props: { style: 'margin-top: 12px; color: #666;' },
              children: '最后搜索: {{ lastSearch }}'
            },
            {
              if: 'searchHistory.length > 0',
              com: 'div',
              props: { style: 'margin-top: 12px;' },
              children: [
                { com: 'h4', children: '搜索历史:' },
                {
                  com: 'ul',
                  children: [
                    {
                      for: '(historyItem, idx) in searchHistory',
                      key: '{{ idx }}',
                      com: 'li',
                      children: '{{ historyItem }}'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    // ===== 生命周期示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'lifecycle'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        mounted: false,
        logs: []
      },
      onMounted: [
        { set: 'mounted', value: true },
        { set: 'logs', value: '{{ [...logs, "✅ onMounted: 组件已挂载 - " + new Date().toLocaleTimeString()] }}' }
      ],
      children: [
        { com: 'h2', children: '🔄 生命周期钩子示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示 onMounted 等生命周期钩子（独立 data 作用域）' },
        {
          com: 'div',
          props: { style: 'padding: 16px;' },
          children: [
            {
              com: 'div',
              props: { style: 'margin-bottom: 16px;' },
              children: [
                { com: 'span', children: '挂载状态: ' },
                {
                  com: 'span',
                  props: { style: "{{ mounted ? 'color: green;' : 'color: red;' }}" },
                  children: '{{ mounted ? "已挂载" : "未挂载" }}'
                }
              ]
            },
            {
              com: 'button',
              props: { style: 'padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;' },
              events: {
                click: { set: 'logs', value: '{{ [...logs, "🔄 手动触发 - " + new Date().toLocaleTimeString()] }}' }
              },
              children: '添加日志'
            },
            {
              com: 'div',
              props: { style: 'margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 6px; max-height: 200px; overflow-y: auto;' },
              children: [
                { com: 'h4', children: '生命周期日志:' },
                {
                  for: '(logItem, logIdx) in logs',
                  key: '{{ logIdx }}',
                  com: 'div',
                  props: { style: 'padding: 4px 0; border-bottom: 1px solid #e0e0e0;' },
                  children: '{{ logItem }}'
                }
              ]
            }
          ]
        }
      ]
    },

    // ===== 标签页示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'tabs'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        activeTab: 'tab1',
        tabItems: [
          { id: 'tab1', label: '首页', content: '这是首页的内容。Vue JSON Renderer 让你可以通过 JSON 配置来构建复杂的 UI。' },
          { id: 'tab2', label: '产品', content: '这是产品页面的内容。支持动态组件渲染、事件处理、状态管理等功能。' },
          { id: 'tab3', label: '关于', content: '这是关于页面的内容。该库使用 TypeScript 编写，提供完整的类型支持。' }
        ]
      },
      computed: {
        activeContent: "tabItems.find(t => t.id === activeTab)?.content || ''"
      },
      children: [
        { com: 'h2', children: '📑 标签页示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示动态标签页切换（独立 data 作用域）' },
        {
          com: 'div',
          children: [
            {
              com: 'div',
              props: { class: 'tabs' },
              children: [
                {
                  for: 'tab in tabItems',
                  key: '{{ tab.id }}',
                  com: 'button',
                  props: { class: "{{ activeTab === tab.id ? 'tab active' : 'tab' }}" },
                  events: { click: { set: 'activeTab', value: '{{ tab.id }}' } },
                  children: '{{ tab.label }}'
                }
              ]
            },
            {
              com: 'div',
              props: { class: 'tab-content' },
              children: '{{ activeContent }}'
            }
          ]
        }
      ]
    },

    // ===== API 调用示例 - 独立的 data 作用域 =====
    {
      if: "currentDemo === 'api'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        users: [],
        loading: false,
        error: null,
        selectedUser: null
      },
      methods: {
        loadUsers: [
          { set: 'loading', value: true },
          { set: 'error', value: null },
          {
            fetch: 'https://jsonplaceholder.typicode.com/users?_limit=5',
            method: 'GET',
            then: [
              { set: 'users', value: '{{ $response }}' },
              { set: 'loading', value: false }
            ],
            catch: [
              { set: 'error', value: '{{ $error.message || "加载失败" }}' },
              { set: 'loading', value: false }
            ]
          }
        ],
        selectUser: { set: 'selectedUser', value: '{{ $event }}' },
        clearSelection: { set: 'selectedUser', value: null }
      },
      children: [
        { com: 'h2', children: '🌐 API 调用示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '展示远程数据获取、Loading 状态、错误处理（独立 data 作用域）' },
        {
          com: 'div',
          props: { style: 'padding: 16px;' },
          children: [
            {
              com: 'button',
              props: { 
                style: 'padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 16px;',
                disabled: '{{ loading }}'
              },
              events: { click: { call: 'loadUsers' } },
              children: '{{ loading ? "加载中..." : "加载用户数据" }}'
            },
            {
              if: 'loading',
              com: 'div',
              props: { class: 'loading' },
              children: [
                { com: 'div', props: { class: 'loading-spinner' } },
                { com: 'div', children: '正在加载用户数据...' }
              ]
            },
            {
              if: 'error',
              com: 'div',
              props: { class: 'error-message' },
              children: '❌ {{ error }}'
            },
            {
              if: '!loading && users.length > 0',
              com: 'div',
              props: { class: 'user-cards' },
              children: [
                {
                  for: 'user in users',
                  key: '{{ user.id }}',
                  com: 'div',
                  props: { class: 'user-card' },
                  children: [
                    {
                      com: 'div',
                      props: { class: 'user-card-header' },
                      children: [
                        {
                          com: 'div',
                          props: { class: 'user-avatar' },
                          children: '{{ user.name.charAt(0) }}'
                        },
                        { com: 'h3', children: '{{ user.name }}' }
                      ]
                    },
                    {
                      com: 'div',
                      props: { class: 'user-card-body' },
                      children: [
                        {
                          com: 'div',
                          props: { class: 'user-info-row' },
                          children: [
                            { com: 'span', children: '📧 邮箱' },
                            { com: 'span', children: '{{ user.email }}' }
                          ]
                        },
                        {
                          com: 'div',
                          props: { class: 'user-info-row' },
                          children: [
                            { com: 'span', children: '📞 电话' },
                            { com: 'span', children: '{{ user.phone }}' }
                          ]
                        },
                        {
                          com: 'div',
                          props: { class: 'user-info-row' },
                          children: [
                            { com: 'span', children: '🏢 公司' },
                            { com: 'span', children: '{{ user.company?.name || "N/A" }}' }
                          ]
                        }
                      ]
                    },
                    {
                      com: 'div',
                      props: { class: 'user-card-actions' },
                      children: [
                        {
                          com: 'button',
                          props: { class: 'btn-edit' },
                          events: { click: { call: 'selectUser', args: ['{{ user }}'] } },
                          children: '查看详情'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              if: 'selectedUser',
              com: 'div',
              props: { 
                style: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;'
              },
              events: { click: { call: 'clearSelection' } },
              children: [
                {
                  com: 'div',
                  props: { 
                    style: 'background: white; padding: 24px; border-radius: 12px; max-width: 500px; width: 90%;'
                  },
                  events: { 'click.stop': [] },
                  children: [
                    { com: 'h2', props: { style: 'margin-bottom: 16px;' }, children: '{{ selectedUser.name }}' },
                    { com: 'p', children: '📧 {{ selectedUser.email }}' },
                    { com: 'p', children: '📞 {{ selectedUser.phone }}' },
                    { com: 'p', children: '🌐 {{ selectedUser.website }}' },
                    { com: 'p', children: '🏢 {{ selectedUser.company?.name }}' },
                    { com: 'p', children: '📍 {{ selectedUser.address?.city }}' },
                    {
                      com: 'button',
                      props: { 
                        style: 'margin-top: 16px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer;'
                      },
                      events: { click: { call: 'clearSelection' } },
                      children: '关闭'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },

    // ===== initApi 示例 - 组件挂载时自动获取数据 =====
    {
      if: "currentDemo === 'initApi'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        title: '加载中...',
        posts: [],
        loaded: false
      },
      // initApi: 组件挂载时自动请求 API，返回数据与 data 合并
      // 注意：API 返回数组时，需要通过 then 回调手动设置到指定字段
      initApi: {
        url: 'https://jsonplaceholder.typicode.com/posts?_limit=3',
        method: 'GET',
        then: [
          { set: 'posts', value: '{{ $response }}' },
          { set: 'title', value: '文章列表（initApi 自动加载）' },
          { set: 'loaded', value: true }
        ],
        catch: { set: 'title', value: '加载失败' }
      },
      children: [
        { com: 'h2', children: '📥 initApi 示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '组件挂载时自动请求 API 获取初始数据，数据与 data 合并并保持响应式' },
        {
          com: 'div',
          props: { style: 'padding: 16px;' },
          children: [
            {
              com: 'div',
              props: { style: 'margin-bottom: 16px; display: flex; align-items: center; gap: 12px;' },
              children: [
                { com: 'h3', children: '{{ title }}' },
                {
                  if: '$loading',
                  com: 'span',
                  props: { style: 'color: #667eea; font-size: 14px;' },
                  children: '⏳ 加载中...'
                }
              ]
            },
            {
              com: 'div',
              props: { style: 'background: #f0f9ff; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;' },
              children: [
                { com: 'strong', children: '💡 说明：' },
                { com: 'span', children: ' initApi 在组件挂载时自动执行，$loading 状态可用于显示加载指示器' }
              ]
            },
            {
              if: 'posts.length > 0',
              com: 'div',
              props: { class: 'post-list' },
              children: [
                {
                  for: 'post in posts',
                  key: '{{ post.id }}',
                  com: 'div',
                  props: { 
                    style: 'background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'
                  },
                  children: [
                    { 
                      com: 'h4', 
                      props: { style: 'margin: 0 0 8px 0; color: #333;' },
                      children: '{{ post.id }}. {{ post.title }}'
                    },
                    { 
                      com: 'p', 
                      props: { style: 'margin: 0; color: #666; font-size: 14px; line-height: 1.5;' },
                      children: '{{ post.body.substring(0, 100) }}...'
                    }
                  ]
                }
              ]
            },
            {
              if: '!$loading && posts.length === 0 && loaded',
              com: 'div',
              props: { style: 'color: #999; text-align: center; padding: 20px;' },
              children: '暂无数据'
            }
          ]
        }
      ]
    },

    // ===== uiApi 示例 - 组件挂载时动态加载 UI 结构 =====
    {
      if: "currentDemo === 'uiApi'",
      com: 'div',
      props: { class: 'demo-section' },
      children: [
        { com: 'h2', children: '🎨 uiApi 示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: '组件挂载时请求 API 获取 UI 结构，动态替换 children 渲染' },
        {
          com: 'div',
          props: { style: 'background: #fdf4ff; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;' },
          children: [
            { com: 'strong', children: '💡 说明：' },
            { com: 'span', children: ' uiApi 返回的 JsonNode 会替换原有 children，$uiLoading 状态可用于显示加载指示器' }
          ]
        },
        // 这个容器的 children 会被 uiApi 返回的内容替换
        {
          com: 'div',
          props: { style: 'padding: 16px; min-height: 200px;' },
          data: { pageTitle: 'uiApi 动态 UI 示例' },
          // uiApi: 组件挂载时请求本地 JSON 文件，返回 JsonNode 替换 children
          uiApi: {
            url: '/mock/ui-schema.json',
            method: 'GET',
            ignoreBaseURL: true  // 本地 mock 文件，不使用全局 baseURL
          },
          children: [
            {
              if: '$uiLoading',
              com: 'div',
              props: { style: 'color: #667eea; text-align: center; padding: 40px;' },
              children: '⏳ UI 加载中...'
            },
            {
              if: '!$uiLoading',
              com: 'div',
              props: { style: 'color: #999; text-align: center; padding: 40px;' },
              children: '等待 uiApi 加载...'
            }
          ]
        }
      ]
    },

    // ===== 组合 API 示例 - initApi + uiApi 配合使用 =====
    {
      if: "currentDemo === 'combinedApi'",
      com: 'div',
      props: { class: 'demo-section' },
      children: [
        { com: 'h2', children: '🔗 组合 API 示例' },
        { com: 'p', props: { style: 'color: #666; margin-bottom: 16px;' }, children: 'initApi 和 uiApi 配合使用：先加载数据，再加载依赖数据的 UI' },
        {
          com: 'div',
          props: { style: 'background: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px;' },
          children: [
            { com: 'strong', children: '💡 执行顺序：' },
            { com: 'span', children: ' 1️⃣ initApi 获取用户数据 → 2️⃣ uiApi 加载 UI 结构（可访问用户数据）→ 3️⃣ 渲染完整界面' }
          ]
        },
        // 这个容器同时使用 initApi 和 uiApi
        {
          com: 'div',
          props: { style: 'padding: 16px;' },
          data: {
            userId: 1,
            user: null
          },
          // initApi 先执行，获取用户数据
          initApi: {
            url: 'https://jsonplaceholder.typicode.com/users/1',
            method: 'GET',
            then: { set: 'user', value: '{{ $response }}' }
          },
          // uiApi 在 initApi 完成后执行，返回的 JsonNode 可以访问 user 数据
          uiApi: {
            url: '/mock/user-card-ui.json',
            method: 'GET',
            ignoreBaseURL: true  // 本地 mock 文件，不使用全局 baseURL
          },
          children: [
            {
              com: 'div',
              props: { style: 'margin-bottom: 16px; display: flex; gap: 16px;' },
              children: [
                {
                  com: 'div',
                  props: { style: 'padding: 8px 16px; border-radius: 6px; font-size: 14px; background: #dcfce7;' },
                  children: '数据: {{ $loading ? "加载中..." : "已加载" }}'
                },
                {
                  com: 'div',
                  props: { style: 'padding: 8px 16px; border-radius: 6px; font-size: 14px; background: #e0f2fe;' },
                  children: 'UI: {{ $uiLoading ? "加载中..." : "已加载" }}'
                }
              ]
            },
            {
              if: '$loading || $uiLoading',
              com: 'div',
              props: { style: 'color: #999; text-align: center; padding: 40px;' },
              children: '⏳ 正在加载...'
            }
          ]
        }
      ]
    },

    // ===== WebSocket 示例 - 长连接管理（connect/send/close + onMessage） =====
    {
      if: "currentDemo === 'ws'",
      com: 'div',
      props: { class: 'demo-section' },
      data: {
        wsUrl: 'wss://echo.websocket.org',
        wsKey: 'demoWs',
        wsConnected: false,
        wsError: '',
        wsMessage: '你好，WebSocket！',
        lastMessage: '',
        messages: [] as any[]
      },
      children: [
        { com: 'h2', children: 'WebSocket（全双工通信协议）长连接示例' },
        {
          com: 'p',
          props: { style: 'color: #666; margin-bottom: 16px;' },
          children: '展示 ws 动作（Action，动作）的 connect/send/close 以及 onMessage 回调动作（callback action）'
        },
        {
          com: 'div',
          props: { style: 'background: #fefce8; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #92400e;' },
          children: [
            { com: 'strong', children: '提示：' },
            { com: 'span', children: '本示例使用公共 echo 服务（可能受网络环境影响）。连接成功后发送消息，服务端会回传同样内容。' }
          ]
        },
        {
          com: 'div',
          props: { style: 'display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;' },
          children: [
            {
              com: 'input',
              model: 'wsUrl',
              props: { placeholder: 'WebSocket URL（例如 wss://echo.websocket.org）', style: 'min-width: 320px; flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px;' }
            },
            {
              com: 'button',
              props: { disabled: '{{ wsConnected }}', style: 'padding: 8px 12px; border-radius: 6px; background: #10b981; color: #fff; border: none;' },
              events: {
                click: {
                  ws: '{{ wsUrl }}',
                  op: 'connect',
                  id: '{{ wsKey }}',
                  timeout: 5000,
                  responseType: 'text',
                  onOpen: [
                    { set: 'wsConnected', value: true },
                    { set: 'wsError', value: '' }
                  ],
                  onMessage: [
                    { set: 'lastMessage', value: '{{ $response }}' },
                    { script: 'state.messages = [...(state.messages || []), $response];' }
                  ],
                  onError: [
                    { set: 'wsError', value: '{{ $error && $error.message ? $error.message : String($error) }}' },
                    { set: 'wsConnected', value: false }
                  ],
                  onClose: { set: 'wsConnected', value: false },
                  then: { set: 'wsConnected', value: true },
                  catch: [
                    { set: 'wsError', value: '{{ $error && $error.message ? $error.message : String($error) }}' },
                    { set: 'wsConnected', value: false }
                  ]
                }
              },
              children: '{{ wsConnected ? \"已连接\" : \"连接\" }}'
            },
            {
              com: 'button',
              props: { disabled: '{{ !wsConnected }}', style: 'padding: 8px 12px; border-radius: 6px; background: #ef4444; color: #fff; border: none;' },
              events: {
                click: {
                  ws: '{{ wsKey }}',
                  op: 'close',
                  then: { set: 'wsConnected', value: false }
                }
              },
              children: '断开'
            }
          ]
        },
        {
          com: 'div',
          props: { style: 'display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;' },
          children: [
            {
              com: 'input',
              model: 'wsMessage',
              props: { placeholder: '要发送的消息...', style: 'min-width: 240px; flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px;' }
            },
            {
              com: 'button',
              props: { disabled: '{{ !wsConnected || !wsMessage }}', style: 'padding: 8px 12px; border-radius: 6px; background: #3b82f6; color: #fff; border: none;' },
              events: {
                click: {
                  ws: '{{ wsKey }}',
                  op: 'send',
                  sendAs: 'text',
                  message: '{{ wsMessage }}',
                  then: { set: 'wsMessage', value: '' }
                }
              },
              children: '发送'
            },
            {
              com: 'button',
              props: { style: 'padding: 8px 12px; border-radius: 6px; background: #6b7280; color: #fff; border: none;' },
              events: { click: { set: 'messages', value: '{{ [] }}' } },
              children: '清空日志'
            }
          ]
        },
        {
          com: 'div',
          props: { style: 'font-size: 14px; color: #374151; margin-bottom: 12px;' },
          children: [
            { com: 'div', children: '连接 key（用于 send/close）: {{ wsKey }}' },
            { com: 'div', children: '连接状态: {{ wsConnected ? \"已连接\" : \"未连接\" }}' },
            { if: 'wsError', com: 'div', props: { style: 'color: #ef4444;' }, children: '错误: {{ wsError }}' },
            { if: 'lastMessage', com: 'div', props: { style: 'margin-top: 6px;' }, children: '最近消息: {{ lastMessage }}' }
          ]
        },
        {
          com: 'div',
          props: { style: 'background: #0f172a; color: #e2e8f0; border-radius: 10px; padding: 12px; font-size: 13px;' },
          children: [
            { com: 'div', props: { style: 'font-weight: 600; margin-bottom: 8px;' }, children: '消息日志（messages）' },
            { if: '!messages.length', com: 'div', props: { style: 'opacity: 0.7;' }, children: '暂无消息。连接后点击“发送”试试。' },
            {
              for: 'msg in messages',
              key: '{{ $index }}',
              com: 'div',
              props: { style: 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.08);' },
              children: '{{ $index + 1 }}. {{ msg }}'
            }
          ]
        }
      ]
    }
  ]
};
</script>

<template>
  <JsonRenderer :schema="demoPageSchema" />
</template>
