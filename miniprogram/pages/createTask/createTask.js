Page({
  data: {
    taskName: '',
    dueDate: '',
    location: '',
    notes: '',
    attachments: []
  },

  onLoad() {
    // 初始化时不设置默认日期
    this.setData({
      dueDate: ''
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

  // 验证日期格式
  validateDate(date) {
    if (!date) return true; // 空日期是有效的
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
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

    // 验证日期（如果有输入）
    if (this.data.dueDate && !this.validateDate(this.data.dueDate)) {
      wx.showToast({
        title: '请输入有效的日期',
        icon: 'none'
      })
      return
    }

    const task = {
      id: Date.now(),
      name: this.data.taskName,
      dueDate: this.data.dueDate || null,
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
