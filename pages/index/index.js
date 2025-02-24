const app = getApp()
const db = require('../../utils/db')
const notification = require('../../utils/notification')

Page({
  data: {
    currentTab: 'all',
    totalTasks: 0,
    completedTasks: 0,
    tasks: [],
    showAddTaskModal: false,
    newTask: {
      title: '',
      notes: '',
      important: false,
      startTime: '',
      dueDate: '',
      location: '',
      url: ''
    },
    taskGroups: [],
    dateError: '',
    editorCtx: null,
    showTaskDetailModal: false,
    currentTask: null,
    unreadCount: 0,
    filter: 'undone',  // 默认显示未完成
    filteredTasks: [],
    dragTask: null,
    dragOverGroup: null,
    quadrantTasks: {
      0: [], // 不重要不紧急
      1: [], // 不重要但紧急
      2: [], // 重要不紧急
      3: []  // 重要且紧急
    }
  },

  onLoad() {
    this.loadTasks()
  },

  onShow() {
    this.loadTasks()
  },

  // 初始化数据库
  initDB() {
    try {
      if (!db.initialized) {
        db.init()
      }
      if (!db.initialized) {
        throw new Error('数据库初始化失败')
      }
    } catch (error) {
      console.error('数据库未初始化', error)
      wx.showToast({
        title: '初始化失败',
        icon: 'error'
      })
    }
  },

  // 切换任务分类标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.loadTasks()
  },

  // 加载任务列表
  async loadTasks() {
    try {
      const tasks = db.getTasks();
      this.setData({
        tasks,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        filteredTasks: this.filterTasks(tasks)
      });
      this.groupTasksByQuadrant(tasks);
    } catch (error) {
      console.error('加载任务失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  filterTasks(tasks) {
    return tasks.filter(task => this.data.filter === 'undone' ? !task.completed : task.completed);
  },

  groupTasksByQuadrant(tasks) {
    const quadrantTasks = {
      0: [],
      1: [],
      2: [],
      3: []
    };

    const now = new Date().getTime();
    const urgentThreshold = 24 * 60 * 60 * 1000; // 24小时内视为紧急

    tasks.forEach(task => {
      const isUrgent = task.startTime && (task.startTime - now < urgentThreshold);
      const isImportant = task.priority >= 2;

      if (isImportant && isUrgent) {
        quadrantTasks[3].push(task);
      } else if (isImportant) {
        quadrantTasks[2].push(task);
      } else if (isUrgent) {
        quadrantTasks[1].push(task);
      } else {
        quadrantTasks[0].push(task);
      }
    });

    this.setData({ quadrantTasks });
  },

  // 计算任务统计数据
  calculateTaskStats(tasks) {
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      importantTasks: tasks.filter(t => t.priority >= 2).length
    };
  },

  // 切换任务完成状态
  toggleTask(e) {
    try {
      const taskId = e.currentTarget.dataset.id
      const allTasks = wx.getStorageSync('tasks') || []
      
      const updatedTasks = allTasks.map(task => {
        if (task.id === taskId) {
          const completed = !task.completed
          return { 
            ...task, 
            completed,
            completedTime: completed ? new Date().toISOString() : null
          }
        }
        return task
      })

      // 保存到本地存储
      wx.setStorageSync('tasks', updatedTasks)
      
      // 更新页面显示
      this.loadTasks()

      // 显示完成提示
      if (updatedTasks.find(t => t.id === taskId).completed) {
        wx.showToast({
          title: '已完成',
          icon: 'success'
        })
      }
    } catch (e) {
      console.error('更新任务状态失败：', e)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 添加任务按钮点击事件
  onAddTask() {
    wx.navigateTo({
      url: '/pages/task/add/index'
    })
  },

  // 显示添加任务弹窗
  showAddTask() {
    wx.navigateTo({
      url: '/pages/task/add/index'
    })
  },

  // 隐藏添加任务弹窗
  hideAddTask() {
    this.setData({
      showAddTaskModal: false
    })
  },

  // 提交新任务
  async submitNewTask() {
    const { newTask } = this.data
    if (!newTask.title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      })
      return
    }

    const task = await this.createTask(newTask)
    if (task) {
      this.hideAddTask()
      this.loadTasks()

      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
    }
  },

  // 删除任务
  deleteTask(taskId) {
    try {
      const allTasks = wx.getStorageSync('tasks') || []
      const updatedTasks = allTasks.filter(task => task.id !== taskId)
      
      // 保存到本地存储
      wx.setStorageSync('tasks', updatedTasks)
      
      // 更新页面显示
      this.loadTasks()

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    } catch (e) {
      console.error('删除任务失败：', e)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  onTaskTitleInput(e) {
    this.setData({
      'newTask.title': e.detail.value
    })
  },

  onHasDateChange(e) {
    this.setData({
      'newTask.hasDate': e.detail.value,
      'newTask.year': '',
      'newTask.month': '',
      'newTask.day': '',
      'newTask.hour': '',
      'newTask.minute': '',
      dateError: ''
    })
  },

  // 修改分钟输入处理
  onMinuteInput(e) {
    let value = e.detail.value
    let minute = parseInt(value)
    
    if (isNaN(minute)) return
    
    // 直接设置输入的值，不做补零处理
    this.setData({
      'newTask.minute': String(minute)
    })

    // 如果输入大于59，自动进位到小时
    if (minute > 59) {
      const hours = Math.floor(minute / 60)
      minute = minute % 60
      
      // 获取当前小时或设为0
      let currentHour = this.data.newTask.hour ? parseInt(this.data.newTask.hour) : 0
      currentHour = currentHour + hours
      
      if (currentHour > 23) {
        currentHour = currentHour % 24
        // 这里可以选择是否自动进位到第二天
      }
      
      this.setData({
        'newTask.hour': String(currentHour),
        'newTask.minute': String(minute)
      })
    }
  },

  // 修改小时输入处理
  onHourInput(e) {
    let value = e.detail.value
    let hour = parseInt(value)
    
    if (isNaN(hour)) return
    
    // 直接设置输入的值，不做补零处理
    this.setData({
      'newTask.hour': String(hour)
    })

    // 如果输入大于23，自动进位到天
    if (hour > 23) {
      const days = Math.floor(hour / 24)
      hour = hour % 24
      
      // 如果有日期，则增加日期
      if (this.data.newTask.day) {
        let currentDate = new Date(
          this.data.newTask.year || new Date().getFullYear(),
          (this.data.newTask.month || new Date().getMonth() + 1) - 1,
          parseInt(this.data.newTask.day)
        )
        currentDate.setDate(currentDate.getDate() + days)
        
        this.setData({
          'newTask.year': String(currentDate.getFullYear()),
          'newTask.month': String(currentDate.getMonth() + 1),
          'newTask.day': String(currentDate.getDate()),
          'newTask.hour': String(hour)
        })
      } else {
        this.setData({
          'newTask.hour': String(hour)
        })
      }
    }
  },

  // 处理日期输入
  onDayInput(e) {
    let value = e.detail.value
    let day = parseInt(value)
    
    if (isNaN(day)) return
    
    const currentYear = this.data.newTask.year || new Date().getFullYear()
    const currentMonth = this.data.newTask.month || new Date().getMonth() + 1
    const maxDays = new Date(currentYear, currentMonth, 0).getDate()
    
    // 如果输入大于当月最大天数，自动进位到下月
    if (day > maxDays) {
      const months = Math.floor((day - 1) / maxDays)
      day = ((day - 1) % maxDays) + 1
      
      let newDate = new Date(currentYear, currentMonth - 1 + months, day)
      
      this.setData({
        'newTask.year': String(newDate.getFullYear()),
        'newTask.month': String(newDate.getMonth() + 1).padStart(2, '0'),
        'newTask.day': String(newDate.getDate()).padStart(2, '0')
      })
    } else {
      this.setData({
        'newTask.day': String(day).padStart(2, '0')
      })
    }
    this.validateDateTime()
  },

  // 处理月份输入
  onMonthInput(e) {
    let value = e.detail.value
    let month = parseInt(value)
    
    if (isNaN(month)) return
    
    // 如果输入大于12，自动进位到年
    if (month > 12) {
      const years = Math.floor((month - 1) / 12)
      month = ((month - 1) % 12) + 1
      
      const currentYear = this.data.newTask.year || new Date().getFullYear()
      
      this.setData({
        'newTask.year': String(parseInt(currentYear) + years),
        'newTask.month': String(month).padStart(2, '0')
      })
    } else {
      this.setData({
        'newTask.month': String(month).padStart(2, '0')
      })
    }
    this.validateDateTime()
  },

  // 获取当前日期时间的各个部分
  getCurrentDateTime() {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: String(now.getMonth() + 1).padStart(2, '0'),
      day: String(now.getDate()).padStart(2, '0'),
      hour: String(now.getHours()).padStart(2, '0'),
      minute: String(now.getMinutes()).padStart(2, '0')
    }
  },

  // 修改提交时的日期时间补全逻辑
  completeDateTime(dateTime) {
    const current = new Date()
    const result = {
      year: dateTime.year || current.getFullYear(),
      month: dateTime.month || (current.getMonth() + 1),
      day: dateTime.day || current.getDate(),
      hour: dateTime.hour || '0',
      minute: dateTime.minute || '0'
    }

    // 补全格式
    result.month = String(result.month).padStart(2, '0')
    result.day = String(result.day).padStart(2, '0')
    result.hour = String(result.hour).padStart(2, '0')
    result.minute = String(result.minute).padStart(2, '0')

    return result
  },

  // 验证日期时间
  validateDateTime() {
    const { year, month, day, hour, minute } = this.data.newTask
    
    // 如果全部为空，返回 true（表示未设置时间）
    if (!year && !month && !day && !hour && !minute) {
      return true
    }

    // 补全缺失的时间部分
    const completed = this.completeDateTime({
      year, month, day, hour, minute
    })

    const date = new Date(
      completed.year,
      parseInt(completed.month) - 1,
      completed.day,
      completed.hour,
      completed.minute
    )

    if (isNaN(date.getTime())) {
      this.setData({
        dateError: '请输入有效的日期时间'
      })
      return false
    }

    // 更新补全后的时间
    this.setData({
      'newTask.year': completed.year,
      'newTask.month': completed.month,
      'newTask.day': completed.day,
      'newTask.hour': completed.hour,
      'newTask.minute': completed.minute
    })

    return true
  },

  onHasStartTimeChange(e) {
    if (e.detail.value) {
      const now = new Date()
      this.setData({
        'newTask.hasStartTime': true,
        'newTask.startYear': now.getFullYear(),
        'newTask.startMonth': String(now.getMonth() + 1).padStart(2, '0'),
        'newTask.startDay': String(now.getDate()).padStart(2, '0'),
        'newTask.startHour': String(now.getHours()).padStart(2, '0'),
        'newTask.startMinute': String(now.getMinutes()).padStart(2, '0')
      })
    } else {
      this.setData({
        'newTask.hasStartTime': false,
        'newTask.startYear': '',
        'newTask.startMonth': '',
        'newTask.startDay': '',
        'newTask.startHour': '',
        'newTask.startMinute': ''
      })
    }
  },

  // 修改开始时间的分钟输入处理
  onStartMinuteInput(e) {
    let value = e.detail.value
    let minute = parseInt(value)
    
    if (isNaN(minute)) return
    
    // 直接设置输入的值，不做补零处理
    this.setData({
      'newTask.startMinute': String(minute)
    })

    // 如果输入大于59，自动进位到小时
    if (minute > 59) {
      const hours = Math.floor(minute / 60)
      minute = minute % 60
      
      // 获取当前小时或设为0
      let currentHour = this.data.newTask.startHour ? parseInt(this.data.newTask.startHour) : 0
      currentHour = currentHour + hours
      
      if (currentHour > 23) {
        currentHour = currentHour % 24
      }
      
      this.setData({
        'newTask.startHour': String(currentHour),
        'newTask.startMinute': String(minute)
      })
    }
  },

  // 修改开始时间的小时输入处理
  onStartHourInput(e) {
    let value = e.detail.value
    let hour = parseInt(value)
    
    if (isNaN(hour)) return
    
    // 直接设置输入的值，不做补零处理
    this.setData({
      'newTask.startHour': String(hour)
    })

    // 如果输入大于23，自动进位到天
    if (hour > 23) {
      const days = Math.floor(hour / 24)
      hour = hour % 24
      
      // 如果有日期，则增加日期
      if (this.data.newTask.startDay) {
        let currentDate = new Date(
          this.data.newTask.startYear || new Date().getFullYear(),
          (this.data.newTask.startMonth || new Date().getMonth() + 1) - 1,
          parseInt(this.data.newTask.startDay)
        )
        currentDate.setDate(currentDate.getDate() + days)
        
        this.setData({
          'newTask.startYear': String(currentDate.getFullYear()),
          'newTask.startMonth': String(currentDate.getMonth() + 1),
          'newTask.startDay': String(currentDate.getDate()),
          'newTask.startHour': String(hour)
        })
      } else {
        this.setData({
          'newTask.startHour': String(hour)
        })
      }
    }
  },

  // 处理日期输入
  onStartDayInput(e) {
    let value = e.detail.value
    let day = parseInt(value)
    
    if (isNaN(day)) return
    
    const currentYear = this.data.newTask.startYear || new Date().getFullYear()
    const currentMonth = this.data.newTask.startMonth || new Date().getMonth() + 1
    const maxDays = new Date(currentYear, currentMonth, 0).getDate()
    
    // 如果输入大于当月最大天数，自动进位到下月
    if (day > maxDays) {
      const months = Math.floor((day - 1) / maxDays)
      day = ((day - 1) % maxDays) + 1
      
      let newDate = new Date(currentYear, currentMonth - 1 + months, day)
      
      this.setData({
        'newTask.startYear': String(newDate.getFullYear()),
        'newTask.startMonth': String(newDate.getMonth() + 1).padStart(2, '0'),
        'newTask.startDay': String(newDate.getDate()).padStart(2, '0')
      })
    } else {
      this.setData({
        'newTask.startDay': String(day).padStart(2, '0')
      })
    }
    this.validateStartDateTime()
  },

  // 处理月份输入
  onStartMonthInput(e) {
    let value = e.detail.value
    let month = parseInt(value)
    
    if (isNaN(month)) return
    
    // 如果输入大于12，自动进位到年
    if (month > 12) {
      const years = Math.floor((month - 1) / 12)
      month = ((month - 1) % 12) + 1
      
      const currentYear = this.data.newTask.startYear || new Date().getFullYear()
      
      this.setData({
        'newTask.startYear': String(parseInt(currentYear) + years),
        'newTask.startMonth': String(month).padStart(2, '0')
      })
    } else {
      this.setData({
        'newTask.startMonth': String(month).padStart(2, '0')
      })
    }
    this.validateStartDateTime()
  },

  // 验证开始时间
  validateStartDateTime() {
    const { startYear, startMonth, startDay, startHour, startMinute } = this.data.newTask
    
    // 如果全部为空，返回 true（表示未设置时间）
    if (!startYear && !startMonth && !startDay && !startHour && !startMinute) {
      return true
    }

    // 补全缺失的时间部分
    const completed = this.completeDateTime({
      year: startYear,
      month: startMonth,
      day: startDay,
      hour: startHour,
      minute: startMinute
    })

    const date = new Date(
      completed.year,
      parseInt(completed.month) - 1,
      completed.day,
      completed.hour,
      completed.minute
    )

    if (isNaN(date.getTime())) {
      this.setData({
        dateError: '请输入有效的开始时间'
      })
      return false
    }

    // 更新补全后的时间
    this.setData({
      'newTask.startYear': completed.year,
      'newTask.startMonth': completed.month,
      'newTask.startDay': completed.day,
      'newTask.startHour': completed.hour,
      'newTask.startMinute': completed.minute
    })

    return true
  },

  onLocationInput(e) {
    this.setData({
      'newTask.location': e.detail.value
    })
  },

  onUrlInput(e) {
    this.setData({
      'newTask.url': e.detail.value
    })
  },

  // 处理备注输入
  onNotesInput(e) {
    const notes = e.detail.value
    this.setData({
      'newTask.notes': notes
    })
  },

  // 格式化备注显示
  formatNotes(notes) {
    if (!notes) return ''
    
    // 简单的 Markdown 格式转换
    return notes
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
      .replace(/- (.*?)(\n|$)/g, '• $1$2') // 列表
      .replace(/\n/g, '<br>') // 换行
  },

  // 长按任务显示操作菜单
  onTaskLongPress(e) {
    const taskId = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['删除任务', '标记重要', '编辑任务'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.deleteTask(taskId)
            break
          case 1:
            this.toggleImportant(taskId)
            break
          case 2:
            this.editTask(taskId)
            break
        }
      }
    })
  },

  // 切换任务重要状态
  toggleImportant(taskId) {
    try {
      const allTasks = wx.getStorageSync('tasks') || []
      
      const updatedTasks = allTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, important: !task.important }
        }
        return task
      })

      // 保存到本地存储
      wx.setStorageSync('tasks', updatedTasks)
      
      // 更新页面显示
      this.loadTasks()

      wx.showToast({
        title: '更新成功',
        icon: 'success'
      })
    } catch (e) {
      console.error('更新任务状态失败：', e)
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },

  // 编辑任务
  editTask(taskId) {
    try {
      const allTasks = wx.getStorageSync('tasks') || []
      const task = allTasks.find(t => t.id === taskId)
      
      if (!task) {
        throw new Error('Task not found')
      }

      // 直接调用编辑方法
      this.setData({
        currentTask: task
      }, () => {
        this.editCurrentTask()
      })
    } catch (e) {
      console.error('编辑任务失败：', e)
      wx.showToast({
        title: '编辑失败',
        icon: 'none'
      })
    }
  },

  // 编辑器准备就绪
  onEditorReady() {
    wx.createSelectorQuery()
      .select('#editor')
      .context((res) => {
        this.editorCtx = res.context
      })
      .exec()
  },

  // 格式化文本
  format(e) {
    const { name } = e.currentTarget.dataset
    if (!this.editorCtx) return
    
    this.editorCtx.format(name)
  },

  // 修改时间格式化方法
  formatDateTime(startTime, endTime) {
    if (!startTime && !endTime) return ''
    
    try {
      // 检查时间值是否有效
      const isValidDate = (dateStr) => {
        if (!dateStr) return false
        const date = new Date(dateStr)
        return date instanceof Date && !isNaN(date)
      }

      const formatNumber = (num) => String(num).padStart(2, '0')
      
      const formatTime = (dateStr) => {
        if (!isValidDate(dateStr)) return ''
        const date = new Date(dateStr)
        return `${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`
      }

      const formatDate = (dateStr) => {
        if (!isValidDate(dateStr)) return ''
        const date = new Date(dateStr)
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      }

      // 如果有开始时间和结束时间
      if (isValidDate(startTime) && isValidDate(endTime)) {
        const start = new Date(startTime)
        const end = new Date(endTime)
        
        // 如果是同一天
        if (start.getFullYear() === end.getFullYear() &&
            start.getMonth() === end.getMonth() &&
            start.getDate() === end.getDate()) {
          return `${formatDate(start)} | ${formatTime(start)}-${formatTime(end)}`
        }
        
        // 不同天
        return `${formatDate(start)} ${formatTime(start)} - ${formatDate(end)} ${formatTime(end)}`
      }
      
      // 只有一个时间点
      const validTime = startTime || endTime
      if (isValidDate(validTime)) {
        const date = new Date(validTime)
        return `${formatDate(date)} ${formatTime(date)}`
      }
      
      return ''
    } catch (e) {
      console.error('时间格式化错误:', e)
      return ''
    }
  },

  // 计算时间进度的方法
  calculateProgress(startTime, dueTime) {
    if (!startTime || !dueTime) return 0
    
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(dueTime)
    
    // 如果已经超过结束时间
    if (now > end) return 100
    
    // 如果还没到开始时间
    if (now < start) return 0
    
    // 计算进度百分比
    const total = end.getTime() - start.getTime()
    const current = now.getTime() - start.getTime()
    const progress = (current / total) * 100
    
    return Math.min(Math.max(progress, 0), 100)
  },

  // 显示任务详情
  showTaskDetail(e) {
    const taskId = e.currentTarget.dataset.id
    const allTasks = wx.getStorageSync('tasks') || []
    const task = allTasks.find(t => t.id === taskId)
    
    if (task) {
      this.setData({
        showTaskDetailModal: true,
        currentTask: task
      })
    }
  },

  // 隐藏任务详情
  hideTaskDetail() {
    this.setData({
      showTaskDetailModal: false,
      currentTask: null
    })
  },

  // 编辑当前任务
  editCurrentTask() {
    if (!this.data.currentTask) return
    
    // 隐藏详情模态框
    this.hideTaskDetail()
    
    // 将当前任务数据转换为编辑格式
    const task = this.data.currentTask
    const startDate = task.startTime ? new Date(task.startTime) : null
    const dueDate = task.dueDate ? new Date(task.dueDate) : null
    
    this.setData({
      showAddTaskModal: true,
      newTask: {
        id: task.id, // 保存原任务ID用于更新
        title: task.title,
        startYear: startDate ? String(startDate.getFullYear()) : '',
        startMonth: startDate ? String(startDate.getMonth() + 1) : '',
        startDay: startDate ? String(startDate.getDate()) : '',
        startHour: startDate ? String(startDate.getHours()) : '',
        startMinute: startDate ? String(startDate.getMinutes()) : '',
        year: dueDate ? String(dueDate.getFullYear()) : '',
        month: dueDate ? String(dueDate.getMonth() + 1) : '',
        day: dueDate ? String(dueDate.getDate()) : '',
        hour: dueDate ? String(dueDate.getHours()) : '',
        minute: dueDate ? String(dueDate.getMinutes()) : '',
        location: task.location || '',
        url: task.url || '',
        notes: task.notes || '',
        important: task.important || false
      }
    })
  },

  // 删除当前任务
  deleteCurrentTask() {
    if (!this.data.currentTask) return
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteTask(this.data.currentTask.id)
          this.hideTaskDetail()
        }
      }
    })
  },

  // 检查未读通知
  async checkUnreadNotifications() {
    try {
      const count = await notification.getUnreadCount()
      this.setData({ unreadCount: count })
    } catch (error) {
      console.error('获取未读通知数失败:', error)
    }
  },

  // 点击通知图标
  onNotificationClick() {
    wx.navigateTo({
      url: '/pages/notification/logs/index'
    })
  },

  // 处理任务状态变更
  onTaskStatusChange(e) {
    const { task, completed } = e.detail
    const updatedTask = db.updateTask(task.id, {
      completed,
      completedTime: completed ? new Date().toISOString() : null
    })
    if (updatedTask) {
      this.loadTasks()
    }
  },

  // 处理任务重要标记变更
  onTaskImportantChange(e) {
    const { task, important } = e.detail
    const updatedTask = db.updateTask(task.id, { important })
    if (updatedTask) {
      this.loadTasks()
    }
  },

  // 查看任务详情
  viewTask(e) {
    const { task } = e.detail
    wx.navigateTo({
      url: `/pages/task/detail/index?id=${task.id}`
    })
  },

  // 创建任务
  async createTask(taskData) {
    try {
      const task = await db.addTask(taskData)
      
      // 如果设置了截止时间，请求权限并创建提醒
      if (task.dueDate) {
        const hasPermission = await notification.requestPermission()
        if (hasPermission) {
          await notification.createTaskReminder(task)
        }
      }
      
      return task
    } catch (error) {
      console.error('创建任务失败:', error)
      return null
    }
  },

  // 设置筛选类型
  setFilter(e) {
    const filter = e.currentTarget.dataset.type;
    this.setData({ filter });
    this.loadTasks(); // 重新加载任务以应用过滤
  },

  // 计算倒计时
  calculateCountdown(dueDate) {
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff < 0) return '已过期';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `剩余 ${days} 天`;
    } else if (hours > 0) {
      return `剩余 ${hours} 小时`;
    } else {
      return '即将到期';
    }
  },

  // 处理任务数据，添加倒计时信息
  processTaskData(tasks) {
    return tasks.map(task => {
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const diff = dueDate - now;

        // 计算倒计时
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          if (days > 0) {
            task.countdown = `剩余 ${days} 天`;
          } else if (hours > 0) {
            task.countdown = `剩余 ${hours} 小时`;
          } else {
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            task.countdown = `剩余 ${minutes} 分钟`;
          }
        } else {
          task.countdown = '已过期';
        }

        // 格式化显示日期
        task.dueDate = this.formatDate(dueDate);
      }
      return task;
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${month}-${day} ${hour}:${minute}`;
  },

  // 开始拖拽任务
  onTaskDragStart(e) {
    const task = e.currentTarget.dataset.task;
    this.setData({ dragTask: task });
  },

  // 拖拽结束
  onTaskDragEnd() {
    this.setData({ 
      dragTask: null,
      dragOverGroup: null
    });
  },

  // 拖拽经过分组
  onGroupDragOver(e) {
    if (!this.data.dragTask) return;
    
    const group = e.currentTarget.dataset.group;
    this.setData({ dragOverGroup: group });
    
    // 添加视觉反馈
    const groups = wx.createSelectorQuery().selectAll('.task-group');
    groups.forEach(group => {
      if (group.dataset.group === this.data.dragOverGroup) {
        group.addClass('drag-over');
      } else {
        group.removeClass('drag-over');
      }
    });
  },

  // 放置到新分组
  onGroupDrop(e) {
    const { dragTask, dragOverGroup } = this.data;
    if (!dragTask || !dragOverGroup) return;

    // 根据目标分组设置新的截止日期
    const now = new Date();
    let newDueDate = null;

    switch (dragOverGroup) {
      case '今天':
        newDueDate = new Date(now.setHours(23, 59, 59, 999));
        break;
      case '明天':
        newDueDate = new Date(now.setDate(now.getDate() + 1));
        newDueDate.setHours(23, 59, 59, 999);
        break;
      case '最近7天':
        newDueDate = new Date(now.setDate(now.getDate() + 7));
        newDueDate.setHours(23, 59, 59, 999);
        break;
      case '更远':
        newDueDate = new Date(now.setDate(now.getDate() + 30));
        newDueDate.setHours(23, 59, 59, 999);
        break;
      case '没有日期':
        newDueDate = null;
        break;
      default:
        return;
    }

    // 更新任务
    const updatedTask = {
      ...dragTask,
      dueDate: newDueDate ? newDueDate.toISOString() : null
    };

    // 保存到数据库
    db.updateTask(dragTask.id, { dueDate: updatedTask.dueDate });

    // 重新加载任务列表
    this.loadTasks();

    // 清除拖拽状态
    this.setData({ 
      dragTask: null,
      dragOverGroup: null 
    });

    // 显示提示
    wx.showToast({
      title: '已更新截止时间',
      icon: 'success'
    });
  },

  // 跳转到添加任务页面
  goToAdd() {
    this.setData({ showAddTaskModal: true });
  },

  // 统一的任务详情页跳转方法
  goToDetail(e) {
    const { task } = e.currentTarget.dataset;
    if (task && task.id) {
      wx.navigateTo({
        url: `/pages/task/detail/index?id=${task.id}`
      });
    }
  },

  // 切换任务状态
  toggleTaskStatus(e) {
    const taskId = e.currentTarget.dataset.taskId
    const task = this.data.tasks.find(t => t.id === taskId)
    if (!task) return

    // 先添加完成动画类
    const tasks = this.data.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed, completing: true }
      }
      return t
    })
    
    this.setData({ tasks })

    // 等待动画完成后更新数据
    setTimeout(() => {
      try {
        db.updateTask(taskId, {
          completed: !task.completed,
          completedTime: !task.completed ? new Date().toISOString() : null
        })
        this.loadTasks() // 重新加载任务列表
      } catch (error) {
        console.error('更新任务状态失败:', error)
        wx.showToast({
          title: '操作失败',
          icon: 'error'
        })
      }
    }, 800) // 与动画时长保持一致
  },

  // 根据ID查找任务
  findTaskById(id) {
    const tasks = wx.getStorageSync('tasks') || [];
    return tasks.find(task => task.id === id);
  },

  // 拖拽到象限
  onQuadrantDrop(e) {
    const { dragTask } = this.data;
    const priority = parseInt(e.currentTarget.dataset.priority);
    if (!dragTask || isNaN(priority)) return;

    try {
      // 更新任务优先级
      db.updateTaskPriority(dragTask.id, priority);
      
      // 重新加载任务列表
      this.loadTasks();
      
      // 显示提示
      wx.showToast({
        title: '已更新优先级',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    } finally {
      // 清除拖拽状态
      this.setData({ dragTask: null });
    }
  },

  // 格式化完成时间
  formatCompletionTime(completedAt) {
    if (!completedAt) return ''
    
    const completedDate = new Date(completedAt)
    const now = new Date()
    const diff = now - completedDate

    // 一小时内
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}分钟前`
    }
    
    // 24小时内
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}小时前`
    }
    
    // 超过24小时
    const month = completedDate.getMonth() + 1
    const date = completedDate.getDate()
    const hours = completedDate.getHours().toString().padStart(2, '0')
    const minutes = completedDate.getMinutes().toString().padStart(2, '0')
    return `${month}月${date}日 ${hours}:${minutes}`
  },

  // 优化任务分组逻辑
  groupTasks(tasks) {
    if (!Array.isArray(tasks)) {
      return [];
    }

    const groupedTasks = tasks.reduce((acc, task) => {
      if (!task.startTime) return acc;
      
      const dateKey = `${task.startTime.year}-${task.startTime.month}-${task.startTime.day}`;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {});

    return Object.entries(groupedTasks)
      .map(([date, tasks]) => ({
        date,
        tasks: this.sortTasksByTime(tasks)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // 抽取任务排序逻辑
  sortTasksByTime(tasks) {
    return tasks.sort((a, b) => {
      if (a.isAllDay !== b.isAllDay) {
        return a.isAllDay ? -1 : 1;
      }
      return this.compareTaskTime(a, b);
    });
  },

  compareTaskTime(a, b) {
    const aTime = `${a.startTime.hour}:${a.startTime.minute}`;
    const bTime = `${b.startTime.hour}:${b.startTime.minute}`;
    return aTime.localeCompare(bTime);
  },

  // 优化象限分组逻辑
  groupTasksByQuadrant(tasks) {
    if (!Array.isArray(tasks)) {
      return;
    }
    
    const now = new Date();
    const quadrantTasks = {
      0: [], // 不重要不紧急
      1: [], // 不重要但紧急
      2: [], // 重要不紧急
      3: []  // 重要且紧急
    };

    tasks.forEach(task => {
      if (task.completed) return;

      const priority = task.priority || 0;
      const isUrgent = this.isTaskUrgent(task, now);
      const quadrant = this.determineQuadrant(priority, isUrgent);
      
      if (quadrantTasks[quadrant]) {
        quadrantTasks[quadrant].push(task);
      }
    });

    this.setData({ quadrantTasks });
  },

  // 判断任务是否紧急
  isTaskUrgent(task, now) {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - now.getTime();
    return timeDiff <= 24 * 60 * 60 * 1000; // 24小时内视为紧急
  },

  // 确定任务象限
  determineQuadrant(priority, isUrgent) {
    if (priority >= 2 && isUrgent) return 3;
    if (priority >= 2) return 2;
    if (isUrgent) return 1;
    return 0;
  },

  // 优化表单提交逻辑
  async submitForm() {
    try {
      if (!this.validateForm()) {
        return;
      }

      const taskData = this.formatTaskData();
      await db.addTask(taskData);
      
      this.loadTasks();
      this.resetForm();
      
      wx.showToast({ 
        title: '任务添加成功', 
        icon: 'success' 
      });
    } catch (error) {
      console.error('添加任务失败:', error);
      wx.showToast({ 
        title: '添加失败: ' + error.message, 
        icon: 'none' 
      });
    }
  },

  // 表单验证
  validateForm() {
    const { title } = this.data.newTask;
    if (!title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  // 重置表单
  resetForm() {
    this.setData({
      newTask: {
        title: '',
        notes: '',
        important: false,
        startTime: '',
        dueDate: '',
        location: '',
        url: ''
      },
      showAddTaskModal: false
    });
  },

  toggleComplete() {
    const { task } = this.data;
    this.updateTask({
      completed: !task.completed,
      completedTime: !task.completed ? new Date().toISOString() : null
    });
  },
}) 