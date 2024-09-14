import type { Book } from '@/model/book'
import type { LoginUser } from '@/model/user'
import { ref } from 'vue'

export const showBookDialogFlag = ref({
  visible: false
})

export const showExcelImportDialogFlag = ref({
  visible: false
})
// 流水Json导入弹出框
export const showFlowJsonImportDialogFlag = ref({
  visible: false
})

export const showFlowTableDialog = ref({
  visible: false
})

export const showSetConvertDialog = ref(false)

export const showFlowEditDialog = ref(false)

export const userInfo = ref<LoginUser>({})
export const bookInfo = ref<Book>({})

export const DialogFullscreen = ref(false)
