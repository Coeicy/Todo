// quadrant.js
Page({
  data: {
    quadrants: [
      {
        id: 1,
        title: '重要且紧急',
        tasks: []
      },
      {
        id: 2,
        title: '重要不紧急',
        tasks: []
      },
      {
        id: 3,
        title: '紧急不重要',
        tasks: []
      },
      {
        id: 4,
        title: '不紧急不重要',
        tasks: []
      }
    ]
  },

  onLoad() {
    this.loadTasks();
  },

  loadTasks() {
    const tasks = wx.getStorageSync('quadrantTasks') || [];
    const quadrants = this.data.quadrants.map(q => ({
      ...q,
      tasks: tasks.filter(t => t.quadrant === q.id)
    }));
    this.setData({ quadrants });
  },

  addTask(e) {
    const quadrantId = e.currentTarget.dataset.quadrant;
    wx.showModal({
      title: '添加任务',
      content: '请输入任务内容',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const newTask = {
            id: Date.now(),
            content: res.content,
            completed: false,
            quadrant: quadrantId
          };
          const tasks = wx.getStorageSync('quadrantTasks') || [];
          tasks.push(newTask);
          wx.setStorageSync('quadrantTasks', tasks);
          this.loadTasks();
        }
      }
    });
  },

  toggleTask(e) {
    const { quadrant, taskId } = e.currentTarget.dataset;
    const tasks = wx.getStorageSync('quadrantTasks') || [];
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    wx.setStorageSync('quadrantTasks', updatedTasks);
    this.loadTasks();
  },

  deleteTask(e) {
    const { quadrant, taskId } = e.currentTarget.dataset;
    const tasks = wx.getStorageSync('quadrantTasks') || [];
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    wx.setStorageSync('quadrantTasks', updatedTasks);
    this.loadTasks();
  }
});
