const app = getApp()
const db = require('../../utils/db')  // 直接引入 db
const lunar = require('../../utils/lunar')

Page({
  data: {
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    currentIndex: 2, // 中间容器
    monthContainers: [], // 存储三个月的容器数据
    containerPositions: [], // 容器位置
    touchStartY: 0,
    selectedLunarDate: '',
    selectedDateTasks: [],
    days: [], // 当前月的日期数据
    tasks: [],
    weeks: [], // 按周分组的日期数据
    expandedWeek: null, // 当前展开的周
    translateY: 0,
    currentTransition: false,
    allWeeks: [], // 存储当前月和前后月的周数据
    touchStartTime: 0,
    inputYear: new Date().getFullYear(),
    inputMonth: new Date().getMonth() + 1,
    isCurrentMonth: true,
    monthGrids: [], // 存储三个月的数据
    translateX: 0,  // 横向偏移量
    touching: false,
    startY: 0,
    currentMonthIndex: 1,  // 当前月份在monthGrids中的索引
    containerHeight: 0,
    currentWeekday: new Date().getDay() || 7, // 获取当前是星期几，周日返回0转为7
    todayBtnActive: true,
    isTransitioning: false,
    loading: true,
  },

  onLoad() {
    this.initContainers()
    wx.getSystemInfo({
      success: (res) => {
        // 计算容器高度
        const containerHeight = (res.windowHeight - 120) // 减去头部和星期栏高度
        this.setData({ containerHeight })
      }
    })
    this.loadCalendarData()
  },

  // 初始化日历
  initCalendar() {
    const { currentYear, currentMonth } = this.data
    const days = this.generateDays()
    
    this.setData({ 
      days,
      isCurrentMonth: this.checkIsCurrentMonth()
    })
  },

  // 生成当前月的日期数据
  generateDays() {
    const { currentYear, currentMonth } = this.data;
    const days = [];
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // 获取当月第一天是星期几（0-6，0代表周日）
    let firstDayWeek = firstDay.getDay();
    // 转换为周一开始（0-6，0代表周一）
    firstDayWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1;
    
    // 获取上月最后几天
    const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();
    
    // 填充上月日期
    for (let i = 0; i < firstDayWeek; i++) {
      const prevDay = prevMonthLastDay - firstDayWeek + i + 1;
      const date = new Date(currentYear, currentMonth - 2, prevDay);
      
      if (days.length % 7 === 0) days.push([]);
      days[Math.floor(days.length / 7)].push({
        day: prevDay,
        fullDate: this.formatDate(date),
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        lunar: lunar.getLunarDay(date), // 只获取农历日期数字
        tasks: []
      });
    }
    
    // 填充当月日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth - 1, i);
      
      if (days.length % 7 === 0) days.push([]);
      days[Math.floor(days.length / 7)].push({
        day: i,
        fullDate: this.formatDate(date),
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        lunar: lunar.getLunarDay(date), // 只获取农历日期数字
        tasks: []
      });
    }
    
    // 填充下月日期
    const remainingDays = 35 - (firstDayWeek + lastDay.getDate());
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth, i);
      
      if (days.length % 7 === 0) days.push([]);
      days[Math.floor(days.length / 7)].push({
        day: i,
        fullDate: this.formatDate(date),
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        lunar: lunar.getLunarDay(date), // 只获取农历日期数字
        tasks: []
      });
    }

    this.setData({ days });
    return days;
  },

  // 检查是否是当前月
  checkIsCurrentMonth() {
    const now = new Date()
    const isCurrentMonth = this.data.currentYear === now.getFullYear() && 
                           this.data.currentMonth === now.getMonth() + 1
    
    this.setData({
      'todayBtnActive': !isCurrentMonth
    })
  },

  // 更新每周起始日
  updateWeekStart(weekStart) {
    const weekdays = weekStart === 0 
      ? ['一', '二', '三', '四', '五', '六', '日']
      : ['日', '一', '二', '三', '四', '五', '六']
    
    this.setData({ weekdays })
    this.initAllWeeks() // 重新生成日历
  },

  // 初始化三个月的周数据
  initAllWeeks() {
    const { currentYear, currentMonth } = this.data
    const prevMonth = this.getAdjustedMonth(currentYear, currentMonth, -1)
    const nextMonth = this.getAdjustedMonth(currentYear, currentMonth, 1)

    const prevWeeks = this.generateCalendarDays(prevMonth.year, prevMonth.month)
    const currentWeeks = this.generateCalendarDays(currentYear, currentMonth)
    const nextWeeks = this.generateCalendarDays(nextMonth.year, nextMonth.month)

    this.setData({
      allWeeks: [...prevWeeks, ...currentWeeks, ...nextWeeks],
      translateY: -currentWeeks.length * this.getWeekHeight()
    })
  },

  // 生成日历数据
  generateCalendarDays(year, month) {
    const settings = wx.getStorageSync('settings') || {}
    const weekStart = settings.weekStart || 0
    
    let calendarDays = []
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    let startEmptyDays = firstDay.getDay() - weekStart
    if (startEmptyDays < 0) startEmptyDays += 7

    // 填充上个月的日期
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = 0; i < startEmptyDays; i++) {
      let prevMonth = month - 1
      let prevYear = year
      if (prevMonth < 1) {
        prevMonth = 12
        prevYear--
      }
      const date = new Date(prevYear, prevMonth - 1, prevMonthLastDay - startEmptyDays + i + 1)
      if (!isNaN(date.getTime())) {
        calendarDays.push({
          date: date,
          day: date.getDate(),
          current: false,
          today: this.isToday(date),
          fullDate: this.formatDate(date)
        })
      }
    }

    // 填充当前月的日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month - 1, i)
      if (!isNaN(date.getTime())) {
        calendarDays.push({
          date: date,
          day: i,
          current: true,
          today: this.isToday(date),
          fullDate: this.formatDate(date)
        })
      }
    }

    // 填充下个月的日期
    const remainingDays = 42 - calendarDays.length
    for (let i = 1; i <= remainingDays; i++) {
      let nextMonth = month + 1
      let nextYear = year
      if (nextMonth > 12) {
        nextMonth = 1
        nextYear++
      }
      const date = new Date(nextYear, nextMonth - 1, i)
      if (!isNaN(date.getTime())) {
        calendarDays.push({
          date: date,
          day: i,
          current: false,
          today: this.isToday(date),
          fullDate: this.formatDate(date)
        })
      }
    }

    // 为每一天添加任务数据和农历信息
    calendarDays = calendarDays.map(day => {
      const dayTasks = this.getTasksForDate(day.date)
      return {
        ...day,
        tasks: dayTasks,
        taskCount: dayTasks.length,
        lunar: this.getLunarDayStr(day.date)
      }
    })

    // 按周分组
    const weeks = []
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7))
    }

    this.setData({ weeks })
    return weeks
  },

  // 格式化日期为ISO字符串的安全方法
  formatDate(date) {
    try {
      if (!date || isNaN(date.getTime())) {
        return ''
      }
      return date.toISOString()
    } catch (error) {
      console.error('日期格式化错误:', error)
      return ''
    }
  },

  // 加载日历数据
  async loadCalendarData() {
    try {
      const tasks = db.getTasks();
      this.setData({ tasks });
      this.generateCalendarDays();
    } catch (error) {
      console.error('加载日历数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  // 按日期分组任务
  groupTasksByDate(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const dateKey = this.formatDate(task.startTime);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },

  // 获取指定日期的任务
  getTasksForDate(date) {
    const dateStr = this.formatDate(date);
    return this.data.tasks[dateStr] || [];
  },

  // 选择日期
  selectDate(e) {
    const { date } = e.currentTarget.dataset
    const selectedDay = this.data.days.find(day => day.fullDate === date)
    if (!selectedDay) return

    this.setData({ selectedDate: selectedDay })
    this.triggerEvent('select', { date: selectedDay })

    // 弹出操作菜单
    wx.showActionSheet({
      itemList: ['添加任务', '查看任务'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 添加任务 - 设置为当天的全天任务，添加 fromCalendar 参数
          wx.navigateTo({
            url: `/pages/task/add/index?date=${date}&isAllDay=true&fromCalendar=true`
          })
        } else if (res.tapIndex === 1) {
          // 查看当天任务
          wx.navigateTo({
            url: `/pages/task/list/index?date=${date}`
          })
        }
      }
    })
  },

  // 点击任务处理
  goToTaskDetail(e) {
    const { task } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/task/detail/index?id=${task.id}`
    })
  },

  // 判断是否是今天
  isToday(date) {
    const today = new Date()
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate()
  },

  // 获取农历日期字符串
  getLunarDateStr(date) {
    const lunarDate = lunar.getLunarDate(date)
    return `农历${lunarDate.monthStr}${lunarDate.dayStr}`
  },

  // 获取农历日期数字
  getLunarDayStr(date) {
    const lunarDate = lunar.getLunarDate(date)
    return lunarDate.dayStr
  },

  // 初始化月份容器
  initContainers() {
    const { currentYear, currentMonth } = this.data
    const prevMonth = this.getAdjustedMonth(currentYear, currentMonth, -1)
    const nextMonth = this.getAdjustedMonth(currentYear, currentMonth, 1)

    const monthContainers = [
      {
        id: 'prev',
        days: this.generateDays(prevMonth.year, prevMonth.month)
      },
      {
        id: 'current',
        days: this.generateDays(currentYear, currentMonth)
      },
      {
        id: 'next',
        days: this.generateDays(nextMonth.year, nextMonth.month)
      }
    ]

    this.setData({
      monthContainers,
      translateY: -this.data.containerHeight
    })
  },

  // 处理触摸开始
  onTouchStart(e) {
    this.setData({
      touching: true,
      startY: e.touches[0].clientY
    })
  },

  // 处理触摸移动
  onTouchMove(e) {
    if (!this.data.touching) return
    
    const deltaY = e.touches[0].clientY - this.data.startY
    const { containerHeight } = this.data
    const translateY = -containerHeight + deltaY

    // 限制滑动范围并添加阻尼效果
    if (Math.abs(deltaY) < containerHeight * 1.5) {
      const damping = 0.6
      const dampedTranslateY = deltaY > 0 
        ? -containerHeight + (deltaY * damping)
        : -containerHeight + (deltaY * damping)
      this.setData({ translateY: dampedTranslateY })
    }
  },

  // 处理触摸结束
  onTouchEnd(e) {
    if (!this.data.touching) return
    
    const deltaY = e.changedTouches[0].clientY - this.data.startY
    const { containerHeight } = this.data

    if (Math.abs(deltaY) > containerHeight / 4) {
      // 滑动超过1/4高度时切换月份
      if (deltaY > 0) {
        this.toPrevMonth()
      } else {
        this.toNextMonth()
      }
    } else {
      // 回弹到当前月
      this.setData({
        translateY: -containerHeight,
        touching: false
      })
    }
  },

  // 切换到上个月
  toPrevMonth() {
    const { currentYear, currentMonth, containerHeight } = this.data
    const prevMonth = this.getAdjustedMonth(currentYear, currentMonth, -1)
    
    this.setData({
      currentYear: prevMonth.year,
      currentMonth: prevMonth.month,
      translateY: 0,
      touching: false
    }, () => {
      setTimeout(() => {
        this.initContainers()
        this.checkIsCurrentMonth()
      }, 300)
    })
  },

  // 切换到下个月
  toNextMonth() {
    const { currentYear, currentMonth, containerHeight } = this.data
    const nextMonth = this.getAdjustedMonth(currentYear, currentMonth, 1)
    
    this.setData({
      currentYear: nextMonth.year,
      currentMonth: nextMonth.month,
      translateY: -containerHeight * 2,
      touching: false
    }, () => {
      setTimeout(() => {
        this.initContainers()
        this.checkIsCurrentMonth()
      }, 300)
    })
  },

  // 获取调整后的月份
  getAdjustedMonth(year, month, offset) {
    const newMonth = month + offset
    let newYear = year
    
    if (newMonth > 12) {
      newYear++
      month = 1
    } else if (newMonth < 1) {
      newYear--
      month = 12
    } else {
      month = newMonth
    }
    
    return { year: newYear, month }
  },

  // 年份输入处理
  onYearInput(e) {
    let value = e.detail.value
    // 限制只能输入数字
    value = value.replace(/\D/g, '')
    // 限制长度为4位
    if (value.length > 4) {
      value = value.slice(0, 4)
    }
    // 限制范围在1900-2100
    let year = parseInt(value)
    if (year && year >= 1900 && year <= 2100) {
      this.setData({ inputYear: year })
    }
    // 返回处理后的值，这样输入框会显示处理后的内容
    return value
  },

  // 年份失焦处理
  onYearBlur(e) {
    let year = parseInt(e.detail.value)
    if (!year || year < 1900 || year > 2100) {
      // 超出范围时恢复原值
      this.setData({ 
        inputYear: this.data.currentYear,
        currentYear: this.data.currentYear
      })
      wx.showToast({
        title: '年份范围：1900-2100',
        icon: 'none'
      })
    } else {
      this.setData({
        currentYear: year
      }, () => {
        this.initAllWeeks()
      })
    }
    this.checkCurrentMonth()
  },

  // 月份输入处理
  onMonthInput(e) {
    let value = e.detail.value
    // 限制只能输入数字
    value = value.replace(/\D/g, '')
    // 限制长度为2位
    if (value.length > 2) {
      value = value.slice(0, 2)
    }
    // 限制范围在1-12
    let month = parseInt(value)
    if (month) {
      if (month > 12) {
        month = 12
        value = '12'
      } else if (month < 1) {
        month = 1
        value = '1'
      }
      this.setData({ inputMonth: month })
    }
    // 返回处理后的值
    return value
  },

  // 月份失焦处理
  onMonthBlur(e) {
    let month = parseInt(e.detail.value)
    if (!month || month < 1 || month > 12) {
      // 超出范围时恢复原值
      this.setData({ 
        inputMonth: this.data.currentMonth,
        currentMonth: this.data.currentMonth
      })
      wx.showToast({
        title: '月份范围：1-12',
        icon: 'none'
      })
    } else {
      this.setData({
        currentMonth: month
      }, () => {
        this.initAllWeeks()
      })
    }
    this.checkCurrentMonth()
  },

  // 检查是否是当前月份
  checkCurrentMonth() {
    const today = new Date()
    const isCurrentMonth = 
      this.data.currentYear === today.getFullYear() && 
      this.data.currentMonth === today.getMonth() + 1

    this.setData({ isCurrentMonth })
  },

  // 跳转到今天
  goToday() {
    const today = new Date();
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1, // 设置为当前月份
      inputYear: today.getFullYear(),
      inputMonth: today.getMonth() + 1
    }, () => {
      this.initAllWeeks(); // 重新初始化周数据
      this.loadCalendarData(); // 重新加载日历数据
      wx.vibrateShort(); // 震动反馈
    });
  },

  // 切换周展开状态
  toggleWeek(e) {
    const weekIndex = e.currentTarget.dataset.week
    this.setData({
      expandedWeek: this.data.expandedWeek === weekIndex ? null : weekIndex
    })
  },

  // 跳转到今年1月
  goToCurrentYear() {
    const currentYear = new Date().getFullYear()
    
    this.setData({
      currentYear,
      currentMonth: 1,
      inputYear: currentYear,
      inputMonth: 1
    }, () => {
      this.initAllWeeks()
      wx.vibrateShort()
    })
  },

  // 获取周高度
  getWeekHeight() {
    const query = wx.createSelectorQuery()
    return new Promise(resolve => {
      query.select('.week-row').boundingClientRect(rect => {
        resolve(rect ? rect.height : 100)
      }).exec()
    })
  },
})