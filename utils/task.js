const lunar = require('./lunar')

class TaskManager {
  constructor() {
    this.tasks = wx.getStorageSync('tasks') || []
  }

  // 添加任务
  addTask(task) {
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
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    this.tasks.unshift(newTask)
    this._save()
    return newTask
  }

  // 更新任务
  updateTask(taskId, updates) {
    const oldTask = this.getTaskById(taskId)
    if (!oldTask) return null

    const result = super.updateTask(taskId, updates)
    if (result) {
      this._recordTaskChange(taskId, {
        before: { ...oldTask },
        after: { ...result }
      })
    }
    return result
  }

  // 删除任务
  deleteTask(taskId) {
    const index = this.tasks.findIndex(t => t.id === taskId)
    if (index > -1) {
      this.tasks.splice(index, 1)
      this._save()
      return true
    }
    return false
  }

  // 获取所有任务
  getTasks() {
    return this.tasks
  }

  // 获取任务详情
  getTaskById(taskId) {
    return this.tasks.find(t => t.id === taskId)
  }

  // 获取指定日期的任务
  getTasksByDate(date) {
    const dateStr = lunar.formatDate(date)
    return this.tasks.filter(task => {
      if (!task.dueDate) return false
      return lunar.formatDate(new Date(task.dueDate)) === dateStr
    })
  }

