<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

import { del, page } from "./api";
import { editInfoFlag } from "./flag";
import EditInfoDialog from "./EditInfoDialog.vue";

const pageQuery = ref<PageParam>({ pageSize: 10, pageNum: 1 });
const query = ref<Book | any>({});
const tabledata = ref<{ total?: number; data?: Book[] }>({});
const loading = ref(false);

const editItem = ref<Book | any>();
const editDialogTitle = ref("Title");

// 取消编辑的回调
const cancelEdit = () => {
  // cancel hook
};

const toDelete = (item: Book) => {
  Confirm.open({
    title: "删除确认",
    content: `确定要删除账本【${item.bookName}】吗？`,
    confirm: () => {
      del(item.id)
        .then((res) => {
          Alert.success("删除成功");
          getPages();
        })
        .catch(() => {
          Alert.error("删除失败");
        });
    },
    cancel: () => {
      Alert.info("取消删除");
    },
  });
};

const getPages = () => {
  loading.value = true;
  page(pageQuery.value, query.value).then((res) => {
    tabledata.value = res;
    loading.value = false;
  });
};

const changePage = (newPage: number) => {
  pageQuery.value.pageNum = newPage;
  getPages();
};

const changePageSize = (newSize: number) => {
  pageQuery.value.pageSize = newSize;
  pageQuery.value.pageNum = 1;
  getPages();
};

// 计算分页信息
const totalPages = computed(() => {
  return Math.ceil((tabledata.value.total || 0) / pageQuery.value.pageSize);
});

const startItem = computed(() => {
  return (pageQuery.value.pageNum - 1) * pageQuery.value.pageSize + 1;
});

const endItem = computed(() => {
  const end = pageQuery.value.pageNum * pageQuery.value.pageSize;
  return Math.min(end, tabledata.value.total || 0);
});

// 初始化
onMounted(() => {
  getPages();
});
</script>

<template>
  <div class="space-y-4">
    <!-- 搜索区域 -->
    <div
      class="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 px-4 py-2"
    >
      <div class="flex flex-col lg:flex-row gap-4 items-end">
        <!-- 搜索输入框 -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            v-model="query.userId"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="用户ID"
          />
          <input
            v-model="query.bookId"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="账本ID"
          />
          <input
            v-model="query.name"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="账本名称"
          />
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <button
            @click="getPages"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <span>查询</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div
      class="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden"
    >
      <!-- 表格头部 -->
      <div class="px-6 py-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-white">账本列表</h3>
          <div class="text-sm text-gray-400">
            共 {{ tabledata.total || 0 }} 条记录
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-2 text-gray-400">
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>加载中...</span>
        </div>
      </div>

      <!-- 表格内容 -->
      <div
        v-else-if="tabledata.data && tabledata.data.length > 0"
        class="overflow-x-auto"
      >
        <table class="w-full">
          <thead class="bg-gray-700/50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                账本ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                用户ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                账本名称
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                共享Key
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                创建时间
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr
              v-for="item in tabledata.data"
              :key="item.id"
              class="hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.bookId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.userId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.bookName }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono"
              >
                {{ item.shareKey || "-" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(item.createDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="toDelete(item)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                    title="删除"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-else class="flex flex-col items-center justify-center py-12">
        <svg
          class="w-12 h-12 text-gray-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          ></path>
        </svg>
        <p class="text-gray-400 text-lg mb-2">暂无数据</p>
        <p class="text-gray-500 text-sm">没有找到符合条件的账本</p>
      </div>

      <!-- 分页 -->
      <div
        v-if="tabledata.data && tabledata.data.length > 0"
        class="px-6 py-4 border-t border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-400">每页显示</span>
            <select
              :value="pageQuery.pageSize"
              @change="
                changePageSize(
                  parseInt(($event.target as HTMLSelectElement).value)
                )
              "
              class="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span class="text-sm text-gray-400"
              >条，共 {{ tabledata.total }} 条</span
            >
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-400">
              第 {{ startItem }}-{{ endItem }} 条，共 {{ totalPages }} 页
            </span>
            <div class="flex items-center space-x-1">
              <button
                @click="changePage(1)"
                :disabled="pageQuery.pageNum === 1"
                class="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
              >
                首页
              </button>
              <button
                @click="changePage(pageQuery.pageNum - 1)"
                :disabled="pageQuery.pageNum === 1"
                class="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
              >
                上一页
              </button>
              <span class="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                {{ pageQuery.pageNum }}
              </span>
              <button
                @click="changePage(pageQuery.pageNum + 1)"
                :disabled="pageQuery.pageNum === totalPages"
                class="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
              >
                下一页
              </button>
              <button
                @click="changePage(totalPages)"
                :disabled="pageQuery.pageNum === totalPages"
                class="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
              >
                尾页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <EditInfoDialog
    :item="editItem"
    :title="editDialogTitle"
    @success="getPages"
    @cancel="cancelEdit"
    v-if="editInfoFlag"
  />
</template>

<style scoped></style>
