<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["admin"],
});

import { del, page, type AdminTheme } from "./api";
import { editInfoFlag } from "./flag";
import EditInfoDialog from "./EditInfoDialog.vue";
import { generateMobileFriendlyPageNumbers } from "~/utils/common";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";

const pageQuery = ref<PageParam>({ pageSize: 15, pageNum: 1 });
const query = ref<any>({
  code: "",
  name: "",
  mode: "",
  isActive: "",
  isDefault: "",
});
const tabledata = ref<{ total?: number; data?: AdminTheme[] }>({});
const loading = ref(false);

const editItem = ref<Partial<AdminTheme>>({});
const editDialogTitle = ref("Title");

const addItem = () => {
  editDialogTitle.value = "添加主题";
  editItem.value = {
    code: "",
    name: "",
    mode: "light",
    colors: "",
    isActive: true,
    isDefault: false,
    sortBy: 0,
  };
  editInfoFlag.value = true;
};

const editItemInfo = (item: AdminTheme) => {
  editDialogTitle.value = "编辑主题";
  editItem.value = { ...item };
  editInfoFlag.value = true;
};

const cancelEdit = () => {};

const toDelete = (item: AdminTheme) => {
  Confirm.open({
    title: "删除确认",
    content: `确定要删除主题【${item.name} / ${item.code}】吗？`,
    confirm: () => {
      del(String(item.id))
        .then(() => {
          Alert.success("删除成功");
          getPages();
        })
        .catch(() => Alert.error("删除失败"));
    },
    cancel: () => Alert.info("取消删除"),
  });
};

const normalizeQuery = () => {
  const q: any = { ...query.value };
  if (!q.mode) delete q.mode;
  if (q.isActive === "") delete q.isActive;
  if (q.isDefault === "") delete q.isDefault;
  return q;
};

const getPages = () => {
  loading.value = true;
  page(pageQuery.value, normalizeQuery())
    .then((res) => (tabledata.value = res))
    .finally(() => (loading.value = false));
};

const changePage = (pageNum: number) => {
  pageQuery.value.pageNum = pageNum;
  getPages();
};

const changePageSize = (pageSize: number | string) => {
  pageQuery.value.pageSize = Number(pageSize);
  pageQuery.value.pageNum = 1;
  getPages();
};

const totalPages = computed(() =>
  Math.ceil((tabledata.value?.total || 0) / pageQuery.value.pageSize)
);
const mobileFriendlyPageNumbers = computed(() =>
  generateMobileFriendlyPageNumbers(
    pageQuery.value.pageNum,
    totalPages.value,
    3
  )
);

onMounted(() => getPages());
</script>

