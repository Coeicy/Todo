// 数据库操作类
class DB {
  constructor() {
    this.tasks = []
    this.initialized = false
  }

  init() {
    try {
      this.tasks = wx.getStorageSync('tasks') || []
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

  addTask(task) {
    try {
      const newTask = {
        ...task,
        id: Date.now().toString(),
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      }
      
      const tasks = this.getTasks()
      tasks.push(newTask)
      wx.setStorageSync('tasks', tasks)
      return newTask
    } catch (error) {
      console.error('添加任务失败:', error)
      throw error
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
      this.saveTasks();
      return updatedTask;
    } catch (error) {
      console.error('更新任务失败:', error);
      throw error;
    }
  }

  deleteTask(taskId) {
    try {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveTasks();
      return true;
    } catch (error) {
      console.error('删除任务失败:', error);
      throw error;
    }
  }

  getTask(taskId) {
    return this.tasks.find(t => t.id === taskId);
  }

  saveTasks() {
    try {
      wx.setStorageSync('tasks', this.tasks);
    } catch (error) {
      console.error('保存任务失败:', error);
      throw error;
    }
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
      return this.updateTask(taskId, { priority });
    } catch (error) {
      console.error('更新任务优先级失败:', error);
      throw error;
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
}

module.exports = new DB() 