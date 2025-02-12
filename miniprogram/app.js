// app.js
App({
  onLaunch: function () {
    // 初始化本地存储
    if (!wx.getStorageSync('tasks')) {
      wx.setStorageSync('tasks', []);
    }
    if (!wx.getStorageSync('quadrantTasks')) {
      wx.setStorageSync('quadrantTasks', []);
    }
    if (!wx.getStorageSync('calendarEvents')) {
      wx.setStorageSync('calendarEvents', []);
    }
  }
});
