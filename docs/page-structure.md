# 页面结构说明

## 1. 主要页面

### 1.1 首页 (pages/index/index)
主要功能：任务总览和管理
```
pages/
└── index/
    ├── index.js    // 页面逻辑
    ├── index.wxml  // 页面结构
    ├── index.wxss  // 页面样式
    └── index.json  // 页面配置
```
包含内容：
1. 顶部导航栏
   - 标题："我的任务"
   - 通知图标（显示未读数）
   - 搜索按钮

2. 统计卡片
   - 总任务数
   - 已完成数
   - 重要任务数

3. 任务列表
   - 任务筛选标签（全部/今天/重要/已完成）
   - 任务项（包含标题、时间、地点、优先级标记）
   - 空状态提示

4. 悬浮添加按钮
   - 右下角圆形按钮

### 1.2 日历页面 (pages/calendar/calendar)
主要功能：日历视图和日程管理
```
pages/
└── calendar/
    ├── calendar.js
    ├── calendar.wxml
    ├── calendar.wxss
    └── calendar.json
```
包含内容：
1. 月历视图
   - 月份切换
   - 农历显示
   - 节假日显示
   - 任务标记点

2. 当日任务列表
   - 日期信息
   - 任务列表
   - 添加任务按钮

### 1.3 任务详情页 (pages/task/detail/index)
主要功能：查看和编辑任务详情
```
pages/task/
└── detail/
    ├── index.js
    ├── index.wxml
    ├── index.wxss
    └── index.json
```
包含内容：
1. 任务基本信息
   - 标题
   - 优先级
   - 完成状态

2. 时间信息
   - 开始时间
   - 结束时间
   - 是否全天

3. 其他信息
   - 地点
   - 备注
   - 附件列表
   - 相关链接

4. 操作按钮
   - 编辑
   - 删除
   - 分享

### 1.4 添加任务页面 (pages/task/add/index)
主要功能：创建新任务
```
pages/task/
└── add/
    ├── index.js
    ├── index.wxml
    ├── index.wxss
    └── index.json
```
包含内容：
1. 任务表单
   - 标题输入框
   - 优先级选择（😐普通/🙂一般/😟重要/😨紧急）
   - 时间设置
   - 地点输入
   - 备注输入
   - 附件上传

2. 底部按钮
   - 保存
   - 取消

### 1.5 设置页面 (pages/settings/settings)
主要功能：应用设置和数据管理
```
pages/
└── settings/
    ├── settings.js
    ├── settings.wxml
    ├── settings.wxss
    └── settings.json
```
包含内容：
1. 主题设置
   - 深色模式开关
   - 主题颜色选择

2. 日历设置
   - 显示农历开关
   - 显示节日开关
   - 周起始日选择

3. 提醒设置
   - 开启提醒开关
   - 默认提醒时间

4. 数据管理
   - 导出数据
   - 导入数据
   - 清除数据

5. 关于信息
   - 版本信息
   - 检查更新
   - 意见反馈

## 2. 组件

### 2.1 通知图标组件 (components/notification-icon)
```
components/
└── notification-icon/
    ├── index.js
    ├── index.wxml
    ├── index.wxss
    └── index.json
```

### 2.2 日历组件 (components/calendar)
```
components/
└── calendar/
    ├── index.js
    ├── index.wxml
    ├── index.wxss
    └── index.json
```

### 2.3 任务列表组件 (components/task-list)
```
components/
└── task-list/
    ├── index.js
    ├── index.wxml
    ├── index.wxss
    └── index.json
```

## 3. 工具类

### 3.1 数据库工具 (utils/db.js)
- 任务管理
- 附件管理
- 数据导入导出

### 3.2 时间工具 (utils/time.js)
- 时间解析
- 日期格式化
- 农历转换

### 3.3 通知工具 (utils/notification.js)
- 提醒设置
- 消息推送
- 通知管理 