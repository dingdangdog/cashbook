<template>
  <div style="flex-direction: column; align-items: left !important;" v-show="haveData">
    <!-- <el-text>span</el-text> -->
    <el-text tag="p" class="text-block">总&nbsp;&nbsp;支&nbsp;出：<el-text tag="b" type="warning">{{monthData?.outSum}}元</el-text></el-text>
    <el-text tag="p" class="text-block">总&nbsp;&nbsp;收&nbsp;入：<el-text tag="b" type="success">{{monthData?.inSum}}元</el-text></el-text>
    <el-text tag="p" class="text-block">不计收支：<el-text tag="b">{{monthData?.zeroSum}}元</el-text></el-text>

    <el-text tag="p" class="text-block" v-show="monthData?.maxOut.id && monthData?.maxOut.id > 0">
      最大单笔支出：
      <el-text tag="p" v-show="monthData?.maxOut.id && monthData?.maxOut.id > 0">
        &nbsp;&nbsp;&nbsp;&nbsp;日期：<el-text tag="b">{{monthData?.maxOut.day}}</el-text>
      </el-text>
      <el-text tag="p" v-show="monthData?.maxOut.id && monthData?.maxOut.id > 0">
        &nbsp;&nbsp;&nbsp;&nbsp;类型：<el-text tag="b">{{monthData?.maxOut.type}}</el-text>
      </el-text>
      <el-text tag="p" v-show="monthData?.maxOut.id && monthData?.maxOut.id > 0">
        &nbsp;&nbsp;&nbsp;&nbsp;方式：<el-text tag="b">{{monthData?.maxOut.payType}}</el-text>
      </el-text>
      <el-text tag="p" v-show="monthData?.maxOut.id && monthData?.maxOut.id > 0">
        &nbsp;&nbsp;&nbsp;&nbsp;金额：<el-text tag="b" type="warning">{{monthData?.maxOut.money}}元</el-text>
      </el-text>
      <el-text tag="p">
        &nbsp;&nbsp;&nbsp;&nbsp;名称：<el-text tag="b">{{monthData?.maxOut.name}}，{{monthData?.maxOut.description}}</el-text>
      </el-text>
    </el-text>
    
    <el-text tag="p" class="text-block" v-show="monthData?.maxIn.id && monthData?.maxIn.id > 0">
      最大单笔收入：
      <el-text tag="p">
        &nbsp;&nbsp;&nbsp;&nbsp;日期：<el-text tag="b">{{monthData?.maxIn.day}}</el-text>
      </el-text>
      <el-text tag="p">
        &nbsp;&nbsp;&nbsp;&nbsp;类型：<el-text tag="b">{{monthData?.maxIn.type}}</el-text>
      </el-text>
      <el-text tag="p">
        &nbsp;&nbsp;&nbsp;&nbsp;方式：<el-text tag="b">{{monthData?.maxIn.payType}}</el-text>
      </el-text>
      <el-text tag="p">
        &nbsp;&nbsp;&nbsp;&nbsp;金额：<el-text tag="b" type="success">{{monthData?.maxIn.money}}元</el-text>
      </el-text>
      <el-text tag="p">
        &nbsp;&nbsp;&nbsp;&nbsp;名称：<el-text tag="b">{{monthData?.maxIn.name}}</el-text>
      </el-text>
    </el-text>

    <el-text tag="p" class="text-block">最高支出类型：<el-text tag="b">{{monthData?.maxType}}</el-text>，支出总额：<el-text tag="b" type="warning">{{monthData?.maxTypeSum}}</el-text>元</el-text>
    
    <!-- <el-text tag="b">Bold</el-text> -->
    <!-- <el-text tag="i">Italic</el-text> -->
    <!-- <el-text>
      This is
      <el-text tag="sub" size="small">subscript</el-text>
    </el-text> -->
    <!-- <el-text>
      This is
      <el-text tag="sup" size="small">superscript</el-text>
    </el-text> -->
    <!-- <el-text tag="ins">Inserted</el-text> -->
    <!-- <el-text tag="del">Deleted</el-text> -->
    <!-- <el-text tag="mark">Marked</el-text> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { monthAnalysis } from '@/api/api.analysis'
import { ElMessage } from 'element-plus';
import type { MonthAnalysis } from '@/types/model/analysis';

// 使用 props 来接收外部传入的参数
const { month } = defineProps(['month'])

const monthData = ref<MonthAnalysis>()
const haveData = ref(false)

onMounted(() => {
  let monthParam = month.replace('年','-').replace('月', '').replaceAll(' ', '')
  // 如果月份是单数，则补零
  
  if (monthParam.split('-')[1].length === 1) {
    monthParam = monthParam.split('-')[0] + '-0' + monthParam.split('-')[1]
  }
  monthAnalysis(monthParam).then(res => {
    if (res.inSum === '' && res.outSum === ''){
      ElMessage.error("暂无数据")
      return
    }
    monthData.value = res
    haveData.value = true
  })
})
</script>

<style scoped>
.text-block{
  margin-bottom: 0.5rem;
}
</style>
