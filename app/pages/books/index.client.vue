<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import { del, page } from "./api";
import { editInfoFlag, showGetShareDialog } from "./flag";
import EditInfoDialog from "./EditInfoDialog.vue";
import GetShareDialog from "./GetShareDialog.vue";
import { generateMobileFriendlyPageNumbers } from "~/utils/common";
import {
  PencilIcon,
  ShareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
} from "@heroicons/vue/24/outline";

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const pageQuery = ref<PageParam>({ pageSize: 15, pageNum: 1 });
const query = ref<Book | any>({});
const tabledata = ref<{ total?: number; data?: Book[] }>({});
const loading = ref(false);

const editItem = ref<Book | any>();
const editDialogTitle = ref("Title");

// 新增
const addItem = () => {
  editDialogTitle.value = "新增账本";
  editItem.value = {};
  editInfoFlag.value = true;
};

// 编辑基本信息
const editItemInfo = (item: Book) => {
  editDialogTitle.value = "编辑账本";
  editItem.value = item;
  editInfoFlag.value = true;
};

const getShare = () => {
  showGetShareDialog.value = true;
};

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
          error("delete fail");
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

const changePage = (pageNum: number) => {
  pageQuery.value.pageNum = pageNum;
  getPages();
};

const changePageSize = (pageSize: number | string) => {
  pageQuery.value.pageSize = Number(pageSize);
  pageQuery.value.pageNum = 1;
  getPages();
};

const toShare = (item: Book) => {
  Confirm.open({
    title: "提示",
    content: `确定要分享账本【${item.bookName}】吗？分享后无法取消分享！`,
    confirm: () => {
      doApi.post("api/entry/book/share", { id: item.id }).then((res) => {
        Alert.success("分享成功");
        getPages();
      });
    },
    cancel: () => {
      Alert.info("取消分享");
    },
  });
};

// 复制分享Key到剪贴板
const copyShareKey = async (shareKey: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器的异步剪贴板API
      await navigator.clipboard.writeText(shareKey);
      Alert.success("分享Key已复制到剪贴板");
    } else {
      // 降级方案：使用传统的document.execCommand
      const textArea = document.createElement("textarea");
      textArea.value = shareKey;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        Alert.success("分享Key已复制到剪贴板");
      } else {
        throw new Error("复制失败");
      }
    }
  } catch (err) {
    console.error("复制失败:", err);
    Alert.error("复制失败，请手动选择复制");
    // 可选：显示一个包含分享Key的对话框，用户可以手动复制
    showShareKeyDialog(shareKey);
  }
};

// 显示分享Key对话框（降级方案）
const showShareKeyDialog = (shareKey: string) => {
  Confirm.open({
    title: "分享Key",
    content: `请手动复制以下分享Key：\n\n${shareKey}`,
    confirm: () => {
      // 用户点击确定
    },
    cancel: () => {
      // 用户点击取消
    },
  });
};

// 计算分页信息
const totalPages = computed(() =>
  Math.ceil((tabledata.value?.total || 0) / pageQuery.value.pageSize)
);

// 移动端友好的页码生成
const mobileFriendlyPageNumbers = computed(() => {
  return generateMobileFriendlyPageNumbers(
    pageQuery.value.pageNum,
    totalPages.value,
    3
  );
});

// 在组件挂载时获取数据
onMounted(() => {
  getPages();
});
</script>

