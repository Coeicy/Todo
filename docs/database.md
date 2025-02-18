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
      startTime: {         // 开始时间
        year: string,
        month: string, 
        day: string,
        hour: string,
        minute: string
      },
      endTime: {          // 结束时间
        year: string,
        month: string,
        day: string, 
        hour: string,
        minute: string
      },
      location: string,    // 任务地点
      url: string,         // 相关链接
      attachments: [{      // 任务附件
        name: string,
        url: string,
        size: number,
        type: string
      }],
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
  startTime?: object;  // 开始时间
  endTime?: object;    // 结束时间
  location?: string;   // 任务地点
  url?: string;         // 相关链接
  attachments?: [{     // 任务附件
    name: string;
    url: string;
    size: number;
    type: string;
  }];
  important: boolean;    // 是否重要
  completed: boolean;    // 是否完成
  createTime: string;     // 创建时间
  updateTime: string;     // 更新时间
  completedTime?: string; // 完成时间
}
```

## 操作接口

### 任务管理
```js
// 添加任务
db.addTask({
  title: string,
  notes?: string,
  startTime?: object,
  endTime?: object,
  location?: string,
  url?: string,
  important?: boolean
})

// 更新任务
db.updateTask(id, {
  title?: string,
  notes?: string,
  startTime?: object,
  endTime?: object,
  location?: string,
  url?: string,
  important?: boolean,
  completed?: boolean
})

// 删除任务
db.deleteTask(id)

// 获取任务列表
db.getTasks()

// 获取任务详情
db.getTask(id)
```

### 数据过滤
```js
// 获取今日任务
db.getTodayTasks()

// 获取重要任务
db.getImportantTasks()

// 获取已完成任务
db.getCompletedTasks()

// 获取指定日期的任务
db.getTasksByDate(date)
```