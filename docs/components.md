# 组件文档

## 任务列表组件 (task-list)

用于显示任务列表。

### 使用方法
```html
<task-list 
  tasks="{{tasks}}"
  showEmpty="{{true}}"
  emptyText="暂无任务"
  bindstatusChange="onStatusChange"
  bindimportantChange="onImportantChange"
  bindtaskClick="onTaskClick"
/>
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| tasks | Array | [] | 任务列表数据 |
| showEmpty | Boolean | true | 是否显示空状态 |
| emptyText | String | '暂无任务' | 空状态文本 |

### 事件
| 事件名 | 说明 | 参数 |
|--------|------|------|
| statusChange | 任务状态变更 | {task, completed} |
| importantChange | 重要标记变更 | {task, important} |
| taskClick | 点击任务项 | {task} |

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

## 日历组件 (calendar)

用于显示日历和任务。

### 使用方法
```html
<calendar 
  show-lunar="{{true}}"
  show-festival="{{true}}"
  show-task-dots="{{true}}"
  tasks="{{tasks}}"
  bind:select="onDateSelect"
  bind:monthChange="onMonthChange"
/>
```

### 属性说明
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| show-lunar | Boolean | true | 显示农历 |
| show-festival | Boolean | true | 显示节日 |
| show-task-dots | Boolean | true | 显示任务标记 |
| tasks | Array | [] | 任务数据 |

### 事件
| 事件名 | 说明 | 参数 |
|--------|------|------|
| select | 选择日期 | {date} |
| monthChange | 月份变更 | {year, month} |

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