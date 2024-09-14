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
    <div class="el-table-div">
      <v-data-table-server
        height="75vh"
        noDataText="暂无数据"
        :items-per-page="flowQuery.pageSize"
        :items="flowPageRef.pageData"
        :itemsLength="flowPageRef.totalCount"
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
    <hr />
    <!-- 表格分页插件 -->
    <div class="pageDiv">
      <span class="pageSpan">
        <v-chip color="rgb(76, 152, 112)">
          总收入：<b>{{ Number(flowPageRef.totalIn.toFixed(2)) }}</b>
        </v-chip>
        <v-chip color="rgb(217, 159, 8)">
          总支出：<b>{{ Number(flowPageRef.totalOut.toFixed(2)) }}</b>
        </v-chip>
        <v-chip color="rgb(120, 120, 120)">
          不计收支：<b>{{ Number(flowPageRef.notInOut.toFixed(2)) }}</b>
        </v-chip>
      </span>
    </div>
  </div>
  <v-navigation-drawer v-model="searchDrawer" temporary location="top">
    <div class="main-inner-header">
      <div class="queryParam">
        <v-text-field
          variant="outlined"
          hide-details="auto"
          v-model="flowQuery.startDay"
          clearable
          label="开始日期"
        ></v-text-field>
        <!-- <el-date-picker
          :style="datePickerStyle"
          class="date-picker"
          v-model="flowQuery.startDay"
          type="date"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          placeholder="开始时间"
        /> -->
      </div>
      <div class="queryParam">
        <v-text-field
          label="结束时间"
          variant="outlined"
          hide-details="auto"
          v-model="flowQuery.endDay"
          clearable
        ></v-text-field>
        <!-- <el-date-picker
          :style="datePickerStyle"
          class="date-picker"
          v-model="flowQuery.endDay"
          type="date"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          placeholder="结束时间"
        /> -->
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

      <!-- <v-btn class="btn-group-btn" color="primary" @click="doQuery()">筛选 </v-btn> -->
    </div>
  </v-navigation-drawer>
  <v-navigation-drawer v-model="selectHeaderDialog" temporary location="top">
    <v-card-text style="text-align: right">
      <v-btn class="btn-group-btn" color="success" @click="showFlowExcelImportDialog = true"
        >CSV导入
      </v-btn>
      <v-btn class="btn-group-btn" color="success" @click="showFlowJsonImportDialog = true"
        >JSON导入
      </v-btn>
      <v-btn class="btn-group-btn" color="primary" @click="exportFlows()">JSON导出 </v-btn>
    </v-card-text>
  </v-navigation-drawer>

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

// 私有引入
import { getFlowPage, deleteFlow, getAll, deleteFlowsApi } from '@/api/api.flow'
import { getExpenseType, getPaymentType } from '@/api/api.typer'
import { exportJson } from '@/utils/fileUtils'
import type { FlowExport } from '@/model/view'
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

const headers = ref([
  { title: '日期', key: 'day', sortable: false },
  { title: '流水类型', key: 'flowType', sortable: false },
  { title: '消费类型', key: 'type', sortable: false },
  { title: '支付方式', key: 'payType', sortable: false },
  { title: '金额', key: 'money' },
  { title: '名称', key: 'name', sortable: false },
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
const flowPageRef = ref<Page<Flow>>({
  pageNum: 1,
  pageSize: 0,
  totalPage: 1,
  totalCount: 0,
  totalOut: 0,
  totalIn: 0,
  notInOut: 0,
  pageData: []
})

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

// 执行分页数据查询
const doQuery = () => {
  loading.value = true
  getFlowPage(flowQuery.value)
    .then((res) => {
      if (res) {
        flowPageRef.value = res
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 金额排序
const moneySortFunc = (obj: any) => {
  console.log(obj)
  if (obj.order === 'ascending') {
    flowQuery.value.moneySort = 'ASC'
  } else if (obj.order === 'descending') {
    flowQuery.value.moneySort = 'DESC'
  } else {
    flowQuery.value.moneySort = ''
  }
  doQuery()
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
      successAlert(res)
      doQuery()
    })
    .catch(() => {
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

doQuery()
changeTypes()
watch(flowQuery.value, () => {
  doQuery()
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
</style>