  // 获取日期范围内的任务
  getTasksBetween(startDate, endDate) {
    return this.tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return taskDate >= startDate && taskDate <= endDate
    })
  }

  // 按状态分组任务
  groupTasksByStatus() {
    return {
      todo: this.tasks.filter(t => !t.completed),
      completed: this.tasks.filter(t => t.completed)
    }
  }

  // 按日期分组任务
  groupTasksByDate() {
    const groups = {
      noDate: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      completed: []
    }

    const now = new Date()
    const today = lunar.getStartOfDay(now)
    const tomorrow = lunar.addDays(today, 1)
    const weekEnd = lunar.getWeekRange(now).end

    this.tasks.forEach(task => {
      if (task.completed) {
        groups.completed.push(task)
        return
      }

      if (!task.dueDate) {
        groups.noDate.push(task)
        return
      }

      const dueDate = new Date(task.dueDate)
      if (lunar.isSameDay(dueDate, today)) {
        groups.today.push(task)
      } else if (lunar.isSameDay(dueDate, tomorrow)) {
        groups.tomorrow.push(task)
      } else if (dueDate <= weekEnd) {
        groups.thisWeek.push(task)
      } else {
        groups.later.push(task)
      }
    })

    return groups
  }

  // 获取任务统计
  getTaskStats() {
    const total = this.tasks.length
    const completed = this.tasks.filter(t => t.completed).length
    const important = this.tasks.filter(t => t.important).length
    const today = this.getTasksByDate(new Date()).length
    
    return {
      total,
      completed,
      important,
      today,
      completion: total ? Math.round((completed / total) * 100) : 0
    }
  }

  // 搜索任务
  searchTasks(keyword) {
    if (!keyword) return []
    const lowerKeyword = keyword.toLowerCase()
    
    return this.tasks.filter(task => {
      return task.title.toLowerCase().includes(lowerKeyword) ||
             task.notes.toLowerCase().includes(lowerKeyword) ||
             task.location?.toLowerCase().includes(lowerKeyword) ||
             task.url?.toLowerCase().includes(lowerKeyword)
    })
  }

  // 获取重要任务
  getImportantTasks() {
    return this.tasks.filter(t => t.important && !t.completed)
  }

  // 获取过期任务
  getOverdueTasks() {
    const now = new Date()
    return this.tasks.filter(task => {
      if (!task.dueDate || task.completed) return false
      return new Date(task.dueDate) < now
    })
  }

  // 获取最近完成的任务
  getRecentlyCompletedTasks(days = 7) {
    const now = new Date()
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return this.tasks.filter(task => {
      if (!task.completed || !task.completedTime) return false
      return new Date(task.completedTime) > cutoff
    })
  }

  // 获取任务完成趋势
  getCompletionTrend(days = 7) {
    const trend = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = lunar.formatDate(date)
      
      const dayTasks = this.tasks.filter(task => {
        return task.completedTime && 
               lunar.formatDate(new Date(task.completedTime)) === dateStr
      })
      
      trend.push({
        date: dateStr,
        count: dayTasks.length
      })
    }
    
    return trend
  }

  // 批量更新任务
  batchUpdateTasks(taskIds, updates) {
    const updatedTasks = []
    taskIds.forEach(id => {
      const updated = this.updateTask(id, updates)
      if (updated) updatedTasks.push(updated)
    })
    return updatedTasks
  }

  // 批量删除任务
  batchDeleteTasks(taskIds) {
    let deletedCount = 0
    taskIds.forEach(id => {
      if (this.deleteTask(id)) deletedCount++
    })
    return deletedCount
  }

  // 清除已完成的任务
  clearCompletedTasks() {
    const completedTasks = this.tasks.filter(t => t.completed)
    this.tasks = this.tasks.filter(t => !t.completed)
    this._save()
    return completedTasks.length
  }

  // 清除过期的已完成任务
  clearOldCompletedTasks(days = 30) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    
    const oldTasks = this.tasks.filter(task => {
      return task.completed && 
             task.completedTime && 
             new Date(task.completedTime) < cutoff
    })
    
    this.tasks = this.tasks.filter(task => {
      return !task.completed || 
             !task.completedTime || 
             new Date(task.completedTime) >= cutoff
    })
    
    this._save()
    return oldTasks.length
  }

  // 导出任务数据
  exportTasks() {
    return {
      tasks: this.tasks,
      exportTime: new Date().toISOString(),
      version: '1.0.0'
    }
  }

  // 导入任务数据
  importTasks(data) {
    if (!data || !Array.isArray(data.tasks)) {
      throw new Error('无效的任务数据')
    }
    
    // 验证任务数据格式
    const isValidTask = task => {
      return task.id && 
             task.title && 
             typeof task.completed === 'boolean' &&
             task.createTime
    }
    
    const validTasks = data.tasks.filter(isValidTask)
    if (validTasks.length === 0) {
      throw new Error('没有有效的任务数据')
    }
    
    this.tasks = validTasks
    this._save()
    return validTasks.length
  }

  // 保存到本地存储
  _save() {
    wx.setStorageSync('tasks', this.tasks)
  }

  // 按优先级排序任务
  sortTasksByPriority(tasks = this.tasks) {
    return [...tasks].sort((a, b) => {
      // 首先按完成状态排序
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      // 然后按重要性排序
      if (a.important !== b.important) {
        return a.important ? -1 : 1
      }
      // 最后按截止日期排序
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate)
      }
      return a.dueDate ? -1 : 1
    })
  }

  // 按时间排序任务
  sortTasksByTime(tasks = this.tasks, ascending = true) {
    return [...tasks].sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31')
      const timeB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31')
      return ascending ? timeA - timeB : timeB - timeA
    })
  }

  // 获取任务标签统计
  getTaskTags() {
    const tags = new Map()
    this.tasks.forEach(task => {
      if (task.location) {
        tags.set('location:' + task.location, 
          (tags.get('location:' + task.location) || 0) + 1)
      }
      if (task.url) {
        tags.set('url:' + task.url, 
          (tags.get('url:' + task.url) || 0) + 1)
      }
    })
    return Array.from(tags, ([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  }

  // 获取任务时间分布
  getTaskTimeDistribution() {
    const distribution = {
      morning: 0,   // 6-12
      afternoon: 0, // 12-18
      evening: 0,   // 18-24
      night: 0      // 0-6
    }

    this.tasks.forEach(task => {
      if (!task.startTime) return
      const hour = new Date(task.startTime).getHours()
      if (hour >= 6 && hour < 12) distribution.morning++
      else if (hour >= 12 && hour < 18) distribution.afternoon++
      else if (hour >= 18 && hour < 24) distribution.evening++
      else distribution.night++
    })

    return distribution
  }

  // 获取任务完成率分析
  getCompletionAnalysis() {
    const analysis = {
      byPriority: {
        important: { total: 0, completed: 0 },
        normal: { total: 0, completed: 0 }
      },
      byTimeOfDay: {
        morning: { total: 0, completed: 0 },
        afternoon: { total: 0, completed: 0 },
        evening: { total: 0, completed: 0 },
        night: { total: 0, completed: 0 }
      },
      byDayOfWeek: Array(7).fill().map(() => ({ total: 0, completed: 0 }))
    }

    this.tasks.forEach(task => {
      // 按优先级统计
      const priorityGroup = task.important ? 'important' : 'normal'
      analysis.byPriority[priorityGroup].total++
      if (task.completed) {
        analysis.byPriority[priorityGroup].completed++
      }

      // 按时间段统计
      if (task.startTime) {
        const hour = new Date(task.startTime).getHours()
        let timeGroup
        if (hour >= 6 && hour < 12) timeGroup = 'morning'
        else if (hour >= 12 && hour < 18) timeGroup = 'afternoon'
        else if (hour >= 18 && hour < 24) timeGroup = 'evening'
        else timeGroup = 'night'

        analysis.byTimeOfDay[timeGroup].total++
        if (task.completed) {
          analysis.byTimeOfDay[timeGroup].completed++
        }
      }

      // 按星期统计
      if (task.dueDate) {
        const dayOfWeek = new Date(task.dueDate).getDay()
        analysis.byDayOfWeek[dayOfWeek].total++
        if (task.completed) {
          analysis.byDayOfWeek[dayOfWeek].completed++
        }
      }
    })

    // 计算完成率
    const calculateRate = (group) => {
      return group.total ? Math.round((group.completed / group.total) * 100) : 0
    }

    return {
      ...analysis,
      rates: {
        byPriority: {
          important: calculateRate(analysis.byPriority.important),
          normal: calculateRate(analysis.byPriority.normal)
        },
        byTimeOfDay: {
          morning: calculateRate(analysis.byTimeOfDay.morning),
          afternoon: calculateRate(analysis.byTimeOfDay.afternoon),
          evening: calculateRate(analysis.byTimeOfDay.evening),
          night: calculateRate(analysis.byTimeOfDay.night)
        },
        byDayOfWeek: analysis.byDayOfWeek.map(calculateRate)
      }
    }
  }

  // 设置任务提醒
  setTaskReminder(taskId, reminderTime) {
    const task = this.getTaskById(taskId)
    if (!task || !task.dueDate) return false

    const notification = require('./notification')
    const dueDate = new Date(task.dueDate)
    
    // 如果已经过期，不设置提醒
    if (dueDate < new Date()) return false

    // 更新任务提醒时间
    this.updateTask(taskId, {
      reminderTime,
      reminderSet: true
    })

    // 设置提醒
    notification.scheduleNotification(task, reminderTime)
    return true
  }

  // 取消任务提醒
  cancelTaskReminder(taskId) {
    const task = this.getTaskById(taskId)
    if (!task) return false

    const notification = require('./notification')
    notification.cancelNotification(taskId)

    this.updateTask(taskId, {
      reminderTime: null,
      reminderSet: false
    })

    return true
  }

  // 重置所有任务提醒
  resetAllReminders() {
    const notification = require('./notification')
    notification.clearAllNotifications()

    const tasks = this.tasks.filter(t => !t.completed && t.dueDate && t.reminderSet)
    tasks.forEach(task => {
      if (task.reminderTime) {
        notification.scheduleNotification(task, task.reminderTime)
      }
    })

    return tasks.length
  }

  // 获取即将到期的任务
  getUpcomingTasks(hours = 24) {
    const now = new Date()
    const deadline = new Date(now.getTime() + hours * 60 * 60 * 1000)
    
    return this.tasks.filter(task => {
      if (!task.dueDate || task.completed) return false
      const dueDate = new Date(task.dueDate)
      return dueDate > now && dueDate <= deadline
    })
  }

  // 获取任务变更历史
  getTaskHistory(taskId) {
    const task = this.getTaskById(taskId)
    if (!task || !task.history) return []
    
    return task.history.map(record => ({
      ...record,
      time: new Date(record.time),
      changes: JSON.parse(record.changes)
    })).sort((a, b) => b.time - a.time)
  }

  // 记录任务变更
  _recordTaskChange(taskId, changes, type = 'update') {
    const task = this.getTaskById(taskId)
    if (!task) return

    if (!task.history) task.history = []
    
    task.history.push({
      time: new Date().toISOString(),
      type,
      changes: JSON.stringify(changes)
    })

    // 只保留最近的30条记录
    if (task.history.length > 30) {
      task.history = task.history.slice(-30)
    }

    this._save()
  }

  // 获取任务冲突
  getTaskConflicts() {
    const conflicts = []
    const tasksByTime = new Map()

    // 收集同一时间段的任务
    this.tasks.forEach(task => {
      if (!task.startTime || !task.dueDate || task.completed) return
      
      const start = new Date(task.startTime)
      const end = new Date(task.dueDate)
      const key = `${start.toISOString()}-${end.toISOString()}`
      
      if (!tasksByTime.has(key)) {
        tasksByTime.set(key, [])
      }
      tasksByTime.get(key).push(task)
    })

    // 检查冲突
    tasksByTime.forEach(tasks => {
      if (tasks.length > 1) {
        conflicts.push({
          time: {
            start: new Date(tasks[0].startTime),
            end: new Date(tasks[0].dueDate)
          },
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            important: t.important
          }))
        })
      }
    })

    return conflicts
  }
}

module.exports = new TaskManager() 