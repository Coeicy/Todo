# 工具函数文档

## 数据库操作 (db.js)

提供本地数据存储和管理功能。

### 初始化
```js
const db = require('../utils/db')
db.init()
```

### 任务操作
```js
// 添加任务
const task = db.addTask({
  title: '任务标题',
  notes: '备注',
  startTime: {
    year: '2024',
    month: '01',
    day: '01',
    hour: '09',
    minute: '00'
  },
  endTime: {
    year: '2024',
    month: '01',
    day: '01',
    hour: '10',
    minute: '00'
  },
  location: '地点',
  url: 'https://example.com',
  important: false
})

// 更新任务
db.updateTask(taskId, {
  title: '新标题',
  completed: true
})

// 删除任务
db.deleteTask(taskId)

// 获取任务列表
const tasks = db.getTasks()

// 获取任务详情
const task = db.getTask(taskId)
```

### 数据过滤
```js
// 获取重要任务
const importantTasks = db.getImportantTasks()

// 获取已完成任务
const completedTasks = db.getCompletedTasks()

// 获取指定日期任务
const dateTasks = db.getTasksByDate('2024-01-01')
```

### 数据统计
```js
// 获取任务统计
const stats = db.getTaskStats()

// 获取每日完成情况
const dailyStats = db.getDailyStats()
```

## 日期工具 (date.js)

提供日期格式化和计算功能。

### 使用方法
```js
const date = require('../utils/date')

// 格式化日期
date.format(new Date(), 'YYYY-MM-DD')

// 计算日期差
date.diff('2024-01-01', '2024-01-02', 'days')

// 检查是否同一天
date.isSameDay(date1, date2)

// 获取日期范围
date.getDateRange('week') // 本周
date.getDateRange('month') // 本月
```

## 农历工具 (lunar.js)

提供农历、节气、节日等功能。

### 使用方法
```js
const lunar = require('../utils/lunar')

// 获取农历日期
const lunarDate = lunar.getLunarDate(new Date())

// 获取节气
const solarTerm = lunar.getSolarTerm(new Date())

// 获取节日
const festival = lunar.getFestival(new Date())
```

### 返回数据
```js
// 农历日期
{
  year: string,  // 农历年
  month: string, // 农历月
  day: string,   // 农历日
  zodiac: string // 生肖
}

// 节气
{
  name: string,  // 节气名称
  date: string   // 节气日期
}
```

## 存储工具 (storage.js)

提供本地存储操作功能。

### 使用方法
```js
const storage = require('../utils/storage')

// 存储数据
storage.set('key', value)

// 读取数据
const data = storage.get('key')

// 删除数据
storage.remove('key')

// 清空数据
storage.clear()

// 获取存储信息
const info = storage.getInfo()
```

## 工具函数 (util.js)

提供通用工具函数。

### 使用方法
```js
const util = require('../utils/util')

// 生成唯一ID
const id = util.generateId()

// 深拷贝对象
const copy = util.deepClone(obj)

// 防抖函数
const debounced = util.debounce(fn, 300)

// 节流函数
const throttled = util.throttle(fn, 300)

// 格式化时间
util.formatDateTime(date)

// 格式化任务时间
util.formatTaskTime(startTime, endTime)

// 格式化文件大小
util.formatFileSize(size)
``` 