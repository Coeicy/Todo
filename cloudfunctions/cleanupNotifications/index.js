// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const now = new Date()

  try {
    // 设置清理条件
    const cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7天前
    const query = {
      createTime: _.lt(cutoffTime),
      $or: [
        { read: true },
        { sent: true, success: true }
      ]
    }

    // 获取需要清理的通知记录
    const notifications = await db.collection('notification_logs')
      .where(query)
      .limit(1000)
      .get()
      .then(res => res.data)

    if (notifications.length === 0) {
      return {
        success: true,
        message: '没有需要清理的通知',
        cleaned: 0
      }
    }

    // 删除通知记录
    const deletePromises = notifications.map(notification => 
      db.collection('notification_logs').doc(notification._id).remove()
    )
    await Promise.all(deletePromises)

    // 记录清理操作
    await db.collection('system_logs').add({
      data: {
        type: 'cleanup_notifications',
        count: notifications.length,
        cutoffTime,
        createTime: db.serverDate()
      }
    })

    // 清理相关的提醒记录
    const reminderKeys = notifications
      .filter(n => n.taskId)
      .map(n => `reminder_${n.taskId}`)

    if (reminderKeys.length > 0) {
      const reminderQuery = {
        _id: _.in(reminderKeys),
        sent: true,
        sendTime: _.lt(cutoffTime)
      }

      await db.collection('reminders')
        .where(reminderQuery)
        .remove()
    }

    return {
      success: true,
      message: '清理完成',
      cleaned: {
        notifications: notifications.length,
        reminders: reminderKeys.length
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 