<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

import { del, page, type AdminTheme } from "./api";
import { editInfoFlag } from "./flag";
import EditInfoDialog from "./EditInfoDialog.vue";

const pageQuery = ref<PageParam>({ pageSize: 10, pageNum: 1 });
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

const cancelEdit = () => {
  // cancel hook
};

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
        .catch(() => {
          Alert.error("删除失败");
        });
    },
    cancel: () => {
      Alert.info("取消删除");
    },
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
    .then((res) => {
      tabledata.value = res;
    })
    .finally(() => {
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

onMounted(() => {
  getPages();
});
</script>

<template>
  <div class="space-y-4">
    <div
      class="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 px-4 py-2"
    >
      <div class="flex flex-col lg:flex-row gap-4 items-end">
        <div class="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            v-model="query.code"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="code"
          />
          <input
            v-model="query.name"
            type="text"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="name"
          />
          <select
            v-model="query.mode"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部mode</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
          <select
            v-model="query.isActive"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部启用状态</option>
            <option value="true">启用</option>
            <option value="false">停用</option>
          </select>
          <select
            v-model="query.isDefault"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">全部默认状态</option>
            <option value="true">默认</option>
            <option value="false">非默认</option>
          </select>
        </div>

        <div class="flex gap-3">
          <button
            @click="getPages"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>查询</span>
          </button>
          <button
            @click="addItem()"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>新增主题</span>
          </button>
        </div>
      </div>
    </div>

    <div
      class="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden"
    >
      <div class="px-6 py-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-white">主题列表</h3>
          <div class="text-sm text-gray-400">共 {{ tabledata.total || 0 }} 条记录</div>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center space-x-2 text-gray-400">
          <span>加载中...</span>
        </div>
      </div>

      <div
        v-else-if="tabledata.data && tabledata.data.length > 0"
        class="overflow-x-auto"
      >
        <table class="w-full">
          <thead class="bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">mode</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">启用</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">默认</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">sortBy</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">创建时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr
              v-for="item in tabledata.data"
              :key="item.id"
              class="hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.code }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ item.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    item.mode === 'dark'
                      ? 'bg-purple-900/30 text-purple-200 border border-purple-700'
                      : 'bg-blue-900/30 text-blue-200 border border-blue-700',
                  ]"
                >
                  {{ item.mode }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    item.isActive
                      ? 'bg-green-900/30 text-green-200 border border-green-700'
                      : 'bg-gray-900/30 text-gray-300 border border-gray-700',
                  ]"
                >
                  {{ item.isActive ? "启用" : "停用" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium',
                    item.isDefault
                      ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-700'
                      : 'bg-gray-900/30 text-gray-300 border border-gray-700',
                  ]"
                >
                  {{ item.isDefault ? "默认" : "否" }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ item.sortBy }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(item.createdAt || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="editItemInfo(item)"
                    class="text-blue-400 hover:text-blue-300 transition-colors"
                    title="编辑"
                  >
                    编辑
                  </button>
                  <button
                    @click="toDelete(item)"
                    class="text-red-400 hover:text-red-300 transition-colors"
                    title="删除"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-12">
        <p class="text-gray-400 text-lg mb-2">暂无数据</p>
        <p class="text-gray-500 text-sm">没有找到符合条件的主题</p>
      </div>

      <div
        v-if="tabledata.data && tabledata.data.length > 0"
        class="px-6 py-4 border-t border-gray-700"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-400">每页显示</span>
            <select
              :value="pageQuery.pageSize"
              @change="changePageSize(parseInt(($event.target as HTMLSelectElement).value))"
              class="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span class="text-sm text-gray-400">条，共 {{ tabledata.total }} 条</span>
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