<template>
  <div class="p-2 md:p-4 bg-surface-muted min-h-full">
    <div
      class="bg-surface rounded-lg shadow-sm border border-border p-2 mb-2 md:mb-4"
    >
      <div class="flex flex-col sm:flex-row gap-2 justify-between">
        <div class="flex flex-wrap gap-2">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted"
            />
            <input
              v-model="query.code"
              type="text"
              placeholder="编码..."
              class="w-full max-w-40 pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
              @keyup.enter="getPages"
            />
          </div>
          <input
            v-model="query.name"
            type="text"
            placeholder="名称..."
            class="w-full max-w-40 px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
            @keyup.enter="getPages"
          />
          <select
            v-model="query.mode"
            class="px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
          >
            <option value="">全部模式</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
          <select
            v-model="query.isActive"
            class="px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
          >
            <option value="">启用状态</option>
            <option value="true">启用</option>
            <option value="false">停用</option>
          </select>
          <button
            @click="getPages"
            class="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <MagnifyingGlassIcon class="h-4 w-4" />
            查询
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            @click="addItem"
            class="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <PlusIcon class="h-4 w-4" />
            新增主题
          </button>
        </div>
      </div>
    </div>

    <div class="bg-surface shadow-sm border border-border overflow-hidden">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        ></div>
        <span class="ml-2 text-muted">加载中...</span>
      </div>

      <div
        v-if="!loading && tabledata.data?.length"
        class="hidden lg:block max-h-[80vh] overflow-y-auto"
      >
        <table class="w-full">
          <thead>
            <tr class="bg-surface-muted border-b border-border">
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                编码
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                名称
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                模式
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                启用
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                默认
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                排序
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                创建时间
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
            <tr
              v-for="item in tabledata.data"
              :key="item.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td class="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                {{ item.code }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                {{ item.name }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium',
                    item.mode === 'dark'
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
                  ]"
                >
                  {{ item.mode }}
                </span>
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                {{ item.isActive ? "启用" : "停用" }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                {{ item.isDefault ? "默认" : "否" }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                {{ item.sortBy }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                {{ formatDate(item.createdAt || 0) }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="editItemInfo(item)"
                    class="text-primary-600 hover:text-primary-500 transition-colors"
                    title="编辑"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="toDelete(item)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="删除"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!loading && tabledata.data?.length"
        class="lg:hidden max-h-[70vh] overflow-y-auto"
      >
        <div
          v-for="item in tabledata.data"
          :key="item.id"
          class="p-3 border-b border-border hover:bg-surface-muted transition-colors last:border-b-0"
        >
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-base font-medium text-foreground flex-1">
              {{ item.name }} / {{ item.code }}
            </h3>
            <div class="flex items-center gap-1">
              <button
                @click="editItemInfo(item)"
                class="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
              >
                <PencilIcon class="h-3 w-3" />
              </button>
              <button
                @click="toDelete(item)"
                class="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <TrashIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
          <div class="space-y-1 text-sm text-muted">
            <p>模式: {{ item.mode }} · 启用: {{ item.isActive ? "是" : "否" }} · 默认: {{ item.isDefault ? "是" : "否" }}</p>
            <p>排序: {{ item.sortBy }} · {{ formatDate(item.createdAt || 0) }}</p>
          </div>
        </div>
      </div>

      <div
        v-if="!loading && (!tabledata.data || tabledata.data.length === 0)"
        class="text-center py-12"
      >
        <div class="text-muted mb-4">
          <svg
            class="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-2">暂无主题数据</h3>
        <p class="text-muted mb-4">添加主题后可在此管理</p>
        <button
          @click="addItem"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 font-medium inline-flex items-center gap-2"
        >
          <PlusIcon class="h-4 w-4" />
          添加主题
        </button>
      </div>

      <div
        v-if="!loading && tabledata.data?.length && totalPages > 1"
        class="px-4 py-3 bg-surface-muted border-t border-border"
      >
        <div class="flex flex-col gap-4">
          <div class="text-sm text-foreground text-center">
            显示第 {{ (pageQuery.pageNum - 1) * pageQuery.pageSize + 1 }} -
            {{
              Math.min(
                pageQuery.pageNum * pageQuery.pageSize,
                tabledata.total || 0
              )
            }}
            条，共 {{ tabledata.total || 0 }} 条
          </div>
          <div class="flex items-center justify-center gap-4">
            <select
              v-model="pageQuery.pageSize"
              @change="changePageSize(pageQuery.pageSize)"
              class="text-sm border border-border rounded px-2 py-1 bg-surface text-foreground"
            >
              <option value="10">10条/页</option>
              <option value="15">15条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
            </select>
            <div class="flex items-center gap-1">
              <button
                @click="changePage(pageQuery.pageNum - 1)"
                :disabled="pageQuery.pageNum <= 1"
                class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface-muted disabled:opacity-50 bg-surface text-foreground"
              >
                <ChevronLeftIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <template
                v-for="(p, index) in mobileFriendlyPageNumbers"
                :key="index"
              >
                <button
                  v-if="p !== '...'"
                  @click="changePage(Number(p))"
                  :class="[
                    'h-7 w-7 sm:h-8 sm:w-8 text-center text-xs sm:text-sm border rounded',
                    p === pageQuery.pageNum
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-border hover:bg-surface-muted bg-surface text-foreground',
                  ]"
                >
                  {{ p }}
                </button>
                <span v-else class="px-1 text-muted text-xs">...</span>
              </template>
              <button
                @click="changePage(pageQuery.pageNum + 1)"
                :disabled="pageQuery.pageNum >= totalPages"
                class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface-muted disabled:opacity-50 bg-surface text-foreground"
              >
                <ChevronRightIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <EditInfoDialog
      v-if="editInfoFlag"
      :item="editItem"
      :title="editDialogTitle"
      @success="getPages"
      @cancel="cancelEdit"
    />
  </div>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-surface-muted;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-border rounded-full;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-muted;
}
</style>
