class DB {
  constructor() {
    this.tasks = wx.getStorageSync('tasks') || []
  }

  init() {
    if (this.tasks.length === 0) {
      // 添加示例任务
      this.addTask({
        title: '欢迎使用 WeTodo',
        notes: '这是一个示例任务',
        important: true,
        dueDate: new Date().toISOString()
      })
    }
  }

  getTasks() {
    return this.tasks
  }

  createTask(task) {
    const newTask = {
      id: Date.now().toString(),
      title: task.title,
      notes: task.notes || '',
      important: task.important || false,
      completed: false,
      startTime: task.startTime || null,
      dueDate: task.dueDate || null,
      location: task.location || '',
      url: task.url || '',
      createTime: new Date().toISOString()
    }
    this.tasks.unshift(newTask)
    this._save()
    return newTask
  }

  addTask(task) {
    return this.createTask(task)
  }

  updateTask(taskId, updates) {
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index > -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updates,
        updateTime: new Date().toISOString()
      }
      this._save()
      return this.tasks[index]
    }
    return null
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index > -1) {
      this.tasks.splice(index, 1)
      this._save()
      return true
    }
    return false
  }

  _save() {
    wx.setStorageSync('tasks', this.tasks)
  }
}

module.exports = new DB() 