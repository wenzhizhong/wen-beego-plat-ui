import dayjs from 'dayjs'

export function timestampToDatetime(timestamp, format = 'YYYY-MM-DD HH:mm:ss') { 
  if(!timestamp || isNaN(timestamp)) return ''
  return dayjs.unix(timestamp).format(format)
}