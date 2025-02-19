const db = require('./utils/db')

App({
  globalData: {
    userInfo: null,
    theme: 'light',
    db: db
  },

  onLaunch() {
    // 初始化数据库
    try {
      db.init()
      this.globalData.db = db
    } catch (error) {
      console.error('数据库初始化失败:', error)
    }
    
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