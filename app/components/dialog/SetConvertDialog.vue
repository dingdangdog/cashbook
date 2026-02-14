<template>
  <!-- CSV导入映射配置对话框 -->
  <div
    v-if="showSetConvertDialog"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col transform transition-all border border-border"
      @click.stop
    >
      <!-- 紧凑的标题栏 -->
      <div
        class="px-3 py-2 md:px-4 md:py-3 border-b border-border flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold">CSV导入映射配置</h3>
        <button
          @click="cancelTypeRelationChange"
          class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- 紧凑的说明 -->
      <div
        class="px-3 py-2 md:px-4 md:py-2 bg-primary-500/10 border-b border-border"
      >
        <p class="text-xs text-primary-700 flex items-center">
          <svg
            class="w-3 h-3 mr-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          将第三方CSV数据导入时，会按照配置将原始交易类型转换为标准类型
        </p>
      </div>

      <!-- 表格形式的映射列表 -->
      <div class="flex-1 overflow-y-auto p-2 md:p-4">
        <div
          v-if="editRelations.length > 0"
          class="bg-surface border border-border rounded-lg overflow-hidden"
        >
          <!-- 表头 -->
          <div
            class="bg-surface-muted border-b border-border"
          >
            <div class="flex items-center px-3 py-2">
              <div
                class="flex-1 text-sm font-medium text-foreground/70"
              >
                原类型
              </div>
              <div class="w-8 flex justify-center">
                <svg
                  class="w-4 h-4 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </div>
              <div
                class="flex-1 text-sm font-medium text-foreground/70"
              >
                导入类型
              </div>
              <div
                class="w-10 text-sm font-medium text-foreground/70 text-center"
              >
                操作
              </div>
            </div>
          </div>

          <!-- 表格内容 -->
          <div class="divide-y divide-border">
            <div
              v-for="(relation, index) in editRelations"
              :key="index"
              class="flex items-center px-3 py-2 hover:bg-surface-muted"
            >
              <!-- 原类型输入框 -->
              <div class="flex-1 pr-2">
                <input
                  v-model="relation.source"
                  type="text"
                  placeholder="CSV中的类型..."
                  class="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  :style="{ color: getItemColor(relation.target) }"
                />
              </div>

              <!-- 箭头 -->
              <div class="w-8 flex justify-center">
                <svg
                  class="w-4 h-4 text-foreground/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  ></path>
                </svg>
              </div>

              <!-- 导入类型输入框 -->
              <div class="flex-1 px-2">
                <input
                  v-model="relation.target"
                  type="text"
                  placeholder="导入类型..."
                  class="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  :style="{ color: getItemColor(relation.target) }"
                />
              </div>

              <!-- 删除按钮 -->
              <div class="w-10 flex justify-center">
                <button
                  @click="removePair(index)"
                  class="p-1 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                  title="删除"
                >
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 紧凑的空状态 -->
        <div v-else class="text-center py-8">
          <div class="text-foreground/40 mb-2">
            <svg
              class="mx-auto h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p class="text-sm text-foreground/60 mb-3">
            暂无映射配置
          </p>
          <button
            @click="addPair"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors"
          >
            添加配置
          </button>
        </div>
      </div>

      <!-- 紧凑的操作栏 -->
      <div
        class="px-4 py-3 rounded-b-lg border-t border-border bg-surface-muted"
      >
        <div class="flex justify-between items-center">
          <!-- 左侧：新增按钮 -->
          <button
            v-if="editRelations.length > 0"
            @click="addPair"
            class="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            新增
          </button>
          <div v-else></div>

          <!-- 右侧：主要操作按钮 -->
          <div class="flex gap-2">
            <button
              @click="cancelTypeRelationChange"
              class="px-4 py-2 bg-surface hover:bg-surface-muted text-foreground/80 rounded text-sm font-medium transition-colors border border-border"
            >
              取消
            </button>
            <button
              @click="confirmTypeRelationChange"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
            >
              <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { showSetConvertDialog } from "~/utils/flag";
import { getTypeRelation } from "~/utils/apis";
import { typeRelationStore } from "~/utils/store";

// ESC键监听
useEscapeKey(() => {
  if (showSetConvertDialog.value) {
    showSetConvertDialog.value = false;
  }
}, showSetConvertDialog);

const editRelations = ref<TypeRelation[] | any>([]);

// Fetch and load the initial data
onMounted(() => {
  getTypeRelation().then((res) => {
    typeRelationStore.value = res;
    editRelations.value = res;
  });
});

// Add a new empty key-value pair
const addPair = () => {
  editRelations.value.unshift({
    
    source: "",
    target: "",
  });
};

// Remove a key-value pair at a specific index
const removePair = (index: number) => {
  editRelations.value.splice(index, 1);
};

// Confirm changes and update the data
const confirmTypeRelationChange = () => {
  // 过滤掉空的配置项
  const validRelations = editRelations.value.filter(
    (relation: any) => relation.source?.trim() && relation.target?.trim()
  );

  doApi
    .post("api/entry/typeRelation/update", {
      types: validRelations,
      
    })
    .then(() => {
      Alert.success("保存成功");
      typeRelationStore.value = validRelations;
      showSetConvertDialog.value = false;
    })
    .catch(() => {
      Alert.error("保存失败");
    });
};

// Cancel changes and reset to the original data
const cancelTypeRelationChange = () => {
  showSetConvertDialog.value = false;
};

const colorArray = [
  "#E57373",
  "#9FA8DA",
  "#FF80AB",
  "#90CAF9",
  "#EA80FC",
  "#29B6F6",
  "#B388FF",
  "#4FC3F7",
  "#00E676",
  "#80CBC4",
  "#F57F17",
  "#1DE9B6",
  "#64DD17",
  "#78909C",
  "#BCAAA4",
]; // 颜色数组
const colorMap = new Map<string, string>(); // 用于存储已经分配的文本及其对应颜色
let colorIndex = 0;

const getItemColor = (text: string) => {
  if (!text) return "#000000";
  // 如果文本已经存在于 colorMap 中，则返回已有的颜色
  if (colorMap.has(text)) {
    return colorMap.get(text)!;
  }
  // 否则，从颜色数组中获取一个颜色
  const color = colorArray[colorIndex];
  // 将文本和颜色映射存入 colorMap
  colorMap.set(text, color);
  // 更新 colorIndex，确保循环使用颜色数组
  colorIndex = (colorIndex + 1) % colorArray.length;
  // 返回该文本的颜色
  return color;
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: rgb(var(--color-surface-muted));
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}
</style>
