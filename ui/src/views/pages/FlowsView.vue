<template>
  <div class="flow-container">
    <!-- 表格查询框与操作按钮 -->
    <div class="main-inner-header">
      <v-btn class="btn-group-btn" color="success" @click="selectHeaderDialog = true"
        >导入导出
      </v-btn>
      <v-btn class="btn-group-btn" color="success" @click="openCreateDialog(formTitle[0])"
        >新增
      </v-btn>
      <!-- <span class="btn-group-btn">
          <v-btn color="error" @click="toDeleteBatch">删除</v-btn>
        </span> -->
      <v-btn class="btn-group-btn" color="primary" @click="searchDrawer = true">筛选 </v-btn>
    </div>
    <hr />
    <!-- 表格主体数据列表 -->
    <div class="flow-table">
      <v-data-table-server
        :height="getTableHeight()"
        noDataText="暂无数据"
        :items-per-page="flowQuery.pageSize"
        :items="flowPageRef?.pageData"
        :itemsLength="flowPageRef?.totalCount || 0"
        :headers="headers"
        :loading="loading"
        @update:options="changePage"
      >
        <template v-slot:item.day="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.flowType="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.type="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.payType="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.money="{ value }">
          <v-chip :color="value > 100 ? 'error' : 'warning'">{{ value }}</v-chip>
        </template>
        <template v-slot:item.name="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.description="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.invoice="{ value }">
          <v-img
            style="height: 3rem; min-width: 3rem; cursor: pointer"
            fit="contain"
            :src="InvoiceUrls[value]"
            @click="openFullscreen(InvoiceUrls[value])"
          >
          </v-img>
        </template>
        <template v-slot:top>
          <v-dialog v-model="deleteConfirmDialog" width="auto">
            <v-card>
              <v-card-title class="text-h5">
                确定删除流水 【{{ deleteItem?.name }}:{{ deleteItem?.money }}】吗?
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="cancelDelete">取消</v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="confirmDelete">确定</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <div style="min-width: 5rem">
            <v-icon
              class="btn-group-btn"
              color="success"
              @click="openUpdateDialog('编辑流水', item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              class="btn-group-btn"
              color="primary"
              @click="
                () => {
                  uploadInvoice.id = item.id
                  showInvoiceDialog = true
                }
              "
            >
              mdi-invoice-text-edit-outline
            </v-icon>
            <v-icon class="btn-group-btn" color="error" @click="toDelete(item)">
              mdi-delete
            </v-icon>
          </div>
        </template>
      </v-data-table-server>
    </div>
    <v-dialog v-model="deleteBatchConfirmDialog" width="auto">
      <v-card>
        <v-card-title class="text-h5">
          确定批量删除【{{ multipleSelection.length }}条】流水吗?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="cancelDeleteFlows">取消</v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="deleteFlows">确定</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 表格分页插件 -->
    <div style="margin-top: 0.5rem">
      <span class="pageSpan">
        <v-chip color="rgb(76, 152, 112)">
          总收入：<b>{{ Number(flowPageRef?.totalIn.toFixed(2)) }}</b>
        </v-chip>
        <v-chip color="rgb(217, 159, 8)">
          总支出：<b>{{ Number(flowPageRef?.totalOut.toFixed(2)) }}</b>
        </v-chip>
        <v-chip color="rgb(120, 120, 120)">
          不计收支：<b>{{ Number(flowPageRef?.notInOut.toFixed(2)) }}</b>
        </v-chip>
      </span>
    </div>
  </div>
  <v-navigation-drawer v-model="searchDrawer" temporary location="left">
    <div style="padding: 0.5rem">
      <div class="queryParam">
        <v-date-input
          label="开始日期"
          cancel-text="取消"
          ok-text="确定"
          clearable
          variant="outlined"
          hide-details="auto"
          v-model="startDay"
          @update:modelValue="changeStartDay"
          @click:clear="clearStartDay"
        ></v-date-input>
      </div>
      <div class="queryParam">
        <v-date-input
          label="结束时间"
          cancel-text="取消"
          ok-text="确定"
          variant="outlined"
          hide-details="auto"
          v-model="endDay"
          clearable
          @update:modelValue="changeEndDay"
          @click:clear="clearEndDay"
        ></v-date-input>
      </div>
      <div class="queryParam">
        <v-text-field
          label="名称"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.name"
          clearable
        ></v-text-field>
      </div>
      <div class="queryParam">
        <v-text-field
          label="备注"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.description"
          clearable
        ></v-text-field>
      </div>
      <div class="queryParam">
        <v-autocomplete
          label="流水类型"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.flowType"
          :items="flowTypeOptions"
          clearable
          @update:modelValue="changeTypes"
        >
        </v-autocomplete>
      </div>
      <div class="queryParam">
        <v-autocomplete
          label="消费类型"
          hide-details="auto"
          variant="outlined"
          :placeholder="typeLabel"
          clearable
          v-model="flowQuery.type"
          :items="expenseTypeOptions"
        >
        </v-autocomplete>
      </div>
      <div class="queryParam">
        <v-autocomplete
          label="支付方式"
          hide-details="auto"
          variant="outlined"
          :placeholder="payTypeLabel"
          clearable
          v-model="flowQuery.payType"
          :items="paymentTypeOptions"
        >
        </v-autocomplete>
      </div>
      <div class="queryParam" style="text-align: center">
        <v-btn style="margin-right: 0.5rem" color="success" @click="resetQuery()">重置</v-btn>
        <v-btn style="margin-left: 0.5rem" color="primary" @click="doQuery()">查询</v-btn>
      </div>

      <!-- <v-btn class="btn-group-btn" color="primary" @click="doQuery()">筛选 </v-btn> -->
    </div>
  </v-navigation-drawer>
  <v-navigation-drawer v-model="selectHeaderDialog" temporary location="left">
    <v-card-text style="text-align: left">
      <v-btn class="btn-group-btn" color="success" @click="showFlowExcelImportDialog = true"
        >CSV导入
      </v-btn>
      <v-btn class="btn-group-btn" color="error" @click="showFlowJsonImportDialog = true"
        >JSON导入
      </v-btn>
      <v-btn class="btn-group-btn" color="primary" @click="exportFlows()">JSON导出 </v-btn>
    </v-card-text>
  </v-navigation-drawer>

  <v-dialog v-model="showInvoiceDialog" width="30rem" transition="dialog-top-transition" persistent>
    <v-card>
      <v-card-title>上传小票</v-card-title>
      <v-card-text>
        <v-text-field disabled label="流水ID" v-model="uploadInvoice.id"></v-text-field>
        <v-file-input
          label="选择小票文件"
          variant="outlined"
          accept="image/*"
          small-chips
          hide-details="auto"
          prepend-icon="mdi-invoice-text-outline"
          show-size
          v-model="uploadInvoice.invoice"
        ></v-file-input>
      </v-card-text>
      <hr />
      <v-card-actions>
        <div style="text-align: center; width: 100%">
          <v-btn
            color="warning"
            class="btn-group-btn"
            variant="outlined"
            @click="showInvoiceDialog = false"
            >取消
          </v-btn>
          <v-btn color="success" class="btn-group-btn" variant="outlined" @click="uploadInvoiceFile"
            >上传
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 图片蒙版 -->
  <div class="overlay" v-if="fullscrenn">
    <div style="max-width: 30rem; width: 100%; height: 100%; max-height: 30rem">
      <v-img
        :src="fullscreenImage"
        style="height: 100%; width: 100%"
        contain
        alt="Fullscreen Image"
      />
    </div>
    <span class="close-button" @click="closeFullscreen">&times;</span>
  </div>
  <!-- 流水编辑弹窗 -->
  <FlowEditDialog
    v-if="showFlowEditDialog"
    :title="dialogFormTitle"
    :flow="editItem"
    :success-callback="doQuery"
  />
  <!-- 文件导入窗口 -->
  <FlowJsonImportDialog v-if="showFlowJsonImportDialog" :success-callback="doQuery" />
  <FlowExcelImportDialog v-if="showFlowExcelImportDialog" :success-callback="doQuery" />
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, watch } from 'vue'
import { VDateInput } from 'vuetify/labs/VDateInput'

