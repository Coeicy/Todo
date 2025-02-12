# 页面文档

## 首页 (pages/index/index)

任务列表主页面。

### 功能
- 显示任务列表
- 添加新任务
- 任务筛选
- 查看通知

### 页面结构
```html
<view class="container">
  <!-- 顶部工具栏 -->
  <view class="toolbar">
    <view class="title">我的任务</view>
    <notification-icon />
    <view class="add-btn" bindtap="onAddTask">+</view>
  </view>

  <!-- 任务筛选器 -->
  <task-filter current="{{currentFilter}}" bindchange="onFilterChange" />

  <!-- 任务列表 -->
  <task-list tasks="{{tasks}}" />
</view>
```

### 数据管理
```js
Page({
  data: {
    tasks: [],
    currentFilter: 'all'
  },

  async onLoad() {
    await this.loadTasks()
  },

  async loadTasks() {
    const tasks = await db.getTasks()
    this.setData({ tasks })
  }
})
```

## 日历页面 (pages/calendar/calendar)

日历视图页面。

### 功能
- 显示月历视图
- 农历和节日显示
- 任务日程展示
- 日期选择

### 页面结构
```html
<view class="container">
  <calendar 
    show-lunar="{{true}}"
    tasks="{{tasks}}"
    bind:select="onDateSelect"
  />
  
  <view class="date-detail" wx:if="{{selectedDate}}">
    <!-- 日期任务列表 -->
  </view>
</view>
```

## 任务详情页 (pages/task/detail/index)

任务详情查看和编辑页面。

### 功能
- 查看任务详情
- 编辑任务信息
- 设置提醒
- 删除任务

### 页面结构
```html
<view class="container">
  <view class="task-detail">
    <!-- 任务信息 -->
  </view>
  
  <view class="actions">
    <!-- 操作按钮 -->
  </view>
</view>
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