// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, templateId, taskId, data } = event
  const wxContext = cloud.getWXContext()

  try {
    // 获取用户的 openid
    const openid = wxContext.OPENID
    if (!openid) {
      throw new Error('未获取到用户 openid')
    }

    // 根据不同类型的通知使用不同的模板
    const templateData = formatTemplateData(type, data)

    // 发送订阅消息
    const result = await cloud.openapi.subscribeMessage.send({
      touser: openid,
      templateId,
      data: templateData,
      page: getTargetPage(type, taskId)
    })

    // 记录发送日志
    await recordNotificationLog({
      openid,
      type,
      taskId,
      data: templateData,
      result,
      success: true
    })

    return {
      success: true,
      result
    }

  } catch (error) {
    // 记录错误日志
    await recordNotificationLog({
      openid: wxContext.OPENID,
      type,
      taskId,
      error: error.message,
      success: false
    })

    return {
      success: false,
      error: error.message
    }
  }
}

// 格式化模板数据
function formatTemplateData(type, data) {
  switch (type) {
    case 'taskReminder':
      return {
        thing1: { value: data.title },
        time2: { value: data.time },
        thing3: { value: data.note }
      }
    case 'taskOverdue':
      return {
        thing1: { value: data.title },
        time2: { value: data.dueTime },
        phrase3: { value: data.status }
      }
    case 'dailyDigest':
      return {
        date1: { value: data.date },
        number2: { value: data.count },
        thing3: { value: data.summary }
      }
    default:
      throw new Error(`未知的通知类型: ${type}`)
  }
}

// 获取目标页面
function getTargetPage(type, taskId) {
  switch (type) {
    case 'taskReminder':
    case 'taskOverdue':
      return taskId ? `/pages/task/detail/index?id=${taskId}` : '/pages/index/index'
    case 'dailyDigest':
      return '/pages/index/index'
    default:
      return '/pages/index/index'
  }
}

// 记录通知日志
async function recordNotificationLog(logData) {
  const db = cloud.database()
  
  try {
    await db.collection('notification_logs').add({
      data: {
        ...logData,
        createTime: db.serverDate()
      }
    })
  } catch (error) {
    console.error('记录通知日志失败:', error)
  }
} 