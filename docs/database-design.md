# 数据库设计文档

## 最新更新

### 1. 任务数据结构优化
```javascript
{
  id: string,          // 任务ID
  title: string,       // 任务标题
  notes: string,       // 备注
  priority: number,    // 优先级 (0-3)
  isAllDay: boolean,   // 是否为全天任务 (新增)
  startTime: {         // 开始时间结构优化
    year: string,
    month: string,
    day: string,
    hour: string,      // 全天任务时为 "00"
    minute: string     // 全天任务时为 "00"
  },
  endTime: {           // 结束时间结构优化
    year: string,
    month: string, 
    day: string,
    hour: string,      // 全天任务时为 "23"
    minute: string     // 全天任务时为 "59"
  },
  fromCalendar: boolean, // 是否从日历创建 (新增)
  completed: boolean,  // 完成状态
  completedTime: string, // 完成时间
  dueDate: string,    // 截止时间
  location: string,    // 地点
  url: string,        // 相关链接
  createTime: string,  // 创建时间
  updateTime: string   // 更新时间
}
```

### 2. 数据操作接口更新
```javascript
// 创建任务时处理全天任务
createTask(taskData) {
  if (taskData.isAllDay) {
    taskData.startTime.hour = "00";
    taskData.startTime.minute = "00";
    taskData.endTime.hour = "23";
    taskData.endTime.minute = "59";
  }
  // ... 其他处理逻辑
}

// 更新任务时处理全天任务
updateTask(taskId, taskData) {
  if (taskData.isAllDay !== undefined) {
    // 处理全天任务时间
    if (taskData.isAllDay) {
      taskData.startTime = taskData.startTime || {};
      taskData.endTime = taskData.endTime || {};
      taskData.startTime.hour = "00";
      taskData.startTime.minute = "00";
      taskData.endTime.hour = "23";
      taskData.endTime.minute = "59";
    }
  }
  // ... 其他更新逻辑
}
```

## 数据结构

### 1. 任务数据 (tasks)
```javascript
{
  id: string,          // 任务ID
  title: string,       // 任务标题
  notes: string,       // 备注
  priority: number,    // 优先级 (0-3)
  completed: boolean,  // 完成状态
  completedTime: string, // 完成时间
  startTime: string,   // 开始时间
  dueDate: string,    // 截止时间
  location: string,    // 地点
  url: string,        // 相关链接
  createTime: string,  // 创建时间
  updateTime: string   // 更新时间
}
```

### 2. 提醒数据 (reminders)
```javascript
{
  id: string,          // 提醒ID
  taskId: string,      // 关联任务ID
  time: string,        // 提醒时间
  type: string,        // 提醒类型
  status: string,      // 提醒状态
  createTime: string   // 创建时间
}
```

## 数据操作接口

### 任务操作
1. 添加任务
2. 更新任务
3. 删除任务
4. 切换任务状态
5. 更新任务优先级

### 提醒操作
1. 设置提醒
2. 取消提醒
3. 更新提醒状态
4. 获取提醒列表

## 数据同步机制

1. 本地存储
- 使用 wx.setStorageSync 存储
- 定期清理过期数据
- 数据备份机制

2. 状态管理
- 实时更新
- 错误处理
- 并发控制 