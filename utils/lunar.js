// 农历数据
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557
]

// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 生肖
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']

// 节气数据
const TERM_INFO = {
  '小寒': [1, 5, -0.01],
  '大寒': [1, 20, -0.01],
  '立春': [2, 3, 0.09],
  '雨水': [2, 18, 0.09],
  '惊蛰': [3, 5, 0.09],
  '春分': [3, 20, 0],
  '清明': [4, 4, 0.09],
  '谷雨': [4, 19, 0.09],
  '立夏': [5, 5, 0.09],
  '小满': [5, 20, 0.09],
  '芒种': [6, 5, 0.09],
  '夏至': [6, 21, 0],
  '小暑': [7, 6, 0.09],
  '大暑': [7, 22, 0.09],
  '立秋': [8, 7, 0.09],
  '处暑': [8, 22, 0.09],
  '白露': [9, 7, 0.09],
  '秋分': [9, 22, 0],
  '寒露': [10, 8, 0.09],
  '霜降': [10, 23, 0.09],
  '立冬': [11, 7, 0.09],
  '小雪': [11, 22, 0.09],
  '大雪': [12, 6, 0.09],
  '冬至': [12, 21, 0]
}

// 节日数据
const FESTIVALS = {
  solar: {
    '1-1': { name: '元旦', description: '新年第一天' },
    '2-14': { name: '情人节', description: '浪漫的日子' },
    '3-8': { name: '妇女节', description: '关爱女性' },
    '4-1': { name: '愚人节', description: '欢乐搞怪' },
    '5-1': { name: '劳动节', description: '劳动光荣' },
    '6-1': { name: '儿童节', description: '关爱儿童' },
    '10-1': { name: '国庆节', description: '祖国生日' },
    '12-25': { name: '圣诞节', description: '平安夜后' }
  },
  lunar: {
    '1-1': { name: '春节', description: '阖家团圆' },
    '1-15': { name: '元宵节', description: '正月十五' },
    '5-5': { name: '端午节', description: '屈原纪念' },
    '7-7': { name: '七夕节', description: '牛郎织女' },
    '8-15': { name: '中秋节', description: '月圆人团圆' },
    '9-9': { name: '重阳节', description: '敬老节日' }
  }
}

// 宜忌项目
const SUITABLE_ITEMS = [
  { name: '会友', description: '与朋友相聚' },
  { name: '上课', description: '学习新知识' },
  { name: '读书', description: '充实自己' },
  { name: '写作', description: '记录思考' },
  { name: '绘画', description: '艺术创作' },
  { name: '运动', description: '强身健体' },
  { name: '旅行', description: '开拓视野' },
  { name: '购物', description: '添置物品' },
  { name: '理财', description: '规划未来' },
  { name: '表白', description: '表达心意' }
]

const UNSUITABLE_ITEMS = [
  { name: '争吵', description: '伤害感情' },
  { name: '赌博', description: '损失财物' },
  { name: '酗酒', description: '损害健康' },
  { name: '熬夜', description: '影响作息' },
  { name: '说谎', description: '失信于人' },
  { name: '浪费', description: '挥霍无度' },
  { name: '懒惰', description: '荒废时光' },
  { name: '拖延', description: '贻误时机' },
  { name: '冒险', description: '风险过大' },
  { name: '轻率', description: '考虑不周' }
]

// 运势等级
const FORTUNE_LEVELS = {
  BEST: { text: '大吉', color: '#ff4d4f', description: '诸事顺遂，万事如意' },
  GOOD: { text: '吉', color: '#ff7a45', description: '运势良好，可行大事' },
  NORMAL: { text: '平', color: '#ffa940', description: '平淡无奇，宜守不宜进' },
  BAD: { text: '凶', color: '#bfbfbf', description: '诸事不宜，应当谨慎' }
}

class Lunar {
  constructor() {
    this.lunarInfo = LUNAR_INFO
    this.lunarMonth = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
    this.lunarDay = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
    this.solarTerm = [
      '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
      '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
      '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
      '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
    ]
  }

  // 获取农历日期
  getLunarDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    
    // 计算从1900年1月31日相差的天数
    const baseDate = new Date(1900, 0, 31)
    let offset = Math.floor((date - baseDate) / 86400000)
    
