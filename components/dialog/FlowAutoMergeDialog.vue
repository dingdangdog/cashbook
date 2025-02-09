<script setup lang="ts">
import { showAutoMergeFlowsDialog } from "~/utils/flag";
interface CandidatePair {
  out: Flow;
  in: Flow;
}

const candidatePairs = ref<CandidatePair[]>([]);

const headers: any = [
  {
    title: "支出",
    value: "out",
    align: "end",
    children: [
      { title: "支付方式", value: "out.payType", align: "end" },
      { title: "支出类型", value: "out.industryType", align: "end" },
      { title: "日期", value: "out.day", align: "end" },
      { title: "备注", value: "out.description", align: "end" },
      { title: "名称", value: "out.name", align: "end" },
      { title: "金额", value: "out.money", align: "end" },
    ],
  },
  { title: "操作", value: "action", align: "center", sortable: false },
  {
    title: "收入/不计收支",
    value: "in",
    align: "left",
    children: [
      // { text: "候选记录ID", value: "in.id" },
      { title: "金额", value: "in.money" },
      { title: "名称", value: "in.name" },
      { title: "备注", value: "in.description" },
      { title: "日期", value: "in.day" },
      { title: "收入类型", value: "in.industryType" },
      { title: "收款方式", value: "in.payType" },
    ],
  },
];

const loading = ref(false);
const fetchCandidates = () => {
  loading.value = true;
  doApi
    .get<CandidatePair[]>("api/entry/flow/condidate/autos")
    .then((res) => {
      candidatePairs.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

fetchCandidates();

const confirmBalance = (pair: CandidatePair) => {
  Confirm.open({
    title: "平账确认",
    content: `确定要将下列数据平账吗？
    支出【${pair.out.industryType}-${pair.out.payType}: ${pair.out.money}】
    收入【${pair.in.industryType}-${pair.in.payType}: ${pair.in.money}】`,
    confirm: () => {
      doApi
        .post("api/entry/flow/condidate/confirm", {
          outId: pair.out.id,
          inIds: [pair.in.id],
          bookId: localStorage.getItem("bookId"),
        })
        .then((res) => {
          Alert.success("平账成功");
          // 重新加载候选数据
          fetchCandidates();
        })
        .catch((error) => {
          console.error("平账失败", error);
          Alert.error("平账失败");
        });
    },
  });
};

const ignoreBalance = (pair: CandidatePair) => {
  doApi
    .post("api/entry/flow/condidate/ignore", {
      id: pair.out.id,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      Alert.warning("已忽略");
      // 重新加载候选数据
      fetchCandidates();
    })
    .catch((error) => {
      console.error("忽略失败", error);
      Alert.error("忽略失败");
    });
};

const ignoreAllBalance = () => {
  if (candidatePairs.value.length <= 0) {
    Alert.error("没有可忽略的数据");
    return;
  }
  doApi
    .post("api/entry/flow/condidate/ignoreAll", {
      bookId: localStorage.getItem("bookId"),
      ids: candidatePairs.value.map((p) => p.out.id),
    })
    .then((res) => {
      Alert.warning("已忽略");
      // 重新加载候选数据
      // fetchCandidates();
      closeDialog();
    })
    .catch((error) => {
      console.error("忽略失败", error);
      Alert.error("忽略失败");
    });
};

const closeDialog = () => {
  showAutoMergeFlowsDialog.value = false;
};
</script>

<template>
  <v-dialog v-model="showAutoMergeFlowsDialog" :fullscreen="true">
    <v-card>
      <v-card-title>自动平账候选数据</v-card-title>
      <v-card-text>
        <div class="tw-flex tw-justify-center">
          <v-btn color="warning" @click="ignoreAllBalance">忽略全部</v-btn>
        </div>
        <v-data-table
          :items="candidatePairs"
          :headers="headers"
          :loading="loading"
          height="calc(100vh - 300px)"
        >
          <template v-slot:header.out="{ column }">
            <div class="tw-text-lg tw-font-bold">{{ column.title }}</div>
          </template>
          <template v-slot:header.in="{ column }">
            <div class="tw-text-lg tw-font-bold">{{ column.title }}</div>
          </template>
          <template v-slot:item.out.money="{ value }">
            <v-chip color="error">{{ Number(value).toFixed(2) }}</v-chip>
          </template>
          <template v-slot:item.out.name="{ value }">
            <p
              class="tw-max-w-40 tw-text-ellipsis tw-line-clamp-2"
              :title="value"
            >
              {{ value }}
            </p>
          </template>
          <template v-slot:item.out.description="{ value }">
            <p
              class="tw-max-w-40 tw-text-ellipsis tw-line-clamp-2"
              :title="value"
            >
              {{ value }}
            </p>
          </template>
          <template v-slot:item.in.money="{ value }">
            <v-chip color="success">{{ Number(value).toFixed(2) }}</v-chip>
          </template>
          <template v-slot:item.in.name="{ value }">
            <p
              class="tw-max-w-40 tw-text-ellipsis tw-line-clamp-2"
              :title="value"
            >
              {{ value }}
            </p>
          </template>
          <template v-slot:item.in.description="{ value }">
            <p
              class="tw-max-w-40 tw-text-ellipsis tw-line-clamp-2"
              :title="value"
            >
              {{ value }}
            </p>
          </template>
          <template #item.action="{ item }">
            <v-btn color="primary" @click="confirmBalance(item)"> 平账 </v-btn>
            &nbsp;
            <v-btn color="warning" @click="ignoreBalance(item)"> 忽略 </v-btn>
          </template>
          <!-- 可根据需要自定义其它单元格展示 -->
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <div
          class="tw-flex tw-items-center tw-w-full tw-justify-center tw-space-x-4 tw-pb-4"
        >
          <v-btn variant="elevated" color="info" @click="closeDialog()">
            关闭
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
