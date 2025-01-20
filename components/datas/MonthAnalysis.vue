<template>
  <div style="flex-direction: column" v-show="haveData">
    <div
      class="tw-border tw-rounded-md tw-m-2 tw-bg-green-200/10 tw-border-green-500"
      v-show="monthData?.maxIn.money && monthData.maxIn.money > 0"
    >
      <div class="text-block">
        <p style="margin: 0.5rem 0">
          <b>总收入：</b
          ><v-chip color="success">{{ monthData?.inSum || 0 }}元</v-chip>
        </p>
      </div>

      <div class="text-block">
        <p>
          <b>最高收入类型：</b>
          <v-chip color="primary">{{ monthData?.maxInType }}</v-chip>
          <b> 收入额：</b>
          <v-chip color="success">{{ monthData?.maxInTypeSum }}元</v-chip>
        </p>
      </div>

      <div class="text-block">
        <b>最大单笔收入：</b>
        <div class="text-block">
          <p>日期：{{ monthData?.maxIn.day }}</p>
          <p>收入类型：{{ monthData?.maxIn.industryType }}</p>
          <p>收款方式：{{ monthData?.maxIn.payType }}</p>
          <p>名称：{{ monthData?.maxIn.name }}</p>
          <p>
            金额：<v-chip color="success"
              >{{ monthData?.maxIn.money }}元</v-chip
            >
          </p>
        </div>
      </div>
    </div>

    <div
      class="tw-border tw-rounded-md tw-m-2 tw-bg-red-200/10 tw-border-red-400"
    >
      <div
        class="text-block"
        v-show="monthData?.maxOut.money && monthData?.maxOut.money > 0"
      >
        <p style="margin: 0.5rem 0">
          <b>总支出：</b
          ><v-chip color="error">{{ monthData?.outSum || 0 }}元</v-chip>
        </p>
      </div>

      <div class="text-block">
        <p>
          <b>最高支出类型：</b>
          <v-chip color="primary">{{ monthData?.maxOutType }}</v-chip>
          <b> 支出额：</b>
          <v-chip color="error">{{ monthData?.maxOutTypeSum }}元</v-chip>
        </p>
      </div>

      <div class="text-block">
        <b>最大单笔支出：</b>
        <div class="text-block">
          <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
            日期：{{ monthData?.maxOut.day }}
          </p>
          <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
            支出类型：{{ monthData?.maxOut.industryType }}
          </p>
          <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
            支付方式：{{ monthData?.maxOut.payType }}
          </p>
          <p>
            名称：{{ monthData?.maxOut.name }}，{{
              monthData?.maxOut.description
            }}
          </p>
          <p v-show="monthData?.maxOut.money && monthData.maxOut.money > 0">
            金额：<v-chip color="error">{{ monthData?.maxOut.money }}元</v-chip>
          </p>
        </div>
      </div>
    </div>

    <div
      class="tw-border tw-rounded-md tw-m-2 tw-bg-gray-200/10 tw-border-gray-400"
    >
      <div class="text-block">
        <p style="margin: 0.5rem 0">
          <b>不计收支：</b
          ><v-chip color="#78909C">{{ monthData?.zeroSum || 0 }}元</v-chip>
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
