const db = require('./utils/db')

App({
  globalData: {
    userInfo: null,
    theme: 'light',
    db: null
  },

  onLaunch() {
    // 初始化数据库
    this.globalData.db = db
    db.init()
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    
    // 检查主题设置
    const theme = wx.getStorageSync('theme') || 'light'
    this.globalData.theme = theme
  },

  // 切换主题
  switchTheme(theme) {
    this.globalData.theme = theme
    wx.setStorageSync('theme', theme)
  }
}) 