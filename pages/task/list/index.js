const app = getApp();
const db = require('../../../utils/db');

Page({
  data: {
    tasks: [],
    loading: true,
  },

  onLoad(options) {
    this.loadTasks(options.date);
  },

  async loadTasks(date) {
    try {
      const tasks = db.getTasks();
      const filteredTasks = this.filterTasksByDate(tasks, date);
      this.setData({ tasks: filteredTasks, loading: false });
    } catch (error) {
      console.error('加载任务失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  filterTasksByDate(tasks, date) {
    return tasks.filter(task => {
      // 处理全天任务
      const taskDate = task.isAllDay ? 
        new Date(task.startTime.split('T')[0]) : 
        new Date(task.startTime);
      
      // 使用本地日期比较
      const taskDateStr = taskDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');

      return taskDateStr === date;
    });
  },
}); 