    // 计算农历年份
    let lunarYear = 1900
    let temp = 0
    for(; lunarYear < 2100 && offset > 0; lunarYear++) {
      temp = this.getLunarYearDays(lunarYear)
      offset -= temp
    }
    if(offset < 0) {
      offset += temp
      lunarYear--
    }
    
    // 计算闰月
    const leapMonth = this.getLeapMonth(lunarYear)
    let isLeap = false
    
    // 计算农历月份
    let lunarMonth = 1
    let monthDays = 0
    for(; lunarMonth < 13 && offset > 0; lunarMonth++) {
      // 闰月
      if(leapMonth > 0 && lunarMonth === (leapMonth + 1) && !isLeap) {
        --lunarMonth
        isLeap = true
        monthDays = this.getLeapDays(lunarYear)
      } else {
        monthDays = this.getLunarMonthDays(lunarYear, lunarMonth)
      }
      
      // 解除闰月
      if(isLeap && lunarMonth === (leapMonth + 1)) {
        isLeap = false
      }
      
      offset -= monthDays
    }
    
    // 如果恰好减完
    if(offset === 0 && leapMonth > 0 && lunarMonth === leapMonth + 1) {
      if(isLeap) {
        isLeap = false
      } else {
        isLeap = true
        --lunarMonth
      }
    }
    
    // offset小于0时，在上一月
    if(offset < 0) {
      offset += monthDays
      --lunarMonth
    }
    
    // 农历日期
    const lunarDay = offset + 1
    
    // 获取生肖
    const zodiac = ZODIAC[(lunarYear - 4) % 12]
    
    // 获取天干地支
    const heavenlyStemEarthlyBranch = this.getHeavenlyStemsEarthlyBranches(lunarYear)
    
