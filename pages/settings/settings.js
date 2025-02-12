const app = getApp()
const db = app.globalData.db
const notificationService = require('../../utils/notification')

Page({
  data: {
    version: '1.0.0',
    theme: 'light',
    themeColor: '#07c160',
    themeColors: [
      { name: '绿色', value: '#07c160' },
      { name: '蓝色', value: '#1890ff' },
      { name: '紫色', value: '#722ed1' },
      { name: '红色', value: '#f5222d' },
      { name: '橙色', value: '#fa8c16' }
    ],
    showLunar: true,
    weekStart: 0,
    weekStartOptions: ['周日', '周一'],
    enableNotification: false,
    reminderTime: 0,
    reminderOptions: ['5分钟前', '15分钟前', '30分钟前', '1小时前', '2小时前'],
    showAboutModal: false
  },

  onLoad() {
    this.loadSettings()
  },

  // 加载设置
  loadSettings() {
    const settings = wx.getStorageSync('settings') || {}
    this.setData({
      theme: settings.theme || 'light',
      themeColor: settings.themeColor || '#07c160',
      showLunar: settings.showLunar !== false,
      weekStart: settings.weekStart || 0,
      enableNotification: settings.enableNotification || false,
      reminderTime: settings.reminderTime || 0
    })
  },

  // 切换主题模式
  onThemeChange(e) {
    const theme = e.detail.value ? 'dark' : 'light'
    this.updateSetting('theme', theme)
    app.switchTheme(theme)

    // 更新全局样式变量
    if (theme === 'dark') {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1f1f1f'
      })
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    }
  },

  // 切换主题色
  onColorChange(e) {
    const color = e.currentTarget.dataset.color
    this.updateSetting('themeColor', color)
    this.setData({ themeColor: color })

    // 更新全局主题色
    app.globalData.themeColor = color
    wx.setStorageSync('themeColor', color)
  },

  // 切换农历显示
  onLunarChange(e) {
    const showLunar = e.detail.value
    this.updateSetting('showLunar', showLunar)
    
    // 通知日历页面刷新
    const pages = getCurrentPages()
    const calendarPage = pages.find(p => p.route === 'pages/calendar/calendar')
    if (calendarPage) {
      calendarPage.setData({ showLunar })
      calendarPage.generateDays()
    }
  },

  // 切换周起始日
  onWeekStartChange(e) {
    const weekStart = parseInt(e.detail.value)
    this.updateSetting('weekStart', weekStart)
    
    // 通知日历页面刷新
    const pages = getCurrentPages()
    const calendarPage = pages.find(p => p.route === 'pages/calendar/calendar')
    if (calendarPage) {
      calendarPage.setData({ weekStart })
      calendarPage.generateDays()
    }
  },

  // 切换通知开关
  async onNotificationChange(e) {
    const enable = e.detail.value
    
    if (enable) {
      const granted = await notificationService.requestPermission()
      if (granted) {
        this.updateSetting('enableNotification', true)
        this.setupNotifications()
      } else {
        this.setData({ enableNotification: false })
        wx.showToast({
          title: '需要开启通知权限',
          icon: 'none'
        })
      }
    } else {
      this.updateSetting('enableNotification', false)
      notificationService.clearAllNotifications()
    }
  },

  // 设置通知
  setupNotifications() {
    const tasks = db.getTasks()
    const reminderMinutes = notificationService.getReminderMinutes(this.data.reminderTime)
    notificationService.resetAllNotifications(tasks, reminderMinutes)
  },

  // 修改提醒时间
  onReminderTimeChange(e) {
    const reminderTime = parseInt(e.detail.value)
    this.updateSetting('reminderTime', reminderTime)
    
    if (this.data.enableNotification) {
      this.setupNotifications()
    }
  },

  // 更新设置
  updateSetting(key, value) {
    const settings = wx.getStorageSync('settings') || {}
    settings[key] = value
    wx.setStorageSync('settings', settings)
    this.setData({ [key]: value })
  },

  // 显示关于弹窗
  showAbout() {
    this.setData({ showAboutModal: true })
  },

  // 隐藏关于弹窗
  hideAbout() {
    this.setData({ showAboutModal: false })
  },

  // 清除数据
  clearData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // 清除任务数据
          wx.removeStorageSync('tasks')
          
          // 重置设置（保留主题设置）
          const settings = {
            theme: this.data.theme,
            themeColor: this.data.themeColor
          }
          wx.setStorageSync('settings', settings)
          
          // 清除通知
          if (this.data.enableNotification) {
            this.clearNotifications()
          }
          
          wx.showToast({
            title: '清除成功',
            icon: 'success'
          })

          // 重新初始化数据库
          db.init()
          
          // 重新加载设置
          this.loadSettings()
          
          // 通知其他页面刷新
          const pages = getCurrentPages()
          pages.forEach(page => {
            if (page.route !== 'pages/settings/settings') {
              page.onLoad()
            }
          })
        }
      }
    })
  }
}) 