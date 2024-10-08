import { bookInfo, userInfo } from '@/stores/flag'
import { errorAlert } from './alert'
import type { LoginUser } from '@/model/user'
import type { Book } from '@/model/book'
import { checkUser } from '@/api/api.user'

/**
 * 校验客户端是什么机型
 * @returns
 */
export const deviceAgent = (): any => {
  return (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ) || 'pc'
  )
}

/**
 *  生成随机字符串
 */
export const generateMixed = (num: number) => {
  num = num || 32
  var t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz012345678',
    a = t.length,
    n = ''
  for (let i = 0; i < num; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

/**
 * 日期格式化方法
 * @param _row
 * @param _column
 * @param cellValue
 * @param _index
 */
export const timeFormatter = (_row: any, _column: Date, cellValue: string) => {
  return dateFormater('YYYY-MM-dd', cellValue)
}

/***
 * 日期格式化方法
 *
 * @author DingDangDog
 * @param format 格式化后的日期格式，标准格式：YYYY-MM-dd HH:mm:ss。
 * @param date 待格式化的日期，可以是string或Date类型
 * @return 标准格式结果示例：2022-12-08 17:30:00
 */
export const dateFormater = (format: string, date: string | Date) => {
  date = new Date(date)

  const dataRegIndexs = [0, 1, 2, 3, 4, 5]
  const dataRegKeys = ['Y+', 'M+', 'd+', 'H+', 'm+', 's+']
  const dataItem = [
    date.getFullYear().toString(),
    date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1).toString(),
    date.getDate() < 10 ? '0' + date.getDate() : date.getDate().toString(),
    date.getHours().toString(),
    date.getMinutes().toString(),
    date.getSeconds().toString()
  ]

  let ret
  for (const index in dataRegIndexs) {
    ret = new RegExp('(' + dataRegKeys[index] + ')').exec(format)
    if (ret) {
      format = format.replace(
        ret[1],
        ret[1].length == 1 ? dataItem[index] : dataItem[index].padStart(ret[1].length, '0')
      )
    }
  }
  return format
}

export const setUserInfo = (info: LoginUser) => {
  // console.log(info)
  localStorage.setItem('userId', String(info.id))
  localStorage.setItem('name', String(info.name))
  localStorage.setItem('token', String(info.token))
  userInfo.value = info
}

export const setBookInfo = (book: Book) => {
  localStorage.setItem('bookId', String(book.id))
  localStorage.setItem('bookName', String(book.bookName))
  bookInfo.value = book
}

export const cleanLoginInfo = () => {
  localStorage.clear()
  userInfo.value = {}
  bookInfo.value = {}
  // setTimeout(() => {
  //   window.location.reload()
  // }, 2000)
}

export const checkUserAndBook = () => {
  checkUser().then((res) => {
    if (res.user === 'none') {
      cleanLoginInfo()
      errorAlert('当前账号无效，请重新登录')
    } else if (res.book === 'none') {
      localStorage.removeItem('bookId')
      localStorage.removeItem('bookName')
      bookInfo.value = {}
      errorAlert('当前账本无效，请重新选择账本')
    }
  })
}
