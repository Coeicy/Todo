class NotificationManager {
  constructor() {
    this.supabase = getApp().globalData.supabase
    // 通知模板配置
    this.templates = {
      taskReminder: 'tmpl_xxx1', // 任务提醒模板
      taskOverdue: 'tmpl_xxx2',  // 任务过期提醒模板
      taskUpdate: 'tmpl_xxx3',   // 任务更新提醒模板
      dailyDigest: 'tmpl_xxx4'   // 每日摘要模板
    }

    // 提醒时间选项（分钟）
    this.reminderOptions = [
      { label: '5分钟前', value: 5 },
      { label: '15分钟前', value: 15 },
      { label: '30分钟前', value: 30 },
      { label: '1小时前', value: 60 },
      { label: '2小时前', value: 120 },
      { label: '1天前', value: 1440 }
    ]

    // 初始化通知权限
    this._initPermission()
  }

  // 初始化通知权限
  async _initPermission() {
    try {
      const setting = await wx.getSetting()
      // 只记录权限状态，不主动请求
      this.hasPermission = setting.authSetting['scope.notification'] || false
    } catch (error) {
      console.error('初始化通知权限失败:', error)
      this.hasPermission = false
    }
  }

  // 获取提醒时间选项
  getReminderOptions() {
    return this.reminderOptions
  }

  // 计算提醒时间
  calculateReminderTime(dueDate, minutesBefore) {
    if (!dueDate) return null
    return new Date(new Date(dueDate).getTime() - minutesBefore * 60 * 1000)
  }

  // 设置任务提醒
  async scheduleTaskReminder(task, minutesBefore) {
    if (!task || !task.dueDate) return false

    const reminderTime = this.calculateReminderTime(task.dueDate, minutesBefore)
    if (!reminderTime || reminderTime < new Date()) return false

    try {
      const res = await wx.requestSubscribeMessage({
        tmplIds: [this.templates.taskReminder]
      })

      if (res[this.templates.taskReminder] === 'accept') {
        await this._sendNotification(task, 'taskReminder', {
          title: task.title,
          time: reminderTime.toLocaleString(),
          note: `任务将在${minutesBefore}分钟后到期`
        })
        
        // 记录提醒设置
        wx.setStorageSync(`reminder_${task.id}`, {
          taskId: task.id,
          reminderTime: reminderTime.toISOString(),
          minutesBefore,
          setAt: new Date().toISOString()
        })
        
        return true
      }
    } catch (error) {
      console.error('设置任务提醒失败:', error)
    }
    
    return false
  }

  // 发送每日任务摘要
  async sendDailyDigest(tasks) {
    try {
      const res = await wx.requestSubscribeMessage({
        tmplIds: [this.templates.dailyDigest]
      })

      if (res[this.templates.dailyDigest] === 'accept') {
        const today = new Date()
        const todayTasks = tasks.filter(t => {
          const dueDate = new Date(t.dueDate)
          return dueDate.toDateString() === today.toDateString()
        })

        if (todayTasks.length > 0) {
          await this._sendNotification(null, 'dailyDigest', {
            date: today.toLocaleDateString(),
            count: todayTasks.length,
            summary: `今日待办：${todayTasks.map(t => t.title).join('、')}`
          })
        }
      }
    } catch (error) {
      console.error('发送每日摘要失败:', error)
    }
  }

  // 发送任务过期提醒
  async sendOverdueNotification(task) {
    try {
      const res = await wx.requestSubscribeMessage({
        tmplIds: [this.templates.taskOverdue]
      })

      if (res[this.templates.taskOverdue] === 'accept') {
        await this._sendNotification(task, 'taskOverdue', {
          title: task.title,
          dueTime: new Date(task.dueDate).toLocaleString(),
          status: '已过期'
        })
      }
    } catch (error) {
      console.error('发送过期提醒失败:', error)
    }
  }

  // 内部发送通知方法
  async _sendNotification(task, type, data) {
    try {
      await wx.cloud.callFunction({
        name: 'sendNotification',
        data: {
          type,
          templateId: this.templates[type],
          taskId: task?.id,
          data
        }
      })

      // 记录通知发送记录
      this._recordNotification(task?.id, type, data)
    } catch (error) {
      console.error('发送通知失败:', error)
      throw error
    }
  }

  // 记录通知发送记录
  _recordNotification(taskId, type, data) {
    const record = {
      taskId,
      type,
      data,
      sentAt: new Date().toISOString()
    }

    const records = wx.getStorageSync('notification_records') || []
    records.unshift(record)
    
    // 只保留最近100条记录
    if (records.length > 100) {
      records.length = 100
    }
    
    wx.setStorageSync('notification_records', records)
  }

  // 调度通知
  scheduleNotification(task, reminderTime) {
    if (!task || !reminderTime) return false

    const now = new Date()
    const remindAt = new Date(reminderTime)
    
    // 如果提醒时间已过，不发送通知
    if (remindAt < now) return false

    // 发送订阅消息
    wx.requestSubscribeMessage({
      tmplIds: ['your-template-id'], // 替换为实际的模板ID
      success: (res) => {
        if (res['your-template-id'] === 'accept') {
          this._sendNotification(task)
        }
      }
    })

    return true
  }

  // 取消通知
  cancelNotification(taskId) {
    // 由于小程序限制，无法直接取消已经发送的订阅消息
    // 这里可以记录取消状态，用于后续逻辑判断
    wx.setStorageSync(`notification_${taskId}`, {
      canceled: true,
      cancelTime: new Date().toISOString()
    })
  }

  // 清除所有通知
  clearAllNotifications() {
    // 清除所有通知相关的存储
    const keys = wx.getStorageInfoSync().keys
    keys.forEach(key => {
      if (key.startsWith('notification_')) {
        wx.removeStorageSync(key)
      }
    })
  }

  // 检查通知状态
  checkNotificationStatus(taskId) {
    const status = wx.getStorageSync(`notification_${taskId}`)
    if (!status) return null
    
    return {
      ...status,
      cancelTime: status.cancelTime ? new Date(status.cancelTime) : null
    }
  }

  // 获取最近的通知记录
  getRecentNotifications(limit = 10) {
    const keys = wx.getStorageInfoSync().keys
    const notifications = []
    
    keys.forEach(key => {
      if (key.startsWith('notification_')) {
        const status = wx.getStorageSync(key)
        if (status) {
          notifications.push({
            taskId: key.replace('notification_', ''),
            ...status
          })
        }
      }
    })

    return notifications
      .sort((a, b) => new Date(b.cancelTime) - new Date(a.cancelTime))
      .slice(0, limit)
  }

  // 清理过期的通知记录
  cleanupOldNotifications(days = 7) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const keys = wx.getStorageInfoSync().keys
    keys.forEach(key => {
      if (key.startsWith('notification_')) {
        const status = wx.getStorageSync(key)
        if (status && status.cancelTime) {
          const cancelTime = new Date(status.cancelTime)
          if (cancelTime < cutoff) {
            wx.removeStorageSync(key)
          }
        }
      }
    })
  }

  // 批量设置任务提醒
  async scheduleBatchReminders(tasks, minutesBefore) {
    return this._batchWithConcurrency(
      tasks,
      task => this.scheduleTaskReminder(task, minutesBefore)
    )
  }

  // 获取任务的所有提醒设置
  getTaskReminders(taskId) {
    const keys = wx.getStorageInfoSync().keys
    const reminders = []
    
    keys.forEach(key => {
      if (key.startsWith(`reminder_${taskId}`)) {
        const reminder = wx.getStorageSync(key)
        if (reminder) {
          reminders.push({
            ...reminder,
            reminderTime: new Date(reminder.reminderTime),
            setAt: new Date(reminder.setAt)
          })
        }
      }
    })

    return reminders.sort((a, b) => b.setAt - a.setAt)
  }

  // 获取所有待发送的提醒
  getPendingReminders() {
    const now = new Date()
    const keys = wx.getStorageInfoSync().keys
    const pending = []
    
    keys.forEach(key => {
      if (key.startsWith('reminder_')) {
        const reminder = wx.getStorageSync(key)
        if (reminder && !reminder.sent) {
          const reminderTime = new Date(reminder.reminderTime)
          if (reminderTime > now) {
            pending.push({
              ...reminder,
              reminderTime,
              setAt: new Date(reminder.setAt)
            })
          }
        }
      }
    })

    return pending.sort((a, b) => a.reminderTime - b.reminderTime)
  }

  // 检查并发送到期提醒
  async checkAndSendDueReminders() {
    const now = new Date()
    const pending = this.getPendingReminders()
    
    for (const reminder of pending) {
      if (reminder.reminderTime <= now) {
        const task = await this._getTaskInfo(reminder.taskId)
        if (task && !task.completed) {
          await this._sendNotification(task, 'taskReminder', {
            title: task.title,
            time: reminder.reminderTime.toLocaleString(),
            note: '任务即将到期'
          })
          
          // 标记提醒已发送
          wx.setStorageSync(`reminder_${reminder.taskId}`, {
            ...reminder,
            sent: true,
            sentAt: new Date().toISOString()
          })
        }
      }
    }
  }

  // 设置自定义提醒
  async setCustomReminder(task, options) {
    const {
      minutesBefore,
      repeat = false,
      repeatInterval,
      repeatCount,
      customMessage
    } = options

    try {
      const success = await this.scheduleTaskReminder(task, minutesBefore)
      if (success && repeat) {
        // 记录重复提醒设置
        wx.setStorageSync(`reminder_repeat_${task.id}`, {
          taskId: task.id,
          minutesBefore,
          repeatInterval,
          repeatCount,
          customMessage,
          currentCount: 0,
          createdAt: new Date().toISOString()
        })
      }
      return success
    } catch (error) {
      console.error('设置自定义提醒失败:', error)
      return false
    }
  }

  // 处理重复提醒
  async processRepeatReminders() {
    const keys = wx.getStorageInfoSync().keys
    const now = new Date()
    
    for (const key of keys) {
      if (key.startsWith('reminder_repeat_')) {
        const repeat = wx.getStorageSync(key)
        if (repeat && repeat.currentCount < repeat.repeatCount) {
          const task = await this._getTaskInfo(repeat.taskId)
          if (task && !task.completed) {
            const nextReminder = new Date(repeat.lastSentAt || repeat.createdAt)
            nextReminder.setMinutes(nextReminder.getMinutes() + repeat.repeatInterval)
            
            if (nextReminder <= now) {
              await this._sendNotification(task, 'taskReminder', {
                title: task.title,
                time: now.toLocaleString(),
                note: repeat.customMessage || '重复提醒'
              })
              
              // 更新重复提醒状态
              wx.setStorageSync(key, {
                ...repeat,
                currentCount: repeat.currentCount + 1,
                lastSentAt: now.toISOString()
              })
            }
          }
        }
      }
    }
  }

  // 实现获取任务信息的方法
  async _getTaskInfo(taskId) {
    try {
      // 先从本地缓存获取
      const cachedTask = wx.getStorageSync(`task_${taskId}`)
      if (cachedTask) {
        return JSON.parse(cachedTask)
      }

      // 从云数据库获取
      const db = wx.cloud.database()
      const result = await db.collection('tasks').doc(taskId).get()
      
      if (result.data) {
        // 缓存任务信息
        wx.setStorageSync(`task_${taskId}`, JSON.stringify(result.data))
        return result.data
      }
      
      return null
    } catch (error) {
      console.error('获取任务信息失败:', error)
      return null
    }
  }

  // 错误处理包装器
  async _errorWrapper(operation, fallback = null) {
    try {
      return await operation()
    } catch (error) {
      console.error(`操作失败: ${error.message}`, error)
      return fallback
    }
  }

  // 批量操作的并发控制
  async _batchWithConcurrency(items, operation, concurrency = 3) {
    const results = []
    const chunks = []
    
    // 将任务分组
    for (let i = 0; i < items.length; i += concurrency) {
      chunks.push(items.slice(i, i + concurrency))
    }
    
    // 按组执行
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(item => this._errorWrapper(() => operation(item)))
      )
      results.push(...chunkResults)
    }
    
    return results
  }

  // 定期清理过期数据
  async cleanupExpiredData() {
    const now = new Date()
    const keys = wx.getStorageInfoSync().keys
    let cleanedCount = 0
    
    for (const key of keys) {
      try {
        if (key.startsWith('notification_') || 
            key.startsWith('reminder_') || 
            key.startsWith('task_')) {
          const data = wx.getStorageSync(key)
          
          // 检查数据是否过期
          if (this._isDataExpired(data, now)) {
            wx.removeStorageSync(key)
            cleanedCount++
          }
        }
      } catch (error) {
        console.error(`清理数据失败 ${key}:`, error)
      }
    }
    
    return cleanedCount
  }

  // 检查数据是否过期
  _isDataExpired(data, now) {
    if (!data) return true
    
    // 检查各种过期情况
    if (data.expiresAt && new Date(data.expiresAt) < now) return true
    if (data.reminderTime && new Date(data.reminderTime) < now) return true
    if (data.sent && data.sentAt && 
        new Date(data.sentAt).getTime() + 7 * 24 * 60 * 60 * 1000 < now.getTime()) {
      return true
    }
    
    return false
  }

  // 性能监控
  _startPerformanceMonitor() {
    this.performanceData = {
      operations: {},
      errors: {}
    }
  }

  _recordOperation(operation, startTime) {
    const duration = Date.now() - startTime
    if (!this.performanceData.operations[operation]) {
      this.performanceData.operations[operation] = {
        count: 0,
        totalDuration: 0,
        maxDuration: 0
      }
    }
    
    const stats = this.performanceData.operations[operation]
    stats.count++
    stats.totalDuration += duration
    stats.maxDuration = Math.max(stats.maxDuration, duration)
  }

  _recordError(operation, error) {
    if (!this.performanceData.errors[operation]) {
      this.performanceData.errors[operation] = []
    }
    this.performanceData.errors[operation].push({
      time: new Date().toISOString(),
      message: error.message,
      stack: error.stack
    })
  }

  // 获取性能报告
  getPerformanceReport() {
    const report = {
      operations: {},
      errors: this.performanceData.errors
    }
    
    // 计算每个操作的统计数据
    Object.entries(this.performanceData.operations).forEach(([op, stats]) => {
      report.operations[op] = {
        ...stats,
        averageDuration: stats.count ? stats.totalDuration / stats.count : 0
      }
    })
    
    return report
  }

  // 获取未读通知数量
  async getUnreadCount() {
    try {
      const { count } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('read', false)
      return count || 0
    } catch (error) {
      console.error('获取未读通知数失败:', error)
      return 0
    }
  }

  // 创建任务提醒
  async createTaskReminder(task) {
    try {
      // 默认在截止时间前30分钟提醒
      const reminderTime = new Date(task.dueDate)
      reminderTime.setMinutes(reminderTime.getMinutes() - 30)

      const reminder = {
        _id: `reminder_${task.id}`,
        taskId: task.id,
        title: task.title,
        content: `任务"${task.title}"将在30分钟后到期`,
        sendTime: reminderTime.toISOString(),
        sent: false,
        success: false,
        createTime: new Date().toISOString()
      }

      await wx.cloud.database().collection('reminders').add({
        data: reminder
      })

      return reminder
    } catch (error) {
      console.error('创建任务提醒失败:', error)
      return null
    }
  }

  // 请求通知权限（需要在用户点击时调用）
  async requestPermission() {
    try {
      const res = await wx.requestSubscribeMessage({
        tmplIds: Object.values(this.templates)
      })
      this.hasPermission = Object.values(res).includes('accept')
      return this.hasPermission
    } catch (error) {
      console.error('请求通知权限失败:', error)
      return false
    }
  }
}

module.exports = new NotificationManager() 