const app = getApp()
const db = require('../../../utils/db')
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
    },
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.loadTask(options.id)
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      })
      setTimeout(() => wx.navigateBack(), 1500)
    }
  },

  async loadTask(taskId) {
    try {
      const task = db.getTasks().find(t => t.id === taskId)
      if (!task) {
        throw new Error('任务不存在')
      }
      this.setData({ task, loading: false })
    } catch (error) {
      console.error('加载任务失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
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
  updateTask(data) {
    const { task } = this.data
    try {
      const updatedTask = db.updateTask(task.id, data)
      if (updatedTask) {
        this.setData({
          task: updatedTask,
          showEditModal: false
        })
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('更新任务失败:', error)
      wx.showToast({
        title: '更新失败',
        icon: 'error'
      })
    }
  },

  // 删除任务
  deleteTask() {
    const { task } = this.data
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            db.deleteTask(task.id)
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            setTimeout(() => wx.navigateBack(), 1500)
          } catch (error) {
            console.error('删除任务失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 切换任务完成状态
  toggleComplete() {
    const { task } = this.data
    this.updateTask({
      completed: !task.completed,
      completedTime: !task.completed ? new Date().toISOString() : null
    })
  },

  // 切换重要标记
  toggleImportant() {
    const { task } = this.data
    this.updateTask({
      important: !task.important
    })
  },

  // 表单输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`editForm.${field}`]: e.detail.value
    })
  }
}) 