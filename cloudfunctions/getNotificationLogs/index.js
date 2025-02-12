// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { 
    type,       // 通知类型
    taskId,     // 任务ID
    startDate,  // 开始日期
    endDate,    // 结束日期
    success,    // 是否成功
    page = 1,   // 页码
    pageSize = 20 // 每页数量
  } = event
  
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate

  try {
    // 构建查询条件
    const query = {
      openid: wxContext.OPENID
    }

    if (type) query.type = type
    if (taskId) query.taskId = taskId
    if (typeof success === 'boolean') query.success = success
    
    // 日期范围查询
    if (startDate || endDate) {
      query.createTime = {}
      if (startDate) query.createTime = _.gte(new Date(startDate))
      if (endDate) query.createTime = _.lte(new Date(endDate))
    }

    // 获取总数
    const countResult = await db.collection('notification_logs')
      .where(query)
      .count()

    // 获取分页数据
    const logs = await db.collection('notification_logs')
      .where(query)
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    // 统计分析
    const stats = await db.collection('notification_logs')
      .aggregate()
      .match(query)
      .group({
        _id: '$type',
        total: $.sum(1),
        success: $.sum($.cond({
          if: '$success',
          then: 1,
          else: 0
        })),
        failed: $.sum($.cond({
          if: '$success',
          then: 0,
          else: 1
        }))
      })
      .end()

    return {
      success: true,
      data: {
        logs: logs.data,
        total: countResult.total,
        page,
        pageSize,
        totalPages: Math.ceil(countResult.total / pageSize),
        stats: stats.list.reduce((acc, curr) => {
          acc[curr._id] = {
            total: curr.total,
            success: curr.success,
            failed: curr.failed,
            successRate: Math.round((curr.success / curr.total) * 100)
          }
          return acc
        }, {})
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 