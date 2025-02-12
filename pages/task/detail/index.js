const app = getApp()
const db = app.globalData.db
const notification = require('../../../utils/notification')

Page({
  data: {
    task: null,
    showEditModal: false,
    editForm: {
      title: '',
      notes: '',
      startTime: '',
      dueDate: '',
      location: '',
      url: '',
      important: false
    }
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadTask(id)
    }
  },

  // 加载任务数据
  loadTask(id) {
    const task = db.getTask(id)
    if (task) {
      this.setData({ 
        task,
        editForm: { ...task }
      })
    } else {
      wx.showToast({
        title: '任务不存在',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 显示编辑模态框
  showEditModal() {
    this.setData({ showEditModal: true })
  },

  // 隐藏编辑模态框
  hideEditModal() {
    this.setData({ showEditModal: false })
  },

  // 更新任务
  updateTask() {
    const { task, editForm } = this.data
    
    // 验证表单
    if (!editForm.title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      })
      return
    }

    // 更新任务
    const updatedTask = db.updateTask(task.id, editForm)
    if (updatedTask) {
      this.setData({
        task: updatedTask,
        showEditModal: false
      })
      wx.showToast({
        title: '更新成功'
      })
    }
  },

  // 删除任务
  deleteTask() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          const { task } = this.data
          if (db.deleteTask(task.id)) {
            wx.showToast({
              title: '删除成功'
            })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
          }
        }
      }
    })
  },

  // 切换任务状态
  toggleStatus() {
    const { task } = this.data
    const updatedTask = db.updateTask(task.id, {
      completed: !task.completed,
      completedTime: new Date().toISOString()
    })
    if (updatedTask) {
      this.setData({ task: updatedTask })
    }
  },

  // 表单输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`editForm.${field}`]: e.detail.value
    })
  },

  // 切换重要标记
  toggleImportant() {
    this.setData({
      'editForm.important': !this.data.editForm.important
    })
  }
}) 