// pages/calendar/calendar.ts
import lunar from 'lunar-javascript';

Page({
  data: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    calendarData: [] as Array<{
      date: number | string;
      lunarDate: string;
      isHoliday: boolean;
      isCurrentDay?: boolean;
      isWeekend?: boolean;
      hasEvent?: boolean;
    }>
  },

  onLoad() {
    this.generateCalendar();
  },

  generateCalendar() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const calendarData: typeof this.data.calendarData = [];

    for (let i = 0; i < firstDay; i++) {
      calendarData.push({ date: '', lunarDate: '', isHoliday: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const lunarDate = lunar.Lunar.fromDate(new Date(year, month - 1, i));
      const isHoliday = this.checkHoliday(year, month, i);
      const currentDate = new Date();
      const isCurrentDay = (year === currentDate.getFullYear() && 
                          month === currentDate.getMonth() + 1 &&
                          i === currentDate.getDate());
      
      const isWeekend = (new Date(year, month - 1, i).getDay() === 0 || 
                        new Date(year, month - 1, i).getDay() === 6);
      
      const hasEvent = this.checkEvent(year, month, i);

      calendarData.push({
        date: i,
        lunarDate: lunarDate.toString(),
        isHoliday,
        isCurrentDay,
        isWeekend,
        hasEvent
      });
    }

    console.log('Generated calendar data:', calendarData);
    this.setData({
      calendarData
    }, () => {
      console.log('Data updated:', this.data.calendarData);
    });
  },

  checkHoliday(year: number, month: number, day: number): boolean {
    const holidays: Record<string, string> = {
      '1-1': '元旦',
      '5-1': '劳动节', 
      '10-1': '国庆节'
    };
    const key = `${month}-${day}`;
    return !!holidays[key];
  },

  checkEvent(year: number, month: number, day: number): boolean {
    return Math.random() > 0.7;
  }
});
