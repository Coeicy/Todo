# 页面文档

## 1. 首页 (pages/index/index)

### 功能描述
任务管理的主页面，支持多种视图切换和任务操作。

### 页面结构
```html
<view class="container">
  <!-- 筛选栏 -->
  <view class="filter-bar">
    <view class="filter-item">已完成</view>
    <view class="filter-item">未完成</view>
    <view class="filter-item">象限</view>
  </view>

  <!-- 任务列表 -->
  <view class="task-list">
    <!-- 任务项 -->
  </view>

  <!-- 添加按钮 -->
  <view class="add-btn">+</view>
</view>
```

### 数据结构
```javascript
{
  filter: string,        // 当前筛选类型
  tasks: Array,         // 任务列表
  taskGroups: Array,    // 分组后的任务
  dragTask: Object,     // 拖拽中的任务
  dragOverGroup: string // 拖拽目标分组
}
```

### 主要方法
```javascript
// 加载任务
async loadTasks()

// 切换筛选
setFilter(type)

// 切换任务状态
toggleTaskStatus(taskId)

// 拖拽相关
onTaskDragStart(e)
onTaskDragEnd(e)
onQuadrantDrop(e)
```

## 2. 日历页 (pages/calendar/calendar)

### 功能描述
日历视图页面，展示任务日程和农历信息。

### 页面结构
```html
<view class="container">
  <!-- 日历组件 -->
  <calendar 
    show-lunar="{{true}}"
    tasks="{{tasks}}"
  />

  <!-- 日期详情 -->
  <view class="date-detail">
    <!-- 任务列表 -->
  </view>
</view>
```

### 数据结构
```javascript
{
  selectedDate: Object,  // 选中的日期
  tasks: Array,         // 任务列表
  lunarInfo: Object     // 农历信息
}
```

## 3. 任务详情页 (pages/task/detail/index)

### 功能描述
展示和编辑任务详细信息。

### 页面结构
```html
<view class="container">
  <!-- 任务信息 -->
  <view class="task-detail">
    <!-- 基本信息 -->
    <view class="basic-info">
      <text class="title">{{task.title}}</text>
      <text class="notes">{{task.notes}}</text>
    </view>

    <!-- 时间信息 -->
    <view class="time-info">
      <!-- 开始时间 -->
      <!-- 截止时间 -->
    </view>

    <!-- 其他信息 -->
    <view class="other-info">
      <!-- 位置 -->
      <!-- 链接 -->
    </view>
  </view>

  <!-- 操作按钮 -->
  <view class="action-buttons">
    <!-- 编辑 -->
    <!-- 删除 -->
  </view>
</view>
```

### 数据结构
```javascript
{
  task: {
    id: string,
    title: string,
    notes: string,
    startTime: string,
    dueDate: string,
    location: string,
    url: string,
    priority: number,
    completed: boolean
  },
  showEditModal: boolean
}
```

## 4. 设置页 (pages/settings/settings)

### 功能描述
应用设置和个性化配置。

### 主要功能
- 主题设置
- 提醒设置
- 数据管理
- 关于信息

### 数据结构
```javascript
{
  theme: string,
  notificationEnabled: boolean,
  version: string
}
```

## 通知日志页面 (pages/notification/logs/index)

通知历史记录页面。

### 功能
- 查看通知历史
- 标记通知已读
- 删除通知
- 通知筛选

### 页面结构
```html
<view class="container">
  <!-- 筛选器 -->
  <view class="filter-section">
    <!-- 筛选条件 -->
  </view>

  <!-- 通知列表 -->
  <view class="notification-list">
    <!-- 通知项 -->
  </view>
</view>
``` 