<template>
  <div class="p-2 md:p-4 bg-surface-muted min-h-full">
    <!-- 搜索和操作栏 -->
    <div
      class="bg-surface rounded-lg shadow-sm border border-border p-2 mb-2 md:mb-4"
    >
      <!-- 宽屏：左右布局，窄屏：分两行 -->
      <div class="flex flex-col lg:flex-row gap-2">
        <!-- 搜索区域 -->
        <div class="flex space-x-2">
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted"
            />
            <input
              v-model="query.name"
              type="text"
              placeholder="搜索账本名称..."
              class="w-full max-w-60 pl-10 pr-4 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              @keyup.enter="getPages"
            />
          </div>
          <button
            @click="getPages"
            class="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <MagnifyingGlassIcon class="h-4 w-4" />
            <span>查询</span>
          </button>
        </div>

        <!-- 操作按钮区域 -->
        <div class="flex-1 flex flex-wrap gap-2 lg:flex-nowrap">
          <button
            @click="getShare"
            class="px-3 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <UsersIcon class="h-4 w-4" />
            添加共享账本
          </button>
          <button
            @click="addItem"
            class="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <PlusIcon class="h-4 w-4" />
            新增账本
          </button>
        </div>
      </div>
    </div>

    <!-- 数据表格容器 -->
    <div
      class="bg-surface shadow-sm border border-border overflow-hidden"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        ></div>
        <span class="ml-2 text-muted">加载中...</span>
      </div>

      <!-- 桌面端表格 -->
      <div
        v-if="!loading && tabledata.data?.length"
        class="hidden lg:block max-h-[70vh] overflow-y-auto"
      >
        <table class="w-full">
          <thead>
            <tr
              class="bg-surface-muted border-b border-border"
            >
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                ID
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                账本ID
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                账本名称
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                预算（每月）
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                创建时间
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                共享KEY
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted uppercase tracking-wider"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="item in tabledata.data"
              :key="item.id"
              class="hover:bg-surface-muted transition-colors"
            >
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-foreground"
              >
                {{ item.id }}
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-foreground"
              >
                {{ item.bookId }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap">
                <div
                  class="text-sm font-medium text-foreground max-w-52 text-ellipsis overflow-hidden"
                  :title="item.bookName"
                >
                  {{ item.bookName }}
                </div>
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-foreground"
              >
                {{ item.budget || "-" }}
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
              >
                {{ formatDate(item.createDate) }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap">
                <div v-if="item.shareKey" class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                  >
                    {{ item.shareKey }}
                  </span>
                  <button
                    @click="copyShareKey(item.shareKey)"
                    class="text-accent-600 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20 rounded p-1 transition-colors"
                    title="复制分享Key"
                  >
                    <DocumentDuplicateIcon class="h-3 w-3" />
                  </button>
                </div>
                <span v-else class="text-muted text-sm"
                  >-</span
                >
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
                    v-if="!item.shareKey"
                    @click="toShare(item)"
                    class="text-accent-600 hover:text-accent-500 transition-colors"
                    title="分享"
                  >
                    <ShareIcon class="h-4 w-4" />
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

      <!-- 移动端卡片 -->
      <div
        v-if="!loading && tabledata.data?.length"
        class="lg:hidden max-h-[60vh] overflow-y-auto"
      >
        <div
          v-for="item in tabledata.data"
          :key="item.id"
          class="bg-surface-muted p-3 space-y-2 border-b border-border last:border-b-0"
        >
          <!-- 标题行：账本名称 + 删除按钮 -->
          <div class="flex justify-between items-center mb-2">
            <h3
              class="text-base font-medium text-foreground flex-1 flex items-center pr-2"
            >
              <span class="font-medium">账本名称：</span>
              <span class="text-ellipsis overflow-hidden max-w-52">{{
                item.bookName
              }}</span>
            </h3>

            <!-- 删除按钮 -->
            <div class="flex items-center">
              <button
                @click="toDelete(item)"
                class="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="删除"
              >
                <TrashIcon class="h-3 w-3" />
              </button>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="space-y-1 text-sm text-muted">
            <div class="flex items-center justify-between">
              <p><span class="font-medium">ID:</span> {{ item.id }}</p>
              <p><span class="font-medium">账本ID:</span> {{ item.bookId }}</p>
            </div>
            <div class="flex items-center justify-between">
              <p>
                <span class="font-medium">预算:</span>
                {{ item.budget || "-" }}
              </p>

              <div class="flex items-center gap-3">
                <span class="font-medium">分享KEY:</span>
                <span
                  v-if="item.shareKey"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400"
                >
                  {{ item.shareKey }}
                </span>
                <span v-else class="text-muted"
                  >未分享</span
                >
                <button
                  v-if="item.shareKey"
                  @click="copyShareKey(item.shareKey)"
                  class="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors"
                  title="复制分享Key"
                >
                  <DocumentDuplicateIcon class="h-3 w-3" />
                </button>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <p>
                <span class="font-medium">创建时间:</span>
                {{ formatDate(item.createDate) }}
              </p>

              <!-- 编辑和分享按钮 -->
              <div class="flex items-center gap-1">
                <button
                  @click="editItemInfo(item)"
                  class="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors"
                  title="编辑"
                >
                  <PencilIcon class="h-3 w-3" />
                </button>
                <button
                  v-if="!item.shareKey"
                  @click="toShare(item)"
                  class="p-1.5 bg-accent-600 hover:bg-accent-500 text-white rounded transition-colors"
                  title="分享"
                >
                  <ShareIcon class="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-2">
          暂无账本数据
        </h3>
        <p class="text-muted mb-4">
          开始创建您的第一个账本吧
        </p>
        <button
          @click="addItem"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
        >
          <PlusIcon class="h-4 w-4" />
          创建账本
        </button>
      </div>

      <!-- 分页组件 -->
      <div
        v-if="!loading && tabledata.data?.length && totalPages > 1"
        class="px-4 py-3 bg-surface-muted border-t border-border"
      >
        <div class="flex flex-col gap-4">
          <!-- 分页信息 -->
          <div class="text-sm text-foreground text-center">
            显示第 {{ (pageQuery.pageNum - 1) * pageQuery.pageSize + 1 }} -
            {{
              Math.min(
                pageQuery.pageNum * pageQuery.pageSize,
                tabledata.total || 0
              )
            }}
            条， 共 {{ tabledata.total || 0 }} 条记录
          </div>

          <!-- 分页控件 - 水平居中 -->
          <div class="flex items-center justify-center gap-4">
            <!-- 每页显示数量选择 -->
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

            <!-- 分页按钮 -->
            <div class="flex items-center gap-1">
              <!-- 上一页 -->
              <button
                @click="changePage(pageQuery.pageNum - 1)"
                :disabled="pageQuery.pageNum <= 1"
                class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed bg-surface text-foreground transition-colors"
                title="上一页"
              >
                <ChevronLeftIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              <!-- 页码按钮 - 移动端限制显示数量 -->
              <template
                v-for="(page, index) in mobileFriendlyPageNumbers"
                :key="index"
              >
                <button
                  v-if="page !== '...'"
                  @click="changePage(Number(page))"
                  :class="[
                    'h-7 w-7 sm:h-8 sm:w-8 text-center text-xs sm:text-sm border rounded transition-colors',
                    page === pageQuery.pageNum
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-border hover:bg-surface-muted bg-surface text-foreground',
                  ]"
                >
                  {{ page }}
                </button>
                <span v-else class="px-1 text-muted text-xs">...</span>
              </template>

              <!-- 下一页 -->
              <button
                @click="changePage(pageQuery.pageNum + 1)"
                :disabled="pageQuery.pageNum >= totalPages"
                class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed bg-surface text-foreground transition-colors"
                title="下一页"
              >
                <ChevronRightIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框组件 -->
    <EditInfoDialog
      :item="editItem"
      :title="editDialogTitle"
      @success="getPages"
      @cancel="cancelEdit"
      v-if="editInfoFlag"
    />
    <GetShareDialog
      @success="getPages"
      @cancel="cancelEdit"
      v-if="showGetShareDialog"
    />
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  @apply bg-surface-muted;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-border rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-muted;
}
</style>
