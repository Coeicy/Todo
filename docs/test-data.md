# 测试数据说明文档

## 测试任务列表

### 1. 产品评审会议
```json
{
  "id": "20240220001",
  "title": "产品评审会议",
  "notes": "讨论新功能原型设计",
  "startTime": {
    "year": "2024",
    "month": "02",
    "day": "20",
    "hour": "10",
    "minute": "00"
  },
  "dueDate": {
    "year": "2024",
    "month": "02",
    "day": "20",
    "hour": "11",
    "minute": "30"
  },
  "isAllDay": false,
  "location": "会议室A",
  "url": "https://meeting.com/123",
  "attachments": [],
  "completed": false
}
```
- 用途：测试普通会议任务
- 特点：有明确的开始和结束时间，包含会议链接

### 2. 准备周报
```json
{
  "id": "20240220002",
  "title": "准备周报",
  "notes": "整理本周工作内容和下周计划",
  "startTime": {
    "year": "2024",
    "month": "02",
    "day": "20",
    "hour": "14",
    "minute": "00"
  },
  "dueDate": {
    "year": "2024",
    "month": "02",
    "day": "20",
    "hour": "15",
    "minute": "00"
  },
  "isAllDay": false,
  "location": "办公室",
  "url": "",
  "attachments": [],
  "completed": false
}
```
- 用途：测试普通工作任务
- 特点：固定时间段，无额外链接和附件

### 3. 团建活动
```json
{
  "id": "20240225001",
  "title": "团建活动",
  "notes": "部门团建活动，地点待定",
  "startTime": {
    "year": "2024",
    "month": "02",
    "day": "25",
    "hour": "09",
    "minute": "00"
  },
  "dueDate": {
    "year": "2024",
    "month": "02",
    "day": "25",
    "hour": "17",
    "minute": "00"
  },
  "isAllDay": true,
  "location": "待定",
  "url": "",
  "attachments": [],
  "completed": false
}
```
- 用途：测试全天任务
- 特点：isAllDay为true，地点待定

### 4. 月度总结
```json
{
  "id": "20240228001",
  "title": "月度总结",
  "notes": "准备月度工作总结报告",
  "startTime": {
    "year": "2024",
    "month": "02",
    "day": "28",
    "hour": "14",
    "minute": "00"
  },
  "dueDate": {
    "year": "2024",
    "month": "02",
    "day": "28",
    "hour": "16",
    "minute": "00"
  },
  "isAllDay": false,
  "location": "大会议室",
  "url": "https://docs.google.com/monthly-report",
  "attachments": [],
  "completed": false
}
```
- 用途：测试带文档链接的任务
- 特点：包含在线文档链接

### 5. 项目启动会
```json
{
  "id": "20240301001",
  "title": "项目启动会",
  "notes": "新项目启动，讨论技术方案",
  "startTime": {
    "year": "2024",
    "month": "03",
    "day": "01",
    "hour": "10",
    "minute": "00"
  },
  "dueDate": {
    "year": "2024",
    "month": "03",
    "day": "01",
    "hour": "12",
    "minute": "00"
  },
  "isAllDay": false,
  "location": "会议室B",
  "url": "",
  "attachments": [],
  "completed": false
}
```
- 用途：测试跨月任务
- 特点：在下个月初

## 测试数据特点

1. 时间分布
   - 同一天多个任务（2月20日）
   - 全天任务（2月25日）
   - 月底任务（2月28日）
   - 跨月任务（3月1日）

2. 任务类型
   - 会议类任务
   - 文档类任务
   - 全天活动
   - 普通工作任务

3. 数据完整性
   - 必填字段全部包含
   - 可选字段部分填写
   - 不同组合的数据

## 测试要点

1. 日历视图
   - 单日多任务显示
   - 全天任务显示
   - 跨月任务显示
   - 任务时间排序

2. 列表视图
   - 任务分类显示
   - 时间排序
   - 详情展示

3. 状态切换
   - 完成状态
   - 编辑功能
   - 删除功能 