// 私有引入
import {
  getFlowPage,
  deleteFlow,
  getAll,
  deleteFlowsApi,
  uploadInvoiceFileApi,
  showInvoice
} from '@/api/api.flow'
import { getExpenseType, getPaymentType } from '@/api/api.typer'
import { exportJson } from '@/utils/fileUtils'
import type { Page } from '@/model/page'
import type { Flow, FlowQuery } from '@/model/flow'

import {
  showFlowExcelImportDialog,
  showFlowEditDialog,
  showFlowJsonImportDialog
} from '@/stores/flag'
import { errorAlert, successAlert } from '@/utils/alert'
import FlowEditDialog from '@/components/dialogs/FlowEditDialog.vue'
import FlowJsonImportDialog from '@/components/dialogs/FlowJsonImportDialog.vue'
import FlowExcelImportDialog from '@/components/dialogs/FlowExcelImportDialog.vue'
import { dateFormater } from '@/utils/common'

const flowQuery = ref<FlowQuery>({
  pageNum: 1,
  pageSize: 20
})

const bookName = localStorage.getItem('bookName')

const searchDrawer = ref(false)
const selectHeaderDialog = ref(false)

const typeLabel = ref('支出/收入类型')
const payTypeLabel = ref('支付/收款方式')
const formTitle = ['新增流水', '修改流水']
/*
 * 集中定义常量
 */
