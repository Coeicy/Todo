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
      })
    }
  }

  addTask(taskData) {
    const task = {
      id: Date.now().toString(),
      title: taskData.title,
      notes: taskData.notes || '',
      startTime: taskData.startTime || null,
      endTime: taskData.endTime || null,
      location: taskData.location || '',
      url: taskData.url || '',
      important: taskData.important || false,
      completed: false,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    this.tasks.unshift(task)
    this._save()
    return task
  }

  getTasks(filter = {}) {
    let tasks = [...this.tasks]
    
    if (filter.completed !== undefined) {
      tasks = tasks.filter(t => t.completed === filter.completed)
    }
    if (filter.important !== undefined) {
      tasks = tasks.filter(t => t.important === filter.important) 
    }
    if (filter.date) {
      tasks = tasks.filter(t => {
        const taskDate = new Date(t.dueDate).toDateString()
        const filterDate = new Date(filter.date).toDateString()
        return taskDate === filterDate
      })
    }

    return tasks
  }

  getTask(id) {
    return this.tasks.find(t => t.id === id)
  }

  updateTask(id, updates) {
    const index = this.tasks.findIndex(t => t.id === id)
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

export default new DB() 