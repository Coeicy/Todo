# 组件文档

## 1. 任务列表组件

### 功能描述
显示任务列表，支持多种视图模式和交互操作。

### 使用方法
```html
<task-list 
  tasks="{{tasks}}"
  filter="{{filter}}"
  bind:statusChange="onStatusChange"
  bind:taskClick="onTaskClick"
/>
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tasks | Array | [] | 任务数据列表 |
| filter | String | 'all' | 过滤类型 |
| showEmpty | Boolean | true | 是否显示空状态 |

### 事件
| 事件名 | 说明 | 参数 |
|--------|------|------|
| statusChange | 任务状态变更 | {taskId, completed} |
| taskClick | 点击任务项 | {taskId, task} |

## 2. 日历组件

### 功能描述
显示日历视图，支持农历、节假日、任务标记等功能。

### 使用方法
```html
<calendar 
  showLunar="{{true}}"
  tasks="{{tasks}}"
  bind:dateSelect="onDateSelect"
/>
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showLunar | Boolean | true | 显示农历 |
| tasks | Array | [] | 任务数据 |
| selectedDate | String | '' | 选中日期 |

### 事件
| 事件名 | 说明 | 参数 |
|--------|------|------|
| dateSelect | 选择日期 | {date} |
| monthChange | 切换月份 | {year, month} |

## 任务筛选组件 (task-filter)

用于任务列表的筛选。

### 使用方法
```html
<task-filter 
  current="{{currentFilter}}"
  bindchange="onFilterChange"
/>
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| current | String | 'all' | 当前选中的筛选器 |

### 事件
| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 筛选条件变更 | {filter} |

## 任务表单组件 (task-form)

用于创建和编辑任务。

### 使用方法
```html
<task-form
  task="{{task}}"
  bindsubmit="onSubmit"
  bindcancel="onCancel"
/>
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| task | Object | null | 任务数据，为null时创建新任务 |
| submitText | String | '保存' | 提交按钮文本 |
| showCancel | Boolean | true | 是否显示取消按钮 |

### 事件
| 事件名 | 说明 | 参数 |
|--------|------|------|
| submit | 提交表单 | {taskData} |
| cancel | 取消编辑 | - |

## 任务统计组件 (task-stats)

用于显示任务统计信息。

### 使用方法
```html
<task-stats stats="{{stats}}" />
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| stats | Object | {} | 统计数据 |
| showChart | Boolean | true | 是否显示图表 |

### 数据格式
```js
{
  total: number,      // 总任务数
  completed: number,  // 已完成数
  important: number,  // 重要任务数
  overdue: number    // 过期任务数
}
``` 