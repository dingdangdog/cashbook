<template>
  <!-- 弹出框表单：新增和修改通用 -->
  <v-dialog v-model="showFlowEditDialog" width="40rem" :fullscreen="miniFullscreen()">
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text class="edit-dialog-main">
        <v-form v-model="editForm" ref="formRef">
          <!-- TODO 日期选择 -->
          <v-date-input
            label="日期"
            cancel-text="取消"
            ok-text="确定"
            clearable
            variant="outlined"
            v-model="day"
            :hide-actions="true"
            @update:modelValue="changeDay"
          ></v-date-input>
          <v-combobox
            variant="outlined"
            label="流水类型"
            placeholder="请选择流水类型"
            v-model="flowEdit.flowType"
            :items="flowTypeDialogOptions"
            @update:modelValue="changeFlowTypes"
          ></v-combobox>
          <!-- 支付/收款方式 -->
          <v-combobox
            variant="outlined"
            :label="payTypeLabel"
            allow-new
            clearable
            no-data-text="暂无数据，请输入"
            v-model="flowEdit.payType"
            :items="paymentTypeOptions"
          ></v-combobox>
          <!-- 消费/收入类型 -->
          <v-combobox
            variant="outlined"
            :label="typeLabel"
            allow-new
            clearable
            no-data-text="暂无数据，请输入"
            v-model="flowEdit.type"
            :items="expenseTypeOptions"
          ></v-combobox>
          <v-text-field
            clearable
            label="金额"
            type="number"
            variant="outlined"
            v-model="flowEdit.money"
          ></v-text-field>
          <v-text-field
            clearable
            label="流水名称"
            variant="outlined"
            v-model="flowEdit.name"
          ></v-text-field>
          <v-text-field
            clearable
            label="备注"
            variant="outlined"
            v-model="flowEdit.description"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <!-- 表单确认按钮 -->
      <v-card-actions>
        <div style="text-align: center; width: 100%; margin-bottom: 1rem">
          <span class="btn-group-btn">
            <v-btn variant="elevated" color="error" @click="showFlowEditDialog = false">
              取消
            </v-btn>
          </span>
          <span class="btn-group-btn">
            <v-btn variant="elevated" color="primary" @click="confirmForm(false)"> 确定 </v-btn>
          </span>
          <span class="btn-group-btn">
            <v-btn
              variant="elevated"
              color="success"
              v-if="formTitle[0] === title"
              @click="confirmForm(true)"
            >
              确定并继续
            </v-btn>
          </span>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { VDateInput } from 'vuetify/labs/VDateInput'
import { createFlow, update } from '@/api/api.flow'
import { getExpenseType, getPaymentType } from '@/api/api.typer'
import type { Flow } from '@/model/flow'
import { showFlowEditDialog } from '@/stores/flag'
import { errorAlert, successAlert } from '@/utils/alert'
import { dateFormater, miniFullscreen } from '@/utils/common'
import { onMounted, ref, watch } from 'vue'

const { title, flow, successCallback } = defineProps(['title', 'flow', 'successCallback'])

// 表单弹窗标题选项
const formTitle = ['新增流水', '修改流水']
const typeLabel = ref('支出/收入类型')
const payTypeLabel = ref('支付/收款方式')
const editForm = ref(false)
const flowTypeDialogOptions = ref(['支出', '收入', '不计收支'])

// 消费类型/收入类型
const expenseTypeOptions = ref<any[]>([])
// 支付类型
const paymentTypeOptions = ref<any[]>([])
const flowEdit = ref<Flow>({})
onMounted(() => {
  if (flow) {
    flowEdit.value = flow
    day.value = new Date(flowEdit.value.day || '')
  }
  changeFlowTypes()
})
const day = ref()
const changeDay = () => {
  if (day.value) {
    // console.log(endDay.value)
    flowEdit.value.day = dateFormater('YYYY-MM-dd', day.value)
  }
}
// 修改FlowType后联动
const changeFlowTypes = () => {
  if (flowEdit.value.flowType === '支出') {
    typeLabel.value = '支出类型'
    payTypeLabel.value = '支付方式'
  } else if (flowEdit.value.flowType === '收入') {
    typeLabel.value = '收入类型'
    payTypeLabel.value = '收款方式'
  } else {
    typeLabel.value = '支出/收入类型'
    payTypeLabel.value = '支付/收款方式'
    return
  }

  getExpenseType(flowEdit.value.flowType).then((data) => {
    expenseTypeOptions.value = data.map((item) => {
      return item.value
    })
  })
  getPaymentType(flowEdit.value.flowType).then((data) => {
    paymentTypeOptions.value = data.map((item) => {
      return item.value
    })
  })
}

const searchPayType = ref('')
const searchType = ref('')
watch(searchPayType, (val) => {
  // console.log(val)
  if (val && !expenseTypeOptions.value.includes(val)) {
    expenseTypeOptions.value.push(val)
  }
})
watch(searchType, (val) => {
  // console.log(val)
  if (val && !paymentTypeOptions.value.includes(val)) {
    paymentTypeOptions.value.push(val)
  }
})

// 提交表单（新增或修改）
const confirmForm = async (again: boolean) => {
  if (!editForm.value) {
    // formRef.validate()
    errorAlert('UnSubmit, Please Check Form!')
    return
  }
  if (flowEdit.value.id) {
    // 修改
    updateOne()
  } else {
    // 新增
    createOne(again)
  }
}

// 创建
const createOne = (again: boolean) => {
  createFlow({
    day: dateFormater('YYYY-MM-dd', flowEdit.value.day || new Date()),
    bookId: parseInt(localStorage.getItem('bookId') || '0'),
    flowType: flowEdit.value.flowType,
    type: flowEdit.value.type,
    money: Number(flowEdit.value.money),
    payType: flowEdit.value.payType,
    name: flowEdit.value.name,
    description: flowEdit.value.description
  })
    .then((res) => {
      if (res.id) {
        successCallback()
        successAlert('新增成功!')
        showFlowEditDialog.value = again
        // 清空名称、备注和金额
        if (again) {
          flowEdit.value.money = undefined
          flowEdit.value.name = undefined
          flowEdit.value.description = undefined
        }
      }
    })
    .catch(() => {
      errorAlert('新增出现异常')
    })
}

// 更新
const updateOne = () => {
  if (!flowEdit.value.id) {
    errorAlert('请选择要修改的数据')
    return
  }
  update(flowEdit.value.id, {
    day: dateFormater('YYYY-MM-dd', flowEdit.value.day || new Date()),
    bookId: parseInt(localStorage.getItem('bookId') || '0'),
    flowType: flowEdit.value.flowType,
    type: flowEdit.value.type,
    money: Number(flowEdit.value.money),
    payType: flowEdit.value.payType,
    name: flowEdit.value.name,
    description: flowEdit.value.description
  })
    .then((res) => {
      // console.log(res);
      if (res.id) {
        successCallback()
        successAlert('更新成功!')
        showFlowEditDialog.value = false
      }
    })
    .catch(() => {
      errorAlert('更新出现异常')
    })
}
</script>

<style scoped>
.edit-dialog-main {
  padding: 1rem 2rem 0rem 2rem !important;
}
</style>
