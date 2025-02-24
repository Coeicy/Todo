const app = getApp()

Page({
  data: {
    taskGroups: [], // 分组后的任务
    loading: false,
    filter: 'todo', // 默认显示未完成任务
    totalCount: 0,
    doneCount: 0,
    importantCount: 0,
    quadrantTasks: {
      urgentImportant: [], // 重要且紧急
      important: [],       // 重要不紧急
      urgent: [],         // 紧急不重要
      normal: []          // 不重要不紧急
    }
  },

  onShow() {
    // 每次页面显示时重新加载任务列表
    this.loadTasks();
  },

  // 设置筛选类型
  setFilter(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filter: type });
    this.loadTasks(); // 重新加载并筛选任务
  },

  // 加载并分组任务
  loadTasks() {
    this.setData({ loading: true });
    try {
      const tasks = wx.getStorageSync('tasks') || [];
      
      // 更新统计数据
      this.updateStats(tasks);
      
      // 根据筛选条件过滤任务
      const filteredTasks = this.filterTasks(tasks);
      
      // 分组过滤后的任务
      const taskGroups = this.groupTasks(filteredTasks);
      
      this.setData({ 
        taskGroups,
        loading: false
      });
    } catch (err) {
      console.error('加载任务失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 更新统计数据
  updateStats(tasks) {
    this.setData({
      totalCount: tasks.length,
      doneCount: tasks.filter(task => task.completed).length,
      importantCount: tasks.filter(task => task.priority >= 2).length
    });
  },

  // 任务筛选
  filterTasks(tasks) {
    if (this.data.filter === 'quadrant') {
      return this.groupTasksByQuadrant(tasks);
    }
    switch (this.data.filter) {
      case 'done':
        return tasks.filter(task => task.completed);
      case 'todo':
        return tasks.filter(task => !task.completed);
      default:
        return tasks;
    }
  },

  // 任务分组处理
  groupTasks(tasks) {
    // 按优先级排序
    const sortedTasks = this.sortTasks(tasks);
    
    // 初始化分组
    const groups = {
      noDate: { title: '无日期任务', tasks: [] },
      today: { title: '今日任务', tasks: [] },
      tomorrow: { title: '明日任务', tasks: [] },
      future: { title: '未来任务', tasks: [] },
      expired: { title: '已过期', tasks: [] }
    };

    // 获取当前日期
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = today + 86400000; // 加一天的毫秒数
    
    // 分组任务
    sortedTasks.forEach(task => {
      const startTime = task.startTime;
      
      if (!startTime) {
        groups.noDate.tasks.push(task);
      } else if (startTime < today) {
        groups.expired.tasks.push(task);
      } else if (startTime < tomorrow) {
        groups.today.tasks.push(task);
      } else if (startTime < tomorrow + 86400000) {
        groups.tomorrow.tasks.push(task);
      } else {
        groups.future.tasks.push(task);
      }
    });

    // 转换为数组并过滤空分组
    return Object.values(groups).filter(group => group.tasks.length > 0);
  },

  // 排序任务
  sortTasks(tasks) {
    return tasks.sort((a, b) => {
      // 首先按优先级排序（高优先级在前）
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      // 其次按创建时间排序（新创建的在前）
      return b.createTime - a.createTime;
    });
  },

  // 格式化时间显示
  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 跳转到添加任务页面
  goToAddTask() {
    wx.navigateTo({
      url: '/pages/task/add/index'
    });
  },

  // 跳转到任务详情页面
  goToTaskDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/task/detail/index?id=${id}`
    });
  },

  // 删除任务
  deleteTask(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          // 获取当前任务列表
          let tasks = wx.getStorageSync('tasks') || [];
          // 移除指定任务
          tasks = tasks.filter(task => task.id !== id);
          // 更新存储
          wx.setStorageSync('tasks', tasks);
          // 更新显示
          this.setData({ tasks });
          
          // 同时删除相关附件
          let attachments = wx.getStorageSync('attachments') || {};
          delete attachments[id];
          wx.setStorageSync('attachments', attachments);
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 按象限分组任务
  groupTasksByQuadrant(tasks) {
    const quadrantTasks = {
      urgentImportant: [],
      important: [],
      urgent: [],
      normal: []
    };

    const now = new Date().getTime();
    const urgentThreshold = 24 * 60 * 60 * 1000; // 24小时内视为紧急

    tasks.forEach(task => {
      const isUrgent = task.startTime && (task.startTime - now < urgentThreshold);
      const isImportant = task.priority >= 2;

      if (isImportant && isUrgent) {
        quadrantTasks.urgentImportant.push(task);
      } else if (isImportant) {
        quadrantTasks.important.push(task);
      } else if (isUrgent) {
        quadrantTasks.urgent.push(task);
      } else {
        quadrantTasks.normal.push(task);
      }
    });

    this.setData({ quadrantTasks });
    return []; // 返回空数组，因为我们使用 quadrantTasks 来显示
  }
});