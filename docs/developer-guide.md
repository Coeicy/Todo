# WeTodo 开发者文档

## 1. 项目概述

WeTodo 是一个任务管理小程序，主要功能包括：
- 任务管理（创建、编辑、删除任务）
- 日历视图
- 任务提醒
- 数据统计

### 1.1 核心功能

1. 任务管理
   - 创建新任务
   - 设置任务优先级
   - 添加任务备注
   - 设置开始/结束时间
   - 添加任务地点
   - 标记任务完成状态

2. 日历功能
   - 显示农历日期
   - 显示节假日
   - 显示任务标记
   - 日期选择

3. 提醒功能
   - 自定义提醒时间
   - 任务到期提醒
   - 通知管理

## 2. 页面说明

### 2.1 首页 (pages/index)
主页面，显示任务列表和统计信息：
- 顶部显示任务统计（总数、已完成、重要）
- 任务分类标签（全部、今日、重要）
- 任务列表
- 右下角添加按钮

### 2.2 日历页面 (pages/calendar)
日历视图页面：
- 月历视图
- 显示农历和节日
- 显示任务标记
- 点击日期显示当日任务

### 2.3 任务详情页面 (pages/task/detail)
查看和编辑任务详情：
- 任务标题
- 任务描述
- 时间设置
- 地点信息
- 重要程度
- 提醒设置

### 2.4 设置页面 (pages/settings)
应用设置：
- 主题设置
- 提醒设置
- 日历设置
- 数据管理

## 3. 数据结构

### 3.1 任务数据
每个任务包含以下信息：
```json
{
  "id": "任务ID",
  "title": "任务标题",
  "notes": "任务备注",
  "startTime": "开始时间",
  "endTime": "结束时间",
  "location": "任务地点",
  "priority": "优先级(0-3)",
  "completed": "是否完成",
  "important": "是否重要",
  "createTime": "创建时间"
}
```

### 3.2 提醒数据
每个提醒包含：
```json
{
  "id": "提醒ID",
  "taskId": "关联任务ID",
  "time": "提醒时间",
  "type": "提醒类型",
  "status": "提醒状态"
}
```

## 4. 操作流程

### 4.1 创建任务
1. 点击首页右下角的"+"按钮
2. 填写任务信息：
   - 输入标题（必填）
   - 设置时间（可选）
   - 选择地点（可选）
   - 添加备注（可选）
3. 点击"确定"保存

### 4.2 编辑任务
1. 在任务列表中点击任务
2. 在详情页面点击"编辑"
3. 修改任务信息
4. 点击"保存"更新

### 4.3 设置提醒
1. 在任务详情页面
2. 点击"提醒"选项
3. 选择提醒时间
4. 确认设置

## 5. 数据管理

### 5.1 本地存储
- 任务数据存储在本地
- 定期清理已完成任务
- 数据备份建议

### 5.2 数据限制
- 单个任务大小限制：50KB
- 建议任务数量：<1000条
- 总存储限制：10MB

## 6. 注意事项

### 6.1 性能建议
1. 定期清理数据
2. 避免存储大量图片
3. 及时处理提醒

### 6.2 使用限制
1. 需要授权通知权限
2. 需要授权位置权限（如使用地点功能）
3. 需要稳定的网络连接

## 7. 常见问题

### 7.1 提醒不工作
可能原因：
- 未授权通知权限
- 系统设置禁用通知
- 任务时间已过期

### 7.2 数据丢失
预防措施：
- 定期备份数据
- 避免频繁清理缓存
- 保持足够存储空间

## 8. 更新维护

### 8.1 版本更新
- 定期检查更新
- 关注新功能发布
- 及时更新应用

### 8.2 数据维护
- 定期清理无用数据
- 检查提醒设置
- 整理任务分类

## 9. 联系支持

如遇到问题，可通过以下方式获取帮助：
- 提交问题反馈
- 查看帮助文档
- 联系技术支持

## 10. 未来规划

计划添加的功能：
- 数据云同步
- 团队协作
- 数据分析
- 自定义主题
- 导入导出

## 1. 页面导航结构

### 1.1 底部导航栏
- 【任务】图标 - 跳转到任务列表页
- 【日历】图标 - 跳转到日历页面
- 【设置】图标 - 跳转到设置页面

