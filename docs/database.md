# 数据库设计文档

## 本地存储结构

### tasks
存储所有任务数据

```js
{
  tasks: [
    {
      id: string,          // 任务ID
      title: string,       // 任务标题
      notes: string,       // 任务备注
      dueDate: string,     // 截止日期
      important: boolean,  // 是否重要
      completed: boolean,  // 是否完成
      createTime: string,  // 创建时间
      updateTime: string,  // 更新时间
      completedTime: string // 完成时间
    }
  ]
}
```

## 索引设计

- tasks 按 createTime 降序存储
- 支持按 dueDate、important、completed 等字段过滤

## 数据同步

所有数据操作通过 Storage 同步机制自动同步

## 数据清理

- 定期清理已完成且超过30天的任务
- 保留最近100条已完成任务记录

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

## 操作接口

### 任务管理
```js
// 添加任务
db.addTask(taskData)

// 更新任务
db.updateTask(taskId, data)

// 删除任务
db.deleteTask(taskId)

// 获取任务列表
db.getTasks(filter?)

// 获取任务详情
db.getTask(taskId)
```

### 数据过滤
```js
// 获取重要任务
db.getImportantTasks()

// 获取已完成任务
db.getCompletedTasks()

// 获取指定日期的任务
db.getTasksByDate(date)
```

### 数据统计
```js
// 获取任务统计
db.getTaskStats()

// 获取每日任务完成情况
db.getDailyStats()
```

## 性能优化

### 存储优化
- 定期清理过期数据
- 控制存储数据量
- 优化查询性能

### 缓存策略
- 缓存常用数据
- 延迟写入
- 批量更新 