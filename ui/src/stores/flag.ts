import type { Book } from '@/model/book'
import type { FlowQuery } from '@/model/flow'
import type { LoginUser } from '@/model/user'
import { ref } from 'vue'

export const showBookDialogFlag = ref({
  visible: false
})

export const showFlowExcelImportDialog = ref(false)
// 流水Json导入弹出框
export const showFlowJsonImportDialog = ref(false)

export const showFlowTableDialog = ref(false)
export const flowTableQuery = ref<FlowQuery>()

export const showSetConvertDialog = ref(false)

export const showFlowEditDialog = ref(false)

export const userInfo = ref<LoginUser>({})
export const bookInfo = ref<Book>({})

// WEB LOCAL，系统初始化时从后端获取
export const MOD = ref<string>('LOCAL')
MOD.value = import.meta.env.VITE_MOD || 'WEB'
console.log('model:', MOD.value)
