import db from '../../../utils/db'
const app = getApp()
const notification = require('../../../utils/notification')

Page({
  data: {
    form: {
      title: '',
      notes: '',
      startYear: '',
      startMonth: '',
      startDay: '',
      startHour: '',
      startMinute: '',
      endYear: '',
      endMonth: '',
      endDay: '',
      endHour: '',
      endMinute: '',
      location: '',
      url: '',
      important: false
    },
    submitLoading: false
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

  // 导航到地点
  navigateToLocation() {
    const location = this.data.form.location.address
    if (!location.trim()) {
      wx.showToast({
        title: '请先输入地点',
        icon: 'none'
      })
      return
    }
    
    // 直接打开地图搜索用户输入的地点
    wx.chooseLocation({
      keyword: location
    })
  },

  // 处理时间输入
  onTimeInput(e) {
    const { field } = e.currentTarget.dataset
    let { value } = e.detail
    
    // 根据字段类型进行验证
    switch(field) {
      case 'startMonth':
      case 'endMonth':
        value = Math.min(Math.max(parseInt(value) || 0, 1), 12).toString().padStart(2, '0')
        break
      case 'startDay':
      case 'endDay':
        value = Math.min(Math.max(parseInt(value) || 0, 1), 31).toString().padStart(2, '0')
        break
      case 'startHour':
      case 'endHour':
        value = Math.min(Math.max(parseInt(value) || 0, 0), 23).toString().padStart(2, '0')
        break
      case 'startMinute':
      case 'endMinute':
        value = Math.min(Math.max(parseInt(value) || 0, 0), 59).toString().padStart(2, '0')
        break
    }
    
    this.setData({
      [`form.${field}`]: value
    })
  },

  // 提交表单
  submitForm() {
    const { form } = this.data
    
    if (!form.title.trim()) {
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none'
      })
      return
    }

    // 组合开始和结束时间
    const startTime = this.combineDateTime('start')
    const endTime = this.combineDateTime('end')

    this.setData({ submitLoading: true })

    try {
      const task = db.addTask({
        ...form,
        startTime,
        endTime
      })
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      wx.showToast({
        title: '添加失败',
        icon: 'error'
      })
    } finally {
      this.setData({ submitLoading: false })
    }
  },

  // 取消创建
  cancel() {
    wx.navigateBack()
  },

  // 打开链接
  openUrl() {
    const url = this.data.form.url
    if (!url.trim()) {
      wx.showToast({
        title: '请先输入链接',
        icon: 'none'
      })
      return
    }
    
    // 复制链接到剪贴板
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
      }
    })
  },

  // 组合日期时间
  combineDateTime(prefix) {
    const { form } = this.data
    const year = form[`${prefix}Year`]
    const month = form[`${prefix}Month`]
    const day = form[`${prefix}Day`]
    const hour = form[`${prefix}Hour`]
    const minute = form[`${prefix}Minute`]
    
    if (!year || !month || !day || !hour || !minute) {
      return null
    }
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
}) 