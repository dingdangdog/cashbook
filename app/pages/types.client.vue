<template>
  <div class="p-2 md:p-4 bg-surface-muted dark:bg-surface-dark min-h-full">
    <!-- 筛选抽屉 (全设备通用) -->
    <div v-if="searchPanelVisible" class="fixed inset-0 bg-black/60 z-50" @click="searchPanelVisible = false">
      <div
        class="fixed right-0 top-0 h-full w-full max-w-md bg-surface dark:bg-surface-dark shadow-xl transform transition-transform duration-300 p-2 md:p-4 overflow-y-auto border-l border-frame dark:border-frame-dark"
        @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-ink-primary dark:text-ink-onDark">
            筛选条件
          </h3>
          <button @click="searchPanelVisible = false"
            class="text-ink-muted hover:text-ink-primary dark:hover:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted p-2 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-ink-secondary dark:text-ink-onDark mb-2">类型分类</label>
            <select v-model="typeQueryRef.type"
              class="w-full px-3 py-2 border border-frame dark:border-frame-dark rounded-lg bg-surface dark:bg-surface-dark text-ink-primary dark:text-ink-onDark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors">
              <option value="">全部</option>
              <option v-for="option in typerOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-secondary dark:text-ink-onDark mb-2">类型名称</label>
            <input v-model="typeQueryRef.value" type="text" placeholder="请输入类型名称..."
              class="w-full px-3 py-2 border border-frame dark:border-frame-dark rounded-lg bg-surface dark:bg-surface-dark text-ink-primary dark:text-ink-onDark placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 pt-4 border-t border-frame dark:border-frame-dark">
            <button @click="clearFilters"
              class="flex-1 px-4 py-2 bg-surface-muted hover:bg-surface-soft dark:bg-surface-darkMuted dark:hover:bg-surface-dark text-ink-secondary dark:text-ink-onDark rounded-lg transition-colors duration-200 font-medium">
              清空筛选
            </button>
            <button @click="searchPanelVisible = false"
              class="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors duration-200 font-medium">
              确定
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div
      class="bg-surface dark:bg-surface-dark rounded-lg shadow-sm border border-frame dark:border-frame-dark p-2 mb-2 md:mb-4">
      <div class="flex flex-col sm:flex-row gap-2 justify-between">
        <!-- 左侧操作按钮 -->
        <div class="flex flex-wrap gap-2">
          <button @click="showConfig"
            class="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4">
              </path>
            </svg>
            CSV导入映射配置
          </button>

          <button @click="hisFlowTypeConvert()"
            class="px-3 py-2 bg-state-danger hover:opacity-90 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
              </path>
            </svg>
            历史数据映射
          </button>
        </div>

        <!-- 右侧筛选按钮 -->
        <div>
          <button @click="searchPanelVisible = !searchPanelVisible"
            class="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z">
              </path>
            </svg>
            筛选
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表格容器 -->
    <div class="bg-surface dark:bg-surface-dark shadow-sm border border-frame dark:border-frame-dark overflow-hidden">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        <span class="ml-2 text-ink-muted">加载中...</span>
      </div>

      <!-- 桌面端表格 -->
      <div v-if="!loading && types.length" class="hidden lg:block max-h-[80vh] overflow-y-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-surface-muted dark:bg-surface-darkMuted border-b border-frame dark:border-frame-dark">
              <th class="px-4 py-2 text-left text-sm font-medium text-ink-muted uppercase tracking-wider">
                分类
              </th>
              <th class="px-4 py-2 text-left text-sm font-medium text-ink-muted uppercase tracking-wider">
                名称
              </th>
              <th class="px-4 py-2 text-left text-sm font-medium text-ink-muted uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-frame dark:divide-frame-dark">
            <tr v-for="item in types" :key="`${item.type}-${item.value}`"
              class="hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors">
              <td class="px-4 py-2 whitespace-nowrap text-sm text-ink-primary dark:text-ink-onDark">
                {{ item.type }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-ink-primary dark:text-ink-onDark">
                {{ item.value }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                <button @click="openUpdateDialog(item)"
                  class="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  title="编辑">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 移动端卡片 -->
      <div v-if="!loading && types.length" class="lg:hidden max-h-[70vh] overflow-y-auto">
        <div v-for="item in types" :key="`${item.type}-${item.value}`"
          class="p-3 border-b border-frame dark:border-frame-dark hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors">
          <!-- 标题行：类型信息 + 编辑按钮 -->
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h3 class="text-base font-medium text-ink-primary dark:text-ink-onDark mb-1">
                {{ item.value }}
              </h3>
              <p class="text-sm text-ink-muted">
                <span class="font-medium">分类:</span> {{ item.type }}
              </p>
            </div>

            <!-- 编辑按钮 -->
            <div class="flex items-center">
              <button @click="openUpdateDialog(item)"
                class="p-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded transition-colors"
                title="编辑">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                  </path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && types.length === 0" class="text-center py-12">
        <div class="text-ink-muted mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-ink-primary dark:text-ink-onDark mb-2">
          暂无类型数据
        </h3>
        <p class="text-ink-muted">
          请先添加一些流水记录，类型数据会自动生成
        </p>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <div v-if="typeDialog.visible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click="cancelEdit">
      <div
        class="bg-surface dark:bg-surface-dark rounded-lg shadow-xl w-full max-w-md transform transition-all border border-frame dark:border-frame-dark"
        @click.stop>
        <!-- 对话框标题 -->
        <div class="px-6 py-4 border-b border-frame dark:border-frame-dark">
          <h3 class="text-lg font-semibold text-ink-primary dark:text-ink-onDark">
            {{ typeDialog.title }}
          </h3>
          <p class="text-sm text-state-warning mt-1">
            修改类型名称会自动修改关联的所有流水
          </p>
        </div>

        <!-- 对话框内容 -->
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-ink-secondary dark:text-ink-onDark mb-2">类型分类</label>
            <input v-model="editType.type" type="text" disabled
              class="w-full px-3 py-2 border border-frame dark:border-frame-dark rounded-lg bg-surface-muted dark:bg-surface-darkMuted text-ink-muted" />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-secondary dark:text-ink-onDark mb-2">原类型名称</label>
            <input v-model="editType.oldValue" type="text" disabled
              class="w-full px-3 py-2 border border-frame dark:border-frame-dark rounded-lg bg-surface-muted dark:bg-surface-darkMuted text-ink-muted" />
          </div>

          <div>
            <label class="block text-sm font-medium text-ink-secondary dark:text-ink-onDark mb-2">新类型名称</label>
            <input v-model="editType.value" type="text" autofocus
              class="w-full px-3 py-2 border border-frame dark:border-frame-dark rounded-lg bg-surface dark:bg-surface-dark text-ink-primary dark:text-ink-onDark focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="请输入新的类型名称" />
          </div>
        </div>

        <!-- 对话框操作按钮 -->
        <div class="px-6 py-4 border-t border-frame dark:border-frame-dark flex justify-center gap-4">
          <button @click="cancelEdit"
            class="px-4 py-2 bg-surface-muted hover:bg-surface-soft dark:bg-surface-darkMuted dark:hover:bg-surface-dark text-ink-secondary dark:text-ink-onDark rounded-lg transition-colors duration-200 font-medium">
            取消
          </button>
          <button @click="confirmTypeChange()"
            class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors duration-200 font-medium">
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import type { Typer } from "~/utils/model";
import { typeConvert } from "~/utils/flowConvert";
import { showSetConvertDialog } from "~/utils/flag";
import { storeToRefs } from "pinia";
import { useSystemStore } from "~/utils/store";

const systemStore = useSystemStore();
const { typeRelations } = storeToRefs(systemStore);

// 加载蒙版显示控制器
const searchPanelVisible = ref(false);
const loading = ref(true);
const typerOptions = ref<string[]>(["支出类型/收入类型", "支付方式/收款方式"]);

// 列表数据绑定
const types = ref<Typer[]>([]);
const allTypes = ref<Typer[]>([]);

const typeQueryRef = ref<Typer>({
  value: "",
});

const editType = ref<Typer>({
  type: "",
  value: "",
});

const typeDialog = ref({
  visible: false,
  title: "流水类型批量改名",
});

// 账本编辑表单实例
const openUpdateDialog = (row: Typer) => {
  editType.value.bookId = localStorage.getItem("bookId") || "";
  editType.value.flowType = row.flowType;
  editType.value.type = row.type;
  editType.value.oldValue = row.value;
  editType.value.value = "";
  typeDialog.value.visible = true;
};

const confirmTypeChange = () => {
  if (!editType.value.value) return;
  doApi
    .post<any>("api/entry/flow/type/update", editType.value)
    .then((res) => {
      // console.log(res);
      if (res && res.count > 0) {
        Alert.success("修改成功，同步修改" + res.count + "条流水数据");
      } else {
        Alert.error("修改失败");
      }
      typeDialog.value.visible = false;
      doQuery();
    })
    .catch((err) => {
      Alert.error("修改失败");
      console.log(err);
    });
};

const cancelEdit = () => {
  typeDialog.value.visible = false;
};

const doQuery = () => {
  loading.value = true;
  // console.log(typeQueryRef.value);
  doApi
    .post<Typer[]>("api/entry/flow/type/getAll", {
      ...typeQueryRef.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      // console.log(res);
      if (res) {
        // Alert.success("查询成功");
        types.value = res;
        allTypes.value = res;
      }
    })
    .catch((err) => {
      Alert.error("查询出错");
      console.log(err);
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  doQuery();
});

watch(typeQueryRef.value, () => {
  types.value = allTypes.value.filter((type) => {
    return (
      type.type?.indexOf(typeQueryRef.value.type || "") !== -1 &&
      type.value?.indexOf(typeQueryRef.value.value || "") !== -1
    );
  });
});

const hisFlowTypeConvert = async () => {
  let doConvert: string = "";
  let hasConversion = false; // Track if any conversion has occurred
  console.log(types.value);
  console.log(typeRelations.value);
  for (let i = 0; i < types.value.length; i++) {
    let t = types.value[i];
    if (t.type === "支出类型/收入类型") {
      t.oldValue = t.value;
      console.log(t.value);
      const newValue = typeConvert(t.value);
      console.log(newValue);
      if (t.value !== newValue) {
        // Only proceed if the value has changed
        t.value = newValue;
        doConvert += `【${t.oldValue}】-->【${t.value}】`;
        const res = await doApi.post<any>("api/entry/flow/type/update", {
          ...t,
          bookId: localStorage.getItem("bookId"),
        });

        if (res && res.count > 0) {
          doConvert += " success\n";
        } else {
          doConvert += " fail\n";
        }
        hasConversion = true; // Mark that a conversion has occurred
      }
    }
  }
  if (!hasConversion) {
    Alert.info("没有类型需要转换");
  } else {
    Confirm.open({
      title: "转换结果如下",
      content: doConvert,
      confirmText: "确定",
      confirm: () => { },
    });
  }
  doQuery();
};

const showConfig = () => {
  showSetConvertDialog.value = true;
};

const clearFilters = () => {
  typeQueryRef.value.type = "";
  typeQueryRef.value.value = "";
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-surface-muted dark:bg-surface-darkMuted;
}

.overflow-x-auto::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-frame dark:bg-frame-dark rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-brand-400 dark:bg-brand-600;
}
</style>
