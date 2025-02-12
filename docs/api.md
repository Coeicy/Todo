# API 文档

## 数据库 API

### 初始化
```js
const db = require('../utils/db')
```

### 任务管理

#### 添加任务
```js
const task = await db.addTask({
  title: '任务标题',
  notes: '备注信息',
  dueDate: '2024-01-01',
  important: false
})
```

#### 更新任务
```js
await db.updateTask(taskId, {
  title: '新标题',
  completed: true
})
```

#### 删除任务
```js
await db.deleteTask(taskId)
```

#### 获取任务列表
```js
// 获取所有任务
const tasks = await db.getTasks()

// 使用过滤器
const tasks = await db.getTasks({
  completed: false,
  important: true
})
```

### 数据过滤

#### 获取重要任务
```js
const tasks = await db.getImportantTasks()
```

#### 获取已完成任务
```js
const tasks = await db.getCompletedTasks()
```

#### 按日期获取任务
```js
const tasks = await db.getTasksByDate('2024-01-01')
```

### 数据统计

#### 获取任务统计
```js
const stats = await db.getTaskStats()
// 返回格式
{
  total: number,      // 总任务数
  completed: number,  // 已完成数
  important: number,  // 重要任务数
  overdue: number    // 过期任务数
}
```

#### 获取每日统计
```js
const dailyStats = await db.getDailyStats()
// 返回格式
{
  date: string,       // 日期
  completed: number,  // 完成数
  added: number      // 新增数
}[]
```

## 数据结构

### Task 对象
```typescript
interface Task {
  id: string;          // 任务ID
  title: string;       // 任务标题
  notes?: string;      // 任务备注
  dueDate?: string;    // 截止日期
  important: boolean;  // 是否重要
  completed: boolean;  // 是否完成
  createTime: string;  // 创建时间
  updateTime: string;  // 更新时间
  completedTime?: string; // 完成时间
}
```

### 过滤器选项
```typescript
interface FilterOptions {
  completed?: boolean;  // 完成状态
  important?: boolean;  // 重要状态
  dueDate?: string;    // 截止日期
  startDate?: string;  // 开始日期
  endDate?: string;    // 结束日期
}
```

## 错误处理

### 错误类型
```js
const errorMessages = {
  INVALID_TASK: '无效的任务数据',
  TASK_NOT_FOUND: '任务不存在',
  STORAGE_ERROR: '存储操作失败'
}
```

### 错误示例
```js
try {
  await db.updateTask('invalid-id', {})
} catch (error) {
  console.error('更新任务失败:', error)
}
```

## 性能说明

### 数据限制
- 单个任务数据大小 < 50KB
- 总任务数建议 < 1000条
- 本地存储限制 10MB

### 优化建议
- 定期清理已完成任务
- 批量操作使用事务
- 避免频繁读写操作

## 通知系统 API

### 初始化
```