# 贡献指南

感谢你对 WeTodo 项目的关注！这份指南将帮助你了解如何参与项目开发。

## 开始之前

### 环境准备
1. 开发工具
- 微信开发者工具
- VS Code 或其他编辑器
- Node.js >= 14.0.0
- npm >= 6.0.0

2. 项目配置
- 申请微信小程序 AppID
- 开启小程序开发模式
- 配置开发者权限

### 技术栈
- 微信小程序原生框架
- LocalStorage 数据存储
- 自定义通知系统

## 参与方式

### 1. 报告问题
在提交 Issue 前：
- 检查是否已存在相同问题
- 使用 Issue 模板
- 提供详细的复现步骤
- 附上相关的错误日志

```markdown
### 问题描述
[简要描述问题]

### 复现步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

### 期望结果
[描述期望的结果]

### 实际结果
[描述实际的结果]

### 环境信息
- 设备：[设备型号]
- 系统：[系统版本]
- 小程序版本：[版本号]
```

### 2. 提交代码

#### 开发流程
1. Fork 项目仓库
2. 克隆到本地
```bash
git clone https://github.com/your-username/wetodo.git
cd wetodo
```

3. 安装依赖
```bash
npm install
```

4. 创建特性分支
```bash
git checkout -b feature/your-feature
```

5. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature
```

6. 创建 Pull Request

#### 分支命名规范
- 功能开发：`feature/feature-name`
- 问题修复：`fix/issue-description`
- 文档更新：`docs/update-description`
- 性能优化：`perf/optimization-description`

#### 提交信息规范
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型说明：
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- perf: 性能优化
- test: 添加测试
- chore: 构建过程或辅助工具的变动

### 3. 代码规范

#### 基本规则
- 使用 ES6+ 语法
- 2空格缩进
- 使用分号结尾
- 使用单引号

#### 命名规范
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

#### 注释规范
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

### 4. 测试要求

#### 单元测试
```js
describe('NotificationManager', () => {
  beforeEach(() => {
    // 测试准备
  })

  test('should create notification', async () => {
    // 测试逻辑
  })
})
```

#### 测试覆盖率要求
- 通知系统: > 90%
- 数据库操作: > 85%
- UI组件: > 80%
- 工具函数: > 90%

### 5. 文档维护

#### 文档类型
- README.md: 项目说明
- API.md: 接口文档
- CHANGELOG.md: 更新日志
- CONTRIBUTING.md: 贡献指南

#### 文档规范
- 使用 Markdown 格式
- 保持结构清晰
- 提供代码示例
- 及时更新内容

## 发布流程

### 版本管理
1. 更新版本号
```bash
npm version patch/minor/major
```

2. 更新文档
- 更新 CHANGELOG.md
- 更新 API 文档
- 更新使用说明

3. 提交代码
```bash
git add .
git commit -m "release: v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### 发布检查清单
- [ ] 所有测试通过
- [ ] 代码规范检查通过
- [ ] 文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新
- [ ] 性能测试通过

## 其他说明

### 行为准则
- 保持友善和专业的交流态度
- 尊重其他贡献者的观点
- 遵循项目的代码规范
- 及时响应反馈和建议

### 版权说明
- 代码使用 MIT 协议
- 确保代码原创性
- 注明第三方代码来源

### 联系方式
- Issue: 功能讨论和问题报告
- Pull Request: 代码贡献和审查
- Email: support@wetodo.com 