    return {
      year: heavenlyStemEarthlyBranch + '年',
      zodiac: zodiac + '年',
      month: (isLeap ? '闰' : '') + this.lunarMonth[lunarMonth - 1] + '月',
      day: this.lunarDay[lunarDay - 1],
      isLeap,
      lunarYear,
      lunarMonth,
      lunarDay
    }
  }

  // 获取天干地支
  getHeavenlyStemsEarthlyBranches(year) {
    const heavenlyStem = HEAVENLY_STEMS[(year - 4) % 10]
    const earthlyBranch = EARTHLY_BRANCHES[(year - 4) % 12]
    return heavenlyStem + earthlyBranch
  }

  // 获取农历年总天数
  getLunarYearDays(year) {
    let sum = 348 // 12个月，每月29或30天
    for(let i = 0x8000; i > 0x8; i >>= 1) {
      sum += (this.lunarInfo[year - 1900] & i) ? 1 : 0
    }
    return sum + this.getLeapDays(year)
  }

  // 获取闰月天数
  getLeapDays(year) {
    if(this.getLeapMonth(year)) {
      return (this.lunarInfo[year - 1900] & 0x10000) ? 30 : 29
    }
    return 0
  }

  // 获取闰月月份
  getLeapMonth(year) {
    return this.lunarInfo[year - 1900] & 0xf
  }

  // 获取农历月份天数
  getLunarMonthDays(year, month) {
    return (this.lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29
  }

  // 获取宜忌
  getDayAdvice() {
    const suitable = [
      '会友', '上课', '读书', '写作', '绘画',
      '运动', '旅行', '购物', '理财', '表白'
    ]
    const unsuitable = [
      '争吵', '赌博', '酗酒', '熬夜', '说谎',
      '浪费', '懒惰', '拖延', '冒险', '轻率'
    ]

    // 随机选择 2-4 个宜和忌
    const getRandomItems = (arr, min = 2, max = 4) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min
      const shuffled = [...arr].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count).join('、')
    }

    return {
      suitable: getRandomItems(suitable),
      unsuitable: getRandomItems(unsuitable)
    }
  }

  // 获取节气
  getSolarTerm(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 获取节气基准信息
    const getTermDay = (term) => {
      const [termMonth, termDay, offset] = TERM_INFO[term]
      if (termMonth === month) {
        // 根据年份计算偏移
        const year = date.getFullYear()
        const yearOffset = Math.floor((year - 2000) * offset / 100)
        return termDay + yearOffset
      }
      return -1
    }

    // 检查是否是节气日
    for (const term of Object.keys(TERM_INFO)) {
      const termDay = getTermDay(term)
      if (termDay === day) {
        return term
      }
    }

    return ''
  }

  // 获取每日运势
  getDailyFortune(date) {
    // 使用日期作为随机种子
    const seed = date.getFullYear() * 10000 + 
                (date.getMonth() + 1) * 100 + 
                date.getDate()
    
    // 简单的伪随机数生成
    const random = () => {
      let x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    // 根据随机值获取运势等级
    const getFortuneLevelByRandom = () => {
      const r = random()
      if (r > 0.9) return FORTUNE_LEVELS.BEST
      if (r > 0.6) return FORTUNE_LEVELS.GOOD
      if (r > 0.3) return FORTUNE_LEVELS.NORMAL
      return FORTUNE_LEVELS.BAD
    }

    // 获取随机项目
    const getRandomItems = (items, count) => {
      const shuffled = [...items]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled.slice(0, count)
    }

    // 生成运势信息
    const level = getFortuneLevelByRandom()
    const suitable = getRandomItems(SUITABLE_ITEMS, 3)
    const unsuitable = getRandomItems(UNSUITABLE_ITEMS, 3)

    return {
      level,
      suitable,
      unsuitable,
      summary: {
        general: level.text,
        description: level.description,
        color: level.color
      },
      details: {
        suitable: suitable.map(item => ({
          name: item.name,
          description: item.description
        })),
        unsuitable: unsuitable.map(item => ({
          name: item.name,
          description: item.description
        }))
      }
    }
  }

  // 获取每日完整信息
  getDailyInfo(date) {
    const lunarDate = this.getLunarDate(date)
    const solarDate = `${date.getMonth() + 1}-${date.getDate()}`
    
    // 获取节日信息
    const lunarFestival = FESTIVALS.lunar[`${lunarDate.lunarMonth}-${lunarDate.lunarDay}`]
    const solarFestival = FESTIVALS.solar[solarDate]
    const festival = lunarFestival || solarFestival

    // 获取节气
    const solarTerm = this.getSolarTerm(date)

    // 获取运势
    const fortune = this.getDailyFortune(date)

    return {
      ...lunarDate,
      festival: festival ? {
        name: festival.name,
        description: festival.description
      } : null,
      solarTerm,
      fortune
    }
  }

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 判断是否是今天
  isToday(date) {
    const today = new Date()
    return this.formatDate(date) === this.formatDate(today)
  }

  // 判断是否是节日
  isFestival(date) {
    const solarDate = `${date.getMonth() + 1}-${date.getDate()}`
    const lunarDate = this.getLunarDate(date)
    const lunarKey = `${lunarDate.lunarMonth}-${lunarDate.lunarDay}`
    
    return !!(FESTIVALS.lunar[lunarKey] || FESTIVALS.solar[solarDate])
  }

  // 判断是否是节气
  isSolarTerm(date) {
    return !!this.getSolarTerm(date)
  }

  // 获取月历信息
  getMonthCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const days = []
    
    // 获取上个月的最后几天
    const firstDayWeek = firstDay.getDay()
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 2, prevMonthLastDay - i)
      days.push({
        date,
        dayInfo: this.getDailyInfo(date),
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isFestival: this.isFestival(date),
        isSolarTerm: this.isSolarTerm(date)
      })
    }
    
    // 获取当月的天数
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month - 1, i)
      days.push({
        date,
        dayInfo: this.getDailyInfo(date),
        isCurrentMonth: true,
        isToday: this.isToday(date),
        isFestival: this.isFestival(date),
        isSolarTerm: this.isSolarTerm(date)
      })
    }
    
    // 获取下个月的前几天
    const lastDayWeek = lastDay.getDay()
    const nextMonthDays = 6 - lastDayWeek
    
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        dayInfo: this.getDailyInfo(date),
        isCurrentMonth: false,
        isToday: this.isToday(date),
        isFestival: this.isFestival(date),
        isSolarTerm: this.isSolarTerm(date)
      })
    }
    
    return {
      year,
      month,
      days,
      lunarYear: this.getLunarDate(firstDay).lunarYear,
      totalDays: lastDay.getDate(),
      firstDayWeek,
      lastDayWeek
    }
  }

  // 获取指定日期范围内的所有节日
  getFestivalsBetween(startDate, endDate) {
    const festivals = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const info = this.getDailyInfo(current)
      if (info.festival) {
        festivals.push({
          date: this.formatDate(current),
          ...info.festival
        })
      }
      current.setDate(current.getDate() + 1)
    }
    
    return festivals
  }

  // 获取指定日期范围内的所有节气
  getSolarTermsBetween(startDate, endDate) {
    const terms = []
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const term = this.getSolarTerm(current)
      if (term) {
        terms.push({
          date: this.formatDate(current),
          name: term
        })
      }
      current.setDate(current.getDate() + 1)
    }
    
    return terms
  }

  // 获取日期的时间戳
  getTimestamp(date) {
    return Math.floor(date.getTime() / 1000)
  }

  // 计算两个日期之间的天数
  getDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000
    return Math.round(Math.abs((date1 - date2) / oneDay))
  }

  // 格式化时间段
  formatDateRange(startDate, endDate) {
    const start = this.formatDate(startDate)
    if (!endDate || this.formatDate(startDate) === this.formatDate(endDate)) {
      return start
    }
    return `${start} 至 ${this.formatDate(endDate)}`
  }

  // 获取日期的星期
  getWeekday(date) {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六']
    return weekdays[date.getDay()]
  }

  // 获取完整的日期时间字符串
  getFullDateString(date) {
    const lunarInfo = this.getLunarDate(date)
    const weekday = this.getWeekday(date)
    return `${this.formatDate(date)} 星期${weekday} ${lunarInfo.year} ${lunarInfo.month}${lunarInfo.day}`
  }

  // 检查日期是否在指定范围内
  isDateInRange(date, startDate, endDate) {
    const timestamp = this.getTimestamp(date)
    return timestamp >= this.getTimestamp(startDate) && 
           timestamp <= this.getTimestamp(endDate)
  }

  // 获取指定月份的所有周末日期
  getWeekends(year, month) {
    const weekends = []
    const calendar = this.getMonthCalendar(year, month)
    
    calendar.days.forEach(day => {
      if (day.isCurrentMonth && [0, 6].includes(day.date.getDay())) {
        weekends.push(day.date)
      }
    })
    
    return weekends
  }

  // 获取指定日期的节日、节气和宜忌信息
  getDateHighlights(date) {
    const info = this.getDailyInfo(date)
    return {
      festival: info.festival,
      solarTerm: info.solarTerm,
      fortune: {
        summary: info.fortune.summary,
        suitable: info.fortune.details.suitable.map(item => item.name).join('、'),
        unsuitable: info.fortune.details.unsuitable.map(item => item.name).join('、')
      }
    }
  }

  // 获取指定年月的节假日安排
  getHolidaySchedule(year, month) {
    // 这里可以添加节假日调休的具体安排
    // 示例数据结构
    const holidays = {
      '2024-01-01': { name: '元旦', type: 'holiday' },
      '2024-02-10': { name: '春节', type: 'holiday' },
      '2024-02-17': { name: '调休', type: 'workday' },
      // ... 更多节假日安排
    }
    
    const schedule = []
    const calendar = this.getMonthCalendar(year, month)
    
    calendar.days.forEach(day => {
      if (day.isCurrentMonth) {
        const dateStr = this.formatDate(day.date)
        const holidayInfo = holidays[dateStr]
        if (holidayInfo) {
          schedule.push({
            date: dateStr,
            ...holidayInfo
          })
        }
      }
    })
    
    return schedule
  }

  // 获取日期的农历生肖和星座
  getDateAstrology(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 星座判断
    const constellations = [
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '双鱼座', start: [2, 19], end: [3, 20] },
      { name: '白羊座', start: [3, 21], end: [4, 19] },
      { name: '金牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '巨蟹座', start: [6, 22], end: [7, 22] },
      { name: '狮子座', start: [7, 23], end: [8, 22] },
      { name: '处女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '天蝎座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
      { name: '摩羯座', start: [12, 22], end: [1, 19] }
    ]
    
    let constellation = '摩羯座'
    for (const item of constellations) {
      const [startMonth, startDay] = item.start
      const [endMonth, endDay] = item.end
      
      if ((month === startMonth && day >= startDay) || 
          (month === endMonth && day <= endDay)) {
        constellation = item.name
        break
      }
    }
    
    return {
      zodiac: ZODIAC[(date.getFullYear() - 4) % 12],
      constellation
    }
  }

  // 格式化时间
  formatTime(date) {
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  }

  // 格式化日期时间
  formatDateTime(date) {
    return `${this.formatDate(date)} ${this.formatTime(date)}`
  }

  // 格式化时间范围
  formatTimeRange(startDate, endDate) {
    if (!startDate) return ''
    if (!endDate) return this.formatTime(startDate)
    return `${this.formatTime(startDate)}-${this.formatTime(endDate)}`
  }

  // 解析日期字符串
  parseDate(dateStr) {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // 解析时间字符串
  parseTime(timeStr) {
    if (!timeStr) return null
    const [hour, minute] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    return date
  }

  // 解析日期时间字符串
  parseDateTime(dateTimeStr) {
    if (!dateTimeStr) return null
    const [dateStr, timeStr] = dateTimeStr.split(' ')
    const date = this.parseDate(dateStr)
    if (!date) return null
    const [hour, minute] = timeStr.split(':').map(Number)
    date.setHours(hour, minute, 0, 0)
    return date
  }

  // 获取相对时间描述
  getRelativeTimeDesc(date) {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 0) {
      const absDiff = Math.abs(diff)
      if (absDiff < 60) return '即将'
      if (absDiff < 3600) return `${Math.floor(absDiff / 60)}分钟后`
      if (absDiff < 86400) return `${Math.floor(absDiff / 3600)}小时后`
      if (absDiff < 604800) return `${Math.floor(absDiff / 86400)}天后`
      return this.formatDate(date)
    }
    
    if (diff < 60) return '刚刚'
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`
    return this.formatDate(date)
  }

  // 获取日期的开始时间
  getStartOfDay(date) {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  // 获取日期的结束时间
  getEndOfDay(date) {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
  }

  // 获取月份的开始日期
  getStartOfMonth(year, month) {
    return new Date(year, month - 1, 1)
  }

  // 获取月份的结束日期
  getEndOfMonth(year, month) {
    return new Date(year, month, 0)
  }

  // 获取日期所在周的日期范围
  getWeekRange(date, startDay = 0) {
    const result = new Date(date)
    const day = result.getDay()
    const diff = day - startDay
    
    // 调整到周起始日
    result.setDate(result.getDate() - diff)
    const start = this.getStartOfDay(result)
    
    // 计算周结束日
    result.setDate(result.getDate() + 6)
    const end = this.getEndOfDay(result)
    
    return { start, end }
  }

  // 添加或减少天数
  addDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  // 添加或减少月份
  addMonths(date, months) {
    const result = new Date(date)
    result.setMonth(result.getMonth() + months)
    return result
  }

  // 添加或减少年份
  addYears(date, years) {
    const result = new Date(date)
    result.setFullYear(result.getFullYear() + years)
    return result
  }

  // 比较两个日期
  compareDates(date1, date2) {
    const d1 = this.getStartOfDay(date1)
    const d2 = this.getStartOfDay(date2)
    return d1.getTime() - d2.getTime()
  }

  // 判断是否是同一天
  isSameDay(date1, date2) {
    return this.formatDate(date1) === this.formatDate(date2)
  }

  // 判断是否是同一月
  isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth()
  }

  // 判断是否是同一年
  isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear()
  }

  // 获取日期是当年的第几天
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date - start
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }

  // 获取日期是当月的第几周
  getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    const firstWeekday = firstDay.getDay()
    return Math.ceil((date.getDate() + firstWeekday) / 7)
  }

  // 获取日期是当年的第几周
  getWeekOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1)
    const diff = date - start
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    return Math.ceil(diff / oneWeek)
  }

  // 判断是否是闰年
  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  }

  // 获取月份的天数
  getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate()
  }

  // 获取两个日期之间的所有日期
  getDatesBetween(startDate, endDate) {
    const dates = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  }

  // 获取两个日期之间的工作日数量
  getWorkdaysBetween(startDate, endDate) {
    let count = 0
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const day = currentDate.getDay()
      if (day !== 0 && day !== 6) count++
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return count
  }

  // 获取指定年月的所有节日
  getMonthFestivals(year, month) {
    const festivals = []
    const calendar = this.getMonthCalendar(year, month)
    
    calendar.days.forEach(day => {
      if (day.isCurrentMonth && day.isFestival) {
        const info = this.getDailyInfo(day.date)
        if (info.festival) {
          festivals.push({
            date: this.formatDate(day.date),
            ...info.festival
          })
        }
      }
    })
    
    return festivals
  }

  // 获取指定年月的所有节气
  getMonthSolarTerms(year, month) {
    const terms = []
    const calendar = this.getMonthCalendar(year, month)
    
    calendar.days.forEach(day => {
      if (day.isCurrentMonth && day.isSolarTerm) {
        terms.push({
          date: this.formatDate(day.date),
          name: this.getSolarTerm(day.date)
        })
      }
    })
    
    return terms
  }

  // 获取下一个节气
  getNextSolarTerm(date) {
    const current = new Date(date)
    const endDate = this.addMonths(date, 2) // 最多查找未来2个月
    
    while (current <= endDate) {
      const term = this.getSolarTerm(current)
      if (term) {
        return {
          date: this.formatDate(current),
          name: term,
          daysLeft: this.getDaysBetween(date, current)
        }
      }
      current.setDate(current.getDate() + 1)
    }
    
    return null
  }

  // 获取下一个节日
  getNextFestival(date) {
    const current = new Date(date)
    const endDate = this.addMonths(date, 2) // 最多查找未来2个月
    
    while (current <= endDate) {
      const info = this.getDailyInfo(current)
      if (info.festival) {
        return {
          date: this.formatDate(current),
          ...info.festival,
          daysLeft: this.getDaysBetween(date, current)
        }
      }
      current.setDate(current.getDate() + 1)
    }
    
    return null
  }

  // 获取指定日期的节日和节气信息
  getFestivalAndTermInfo(date) {
    const info = this.getDailyInfo(date)
    const nextTerm = this.getNextSolarTerm(date)
    const nextFestival = this.getNextFestival(date)
    
    return {
      today: {
        festival: info.festival,
        solarTerm: info.solarTerm
      },
      next: {
        festival: nextFestival,
        solarTerm: nextTerm
      }
    }
  }

  // 判断是否是法定节假日
  isLegalHoliday(date) {
    const dateStr = this.formatDate(date)
    const holidays = {
      '2024-01-01': '元旦',
      '2024-02-10': '春节',
      '2024-04-04': '清明节',
      '2024-05-01': '劳动节',
      '2024-06-10': '端午节',
      '2024-09-17': '中秋节',
      '2024-10-01': '国庆节'
      // ... 可以添加更多节假日
    }
    
    return holidays[dateStr] || ''
  }

  // 判断是否是调休工作日
  isWorkday(date) {
    const dateStr = this.formatDate(date)
    const workdays = [
      '2024-02-04', // 春节调休
      '2024-02-18',
      '2024-04-07', // 清明调休
      '2024-04-28', // 劳动节调休
      '2024-05-11',
      '2024-09-14', // 中秋调休
      '2024-09-29', // 国庆调休
      '2024-10-12'
      // ... 可以添加更多调休日期
    ]
    
    return workdays.includes(dateStr)
  }

  // 获取节假日安排描述
  getHolidayDesc(date) {
    const day = date.getDay()
    const isWeekend = day === 0 || day === 6
    const holiday = this.isLegalHoliday(date)
    const isWorkday = this.isWorkday(date)
    
    if (holiday) return `${holiday}假期`
    if (isWorkday) return '调休工作日'
    if (isWeekend) return '周末'
    return '工作日'
  }

  // 获取节日
  getFestival(date) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const solarKey = `${month}-${day}`
    const festival = FESTIVALS.solar[solarKey]

    if (festival) return festival

    // 获取农历日期并查找农历节日
    const lunar = this.getLunarDate(date)
    const lunarKey = `${lunar.month}-${lunar.day}`
    return FESTIVALS.lunar[lunarKey] || ''
  }
}

module.exports = new Lunar() 