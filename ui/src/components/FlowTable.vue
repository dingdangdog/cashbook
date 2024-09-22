<template>
  <div class="flow-container">
    <!-- 表格主体数据列表 -->
    <div>
      <v-data-table-server
        height="40rem"
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
      </v-data-table-server>
    </div>
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
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, watch } from 'vue'

// 私有引入
import { getFlowPage } from '@/api/api.flow'
import { getExpenseType, getPaymentType } from '@/api/api.typer'
import type { Page } from '@/model/page'
import type { Flow, FlowQuery } from '@/model/flow'

const flowQuery = ref<FlowQuery>({ pageNum: 1, pageSize: 20 })

const { query } = defineProps(['query'])

// 初始化后自动执行
if (query) {
  flowQuery.value = query
}

const typeLabel = ref('支出/收入类型')
const payTypeLabel = ref('支付/收款方式')

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
  { title: '备注', key: 'description', sortable: false }
])

/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true)
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
  console.log(param)
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
      flowPageRef.value = res
    })
    .finally(() => {
      loading.value = false
    })
}

doQuery()
changeTypes()

watch(flowQuery, () => {
  doQuery()
})
</script>

<style scoped>
.flow-container {
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
