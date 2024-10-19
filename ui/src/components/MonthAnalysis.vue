<template>
  <div style="flex-direction: column; align-items: left !important" v-show="haveData">
    <div class="text-block">
      <p style="margin: 0.5rem 0">
        <b>总支出：</b><v-chip color="error">{{ monthData?.outSum || 0 }}元</v-chip>
      </p>
      <p style="margin: 0.5rem 0">
        <b>总收入：</b><v-chip color="success">{{ monthData?.inSum || 0 }}元</v-chip>
      </p>
      <p style="margin: 0.5rem 0">
        <b>不计收支：</b><v-chip color="#78909C">{{ monthData?.zeroSum || 0 }}元</v-chip>
      </p>
    </div>

    <div class="text-block" v-show="monthData?.maxOut.money && monthData?.maxOut.money > 0">
      <b>最大单笔支出：</b>
      <div class="text-block">
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          日期：{{ monthData?.maxOut.day }}
        </p>
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          支出类型：{{ monthData?.maxOut.type }}
        </p>
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          支付方式：{{ monthData?.maxOut.payType }}
        </p>
        <p>名称：{{ monthData?.maxOut.name }}，{{ monthData?.maxOut.description }}</p>
        <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
          金额：<v-chip color="error">{{ monthData?.maxOut.money }}元</v-chip>
        </p>
      </div>
    </div>

    <div class="text-block" v-show="monthData?.maxIn.money && monthData.maxIn.money > 0">
      <b>最大单笔收入：</b>
      <div class="text-block">
        <p>日期：{{ monthData?.maxIn.day }}</p>
        <p>收入类型：{{ monthData?.maxIn.type }}</p>
        <p>收款方式：{{ monthData?.maxIn.payType }}</p>
        <p>名称：{{ monthData?.maxIn.name }}</p>
        <p>
          金额：<v-chip color="success">{{ monthData?.maxIn.money }}元</v-chip>
        </p>
      </div>
    </div>

    <div class="text-block" v-show="monthData?.maxTypeSum != '0'">
      <p>
        <b>最高支出类型：</b><v-chip color="primary">{{ monthData?.maxType }}</v-chip>
        <b> 支出额：</b>
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
  monthAnalysis(monthParam)
    .then((res) => {
      if (!res || (!res.inSum && !res.outSum)) {
        errorAlert('暂无数据')
        return
      }
      monthData.value = res
      haveData.value = true
    })
    .catch((err) => {
      errorAlert('查询出错')
      console.log(err)
    })
})
</script>

<style scoped>
.text-block {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}
</style>
