<template>
  <div class="el-dialog-main">
    <el-form ref="planFormRef" :model="planRef" :rules="planFormRules">
      <el-form-item label="月份" :label-width="formLabelWidth" prop="month">
        <el-date-picker
          v-model="planRef.month"
          type="month"
          format="YYYY-MM"
          placeholder="月份"
        />
      </el-form-item>

      <el-form-item label="额度" :label-width="formLabelWidth" prop="limitMoney">
        <el-input-number v-model="planRef.limitMoney" :min="0" />
      </el-form-item>
    </el-form>
  </div>
  <!-- 表单确认按钮 -->
  <footer class="custom-dialog-footer common-center">
    <span class="dialog-footer">
      <el-button type="primary" @click="confirmPlanForm(planFormRef)"> 确定 </el-button>
      <el-button @click="resetPlanForm()"> 重置 </el-button>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus';
import type { Plan } from '@/types/model/plan';

import { setPlans, getPlan } from '@/api/api.plan'
import { dateFormater } from '@/utils/common'

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

// 额度设置表单实例
const planFormRef = ref<FormInstance>()

const planModel: Plan = {
  month: new Date(),
  limitMoney: 0,
  usedMoney: undefined
}

const planRef = reactive(planModel)

// 表单输入框校验规则
const planFormRules = ref<FormRules>({
  month: [{ required: true, message: '请选择额度月份', trigger: 'blur' }],
  limitMoney: [{ required: true, message: '请填入额度', trigger: 'blur' }]
})


const toSetPlan = (plan: Plan, o: number) => {
  plan.month = dateFormater('YYYY-MM', plan.month || new Date())
  setPlans(plan, o).then(() => {
    ElMessage({
      type: 'success',
      message: '设置成功!'
    })

    resetPlanForm()
  })
}

// 重置表单数据
const resetPlanForm = () => {
  planRef.month = ''
  planRef.limitMoney = 0
}


// 提交表单（新增或修改）
const confirmPlanForm = async (form: FormInstance | undefined) => {
  if (!form) return
  if (
    !(await form.validate((valid, fields) => {
      if (valid) {
        console.log('submit!')
      } else {
        console.log('error submit!', fields)
        return false
      }
    }))
  ) {
    return
  }
  getPlan(dateFormater('YYYY-MM', planRef.month) || '').then((plan) => {
    if (plan && plan.month) {
      ElMessageBox.confirm(
        '已存在额度设置(' + plan.month + '：' + plan.limitMoney + ')，是否修改设置？',
        '通知',
        {
          confirmButtonText: '确定',
          type: 'warning'
        }
      )
        .then(() => {
          toSetPlan(planRef, 1)
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '取消设置!'
          })
        })
    } else {
      toSetPlan(planRef, 0)
    }
  })
}

</script>

<style scoped>

</style>
