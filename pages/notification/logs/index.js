const app = getApp();
const notification = require('../../../utils/notification');

Page({
  data: {
    logs: [],
    stats: {},
    loading: true,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    filters: {
      type: '',
      startDate: '',
      endDate: '',
      success: ''
    }
  },

  onLoad() {
    this.loadNotificationLogs();
  },

  async loadNotificationLogs() {
    try {
      const logs = await notification.getRecentNotifications();
      this.setData({ logs, loading: false });
    } catch (error) {
      console.error('加载通知日志失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 加载日志数据
  async loadLogs(reset = false) {
    if (this.data.loading) return
    
    if (reset) {
      this.setData({ page: 1, logs: [] })
    }

    this.setData({ loading: true })

    try {
      const { filters, page, pageSize } = this.data
      const res = await wx.cloud.callFunction({
        name: 'getNotificationLogs',
        data: {
          ...filters,
          page,
          pageSize
        }
      })

      if (res.result.success) {
        const { logs, stats, totalPages } = res.result.data
        this.setData({
          logs: [...this.data.logs, ...logs],
          stats,
          totalPages,
          loading: false
        })
      } else {
        throw new Error(res.result.error)
      }
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadLogs(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  async onReachBottom() {
    if (this.data.page < this.data.totalPages) {
      this.setData({
        page: this.data.page + 1
      })
      await this.loadLogs()
    }
  },

  // 设置筛选条件
  onFilterChange(e) {
    const { field, value } = e.currentTarget.dataset
    this.setData({
      [`filters.${field}`]: value
    }, () => {
      this.loadLogs(true)
    })
  },

  // 清除筛选条件
  clearFilters() {
    this.setData({
      filters: {
        type: '',
        startDate: '',
        endDate: '',
        success: ''
      }
    }, () => {
      this.loadLogs(true)
    })
  },

  // 查看日志详情
  viewLogDetail(e) {
    const { log } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/notification/detail/index?id=${log._id}`
    })
  },

  // 重试失败的通知
  async retryNotification(e) {
    const { log } = e.currentTarget.dataset
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
        this.loadLogs(true)
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

  // 导出日志
  async exportLogs() {
    try {
      wx.showLoading({ title: '导出中' })
      const { filters } = this.data
      
      const res = await wx.cloud.callFunction({
        name: 'exportNotificationLogs',
        data: filters
      })

      if (res.result.success) {
        const { fileID } = res.result
        const { tempFilePath } = await wx.cloud.downloadFile({
          fileID
        })
        
        await wx.shareFileMessage({
          filePath: tempFilePath,
          fileName: '通知日志.xlsx'
        })
      } else {
        throw new Error(res.result.error)
      }
    } catch (error) {
      wx.showToast({
        title: '导出失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  }
}) 