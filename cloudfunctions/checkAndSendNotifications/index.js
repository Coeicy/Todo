// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const now = new Date()

  try {
    // 查找需要发送的提醒
    const reminders = await db.collection('reminders')
      .where({
        reminderTime: _.lte(now),
        sent: false,
        cancelled: false
      })
      .limit(100)
      .get()
      .then(res => res.data)

    if (reminders.length === 0) {
      return {
        success: true,
        message: '没有需要发送的通知',
        sent: 0
      }
    }

    // 按用户分组提醒
    const userReminders = reminders.reduce((acc, reminder) => {
      if (!acc[reminder.openid]) {
        acc[reminder.openid] = []
      }
      acc[reminder.openid].push(reminder)
      return acc
    }, {})

    // 处理每个用户的提醒
    const results = await Promise.all(
      Object.entries(userReminders).map(async ([openid, userReminders]) => {
        try {
          // 获取用户的订阅状态
          const subscribeResult = await cloud.openapi.subscribeMessage.getTemplateList({
            openid
          })

          // 发送通知
          const sendPromises = userReminders.map(async reminder => {
            try {
              // 获取任务信息
              const task = await db.collection('tasks')
                .doc(reminder.taskId)
                .get()
                .then(res => res.data)
                .catch(() => null)

              if (!task || task.completed) {
                // 任务不存在或已完成，标记提醒为已发送
                await db.collection('reminders').doc(reminder._id).update({
                  data: {
                    sent: true,
                    sendTime: db.serverDate(),
                    error: '任务已完成或不存在'
                  }
                })
                return {
                  success: false,
                  error: '任务已完成或不存在'
                }
              }

              // 发送订阅消息
              await cloud.openapi.subscribeMessage.send({
                touser: openid,
                templateId: reminder.templateId,
                data: {
                  thing1: { value: task.title },
                  time2: { value: new Date(task.dueDate).toLocaleString() },
                  thing3: { value: reminder.note || '任务提醒' }
                },
                page: `/pages/task/detail/index?id=${task.id}`
              })

              // 更新提醒状态
              await db.collection('reminders').doc(reminder._id).update({
                data: {
                  sent: true,
                  sendTime: db.serverDate()
                }
              })

              return { success: true }
            } catch (error) {
              // 记录发送失败
              await db.collection('reminders').doc(reminder._id).update({
                data: {
                  error: error.message
                }
              })
              return {
                success: false,
                error: error.message
              }
            }
          })

          return await Promise.all(sendPromises)
        } catch (error) {
          return userReminders.map(() => ({
            success: false,
            error: error.message
          }))
        }
      })
    )

    // 统计结果
    const stats = results.flat().reduce((acc, result) => {
      acc[result.success ? 'success' : 'failed']++
      return acc
    }, { success: 0, failed: 0 })

    return {
      success: true,
      message: '通知发送完成',
      ...stats
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
} 