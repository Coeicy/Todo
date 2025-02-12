const lunar = require('../../utils/lunar')

Component({
  properties: {
    // 是否显示农历
    showLunar: {
      type: Boolean,
      value: true
    },
    // 是否显示节日
    showFestival: {
      type: Boolean,
      value: true
    },
    // 是否显示节气
    showSolarTerm: {
      type: Boolean,
      value: true
    },
    // 是否显示任务点
    showTaskDots: {
      type: Boolean,
      value: true
    },
    // 任务数据
    tasks: {
      type: Array,
      value: []
    }
  },

  data: {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    days: [],
    selectedDate: null,
    lunarInfo: {}
  },

  lifetimes: {
    attached() {
      this.initCalendar()
    }
  },

  observers: {
    tasks() {
      this.generateDays()
    }
  },

  methods: {
    // 初始化日历
    initCalendar() {
      const today = new Date()
      this.setData({
        year: today.getFullYear(),
        month: today.getMonth() + 1
      }, () => {
        this.generateDays()
        this.updateLunarInfo()
      })
    },

    // 生成日历数据
    generateDays() {
      const { year, month } = this.data
      const days = []
      
      // 获取当月第一天是星期几
      const firstDay = new Date(year, month - 1, 1).getDay()
      
      // 获取当月天数
      const lastDate = new Date(year, month, 0).getDate()
      
      // 获取今天的日期信息
      const today = new Date()
      const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1
      const currentDate = today.getDate()

      // 填充上月剩余日期
      const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
      for (let i = 0; i < firstDay; i++) {
        const date = new Date(year, month - 2, prevMonthLastDay - i)
        days.unshift(this.generateDayInfo(date, false))
      }

      // 填充当月日期
      for (let date = 1; date <= lastDate; date++) {
        const currentDay = new Date(year, month - 1, date)
        days.push(this.generateDayInfo(currentDay, true))
      }

      // 填充下月开始日期
      const remainingDays = 42 - days.length // 保持6行
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month, i)
        days.push(this.generateDayInfo(date, false))
      }

      this.setData({ days })
    },

    // 生成日期信息
    generateDayInfo(date, isCurrentMonth) {
      const lunarDate = lunar.getLunarDate(date)
      const festival = this.data.showFestival ? lunar.getFestival(date) : ''
      const solarTerm = this.data.showSolarTerm ? lunar.getSolarTerm(date) : ''
      
      // 获取当天任务
      const tasks = this.data.showTaskDots ? this.getDateTasks(date) : []

      return {
        date: date.getDate(),
        fullDate: lunar.formatDate(date),
        lunar: this.data.showLunar ? `${lunarDate.month}${lunarDate.day}` : '',
        holiday: festival,
        term: solarTerm,
        tasks,
        isCurrentMonth,
        isToday: lunar.isToday(date)
      }
    },

    // 获取指定日期的任务
    getDateTasks(date) {
      const dateStr = lunar.formatDate(date)
      return this.data.tasks.filter(task => {
        const taskDate = task.dueDate.split('T')[0]
        return taskDate === dateStr
      })
    },

    // 更新农历年份信息
    updateLunarInfo() {
      const { year } = this.data
      const lunarDate = lunar.getLunarDate(new Date(year, 0, 1))
      this.setData({
        lunarInfo: {
          year: lunarDate.year,
          zodiac: lunarDate.zodiac
        }
      })
    },

    // 切换月份
    changeMonth(e) {
      const { type } = e.currentTarget.dataset
      let { year, month } = this.data
      
      if (type === 'prev') {
        if (month === 1) {
          year--
          month = 12
        } else {
          month--
        }
      } else {
        if (month === 12) {
          year++
          month = 1
        } else {
          month++
        }
      }
      
      this.setData({ 
        year, 
        month,
        selectedDate: null
      }, () => {
        this.generateDays()
        this.updateLunarInfo()
      })

      this.triggerEvent('monthChange', { year, month })
    },

    // 选择日期
    selectDate(e) {
      const { date } = e.currentTarget.dataset
      const selectedDay = this.data.days.find(day => day.fullDate === date)
      if (!selectedDay) return

      this.setData({ selectedDate: selectedDay })
      this.triggerEvent('select', { date: selectedDay })
    },

    // 返回今天
    goToday() {
      const today = new Date()
      this.setData({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        selectedDate: null
      }, () => {
        this.generateDays()
        this.updateLunarInfo()
        this.triggerEvent('today')
      })
    }
  }
}) 