// 流水类型
const flowTypeOptions = ref([{ title: '支出' }, { title: '收入' }, { title: '不计收支' }])

const typeDefault = ['请先选择流水类型']
// 消费类型/收入类型
const expenseTypeOptions = ref(typeDefault)
// 支付类型
const paymentTypeOptions = ref(typeDefault)

// 修改FlowType后联动
const changeTypes = () => {
  if (flowQuery.value.flowType === '支出') {
    typeLabel.value = '支出类型'
    payTypeLabel.value = '支付方式'
  } else if (flowQuery.value.flowType === '收入') {
    typeLabel.value = '收入类型'
    payTypeLabel.value = '收款方式'
  } else {
    typeLabel.value = '支出/收入类型'
    payTypeLabel.value = '支付/收款方式'
  }
  if (!flowQuery.value.flowType) {
    expenseTypeOptions.value = typeDefault
    paymentTypeOptions.value = typeDefault
    return
  }
  getExpenseType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    expenseTypeOptions.value = data.map((item) => {
      return item.value
    })
  })
  getPaymentType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    paymentTypeOptions.value = data.map((item) => {
      return { title: item.value }
    })
  })
}

const startDay = ref()
const endDay = ref()
const changeStartDay = () => {
  if (startDay.value) {
    // console.log(startDay.value)
    flowQuery.value.startDay = dateFormater('YYYY-MM-dd', startDay.value)
  } else {
    flowQuery.value.startDay = ''
  }
}
const clearStartDay = () => {
  startDay.value = null
  flowQuery.value.startDay = ''
}
const changeEndDay = () => {
  if (endDay.value) {
    // console.log(endDay.value)
    flowQuery.value.endDay = dateFormater('YYYY-MM-dd', endDay.value)
  } else {
    flowQuery.value.endDay = ''
  }
}
const clearEndDay = () => {
  endDay.value = null
  flowQuery.value.endDay = ''
}
const resetQuery = () => {
  flowQuery.value = {}
  searchDrawer.value = false
  doQuery()
}

const headers = ref([
  { title: '日期', key: 'day', sortable: false },
  { title: '流水类型', key: 'flowType', sortable: false },
  { title: '消费类型', key: 'type', sortable: false },
  { title: '支付方式', key: 'payType', sortable: false },
  { title: '金额', key: 'money' },
  { title: '名称', key: 'name', sortable: false },
  { title: '小票', key: 'invoice', sortable: false },
  { title: '备注', key: 'description', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
])

/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true)
// 表单弹窗标题
const dialogFormTitle = ref(formTitle[0])
// 分页数据绑定
const flowPageRef = ref<Page<Flow>>()

const changePage = (param: {
  page: number
  itemsPerPage: number
  sortBy: { key: string; order: string }[]
}) => {
  // console.log(param)
  flowQuery.value.pageNum = param.page
  flowQuery.value.pageSize = param.itemsPerPage
  if (param.sortBy[0] && param.sortBy[0].key === 'money') {
    flowQuery.value.moneySort = param.sortBy[0].order
  } else {
    flowQuery.value.moneySort = ''
  }
  doQuery()
}

