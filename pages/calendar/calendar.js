const app = getApp()
const db = app.globalData.db
const lunar = require('../../utils/lunar')

Page({
  data: {
    selectedDate: null,
    tasks: []
  },

  onLoad() {
    this.loadTasks()
  },

  // 加载任务数据
  loadTasks() {
    const tasks = db.getTasks()
    this.setData({ tasks })
  },

  // 日期选择事件
  onDateSelect(e) {
    const { date } = e.detail
    const dayAdvice = lunar.getDayAdvice()
    
    this.setData({
      selectedDate: {
        ...date,
        ...dayAdvice
      }
    })
  },

  // 月份切换事件
  onMonthChange(e) {
    const { year, month } = e.detail
    console.log('月份切换:', year, month)
  },

  // 返回今天事件
  onGoToday() {
    this.setData({
      selectedDate: null
    })
  },

  // 添加任务
  addTask() {
    const { selectedDate } = this.data
    if (!selectedDate) {
      wx.showToast({
        title: '请先选择日期',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/task/add/index?date=${selectedDate.fullDate}`
    })
  },

  // 显示任务详情
  showTaskDetail(e) {
    const { task } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/task/detail/index?id=${task.id}`
    })
  }
}) 