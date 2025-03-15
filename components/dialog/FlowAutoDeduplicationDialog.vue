<script setup lang="ts">
import { showAutoDeduplicationFlowsDialog } from "~/utils/flag";

interface DuplicateData {
  duplicateGroups: Flow[][];
  totalGroups: number;
  totalDuplicates: number;
}

const duplicateData = ref<DuplicateData>({
  duplicateGroups: [],
  totalGroups: 0,
  totalDuplicates: 0,
});

const loading = ref(false);

// 定义去重检测条件
const deduplicationCriteria = ref({
  name: true,
  description: true,
  industryType: true,
  flowType: true,
  payType: true,
});

// 获取疑似重复数据
const fetchDuplicates = () => {
  loading.value = true;
  doApi
    .post<DuplicateData>("api/entry/flow/deduplication/autos", {
      bookId: localStorage.getItem("bookId"),
      criteria: deduplicationCriteria.value, // 传递检测条件
    })
    .then((res) => {
      duplicateData.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

fetchDuplicates();

// 删除流水记录
const deleteFlow = (item: Flow) => {
  if (!item.id) {
    Alert.error("无法删除，ID不存在");
    return;
  }

  Confirm.open({
    title: "删除确认",
    content: `确定删除流水 【${item.name}:${item.money}】吗?`,
    confirm: () => {
      doApi
        .post("api/entry/flow/del", {
          id: item.id,
          bookId: localStorage.getItem("bookId"),
        })
        .then(() => {
          Alert.success("删除成功");
          // 重新加载数据
          fetchDuplicates();
        })
        .catch((error) => {
          console.error("删除失败", error);
          Alert.error("删除失败");
        });
    },
  });
};

// 关闭对话框
const closeDialog = () => {
  showAutoDeduplicationFlowsDialog.value = false;
};

// 格式化日期显示
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return dateStr;
};

// 获取流水类型对应的颜色
const getFlowTypeColor = (type: string) => {
  switch (type) {
    case "支出":
      return "error";
    case "收入":
      return "success";
    case "不计收支":
      return "info";
    default:
      return "grey";
  }
};
</script>

<template>
  <v-dialog v-model="showAutoDeduplicationFlowsDialog" :fullscreen="true">
    <v-card>
      <v-card-title class="tw-flex tw-justify-between tw-items-center">
        <span>疑似重复数据检测</span>
        <div class="tw-text-sm tw-text-gray-500">
          共发现 {{ duplicateData.totalGroups }} 组疑似重复数据， 涉及
          {{ duplicateData.totalDuplicates }} 条记录
        </div>
      </v-card-title>

      <!-- 添加检测条件选择器 -->
      <v-card-subtitle>
        <div
          class="tw-flex tw-flex-col md:tw-flex-row tw-items-center md:tw-space-x-4"
        >
          <div class="tw-font-medium">
            检测条件选择（日期和金额为默认条件）：
          </div>
          <div class="tw-flex tw-flex-wrap tw-gap-2">
            <v-checkbox
              color="success"
              v-model="deduplicationCriteria.name"
              label="名称"
              hide-details
              density="compact"
            ></v-checkbox>
            <v-checkbox
              color="success"
              v-model="deduplicationCriteria.description"
              label="备注"
              hide-details
              density="compact"
            ></v-checkbox>
            <v-checkbox
              color="success"
              v-model="deduplicationCriteria.flowType"
              label="流水类型"
              hide-details
              density="compact"
            ></v-checkbox>
            <v-checkbox
              color="success"
              v-model="deduplicationCriteria.industryType"
              label="支出/收入类型"
              hide-details
              density="compact"
            ></v-checkbox>
            <v-checkbox
              color="success"
              v-model="deduplicationCriteria.payType"
              label="支付/收款方式"
              hide-details
              density="compact"
            ></v-checkbox>
          </div>
          <v-btn
            size="small"
            color="primary"
            variant="elevated"
            @click="fetchDuplicates"
          >
            应用筛选条件
          </v-btn>
        </div>
      </v-card-subtitle>

      <v-card-text>
        <div
          v-if="loading"
          class="tw-flex tw-justify-center tw-items-center tw-py-10"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
          <span class="tw-ml-4">加载中...</span>
        </div>

        <div
          v-else-if="duplicateData.duplicateGroups.length === 0"
          class="tw-text-center tw-py-10"
        >
          <v-icon size="64" color="info">mdi-check-circle</v-icon>
          <p class="tw-mt-4 tw-text-lg">未发现疑似重复数据</p>
        </div>

        <div v-else class="tw-space-y-6 tw-overflow-y-auto tw-max-h-[75vh]">
          <!-- 每一组重复数据 -->
          <v-card
            v-for="(group, groupIndex) in duplicateData.duplicateGroups"
            :key="groupIndex"
            variant="outlined"
            class="tw-mb-6"
          >
            <v-card-title class="tw-bg-gray-400/40">
              <span class="tw-text-lg">疑似重复组 #{{ groupIndex + 1 }}</span>
              <div class="tw-text-sm">
                {{ formatDate(group[0]?.day) }} | {{ group[0]?.flowType }} |
                {{ group[0]?.money?.toFixed(2) }}元
              </div>
            </v-card-title>

            <v-card-text>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="tw-font-bold">类型</th>
                    <th>名称</th>
                    <th>金额</th>
                    <th>日期</th>
                    <th>支付/收款方式</th>
                    <th>类别</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, itemIndex) in group"
                    :key="item.id"
                    :class="{ 'tw-bg-gray-300/50': itemIndex % 2 === 0 }"
                  >
                    <td>
                      <v-chip
                        :color="getFlowTypeColor(item.flowType || '')"
                        size="small"
                      >
                        {{ item.flowType }}
                      </v-chip>
                    </td>
                    <td>
                      <div class="tw-max-w-40 tw-truncate" :title="item.name">
                        {{ item.name }}
                      </div>
                    </td>
                    <td>
                      <span
                        :class="
                          item.flowType === '支出'
                            ? 'tw-text-red-500'
                            : 'tw-text-green-500'
                        "
                      >
                        {{ Number(item.money).toFixed(2) }}
                      </span>
                    </td>
                    <td>{{ formatDate(item.day) }}</td>
                    <td>{{ item.payType }}</td>
                    <td>{{ item.industryType }}</td>
                    <td>
                      <div
                        class="tw-max-w-40 tw-truncate"
                        :title="item.description"
                      >
                        {{ item.description || "-" }}
                      </div>
                    </td>
                    <td>
                      <v-btn
                        color="error"
                        size="small"
                        variant="text"
                        density="compact"
                        @click="deleteFlow(item)"
                      >
                        <v-icon>mdi-delete</v-icon>
                        删除
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions>
        <div
          class="tw-flex tw-items-center tw-w-full tw-justify-center tw-space-x-4 tw-pb-4"
        >
          <v-btn variant="elevated" color="success" @click="fetchDuplicates">
            <v-icon left>mdi-refresh</v-icon>
            刷新数据
          </v-btn>
          <v-btn variant="elevated" color="error" @click="closeDialog()">
            关闭
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-card-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
