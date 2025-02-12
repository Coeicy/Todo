# WeTodo

一个功能丰富的日历待办事项小程序，支持农历、节假日等功能。

## 功能特点

- 任务管理
  - 添加、编辑、删除任务
  - 设置任务优先级
  - 任务分类和标签
  - 任务提醒

- 日历功能
  - 农历和节假日显示
  - 任务日历视图
  - 宜忌提示

- 其他功能
  - 深色模式
  - 自定义主题色
  - 数据备份

## 开发环境

- 微信开发者工具
- Node.js >= 14.0.0
- npm >= 6.0.0

## 项目设置

1. 克隆项目
```bash
git clone https://github.com/your-username/wetodo.git
cd wetodo
```

2. 安装依赖
```bash
npm install
```

3. 在微信开发者工具中打开项目
- 导入项目
- 选择项目目录
- 填入自己的 AppID

## 目录结构

```
wetodo/
├── assets/          # 静态资源
├── components/      # 公共组件
├── pages/          # 页面文件
├── utils/          # 工具函数
├── app.js          # 入口文件
├── app.json        # 全局配置
├── app.wxss        # 全局样式
└── project.config.json  # 项目配置
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情
