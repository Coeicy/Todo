# 开发指南

## 环境准备

1. 开发工具
- 微信开发者工具
- VS Code 或其他编辑器
- Node.js >= 14.0.0
- npm >= 6.0.0

2. 项目配置
- 申请微信小程序 AppID
- 开启小程序开发模式
- 配置开发者权限

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/your-username/wetodo.git
cd wetodo
```

2. 安装依赖
```bash
npm install
```

3. 导入项目到微信开发者工具
- 选择项目目录
- 填入 AppID
- 开启 ES6 转 ES5
- 开启增强编译

## 项目结构

```
wetodo/
├── components/        # 组件目录
│   ├── calendar/     # 日历组件
│   ├── task-list/    # 任务列表组件
│   └── ...
├── pages/            # 页面目录
│   ├── index/        # 首页
│   ├── calendar/     # 日历页
│   └── ...
├── utils/            # 工具函数
│   ├── db.js           # 数据存储
│   ├── storage.js      # 存储工具
│   ├── date.js         # 日期工具
│   ├── lunar.js        # 农历工具
│   ├── util.js         # 通用工具
│   └── ...
└── docs/             # 文档目录
```

## 开发规范

### 1. 代码风格
- 使用 ES6+ 语法
- 2空格缩进
- 使用分号结尾
- 使用单引号

### 2. 命名规范
```js
// 组件命名
components/
  notification-icon/
  task-list/

// 变量命名
const taskList = [];
const isCompleted = true;

// 函数命名
function handleClick() {}
function loadTaskList() {}
```

### 3. 注释规范
```js
/**
 * 创建任务
 * @param {Object} taskData - 任务数据
 * @param {string} taskData.title - 任务标题
 * @param {string} taskData.notes - 任务备注
 * @returns {Object} 创建的任务对象
 */
function createTask(taskData) {
  // ...
}
```

## 功能开发

### 1. 添加新组件
```bash
# 创建组件目录
mkdir components/my-component

# 创建组件文件
touch components/my-component/index.js
touch components/my-component/index.wxml
touch components/my-component/index.wxss
touch components/my-component/index.json
```

### 2. 添加新页面
```bash
# 创建页面目录
mkdir pages/new-page

# 创建页面文件
touch pages/new-page/index.js
touch pages/new-page/index.wxml
touch pages/new-page/index.wxss
touch pages/new-page/index.json

# 在 app.json 中注册页面
{
  "pages": [
    "pages/new-page/index"
  ]
}
```

### 3. 使用通知系统
```js
const notification = require('../../utils/notification')

// 创建提醒
await notification.scheduleTaskReminder(task, 30)

// 处理通知
Page({
  async onLoad() {
    const unreadCount = await notification.getUnreadCount()
    this.setData({ unreadCount })
  }
})
```

## 调试技巧

### 1. 本地存储调试
```js
// 查看存储数据
const data = wx.getStorageSync('key')
console.log('Storage Data:', data)

// 清除存储
wx.clearStorageSync()
```

### 2. 性能优化
```js
// 避免频繁 setData
const data = {}
items.forEach(item => {
  data[`items[${item.index}]`] = item
})
this.setData(data)

// 使用防抖
const debounce = require('../../utils/debounce')
const debouncedUpdate = debounce(this.updateData, 300)
```

### 3. 错误处理
```js
try {
  await operation()
} catch (error) {
  console.error('操作失败:', error)
  wx.showToast({
    title: '操作失败',
    icon: 'none'
  })
}
```

## 测试指南

### 1. 运行测试
```bash
# 运行所有测试
npm test

# 运行指定测试
npm test -- -t "NotificationManager"
```

### 2. 编写测试
```js
describe('MyComponent', () => {
  beforeEach(() => {
    // 测试准备
  })

  test('should work correctly', () => {
    // 测试逻辑
  })
})
```

## 发布流程

1. 版本更新
```bash
# 更新版本号
npm version patch/minor/major
```

2. 代码提交
```bash
git add .
git commit -m "feat: add new feature"
git push
```

3. 发布准备
- 更新 README.md
- 更新 CHANGELOG.md
- 检查测试覆盖率
- 性能测试

4. 提交审核
- 填写版本信息
- 提供测试账号
- 描述更新内容

## 常见问题

### 1. 存储限制
小程序本地存储限制为 10MB，需要定期清理过期数据。

### 2. 性能问题
- 避免频繁 setData
- 合理使用分页加载
- 优化图片资源

### 3. 调试技巧
- 使用 console 调试
- 查看存储数据
- 分析性能数据 