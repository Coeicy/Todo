const db = require('./utils/db')
const { createClient } = require('supabase-wechat-stable-v2')

App({
  globalData: {
    userInfo: null,
    theme: 'light',
    db: null,
    supabase: null
  },

  onLaunch() {
    // 初始化 MemFireDB 客户端
    const supabase = createClient(
      'YOUR_MEMFIREDB_URL',
      'YOUR_MEMFIREDB_ANON_KEY'
    )
    this.globalData.supabase = supabase

    // 确保数据库最先初始化
    db.init()
    this.globalData.db = db
    
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