const showInvoiceDialog = ref(false)
const uploadInvoice = ref<{ id?: any; invoice?: any }>({})
const uploadInvoiceFile = () => {
  if (!uploadInvoice.value.invoice) {
    errorAlert('未选择小票')
    return
  }
  const formdata = new FormData()
  formdata.append('id', uploadInvoice.value.id)
  formdata.append('invoice', uploadInvoice.value.invoice)
  uploadInvoiceFileApi(formdata).then((res) => {
    successAlert('上传成功')
    showInvoiceDialog.value = false
    uploadInvoice.value = {}
    doQuery()
  })
}
// 获取小票图片url的一些逻辑
const InvoiceUrls = ref<Record<string, string>>({})
const getInvoiceUrl = async (invoice: string) => {
  const defalutImage = '/cashbook-mini.jpg'
  if (!invoice || invoice === '') {
    InvoiceUrls.value[invoice] = defalutImage
    return
  }
  try {
    const res = await showInvoice(invoice)
    // console.log(res)
    InvoiceUrls.value[invoice] = res.data ? URL.createObjectURL(res.data) : res
  } catch (e) {
    InvoiceUrls.value[invoice] = defalutImage
  }
}
// 全屏展示小票
const fullscrenn = ref(false)
const fullscreenImage = ref('')
const openFullscreen = (image: string) => {
  fullscrenn.value = true
  fullscreenImage.value = image.replace('/thumbs', '')
  window.addEventListener('keydown', handleKeydown)
}
const closeFullscreen = () => {
  fullscrenn.value = false
  window.removeEventListener('keydown', handleKeydown)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && fullscrenn.value) {
    fullscrenn.value = false
  }
}

// 执行分页数据查询
const doQuery = () => {
  loading.value = true
  searchDrawer.value = false
  getFlowPage(flowQuery.value)
    .then((res) => {
      if (res) {
        // successAlert('查询成功')
        flowPageRef.value = res
        for (let flow of flowPageRef.value.pageData) {
          getInvoiceUrl(flow.invoice || '')
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 确认删除的一些逻辑
const deleteConfirmDialog = ref(false)
const deleteItem = ref<Flow>()
const toDelete = (item: Flow) => {
  deleteConfirmDialog.value = true
  deleteItem.value = item
}
const cancelDelete = () => {
  deleteConfirmDialog.value = false
  deleteItem.value = {}
}
const confirmDelete = () => {
  if (!deleteItem.value?.id) {
    errorAlert('请选择要删除的数据')
    return
  }
  deleteFlow(deleteItem.value?.id)
    .then((res) => {
      successAlert('删除成功')
      doQuery()
    })
    .catch((res) => {
      console.log(res)
      errorAlert('删除失败')
    })
  deleteConfirmDialog.value = false
}

// 批量删除
const deleteBatchConfirmDialog = ref(false)
const multipleSelection = ref<Flow[]>([])
const toDeleteBatch = () => {
  if (multipleSelection.value.length <= 0) {
    errorAlert('请至少选择一条要删除的流水')
    return
  }
  deleteBatchConfirmDialog.value = true
}
const deleteFlows = () => {
  deleteFlowsApi(multipleSelection.value.map((flow) => flow.id))
    .then(() => {
      successAlert('删除成功!')
      doQuery()
    })
    .catch(() => {
      errorAlert('删除失败!')
    })
}
const cancelDeleteFlows = () => {
  deleteBatchConfirmDialog.value = false
}

// 打开新增弹窗
const openCreateDialog = (title: string) => {
  typeLabel.value = '支出/收入类型'
  payTypeLabel.value = '支付/收款方式'
  dialogFormTitle.value = title
  showFlowEditDialog.value = true
  editItem.value = {}
}

const editItem = ref<Flow>()
// 打开修改弹窗
const openUpdateDialog = (title: string, updateFlow: Flow) => {
  dialogFormTitle.value = title
  showFlowEditDialog.value = true
  editItem.value = updateFlow
}

// 导出方法(前台导出，后台负责要导出的查询数据)
const exportFlows = () => {
  getAll(flowQuery.value)
    .then((data) => {
      const fileName = bookName + '-' + new Date().getTime() + '.json'
      exportJson(fileName, JSON.stringify(data))
    })
    .catch(() => {
      errorAlert('数据获取出错，无法导出！')
    })
}
// 动态设置列表高度
const getTableHeight = () => {
  return window.innerWidth < 1080 ? window.innerHeight - 64 * 5 : window.innerHeight - 64 * 4
}

changeTypes()

const searching = ref(false)
onMounted(() => {
  // watch(flowQuery.value, () => {
  //   if (searching.value) {
  //     return
  //   }
  //   searching.value = true
  //   setTimeout(() => {
  //     searching.value = false
  //     doQuery()
  //   }, 500)
  // })
})
</script>

<style scoped>
.flow-container {
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
}

.common-text-column {
  min-width: 5rem;
  max-width: 10rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

/* 在这里添加样式来隐藏 overlay 和 fullscreen-image */
.overlay {
  z-index: 11111;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(55, 55, 55, 0.8);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  /* padding: 0 0.5rem; */
  background-color: rgb(79, 79, 79);
  color: rgb(255, 131, 131);
  border-radius: 50%;
  font-size: 30px;
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
}
</style>
