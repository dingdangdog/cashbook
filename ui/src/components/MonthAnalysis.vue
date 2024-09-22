<template>
  <div style="flex-direction: column; align-items: left !important" v-show="haveData">
    <div class="text-block">
      <p>
        总支出：<v-chip color="error">{{ monthData?.outSum }}元</v-chip>
      </p>
      <p>
        总收入：<v-chip color="success">{{ monthData?.inSum }}元</v-chip>
      </p>
      <p>
        不计收支：<v-chip color="warning">{{ monthData?.zeroSum }}元</v-chip>
      </p>
    </div>

    <div class="text-block" v-show="monthData?.maxOut.money && monthData?.maxOut.money > 0">
      最大单笔支出：
      <div class="text-block">
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          日期：<b>{{ monthData?.maxOut.day }}</b>
        </p>
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          支出类型：<b>{{ monthData?.maxOut.type }}</b>
        </p>
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          支付方式：<b>{{ monthData?.maxOut.payType }}</b>
        </p>
        <p>
          名称：<b>{{ monthData?.maxOut.name }}，{{ monthData?.maxOut.description }}</b>
        </p>
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          金额：<v-chip color="error">{{ monthData?.maxOut.money }}元</v-chip>
        </p>
      </div>
    </div>

    <div class="text-block" v-show="monthData?.maxIn.money && monthData.maxIn.money > 0">
      最大单笔收入：
      <div class="text-block">
        <p>
          日期：<b>{{ monthData?.maxIn.day }}</b>
        </p>
        <p>
          收入类型：<b>{{ monthData?.maxIn.type }}</b>
        </p>
        <p>
          收款方式：<b>{{ monthData?.maxIn.payType }}</b>
        </p>
        <p>
          名称：<b>{{ monthData?.maxIn.name }}</b>
        </p>
        <p>
          金额：<v-chip color="success">{{ monthData?.maxIn.money }}元</v-chip>
        </p>
      </div>
    </div>

    <div class="text-block">
      <p>
        最高支出类型： <v-chip>{{ monthData?.maxType }}</v-chip>
        支出额：
        <v-chip color="error">{{ monthData?.maxTypeSum }}元</v-chip>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { monthAnalysis } from '@/api/api.analysis'
import type { MonthAnalysis } from '@/model/analysis'
import { errorAlert } from '@/utils/alert'

// 使用 props 来接收外部传入的参数
const { month } = defineProps(['month'])

const monthData = ref<MonthAnalysis>()
const haveData = ref(false)

onMounted(() => {
  let monthParam = month.replace('年', '-').replace('月', '').replaceAll(' ', '')
  // 如果月份是单数，则补零

  if (monthParam.split('-')[1] && monthParam.split('-')[1].length === 1) {
    monthParam = monthParam.split('-')[0] + '-0' + monthParam.split('-')[1]
  }
  monthAnalysis(monthParam).then((res) => {
    if (res.inSum === '' && res.outSum === '') {
      errorAlert('暂无数据')
      return
    }
    monthData.value = res
    haveData.value = true
  })
})
</script>

<style scoped>
.text-block {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}
</style>
