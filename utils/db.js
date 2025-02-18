// 数据库操作类
class DB {
  constructor() {
    this.tasks = []
    this.initialized = false
  }

  init() {
    try {
      // 从本地存储加载任务
      const tasks = wx.getStorageSync('tasks') || []
      this.tasks = tasks
      this.initialized = true
    } catch (error) {
      console.error('初始化数据库失败:', error)
      this.initialized = false
    }
  }

  getTasks() {
    if (!this.initialized) {
      this.init()
    }
    return this.tasks
  }

  addTask(taskData) {
    if (!this.initialized) {
      this.init()
    }
    
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title || '',
      notes: taskData.notes || '',
      priority: taskData.priority || 0,
      startTime: taskData.startTime || null,
      dueDate: taskData.dueDate || null,
      location: taskData.location || '',
      url: taskData.url || '',
      completed: false,
      important: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.tasks.unshift(newTask)
    this.saveTasks()
    return newTask
  }

  updateTask(id, updates) {
    if (!this.initialized) {
      this.init()
    }
    
    const index = this.tasks.findIndex(t => t.id === id)
    if (index > -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      this.saveTasks()
      return this.tasks[index]
    }
    return null
  }

  deleteTask(id) {
    if (!this.initialized) {
      this.init()
    }
    
    this.tasks = this.tasks.filter(t => t.id !== id)
    this.saveTasks()
  }

  getTask(id) {
    if (!this.initialized) {
      this.init()
    }
    return this.tasks.find(t => t.id === id)
  }

  saveTasks() {
    try {
      wx.setStorageSync('tasks', this.tasks)
    } catch (error) {
      console.error('保存任务失败:', error)
      throw error // 抛出错误以便上层处理
    }
  }
}

module.exports = new DB() 