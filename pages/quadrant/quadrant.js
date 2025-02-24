Page({
  data: {
    urgentImportant: ['项目deadline', '紧急会议'],
    importantNotUrgent: ['学习新技能', '职业规划'],
    urgentNotImportant: ['回复邮件', '处理日常事务'],
    notUrgentNotImportant: ['刷社交媒体', '看电视剧'],
    tasks: {
      urgentImportant: [],
      importantNotUrgent: [],
      urgentNotImportant: [],
      notUrgentNotImportant: []
    },
    newTask: {
      quadrant: '',
      content: ''
    }
  },
  
  onLoad() {
    // 从本地存储加载任务数据
    const tasks = wx.getStorageSync('quadrant_tasks');
    if (tasks) {
      this.setData({ tasks });
    }
  },
  
  // 添加任务
  addTask() {
    const { quadrant, content } = this.data.newTask;
    if (!quadrant || !content) {
      wx.showToast({
        title: '请选择象限并输入任务内容',
        icon: 'none'
      });
      return;
    }
  
    const tasks = this.data.tasks;
    tasks[quadrant].push({
      content,
      completed: false,
      createTime: new Date().getTime()
    });
  
    this.setData({
      tasks,
      'newTask.content': ''
    });
  
    // 保存到本地存储
    this.saveTasksToStorage();
  
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },
  
  // 切换任务状态
  toggleTask(e) {
    const { quadrant, index } = e.currentTarget.dataset;
    const tasks = this.data.tasks;
    tasks[quadrant][index].completed = !tasks[quadrant][index].completed;
  
    this.setData({ tasks });
    this.saveTasksToStorage();
  },
  
  // 删除任务
  deleteTask(e) {
    const { quadrant, index } = e.currentTarget.dataset;
    const tasks = this.data.tasks;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          tasks[quadrant].splice(index, 1);
          this.setData({ tasks });
          this.saveTasksToStorage();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 输入任务内容
  inputTaskContent(e) {
    this.setData({
      'newTask.content': e.detail.value
    });
  },
  
  // 选择象限
  selectQuadrant(e) {
    const index = e.detail.value;
    const quadrants = ['urgentImportant', 'importantNotUrgent', 'urgentNotImportant', 'notUrgentNotImportant'];
    this.setData({
      'newTask.quadrant': quadrants[index]
    });
  },
  // 保存任务到本地存储
  saveTasksToStorage() {
    wx.setStorageSync('quadrant_tasks', this.data.tasks);
  }
})