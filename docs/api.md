# API 文档

## 数据库 API (utils/db.js)

### 初始化
```javascript
const db = require('../utils/db')
db.init()
```

### 任务管理
```javascript
// 获取所有任务
const tasks = db.getTasks()

// 添加任务
const newTask = db.addTask({
  title: '任务标题',
  notes: '备注',
  priority: 1,
  startTime: '2024-01-20T10:00:00',
  dueDate: '2024-01-20T18:00:00'
})

// 更新任务
const updatedTask = db.updateTask(taskId, {
  title: '新标题',
  priority: 2
})

// 删除任务
db.deleteTask(taskId)

// 切换任务状态
db.toggleTaskStatus(taskId)

// 更新优先级
db.updateTaskPriority(taskId, 3)
```

### 提醒管理
```javascript
// 设置提醒
const reminder = notification.setReminder({
  taskId: 'task123',
  time: '2024-01-20T10:00:00',
  type: 'once'
})

// 取消提醒
notification.cancelReminder(reminderId)

// 获取任务提醒
const reminders = notification.getTaskReminders(taskId)
```

## 工具函数 API (utils/)

### 日期工具 (utils/lunar.js)
```javascript
const lunar = require('../utils/lunar')

// 获取农历日期
const lunarDate = lunar.getLunarDate(new Date())

// 获取节气
const term = lunar.getSolarTerm(new Date())

// 获取节日
const festival = lunar.getFestival(new Date())
```

### 通知工具 (utils/notification.js)
```javascript
const notification = require('../utils/notification')

// 发送通知
notification.send({
  title: '任务提醒',
  content: '您有一个任务即将到期'
})

// 获取未读通知
const unread = notification.getUnreadCount()

// 标记通知已读
notification.markAsRead(notificationId)
```

## 性能说明

### 数据限制
- 单个任务数据大小 < 50KB
- 总任务数建议 < 1000条
- 本地存储限制 10MB

### 缓存策略
- 任务列表缓存 5 分钟
- 农历数据缓存 1 天
- 提醒列表实时更新

### 错误处理
所有 API 调用都应该使用 try-catch 处理可能的错误：
```javascript
try {
  const result = await db.addTask(taskData)
} catch (error) {
  console.error('添加任务失败:', error)
  wx.showToast({
    title: '操作失败',
    icon: 'error'
  })
}
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