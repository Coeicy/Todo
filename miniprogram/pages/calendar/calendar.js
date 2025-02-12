// calendar.js
Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarData: []
  },

  onLoad() {
    this.generateCalendar();
  },

  generateCalendar() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const calendar = [];
    // 填充空白
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar.push({ date: '', lunarDate: '' });
    }

    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      calendar.push({
        date: i,
        lunarDate: this.getLunarDate(date),
        isCurrentDay: this.isCurrentDay(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        hasEvent: this.hasEvent(date)
      });
    }

    this.setData({ calendarData: calendar });
  },

  getLunarDate(date) {
    // 这里可以集成农历计算库
    return '';
  },

  isCurrentDay(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  },

  hasEvent(date) {
    const events = wx.getStorageSync('calendarEvents') || [];
    return events.some(e => e.date === date.toISOString().split('T')[0]);
  },

  changeMonth(delta) {
    let newMonth = this.data.currentMonth + delta;
    let newYear = this.data.currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    this.setData({
      currentYear: newYear,
      currentMonth: newMonth
    }, () => {
      this.generateCalendar();
    });
  },

  addEvent(date) {
    wx.showModal({
      title: '添加事件',
      content: '请输入事件内容',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const events = wx.getStorageSync('calendarEvents') || [];
          events.push({
            date: date.toISOString().split('T')[0],
            content: res.content
          });
          wx.setStorageSync('calendarEvents', events);
          this.generateCalendar();
        }
      }
    });
  }
});
