# 通知系统设计文档

## 系统架构

### 1. 核心组件
- 提醒管理器 (ReminderManager)
- 通知发送器 (NotificationSender)
- 通知存储器 (NotificationStorage)
- 定时任务管理器 (TimerManager)

### 2. 数据流
```
任务创建/更新 -> 提醒设置 -> 定时检查 -> 发送通知 -> 更新状态
```

## 功能实现

### 1. 提醒设置
```javascript
// 设置提醒
async function setReminder(taskId, reminderTime) {
  // 1. 验证任务
  const task = await db.getTask(taskId)
  if (!task) throw new Error('任务不存在')
  
  // 2. 创建提醒
  const reminder = {
    id: generateId(),
    taskId,
    time: reminderTime,
    status: 'pending'
  }
  
  // 3. 保存提醒
  await saveReminder(reminder)
  
  // 4. 设置定时器
  scheduleReminder(reminder)
}
```

### 2. 通知发送
```javascript
// 发送通知
async function sendNotification(reminder) {
  // 1. 获取任务信息
  const task = await db.getTask(reminder.taskId)
  
  // 2. 构建通知内容
  const notification = {
    title: '任务提醒',
    content: `任务"${task.title}"即将到期`,
    time: new Date().toISOString()
  }
  
  // 3. 发送通知
  await wx.requestSubscribeMessage({
    tmplIds: [TEMPLATE_ID]
  })
  
  // 4. 更新状态
  await updateReminderStatus(reminder.id, 'sent')
}
```

## 通知模板

### 1. 任务提醒模板
```javascript
{
  template_id: "template_xxx",
  title: "任务提醒",
  content: "任务名称：{{taskName}}",
  time: "时间：{{time}}",
  status: "状态：{{status}}"
}
```

### 2. 每日摘要模板
```javascript
{
  template_id: "template_yyy",
  title: "每日任务摘要",
  date: "日期：{{date}}",
  total: "总任务数：{{total}}",
  completed: "已完成：{{completed}}"
}
```

## 错误处理

### 1. 发送失败处理
```javascript
try {
  await sendNotification(reminder)
} catch (error) {
  // 1. 记录错误
  logError('发送通知失败', error)
  
  // 2. 更新状态
  await updateReminderStatus(reminder.id, 'failed')
  
  // 3. 安排重试
  scheduleRetry(reminder)
}
```

### 2. 权限处理
```javascript
async function checkNotificationPermission() {
  try {
    const setting = await wx.getSetting()
    if (!setting.authSetting['scope.notification']) {
      await wx.requestSubscribeMessage({
        tmplIds: [TEMPLATE_ID]
      })
    }
  } catch (error) {
    console.error('获取通知权限失败:', error)
  }
}
```

## 性能优化

### 1. 批量处理
- 合并相近时间的提醒
- 批量发送通知
- 定期清理过期数据

### 2. 错误重试
- 指数退避算法
- 最大重试次数限制
- 失败通知处理

### 3. 资源管理
- 限制并发请求数
- 合理设置缓存
- 优化数据结构

## 系统概述

通知系统提供任务提醒和消息通知功能，基于本地存储实现，支持自定义提醒时间、多种提醒方式和通知管理。

## 核心功能

### 1. 任务提醒
- 支持自定义提醒时间
- 多种预设时间选项
- 支持取消和重新激活
- 提醒状态追踪

### 2. 通知管理
- 未读通知统计
- 批量操作支持
- 通知历史记录
- 通知搜索功能

### 3. 性能监控
- 操作耗时统计
- 错误追踪
- 性能报告生成

## 技术实现

### 存储设计
```js
// 通知记录
notifications: [{
  id: string,          // 通知ID
  type: string,        // 通知类型
  taskId: string,      // 关联任务ID
  data: object,        // 通知数据
  status: string,      // 状态
  createTime: string   // 创建时间
}]

// 提醒设置
reminder_${taskId}: {
  reminderTime: string,   // 提醒时间
  minutesBefore: number,  // 提前时间
  status: string         // 状态
}
```

### 状态管理
```js
// 通知状态
STATUS: {
  PENDING: 'pending',    // 等待发送
  SENT: 'sent',         // 已发送
  READ: 'read',         // 已读
  CANCELLED: 'cancelled' // 已取消
}
```

### 错误处理
```js
// 错误类型
errorMessages: {
  PERMISSION_DENIED: '通知权限被拒绝',
  INVALID_TASK: '无效的任务数据',
  STORAGE_ERROR: '存储操作失败',
  NOTIFICATION_NOT_FOUND: '通知不存在',
  REMINDER_NOT_FOUND: '提醒设置不存在',
  ALREADY_CANCELLED: '通知已被取消',
  INVALID_TIME: '无效的时间设置',
  PAST_TIME: '不能设置过去的时间'
}
```

## 使用示例

### 设置任务提醒
```js
const notification = require('../utils/notification')

// 设置提醒
await notification.scheduleTaskReminder(task, 30) // 30分钟前提醒

// 取消提醒
await notification.cancelTaskReminder(taskId)

// 获取提醒状态
const status = notification.getReminderStatus(taskId)
```

### 通知管理
```js
// 获取未读数
const count = await notification.getUnreadCount()

// 标记已读
await notification.markAsRead(notificationId)

// 批量标记已读
await notification.batchMarkAsRead([id1, id2, id3])

// 获取统计信息
const stats = notification.getNotificationStats()
```

## 最佳实践

1. 提醒设置
- 合理设置提醒时间
- 避免频繁修改
- 注意时区处理

2. 通知管理
- 及时处理未读通知
- 定期清理历史记录
- 适当使用批量操作

3. 性能监控
- 关注关键指标
- 定期检查性能
- 及时优化问题

## 注意事项

1. 权限管理
- 请求通知权限
- 处理权限变更
- 权限状态维护

2. 数据安全
- 敏感数据加密
- 定期数据备份
- 防止数据丢失

3. 用户体验
- 合理的提醒频率
- 友好的交互设计
- 及时的状态反馈 