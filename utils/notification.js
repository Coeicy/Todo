class NotificationManager {
  constructor() {
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

    // 错误消息定义
    this.errorMessages = {
      PERMISSION_DENIED: '通知权限被拒绝',
      INVALID_TASK: '无效的任务数据',
      STORAGE_ERROR: '存储操作失败',
      NOTIFICATION_NOT_FOUND: '通知不存在',
      REMINDER_NOT_FOUND: '提醒设置不存在',
      ALREADY_CANCELLED: '通知已被取消',
      INVALID_TIME: '无效的时间设置',
      PAST_TIME: '不能设置过去的时间'
    }

    // 通知状态定义
    this.STATUS = {
      PENDING: 'pending',    // 等待发送
      SENT: 'sent',         // 已发送
      READ: 'read',         // 已读
      CANCELLED: 'cancelled' // 已取消
    }

    this._initPermission()
    this._startPerformanceMonitor()
  }

  // 基础通知操作
  async _sendNotification(task, type, data) {
    const startTime = Date.now()
    try {
      if (!task?.id) {
        throw new Error(this.errorMessages.INVALID_TASK)
      }

      const notification = {
        id: Date.now().toString(),
        type,
        taskId: task.id,
        data,
        sent: true,
        read: false,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      try {
        const notifications = wx.getStorageSync('notifications') || []
        notifications.unshift(notification)
        wx.setStorageSync('notifications', notifications)
      } catch (storageError) {
        throw new Error(this.errorMessages.STORAGE_ERROR)
      }

      this._recordOperation('sendNotification', startTime)
      return notification
    } catch (error) {
      this._recordError('sendNotification', error)
      throw error
    }
  }

  // 通知权限管理
  async _initPermission() {
    try {
      const setting = await wx.getSetting()
      this.hasPermission = setting.authSetting['scope.notification'] || false
    } catch (error) {
      console.error('初始化通知权限失败:', error)
      this.hasPermission = false
    }
  }

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

  // 任务提醒相关
  calculateReminderTime(dueDate, minutesBefore) {
    if (!dueDate) return null
    return new Date(new Date(dueDate).getTime() - minutesBefore * 60 * 1000)
  }

  // 检查时间是否有效
  _validateTime(time) {
    const timeValue = new Date(time).getTime()
    if (isNaN(timeValue)) {
      throw new Error(this.errorMessages.INVALID_TIME)
    }
    if (timeValue < Date.now()) {
      throw new Error(this.errorMessages.PAST_TIME)
    }
    return true
  }

  // 获取通知存储键
  _getNotificationKey(taskId) {
    return `notification_${taskId}`
  }

  // 获取提醒存储键
  _getReminderKey(taskId) {
    return `reminder_${taskId}`
  }

  // 修改 scheduleTaskReminder 方法
  async scheduleTaskReminder(task) {
    try {
      // 设置通知逻辑
    } catch (error) {
      console.error('设置任务提醒失败:', error);
      throw error;
    }
  }

  // 更新提醒时间
  async updateReminderTime(taskId, newMinutesBefore) {
    try {
      const reminder = wx.getStorageSync(this._getReminderKey(taskId))
      if (!reminder) {
        throw new Error(this.errorMessages.REMINDER_NOT_FOUND)
      }

      const task = await this._getTaskInfo(taskId)
      if (!task) {
        throw new Error(this.errorMessages.INVALID_TASK)
      }

      const newReminderTime = this.calculateReminderTime(task.dueDate, newMinutesBefore)
      this._validateTime(newReminderTime)

      // 更新提醒设置
      reminder.reminderTime = newReminderTime.toISOString()
      reminder.minutesBefore = newMinutesBefore
      reminder.updateTime = new Date().toISOString()
      
      wx.setStorageSync(this._getReminderKey(taskId), reminder)

      // 更新通知内容
      if (reminder.notificationId) {
        const notifications = wx.getStorageSync('notifications') || []
        const index = notifications.findIndex(n => n.id === reminder.notificationId)
        if (index > -1) {
          notifications[index].data.time = newReminderTime.toLocaleString()
          notifications[index].updateTime = new Date().toISOString()
          wx.setStorageSync('notifications', notifications)
        }
      }

      return true
    } catch (error) {
      console.error('更新提醒时间失败:', error)
      throw error
    }
  }

  // 获取任务的所有提醒
  getTaskReminders(taskId) {
    try {
      const reminder = wx.getStorageSync(this._getReminderKey(taskId))
      if (!reminder) return []
      
      const notifications = wx.getStorageSync('notifications') || []
      const relatedNotifications = notifications.filter(n => 
        n.taskId === taskId && n.type === 'taskReminder'
      )

      return {
        current: reminder,
        history: relatedNotifications
      }
    } catch (error) {
      console.error('获取任务提醒失败:', error)
      return { current: null, history: [] }
    }
  }

  // 通知管理
  async getUnreadCount() {
    try {
      const notifications = wx.getStorageSync('notifications') || []
      return notifications.filter(n => !n.read).length
    } catch (error) {
      console.error('获取未读通知数失败:', error)
      return 0
    }
  }

  getRecentNotifications(limit = 10) {
    const notifications = wx.getStorageSync('notifications') || []
    return notifications
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, limit)
  }

  getTaskNotifications(taskId) {
    const notifications = wx.getStorageSync('notifications') || []
    return notifications.filter(n => n.taskId === taskId)
  }

  markAsRead(notificationId) {
    const notifications = wx.getStorageSync('notifications') || []
    const index = notifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications[index].read = true
      notifications[index].updateTime = new Date().toISOString()
      wx.setStorageSync('notifications', notifications)
      return true
    }
    throw new Error(this.errorMessages.NOTIFICATION_NOT_FOUND)
  }

  deleteNotification(notificationId) {
    const notifications = wx.getStorageSync('notifications') || []
    const index = notifications.findIndex(n => n.id === notificationId)
    if (index === -1) {
      throw new Error(this.errorMessages.NOTIFICATION_NOT_FOUND)
    }
    const newNotifications = notifications.filter(n => n.id !== notificationId)
    wx.setStorageSync('notifications', newNotifications)
    return true
  }

  clearAllNotifications() {
    wx.setStorageSync('notifications', [])
    return true
  }

  cleanupOldNotifications(days = 7) {
    const notifications = wx.getStorageSync('notifications') || []
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const newNotifications = notifications.filter(n => {
      return new Date(n.createTime) >= cutoff || !n.read
    })

    wx.setStorageSync('notifications', newNotifications)
    return notifications.length - newNotifications.length
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

  getPerformanceReport() {
    const report = {
      operations: {},
      errors: this.performanceData.errors
    }
    
    Object.entries(this.performanceData.operations).forEach(([op, stats]) => {
      report.operations[op] = {
        ...stats,
        averageDuration: stats.count ? stats.totalDuration / stats.count : 0
      }
    })
    
    return report
  }

  // 批量操作通知
  async batchMarkAsRead(notificationIds) {
    const notifications = wx.getStorageSync('notifications') || []
    let updatedCount = 0

    const updatedNotifications = notifications.map(n => {
      if (notificationIds.includes(n.id) && !n.read) {
        updatedCount++
        return { ...n, read: true, updateTime: new Date().toISOString() }
      }
      return n
    })

    wx.setStorageSync('notifications', updatedNotifications)
    return updatedCount
  }

  // 获取通知统计信息
  getNotificationStats() {
    const notifications = wx.getStorageSync('notifications') || []
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1
        return acc
      }, {}),
      lastUpdate: notifications[0]?.updateTime || null
    }
  }

  // 搜索通知
  searchNotifications(keyword) {
    if (!keyword) return []
    const notifications = wx.getStorageSync('notifications') || []
    return notifications.filter(n => 
      n.data.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      n.data.note?.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 取消任务提醒
  async cancelTaskReminder(taskId) {
    try {
      // 获取提醒设置
      const reminderKey = this._getReminderKey(taskId)
      const reminder = wx.getStorageSync(reminderKey)
      
      if (!reminder) {
        throw new Error(this.errorMessages.REMINDER_NOT_FOUND)
      }
      
      if (reminder.cancelled) {
        throw new Error(this.errorMessages.ALREADY_CANCELLED)
      }

      // 更新提醒状态
      reminder.cancelled = true
      reminder.cancelTime = new Date().toISOString()
      wx.setStorageSync(reminderKey, reminder)

      // 更新相关通知状态
      if (reminder.notificationId) {
        const notifications = wx.getStorageSync('notifications') || []
        const index = notifications.findIndex(n => n.id === reminder.notificationId)
        
        if (index > -1) {
          notifications[index].cancelled = true
          notifications[index].updateTime = new Date().toISOString()
          wx.setStorageSync('notifications', notifications)
        }
      }

      return true
    } catch (error) {
      console.error('取消任务提醒失败:', error)
      throw error
    }
  }

  // 获取提醒状态
  getReminderStatus(taskId) {
    try {
      const reminder = wx.getStorageSync(this._getReminderKey(taskId))
      if (!reminder) return null
      
      return {
        ...reminder,
        active: !reminder.cancelled && new Date(reminder.reminderTime) > new Date()
      }
    } catch (error) {
      console.error('获取提醒状态失败:', error)
      return null
    }
  }

  // 重新激活已取消的提醒
  async reactivateReminder(taskId) {
    try {
      const reminder = wx.getStorageSync(this._getReminderKey(taskId))
      if (!reminder) {
        throw new Error(this.errorMessages.REMINDER_NOT_FOUND)
      }

      // 检查提醒时间是否已过
      if (new Date(reminder.reminderTime) <= new Date()) {
        throw new Error('提醒时间已过')
      }

      // 重置取消状态
      reminder.cancelled = false
      reminder.cancelTime = null
      reminder.updateTime = new Date().toISOString()
      wx.setStorageSync(this._getReminderKey(taskId), reminder)

      // 更新相关通知状态
      if (reminder.notificationId) {
        const notifications = wx.getStorageSync('notifications') || []
        const index = notifications.findIndex(n => n.id === reminder.notificationId)
        
        if (index > -1) {
          notifications[index].cancelled = false
          notifications[index].updateTime = new Date().toISOString()
          wx.setStorageSync('notifications', notifications)
        }
      }

      return true
    } catch (error) {
      console.error('重新激活提醒失败:', error)
      throw error
    }
  }
}

module.exports = new NotificationManager() 