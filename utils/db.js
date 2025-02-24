// 数据库操作类
class DB {
  constructor() {
    this.tasks = [];
    this.initialized = false;
    this.cache = new Map();
    this.pageSize = 20;
  }

  init() {
    try {
      this.tasks = wx.getStorageSync('tasks') || [];
      this.initialized = true;
      this.initCache();
    } catch (error) {
      console.error('初始化数据库失败:', error);
      this.initialized = false;
      this.restoreFromBackup();
    }
  }

  initCache() {
    this.tasks.forEach(task => {
      this.cache.set(task.id, task);
    });
  }

  getTasks(page = 1) {
    if (!this.initialized) {
      this.init();
    }
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.tasks.slice(start, end);
  }

  getTask(taskId) {
    return this.cache.get(taskId) || this.tasks.find(t => t.id === taskId);
  }

  addTask(taskData) {
    try {
      this.tasks.unshift(taskData);
      this.cache.set(taskData.id, taskData);
      this.saveTasks();
      this.backup();
      return true;
    } catch (error) {
      console.error('添加任务失败:', error);
      return false;
    }
  }

  updateTask(taskId, updates) {
    try {
      const index = this.tasks.findIndex(t => t.id === taskId);
      if (index === -1) throw new Error('任务不存在');

      const updatedTask = {
        ...this.tasks[index],
        ...updates,
        updateTime: new Date().toISOString()
      };

      this.tasks[index] = updatedTask;
      this.cache.set(taskId, updatedTask);
      this.saveTasks();
      this.backup();
      return updatedTask;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  deleteTask(taskId) {
    try {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.cache.delete(taskId);
      this.saveTasks();
      this.backup();
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  saveTasks() {
    try {
      wx.setStorageSync('tasks', this.tasks);
    } catch (error) {
      console.error('保存任务失败:', error);
      this.backup();
      throw error;
    }
  }

  backup() {
    try {
      wx.setStorageSync('tasks_backup', this.tasks);
    } catch (error) {
      console.error('备份失败:', error);
    }
  }

  restoreFromBackup() {
    try {
      const backup = wx.getStorageSync('tasks_backup');
      if (backup && backup.length > 0) {
        this.tasks = backup;
        this.initialized = true;
        this.initCache();
        console.log('从备份恢复成功');
      }
    } catch (error) {
      console.error('恢复备份失败:', error);
    }
  }

  clearCache() {
    this.cache.clear();
    this.initCache();
  }

  toggleTaskStatus(taskId) {
    try {
      const tasks = this.getTasks()
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          const completed = !task.completed
          return {
            ...task,
            completed,
            completedAt: completed ? new Date().toISOString() : null
          }
        }
        return task
      })
      
      wx.setStorageSync('tasks', updatedTasks)
      return updatedTasks.find(t => t.id === taskId)
    } catch (error) {
      console.error('切换任务状态失败:', error)
      throw error
    }
  }

  updateTaskPriority(taskId, priority) {
    try {
      return this.updateTask(taskId, { priority })
    } catch (error) {
      console.error('更新任务优先级失败:', error)
      throw error
    }
  }

  getCompletedTasks() {
    try {
      const tasks = this.getTasks()
      return tasks
        .filter(task => task.completed)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    } catch (error) {
      console.error('获取已完成任务失败:', error)
      throw error
    }
  }

  initTestData() {
    const tasks = [
      {
        id: '20240220001',
        title: '产品评审会议',
        notes: '讨论新功能原型设计',
        startTime: {
          year: '2024',
          month: '02',
          day: '20',
          hour: '10',
          minute: '00'
        },
        dueDate: {
          year: '2024',
          month: '02',
          day: '20',
          hour: '11',
          minute: '30'
        },
        isAllDay: false,
        location: '会议室A',
        url: 'https://meeting.com/123',
        attachments: [],
        completed: false,
        createTime: new Date().toISOString()
      },
      {
        id: '20240220002',
        title: '准备周报',
        notes: '整理本周工作内容和下周计划',
        startTime: {
          year: '2024',
          month: '02',
          day: '20',
          hour: '14',
          minute: '00'
        },
        dueDate: {
          year: '2024',
          month: '02',
          day: '20',
          hour: '15',
          minute: '00'
        },
        isAllDay: false,
        location: '办公室',
        url: '',
        attachments: [],
        completed: false,
        createTime: new Date().toISOString()
      },
      {
        id: '20240225001',
        title: '团建活动',
        notes: '部门团建活动，地点待定',
        startTime: {
          year: '2024',
          month: '02',
          day: '25',
          hour: '09',
          minute: '00'
        },
        dueDate: {
          year: '2024',
          month: '02',
          day: '25',
          hour: '17',
          minute: '00'
        },
        isAllDay: true,
        location: '待定',
        url: '',
        attachments: [],
        completed: false,
        createTime: new Date().toISOString()
      },
      {
        id: '20240228001',
        title: '月度总结',
        notes: '准备月度工作总结报告',
        startTime: {
          year: '2024',
          month: '02',
          day: '28',
          hour: '14',
          minute: '00'
        },
        dueDate: {
          year: '2024',
          month: '02',
          day: '28',
          hour: '16',
          minute: '00'
        },
        isAllDay: false,
        location: '大会议室',
        url: 'https://docs.google.com/monthly-report',
        attachments: [],
        completed: false,
        createTime: new Date().toISOString()
      },
      {
        id: '20240301001',
        title: '项目启动会',
        notes: '新项目启动，讨论技术方案',
        startTime: {
          year: '2024',
          month: '03',
          day: '01',
          hour: '10',
          minute: '00'
        },
        dueDate: {
          year: '2024',
          month: '03',
          day: '01',
          hour: '12',
          minute: '00'
        },
        isAllDay: false,
        location: '会议室B',
        url: '',
        attachments: [],
        completed: false,
        createTime: new Date().toISOString()
      }
    ]

    try {
      wx.setStorageSync('tasks', tasks)
      return true
    } catch (error) {
      console.error('初始化测试数据失败:', error)
      return false
    }
  }
}

module.exports = new DB()