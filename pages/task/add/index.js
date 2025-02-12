const app = getApp()
const db = app.globalData.db
const notification = require('../../../utils/notification')

Page({
  data: {
    form: {
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
    // 如果有预设日期，设置到表单中
    if (options.date) {
      this.setData({
        'form.dueDate': options.date
      })
    }
  },

  // 表单输入处理
  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`form.${field}`]: e.detail.value
    })
  },

  // 切换重要标记
  toggleImportant() {
    this.setData({
      'form.important': !this.data.form.important
    })
  },

  // 选择地点
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.location': res.address
        })
      }
    })
  },

  // 提交表单
  submitForm() {
    const { form } = this.data

    // 验证表单
    if (!form.title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      })
      return
    }

    // 创建任务
    const task = db.createTask({
      ...form,
      createTime: new Date().toISOString(),
      completed: false
    })

    if (task) {
      // 如果设置了截止时间，创建提醒
      if (form.dueDate) {
        notification.createTaskReminder(task)
      }

      wx.showToast({
        title: '创建成功'
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 取消创建
  cancel() {
    wx.navigateBack()
  }
}) 