### 1.2 主要页面

#### A. 任务列表页 (pages/index/index)

1. 顶部区域
   - 【我的任务】标题文本
   - 【通知图标】右上角 - 显示未读通知数
   - 【+】添加按钮 - 右上角，创建新任务

2. 统计卡片
   - 【总任务数】数字 + "总任务"文本
   - 【已完成数】数字 + "已完成"文本
   - 【重要任务数】数字 + "重要"文本

3. 任务筛选栏
   - 【全部】标签按钮
   - 【今天】标签按钮
   - 【重要】标签按钮
   - 【已完成】标签按钮

4. 任务列表区域
   每个任务项包含：
   - 【✓】勾选框 - 标记完成
   - 【任务标题】文本
   - 【⭐】星标按钮 - 标记重要
   - 【时间信息】文本
   - 【地点信息】文本（如有）

5. 悬浮按钮
   - 【+】大号圆形按钮 - 右下角添加任务

#### B. 日历页面 (pages/calendar/calendar)

1. 日历头部
   - 【◀】上月按钮
   - 【2024年1月】年月文本
   - 【▶】下月按钮
   - 【今天】快捷按钮

2. 星期栏
   - 【日】【一】【二】【三】【四】【五】【六】文本

3. 日期格子
   每个日期格子包含：
   - 【日期数字】如"15"
   - 【农历日期】如"廿三"
   - 【节日名称】如"春节"
   - 【任务标记点】彩色圆点

4. 当日任务面板
   - 【日期信息】标题
   - 【添加任务】按钮
   - 任务列表，每项包含：
     - 【任务标题】
     - 【时间信息】
     - 【完成按钮】

#### C. 任务详情页 (pages/task/detail/index)

1. 顶部栏
   - 【<】返回按钮
   - 【任务详情】标题
   - 【编辑】按钮

2. 任务信息区
   - 【标题】输入框
   - 【重要程度】四个表情按钮
     - 😐 普通
     - 🙂 一般
     - 😟 重要
     - 😨 紧急
   - 【开始时间】日期时间选择器
   - 【结束时间】日期时间选择器
   - 【地点】位置选择器
   - 【备注】多行文本框
   - 【附件】附件列表

3. 底部操作栏
   - 【删除】按钮
   - 【保存】按钮

#### D. 设置页面 (pages/settings/settings)

1. 主题设置组
   - 【深色模式】开关
   - 【主题颜色】颜色选择器
     - 绿色
     - 蓝色
     - 紫色
     - 红色
     - 橙色

2. 日历设置组
   - 【显示农历】开关
   - 【显示节日】开关
   - 【显示节气】开关
   - 【周起始日】选择器
     - 周日开始
     - 周一开始

3. 提醒设置组
   - 【开启提醒】开关
   - 【提醒时间】选择器
     - 5分钟前
     - 15分钟前
     - 30分钟前
     - 1小时前
     - 2小时前

4. 数据管理组
   - 【导出数据】按钮
   - 【导入数据】按钮
   - 【清除数据】红色警告按钮

5. 关于信息组
   - 【当前版本】文本
   - 【检查更新】按钮
   - 【意见反馈】按钮
   - 【关于我们】按钮

## 2. 弹窗组件

### 2.1 确认弹窗
- 【确认】(确认按钮)
- 【取消】(取消按钮)

### 2.2 提示弹窗
- 【知道了】(关闭按钮)

### 2.3 任务操作弹窗
- 【编辑】(编辑按钮)
- 【删除】(删除按钮)
- 【分享】(分享按钮)
- 【取消】(取消按钮)

### 2.4 时间选择弹窗
- 【确定】(确认按钮)
- 【取消】(取消按钮)
- 【清除】(清除按钮)

## 3. 交互说明

### 3.1 滑动操作
任务列表项支持：
- 【左滑】显示 [编辑] [删除]
- 【右滑】显示 [完成] [重要]

### 3.2 长按操作
- 任务项：显示操作菜单
- 日期：快速添加任务
- 附件：预览或打开

### 3.3 双击操作
- 任务标题：快速编辑
- 日期：切换视图
- 统计数字：显示详情 