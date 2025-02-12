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
    tasks[quadrant].push(content);
    this.setData({
      tasks,
      'newTask.content': ''
    });
  },

  // 删除任务
  deleteTask(e) {
    const { quadrant, index } = e.currentTarget.dataset;
    const tasks = this.data.tasks;
    tasks[quadrant].splice(index, 1);
    this.setData({ tasks });
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
  }
}) 