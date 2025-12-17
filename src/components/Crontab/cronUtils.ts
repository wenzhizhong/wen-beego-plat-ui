/**
 * 解析 cron 表达式为中文描述
 * @param expression cron 表达式
 * @returns 中文描述
 */
export function parseExpression(expression: string): string {
  if (!expression) return '未设置'
  
  const parts = expression.split(/\s+/)
  if (parts.length < 6) return '表达式格式错误'
  
  const [second, minute, hour, day, month, week, year] = parts
  
  // 构建各个部分的描述
  const yearDesc = parseYearPart(year)
  const monthDesc = parseMonthPart(month)
  const dayDesc = parseDayOrWeekPart(day, week)
  const timeDesc = parseTimePart(second, minute, hour)
  
  // 按照自然语言顺序组合: 年-月-日-时-分-秒
  const descriptions: string[] = []
  
  if (yearDesc) descriptions.push(yearDesc)
  if (monthDesc) descriptions.push(!yearDesc? "每年"+monthDesc: monthDesc)
  if (dayDesc) descriptions.push(!monthDesc? "每月"+dayDesc: dayDesc)
  if (timeDesc) descriptions.push(timeDesc)
  
  if (descriptions.length === 0) {
    return '每秒执行'
  }
  
  return (descriptions.join('') + '执行').replace(/执{1}行{1}执{1}行{1}/g, "执行");
}

/**
 * 解析时间部分（时分秒）
 */
function parseTimePart(second: string, minute: string, hour: string): string {
  // 全部为*的情况
  if (second === '*' && minute === '*' && hour === '*') {
    return '每秒'
  }
  
  if (hour === '*') {
    if (minute === '*') {
      // 只定义了秒
      if (second === '*') {
        return '每秒'
      } else {
        const secDesc = formatSimplePart(second, '秒')
        return secDesc === '每秒' ? '每秒' : `${secDesc}执行`
      }
    } else {
      // 定义了分钟，可能定义了秒
      const minDesc = formatSimplePart(minute, '分')
      if (second === '*') {
        return minDesc === '每分' ? '每分钟' : `${minDesc}每秒`
      } else {
        const secDesc = formatSimplePart(second, '秒')
        return minDesc === '每分' && secDesc === '每秒' 
          ? '每分钟' 
          : `${minDesc}${secDesc === '每秒' ? '' : secDesc}`
      }
    }
  } else {
    // 定义了小时
    const hourDesc = formatSimplePart(hour, '时')
    
    if (minute === '*') {
      // 定义了小时，没定义分钟
      if (second === '*') {
        return `${hourDesc}每分每秒`
      } else {
        const secDesc = formatSimplePart(second, '秒')
        return `${hourDesc}每分${secDesc}`
      }
    } else {
      // 定义了小时和分钟
      const minDesc = formatSimplePart(minute, '分')
      
      if (second === '*') {
        return `${hourDesc}${minDesc}每秒`
      } else {
        const secDesc = formatSimplePart(second, '秒')
        // 特殊处理：如果秒是每秒，则省略
        return secDesc === '每秒' 
          ? `${hourDesc}${minDesc}` 
          : `${hourDesc}${minDesc}${secDesc}`
      }
    }
  }
}

/**
 * 解析年份部分
 */
function parseYearPart(year: string): string {
  if (!year || year === '*') return ''
  
  return formatSimplePart(year, '年')
}

/**
 * 解析月份部分
 */
function parseMonthPart(month: string): string {
  if (month === '*') return ''
  
  return formatSimplePart(month, '月')
}

/**
 * 解析日期部分（日或周）
 */
function parseDayOrWeekPart(day: string, week: string): string {
  // 优先处理周，因为周和日通常互斥（一个为?另一个才有效）
  if (week && week !== '?' && week !== '*') {
    const weekDesc = formatWeekPart(week)
    return weekDesc ? `${weekDesc}` : ''
  }
  
  if (day && day !== '?' && day !== '*') {
    const dayDesc = formatDayPart(day)
    return dayDesc ? `${dayDesc}` : ''
  }
  
  return '' // 每天的情况不特别说明
}

/**
 * 格式化简单部分（数字、区间、步长、列表）
 */
function formatSimplePart(part: string, unit: string): string {
  if (part === '*') {
    return `每${unit.charAt(0)}`
  }
  
  if (part.includes('/')) {
    const [base, step] = part.split('/')
    if (base === '*') {
      return `每${step}${unit}`
    } else {
      return `${base}${unit}起每${step}${unit}`
    }
  }
  
  if (part.includes('-')) {
    const [start, end] = part.split('-')
    return `${start}至${end}${unit}`
  }
  
  if (part.includes(',')) {
    const items = part.split(',')
    // 如果项数很多，简化显示
    if (items.length > 5) {
      return `${items[0]}和${items.length - 1}个其他${unit}`
    } else {
      return items.join('、') + unit
    }
  }
  
  return `${part}${unit}`
}

/**
 * 格式化日期部分
 */
function formatDayPart(day: string): string {
  if (day === 'L') {
    return '每月最后一天'
  }
  
  if (day.includes('W')) {
    const dayNum = day.replace('W', '')
    return `${dayNum}号最近的工作日`
  }
  
  return formatSimplePart(day, '日')
}

/**
 * 格式化星期部分
 */
function formatWeekPart(week: string): string {
  const weekMap: Record<string, string> = {
    '1': '周日',
    '2': '周一',
    '3': '周二',
    '4': '周三',
    '5': '周四',
    '6': '周五',
    '7': '周六'
  }
  
  if (week === 'L') {
    return '每月最后一个星期'
  }
  
  if (week.includes('#')) {
    const [day, nth] = week.split('#')
    return `每月第${nth}个${weekMap[day] || day}`
  }
  
  if (week.includes('/')) {
    const [base, step] = week.split('/')
    if (base === '*') {
      return `每周隔${step}执行`
    } else {
      return `${weekMap[base] || base}起每周隔${step}执行`
    }
  }
  
  if (week.includes('-')) {
    const [start, end] = week.split('-')
    return `${weekMap[start] || start}至${weekMap[end] || end}`
  }
  
  if (week.includes(',')) {
    const items = week.split(',')
    const mappedItems = items.map(item => weekMap[item] || item)
    
    if (mappedItems.length > 5) {
      return `${mappedItems[0]}和另外${mappedItems.length - 1}天`
    } else {
      return mappedItems.join('、')
    }
  }
  
  return weekMap[week] || `${week}星期`
}
