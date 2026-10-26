import dayjs from 'dayjs'


import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(quarterOfYear)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.extend(relativeTime)
dayjs.locale('zh-cn') // 设置后 startOf('week') 以周一为一周开始

export const FORMAT_DATE = 'YYYY-MM-DD'
export const FORMAT_DATETIME = 'YYYY-MM-DD HH:mm:ss'
export const FORMAT_MONTH = 'YYYY-MM'

export function datetimeNow() :Date{
  return dayjs().toDate()
}

export function timestampToDatetime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') { 
  if(!timestamp || isNaN(timestamp)) return ''
  return dayjs.unix(timestamp).format(format)
}

export const dateParsingInZone = (dateStr: string)=>{ 
  if(!dateStr) return ''
  return dayjs.tz(dateStr, 'Asia/Shanghai').format()
}

/**
 * 时间字符串转秒级时间戳
 * @param {string} dateStr - 时间字符串，如 '2024-01-01 12:00:00'
 * @param {string} format - 可选，输入格式，如 'YYYY-MM-DD HH:mm:ss'
 * @param {string} timezone - 可选，时区，如 'Asia/Shanghai'
 * @returns {number|null} 秒级时间戳，失败返回 null
 */
export function datetimeToTimestamp(dateStr, format = 'YYYY-MM-DD HH:mm:ss', timezone = 'Asia/Shanghai') {
  if (!dateStr) return null

  let d
  if (format) {
    d = timezone
      ? dayjs.tz(dateStr, format, timezone)
      : dayjs(dateStr, format)
  } else {
    d = timezone
      ? dayjs.tz(dateStr, timezone)
      : dayjs(dateStr)
  }

  return d.isValid() ? d.unix() : null
}


/* ========== 1. 格式化 ========== */
export function formatDate(date, format = FORMAT_DATE) {
  return date ? dayjs(date).format(format) : ''
}


/* ========== 2. 日期加减（修复后） ========== */

// 因为 extend 了 quarterOfYear，用 QUnitType 才能支持 'quarter'
// 如果不支持季度，用 dayjs.ManipulateType 即可
export const addTime = (
  date: dayjs.ConfigType,
  amount: number,
  unit: dayjs.QUnitType = 'day'
) => dayjs(date).add(amount, unit).toDate()

export const subTime = (
  date: dayjs.ConfigType,
  amount: number,
  unit: dayjs.QUnitType = 'day'
) => dayjs(date).subtract(amount, unit).toDate()

/* ========== 3. 周期边界（返回 [start, end]） ========== */
export const getDayRange = (date: dayjs.ConfigType = new Date()) => {
  const d = dayjs(date)
  return [d.startOf('day').toDate(), d.endOf('day').toDate()] as [Date, Date]
}

export const getWeekRange = (date = new Date()) => {
  const d = dayjs(date)
  return [d.startOf('week').toDate(), d.endOf('week').toDate()]
}

export const getMonthRange = (date = new Date()) => {
  const d = dayjs(date)
  return [d.startOf('month').toDate(), d.endOf('month').toDate()]
}

export const getQuarterRange = (date = new Date()) => {
  const d = dayjs(date)
  return [d.startOf('quarter').toDate(), d.endOf('quarter').toDate()]
}

export const getYearRange = (date = new Date()) => {
  const d = dayjs(date)
  return [d.startOf('year').toDate(), d.endOf('year').toDate()]
}

/* ========== 4. 常用业务区间 ========== */
export const getRecentDays = (n = 7) => [
  dayjs().subtract(n - 1, 'day').startOf('day').toDate(),
  dayjs().endOf('day').toDate(),
]

export const getLastWeekRange = () => {
  const d = dayjs().subtract(1, 'week')
  return [d.startOf('week').toDate(), d.endOf('week').toDate()]
}

export const getLastMonthRange = () => {
  const d = dayjs().subtract(1, 'month')
  return [d.startOf('month').toDate(), d.endOf('month').toDate()]
}

export const getLastQuarterRange = () => {
  const d = dayjs().subtract(1, 'quarter')
  return [d.startOf('quarter').toDate(), d.endOf('quarter').toDate()]
}

/* ========== 5. 差值计算 ========== */
// 选了两个日期后计算相差天数
// const days = diffDays('2026-10-25', '2026-10-01') // 24
export const diffDays = (a, b) => dayjs(a).diff(dayjs(b), 'day')        // a - b 天数
export const diffHours = (a, b) => dayjs(a).diff(dayjs(b), 'hour')      // 小时差
export const diffMonths = (a, b) => dayjs(a).diff(dayjs(b), 'month')    // 月份差

/** 计算年龄（周岁） */
// 生日算年龄
// const age = getAge('1995-06-15')
export const getAge = (birthday) => dayjs().diff(dayjs(birthday), 'year')

/** 相对时间：例如 "3 天前" / "2 小时后" */
// 相对时间，列表里做「3 天前」展示很方便
// const relative = fromNow('2026-10-22')
export const fromNow = (date) => dayjs(date).fromNow()

/* ========== 6. 判断 ========== */
export const isToday = (date) => dayjs(date).isSame(dayjs(), 'day')
export const isSameDay = (a, b) => dayjs(a).isSame(dayjs(b), 'day')
export const isBeforeDay = (a, b) => dayjs(a).isBefore(dayjs(b), 'day')
export const isAfterDay = (a, b) => dayjs(a).isAfter(dayjs(b), 'day')
export const isWeekend = (date) => [0, 6].includes(dayjs(date).day())

/* ========== 7. 校验 & 禁用 ========== */

/** 开始日期不能晚于结束日期（给 el-date-picker 的 disabledDate 用） */
export const disabledStartDate = (end) => (current) =>
  end ? dayjs(current).isAfter(dayjs(end), 'day') : false

export const disabledEndDate = (start) => (current) =>
  start ? dayjs(current).isBefore(dayjs(start), 'day') : false

/** 禁止选择未来日期 */
export const disabledFuture = (current) => dayjs(current).isAfter(dayjs(), 'day')

/** 禁止选择今天之前的日期 */
export const disabledPast = (current) => dayjs(current).isBefore(dayjs(), 'day')

