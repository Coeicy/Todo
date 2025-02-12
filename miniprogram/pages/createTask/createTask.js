Page({
  data: {
    taskName: '',
    dueDate: '',
    location: '',
    notes: '',
    attachments: []
  },

  onLoad() {
    // 初始化日期选择器
    const now = new Date()
    this.setData({
      dueDate: now.toISOString().split('T')[0]
    })
  },

  // 输入任务名称
  handleTaskNameInput(e) {
    this.setData({
      taskName: e.detail.value
    })
  },

  // 选择日期
  handleDateChange(e) {
    this.setData({
      dueDate: e.detail.value
    })
  },

  // 输入地点
  handleLocationInput(e) {
    this.setData({
      location: e.detail.value
    })
  },

  // 输入备注
  handleNotesInput(e) {
    this.setData({
      notes: e.detail.value
    })
  },

  // 上传附件
  handleUploadAttachment() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: (res) => {
        const tempFiles = res.tempFiles
        this.setData({
          attachments: this.data.attachments.concat(tempFiles)
        })
      }
    })
  },

  // 删除附件
  handleRemoveAttachment(e) {
    const index = e.currentTarget.dataset.index
    const attachments = this.data.attachments.filter((_, i) => i !== index)
    this.setData({ attachments })
  },

  // 提交表单
  handleSubmit() {
    if (!this.data.taskName) {
      wx.showToast({
        title: '请输入任务名称',
        icon: 'none'
      })
      return
    }

    const task = {
      id: Date.now(),
      name: this.data.taskName,
      dueDate: this.data.dueDate,
      location: this.data.location,
      notes: this.data.notes,
      attachments: this.data.attachments,
      completed: false
    }

    // 保存任务并返回上一页
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    prevPage.addTask(task)
    wx.navigateBack()
  }
})
