// utils/calendar.js
module.exports = {
  getYearMonth(date) {
    if (date instanceof Date) {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
    } else {
      console.error('Invalid date object:', date);
      return { year: 0, month: 0 };
    }
  },

  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  },

  getFirstDayOfWeek(year, month) {
    return new Date(year, month - 1, 1).getDay();
  },
};
