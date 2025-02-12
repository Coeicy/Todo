Page({
  data: {
    taskList: [],
    groupedTasks: {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: []
    },
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  },

  onLoad() {
    this.loadTasks();
    this.updateStats();
  },

  loadTasks() {
    const tasks = wx.getStorageSync('tasks') || [];
    const groupedTasks = this.groupTasksByDate(tasks);
    this.setData({ 
      taskList: tasks,
      groupedTasks: groupedTasks
    });
  },

  groupTasksByDate(tasks) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 86400000);
    const endOfWeek = new Date(today.getTime() + 86400000 * 7);

    return {
      today: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      }),
      tomorrow: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 86400000);
      }),
      thisWeek: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= tomorrow && dueDate < endOfWeek;
      }),
      later: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        return dueDate >= endOfWeek;
      })
    };
  },

  updateStats() {
    const tasks = this.data.taskList;
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    this.setData({
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending
    });
  },

  navigateToCreateTask() {
    wx.navigateTo({
      url: '/pages/createTask/index'
    });
  },

  addTask(task) {
    const tasks = [...this.data.taskList, task];
    this.setData({ 
      taskList: tasks,
      groupedTasks: this.groupTasksByDate(tasks)
    });
    wx.setStorageSync('tasks', tasks);
    this.updateStats();
  },

  editTask(e) {
    const index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/editTask/editTask?index=${index}`
    });
  },

  deleteTask(e) {
    const index = e.currentTarget.dataset.index;
    const tasks = this.data.taskList.filter((_, i) => i !== index);
    this.setData({ 
      taskList: tasks,
      groupedTasks: this.groupTasksByDate(tasks)
    });
    wx.setStorageSync('tasks', tasks);
    this.updateStats();
  },

  toggleTaskStatus(e) {
    const index = e.currentTarget.dataset.index;
    const tasks = this.data.taskList.map((task, i) => 
      i === index ? { ...task, completed: !task.completed } : task
    );
    this.setData({ 
      taskList: tasks,
      groupedTasks: this.groupTasksByDate(tasks)
    });
    wx.setStorageSync('tasks', tasks);
    this.updateStats();
  }
});
