const notification = require('../../../utils/notification')

Page({
  data: {
    log: null,
    loading: true,
    taskInfo: null
  },

  onLoad(options) {
    if (options.id) {
      this.loadLogDetail(options.id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  // 加载日志详情
  async loadLogDetail(logId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getNotificationLog',
        data: { logId }
      })

      if (res.result.success) {
        const log = res.result.data
        this.setData({ log })
        
        // 如果有关联任务，加载任务信息
        if (log.taskId) {
          this.loadTaskInfo(log.taskId)
        }
      } else {
        throw new Error(res.result.error)
      }
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载关联任务信息
  async loadTaskInfo(taskId) {
    try {
      const task = await notification._getTaskInfo(taskId)
      if (task) {
        this.setData({ taskInfo: task })
      }
    } catch (error) {
      console.error('加载任务信息失败:', error)
    }
  },

  // 重试发送通知
  async retryNotification() {
    const { log } = this.data
    if (!log || log.success) return

    try {
      wx.showLoading({ title: '重试中' })
      
      const result = await notification.resendNotification({
        type: log.type,
        taskId: log.taskId,
        data: log.data
      })

      if (result) {
        wx.showToast({
          title: '重试成功',
          icon: 'success'
        })
        // 重新加载日志详情
        this.loadLogDetail(log._id)
      } else {
        throw new Error('重试失败')
      }
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 查看关联任务
  viewTask() {
    const { taskInfo } = this.data
    if (taskInfo) {
      wx.navigateTo({
        url: `/pages/task/detail/index?id=${taskInfo.id}`
      })
    }
  },

  // 复制错误信息
  copyError() {
    const { log } = this.data
    if (log && log.error) {
      wx.setClipboardData({
        data: log.error,
        success: () => {
          wx.showToast({
            title: '已复制',
            icon: 'success'
          })
        }
      })
    }
  }
}) 