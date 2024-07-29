import { useDark } from '@vueuse/core'
import router from '../router/index'
import { checkUser } from '@/api/api.user'
import { checkBook } from '@/api/api.book'
import { showBookDialogFlag } from '@/stores/flag'
import { ElMessage, ElMessageBox } from 'element-plus'

// 设置主题，用于判断主题色是否为暗色
export const isDark = useDark({
  storageKey: 'vitepress-theme-appearance'
})

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

const chars = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
]
/**
 *  生成随机字符串
 */
export const generateMixed = (n: number) => {
  let a = ''
  for (let i = 0; i < n; i++) {
    a += chars[Math.ceil(Math.random() * 61)]
  }
  return a
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

export const toLogin = () => {
  router.push({ path: '/login' })
}

export const cleanLoginInfo = () => {
  localStorage.removeItem('userId')
  localStorage.removeItem('name')
  localStorage.removeItem('bookId')
  localStorage.removeItem('bookName')
  localStorage.removeItem('token')
  toLogin()
}

export const changeBackground = (url: string) => {
  document.getElementById('app')!.style!.backgroundImage = 'url(' + url + ')'
  // set div background image size
  document.getElementById('app')!.style!.backgroundSize = 'cover'
  localStorage.setItem('background', url)
}

export const checkUserAndBook = () => {
  if (!localStorage.getItem('userId')) {
    ElMessage.error('请登录')
    return
  }

  checkUser(localStorage.getItem('userId')).then((res) => {
    if (res.id) {
      checkBook(localStorage.getItem('bookId')).then((rb) => {
        if (!rb.id) {
          ElMessageBox.confirm('当前账本已失效，必须重新选择', '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
            .then(() => {
              showBookDialogFlag.value.visible = true
            })
            .catch(() => {
              showBookDialogFlag.value.visible = true
            })
        }
      })
    } else {
      localStorage.clear()
      ElMessageBox.confirm('当前账号已失效，请重新登录', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      })
        .then(() => {
          router.push({ path: '/login' })
        })
        .catch(() => {
          router.push({ path: '/login' })
        })
    }
  })
}
