<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

import { onMounted } from "vue";
import { del, page } from "./api";
import { editInfoFlag } from "./flag";
import EditInfoDialog from "./EditInfoDialog.vue";

const pageQuery = ref<PageParam>({ pageSize: 15, pageNum: 1 });
const query = ref<TypeRelation | any>({});
const tabledata = ref<{ total?: number; data?: TypeRelation[] }>({});
const loading = ref(false);

// 是否显示模板数据
const showTemplateData = ref(false);

// 账本选择列表
const bookOptions = ref<{ text: string; value: string }[]>([]);

// 获取账本列表
const getBookList = async () => {
  try {
    const books = (await doApi.post(
      "api/admin/entry/books/list",
      {}
    )) as Book[];
    bookOptions.value = [
      { text: "全部账本", value: "" },
      { text: "🔧 模板数据", value: "0" },
      ...books.map((book: Book) => ({
        text: `${book.bookName} (${book.bookId})`,
        value: book.bookId,
      })),
    ];
  } catch (error) {
    console.error("获取账本列表失败:", error);
  }
};

const editItem = ref<TypeRelation | any>();
const editDialogTitle = ref("Title");

// 新增
const addItem = () => {
  editDialogTitle.value = "新增关系";
  editItem.value = {};
  editInfoFlag.value = true;
};

// 编辑基本信息
const editItemInfo = (item: TypeRelation) => {
  editDialogTitle.value = "编辑关系";
  editItem.value = item;
  editInfoFlag.value = true;
};

// 取消编辑的回调
const cancelEdit = () => {
  // cancel hook
};

const toDelete = (item: TypeRelation) => {
  Confirm.open({
    title: "删除确认",
    content: `确定要删除关系【${item.source}-${item.target}】吗？`,
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

  // 如果没有显式选择查看模板数据，则过滤掉模板数据
  const queryParams = { ...query.value };
  if (!showTemplateData.value && !query.value.bookId) {
    queryParams.excludeTemplate = true; // 添加排除模板数据的标志
  }

  page(pageQuery.value, queryParams).then((res) => {
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
  getBookList();
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
        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            v-model="query.bookId"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="option in bookOptions"
              :key="option.value"
              :value="option.value"
              class="text-sm w-64 text-ellipsis overflow-hidden"
            >
              {{ option.text }}
            </option>
          </select>
          <input
            v-model="query.userId"
            type="number"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="用户ID"
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
          <button
            @click="addItem()"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span>新增映射</span>
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
          <h3 class="text-lg font-medium text-white">映射列表</h3>
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
                账本信息
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                用户ID
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                原类型
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                目标类型
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
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex flex-col">
                  <div class="flex items-center space-x-2">
                    <span
                      v-if="item.bookId === '0'"
                      class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                    >
                      模板数据
                    </span>
                    <span
                      class="font-medium"
                      :class="
                        item.bookId === '0'
                          ? 'text-orange-400'
                          : 'text-blue-400'
                      "
                    >
                      {{
                        item.bookId === "0"
                          ? "系统模板"
                          : item.bookName || "未知账本"
                      }}
                    </span>
                  </div>
                  <div class="flex space-x-2 text-xs text-gray-500 mt-1">
                    <span>DB ID: {{ item.bookDbId || "N/A" }}</span>
                    <span>|</span>
                    <span>业务ID: {{ item.bookId }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.userId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.source }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.target }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editItemInfo(item)"
                    class="text-blue-400 hover:text-blue-300 transition-colors"
                    title="编辑"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      ></path>
                    </svg>
                  </button>
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
            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          ></path>
        </svg>
        <p class="text-gray-400 text-lg mb-2">暂无数据</p>
        <p class="text-gray-500 text-sm">没有找到符合条件的映射关系</p>
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
