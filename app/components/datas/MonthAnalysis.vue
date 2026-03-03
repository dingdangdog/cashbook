<template>
  <div style="flex-direction: column" v-show="haveData">
    <div
      class="border rounded-md m-2 bg-green-200/10 border-green-500"
      v-show="
        monthData?.maxIn && monthData.maxIn?.money && monthData.maxIn.money > 0
      "
    >
      <div class="text-block">
        <p style="margin: 0.5rem 0">
          <b>总收入：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          >
            {{ monthData?.inSum || 0 }}元
          </span>
        </p>
      </div>

      <div class="text-block">
        <p>
          <b>最高收入类型：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
          >
            {{ monthData?.maxInType }}
          </span>
          <b> 收入额：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
          >
            {{ monthData?.maxInTypeSum }}元
          </span>
        </p>
      </div>

      <div class="text-block">
        <b>最大单笔收入：</b>
        <div class="text-block" v-if="monthData?.maxIn">
          <p class="text-gray-800 dark:text-gray-200">
            日期：{{ monthData?.maxIn.day }}
          </p>
          <p class="text-gray-800 dark:text-gray-200">
            收入类型：{{ monthData?.maxIn.industryType }}
          </p>
          <p class="text-gray-800 dark:text-gray-200">
            收款方式：{{ monthData?.maxIn.payType }}
          </p>
          <p class="text-gray-800 dark:text-gray-200">
            名称：{{ monthData?.maxIn.name }}
          </p>
          <p class="text-gray-800 dark:text-gray-200">
            金额：
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
            >
              {{ monthData?.maxIn.money }}元
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="border rounded-md m-2 bg-red-200/10 border-red-400">
      <div
        class="text-block"
        v-show="monthData?.outSum && Number(monthData.outSum) > 0"
      >
        <p style="margin: 0.5rem 0">
          <b>总支出：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          >
            {{ monthData?.outSum || 0 }}元
          </span>
        </p>
      </div>

      <div class="text-block">
        <p>
          <b>最高支出类型：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
          >
            {{ monthData?.maxOutType }}
          </span>
          <b> 支出额：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          >
            {{ monthData?.maxOutTypeSum }}元
          </span>
        </p>
      </div>

      <div class="text-block">
        <b>最大单笔支出：</b>
        <div class="text-block" v-if="monthData?.maxOut">
          <p
            class="text-gray-800 dark:text-gray-200"
            v-show="monthData?.maxOut.money && monthData.maxOut.money > 0"
          >
            日期：{{ monthData?.maxOut.day }}
          </p>
          <p
            class="text-gray-800 dark:text-gray-200"
            v-show="monthData?.maxOut.money && monthData.maxOut.money > 0"
          >
            支出类型：{{ monthData?.maxOut.industryType }}
          </p>
          <p
            class="text-gray-800 dark:text-gray-200"
            v-show="monthData?.maxOut.money && monthData.maxOut.money > 0"
          >
            支付方式：{{ monthData?.maxOut.payType }}
          </p>
          <p class="text-gray-800 dark:text-gray-200">
            名称：{{ monthData?.maxOut.name || "" }}，{{
              monthData?.maxOut.description || ""
            }}
          </p>
          <p
            class="text-gray-800 dark:text-gray-200"
            v-show="monthData?.maxOut.money && monthData.maxOut.money > 0"
          >
            金额：
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
            >
              {{ monthData?.maxOut.money }}元
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="border rounded-md m-2 bg-gray-200/10 border-gray-400">
      <div class="text-block">
        <p style="margin: 0.5rem 0">
          <b>不计收支：</b>
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
          >
            {{ monthData?.zeroSum || 0 }}元
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

// 使用 props 来接收外部传入的参数
const { data } = defineProps(["data"]);

const monthData = ref<MonthAnalysis>({
  ...data,
});
const haveData = ref(true);

onMounted(() => {});
</script>

<style scoped>
.text-block {
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}
</style>
