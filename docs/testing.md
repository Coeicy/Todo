# 测试文档

## 单元测试

### 通知系统测试
```js
describe('NotificationManager', () => {
  let notification

  beforeEach(() => {
    notification = require('../utils/notification')
    wx.clearStorage()
  })

  test('should create notification', async () => {
    const task = {
      id: '1',
      title: 'Test Task'
    }
    
    const result = await notification.scheduleTaskReminder(task, 30)
    expect(result).toBeTruthy()
  })

  test('should mark notification as read', async () => {
    const notificationId = '123'
    const result = await notification.markAsRead(notificationId)
    expect(result).toBeTruthy()
  })
})
```

### 数据库操作测试
```js
describe('Database', () => {
  let db

  beforeEach(() => {
    db = require('../utils/db')
    db.init()
  })

  test('should add task', () => {
    const task = db.addTask({
      title: 'Test Task'
    })
    expect(task.id).toBeDefined()
  })

  test('should update task', () => {
    const task = db.addTask({ title: 'Old Title' })
    const updated = db.updateTask(task.id, { title: 'New Title' })
    expect(updated.title).toBe('New Title')
  })
})
```

## 组件测试

### 通知图标组件测试
```js
describe('NotificationIcon', () => {
  test('should render badge with count', () => {
    const component = mount(NotificationIcon, {
      data: {
        count: 5
      }
    })
    
    expect(component.find('.badge').text()).toBe('5')
  })

  test('should show dot when specified', () => {
    const component = mount(NotificationIcon, {
      data: {
        dot: true
      }
    })
    
    expect(component.find('.badge').hasClass('dot')).toBeTruthy()
  })
})
```

## 集成测试

### 任务流程测试
```js
describe('Task Flow', () => {
  test('should complete task flow', async () => {
    // 创建任务
    const task = await db.addTask({
      title: 'Test Task',
      dueDate: '2024-01-01'
    })

    // 设置提醒
    await notification.scheduleTaskReminder(task, 30)

    // 检查提醒状态
    const status = notification.getReminderStatus(task.id)
    expect(status.active).toBeTruthy()

    // 完成任务
    await db.updateTask(task.id, { completed: true })
    
    // 验证提醒已取消
    const updatedStatus = notification.getReminderStatus(task.id)
    expect(updatedStatus.cancelled).toBeTruthy()
  })
})
```

## 性能测试

### 通知系统性能
```js
describe('Notification Performance', () => {
  test('should handle bulk operations efficiently', async () => {
    const start = Date.now()
    
    // 批量创建通知
    for (let i = 0; i < 100; i++) {
      await notification.createNotification({
        title: `Test ${i}`
      })
    }
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(1000) // 应在1秒内完成
  })
})
```

## 测试覆盖率

确保关键功能的测试覆盖率达到以下标准：
- 通知系统: > 90%
- 数据库操作: > 85%
- UI组件: > 80%
- 工具函数: > 90%

## 自动化测试

使用 GitHub Actions 进行自动化测试：

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
``` 