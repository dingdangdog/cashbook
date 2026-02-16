<template>
  <div
    class="bg-surface text-foreground shadow-sm border border-border overflow-hidden rounded-sm"
  >
    <!-- 桌面端表格 -->
    <div class="hidden md:block max-h-[68vh] overflow-y-auto">
      <table class="min-w-full divide-y divide-border">
        <thead class="bg-surface-muted">
          <tr>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="$emit('toggleSelectAll')"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
              />
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              日期
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              流水类型
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              支出/收入类型
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              支付方式
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              账户
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              金额
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              账户余额
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              名称
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              小票
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              备注
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              归属
            </th>
            <th
              class="px-2 py-1 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
            >
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-surface divide-y divide-border">
          <tr v-if="loading" class="hover:bg-surface-muted">
            <td colspan="13" class="px-4 py-8 text-center text-foreground/60">
              <div class="flex items-center justify-center gap-2">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"
                ></div>
                加载中...
              </div>
            </td>
          </tr>
          <tr v-else-if="flows.length === 0" class="hover:bg-surface-muted">
            <td colspan="13" class="px-4 py-8 text-center text-foreground/60">
              暂无数据
            </td>
          </tr>
          <tr
            v-else
            v-for="item in flows"
            :key="item.id"
            class="hover:bg-surface-muted transition-colors"
          >
            <td class="px-2 py-1 whitespace-nowrap">
              <input
                type="checkbox"
                :checked="selectedItems.includes(item.id)"
                @change="$emit('toggleSelectItem', item.id)"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
              />
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{ formatDay(item.day) }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{ item.flowType }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{ item.industryType }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{ item.payType }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{ item.account?.name || "-" }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full border',
                  item.flowType === '收入'
                    ? 'bg-primary-500/10 text-primary-700 border-primary-500/20'
                    : item.flowType === '支出'
                      ? 'bg-red-500/10 text-red-600 border-red-500/20'
                      : 'bg-surface-muted text-foreground/70 border-border',
                ]"
              >
                {{ Number(item.money || 0).toFixed(2) }}
              </span>
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{
                item.accountBal !== undefined && item.accountBal !== null
                  ? Number(item.accountBal).toFixed(2)
                  : "-"
              }}
            </td>
            <td class="px-2 py-1 text-sm max-w-32 truncate" :title="item.name">
              {{ item.name }}
            </td>
            <td class="px-2 py-1 text-sm">
              <!-- 小票显示 -->
              <div
                v-if="getInvoiceImages(item.invoice).length > 0"
                class="flex flex-wrap gap-1"
              >
                <div
                  v-for="(img, index) in getInvoiceImages(item.invoice)"
                  :key="index"
                  class="relative w-8 h-8 cursor-pointer group rounded overflow-hidden border border-border hover:border-primary-500 transition-colors"
                  @click="openFullscreen(invoiceImageMap[img] || '')"
                >
                  <img
                    :src="invoiceImageMap[img]"
                    class="w-full h-full object-cover"
                    :alt="`小票 ${index + 1}`"
                  />
                  <!-- 悬停遮罩 -->
                  <div
                    class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all"
                  >
                    <EyeIcon class="h-4 w-4 text-primary-400" />
                  </div>
                </div>
              </div>
              <span v-else class="text-foreground/40 text-xs">无小票</span>
            </td>
            <td
              class="px-2 py-1 text-sm max-w-32 truncate"
              :title="item.description"
            >
              {{ item.description }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm">
              {{ item.attribution }}
            </td>
            <td class="px-2 py-1 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <button
                  @click="$emit('editItem', item)"
                  class="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-500/10 transition-colors"
                  title="编辑"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  @click="$emit('editInvoice', item)"
                  class="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-500/10 transition-colors"
                  title="编辑小票"
                >
                  <TicketIcon class="h-4 w-4" />
                </button>
                <button
                  @click="$emit('deleteItem', item)"
                  class="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-500/10 transition-colors"
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
    <div class="md:hidden">
      <div v-if="loading" class="p-8 text-center text-foreground/60">
        <div class="flex items-center justify-center gap-2">
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"
          ></div>
          加载中...
        </div>
      </div>
      <div
        v-else-if="flows.length === 0"
        class="p-8 text-center text-foreground/60"
      >
        暂无数据
      </div>
      <div class="max-h-[62vh] overflow-y-auto" v-else>
        <div
          v-for="item in flows"
          :key="item.id"
          class="bg-surface px-2 py-2 space-y-1 border-b border-border last:border-b-0"
        >
          <!-- 顶部：复选框、日期和删除按钮 -->
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                :checked="selectedItems.includes(item.id)"
                @change="$emit('toggleSelectItem', item.id)"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
              />
              <span class="text-xs text-foreground/60">{{
                formatDay(item.day)
              }}</span>
            </div>
            <div class="flex items-center">
              <button
                @click="$emit('deleteItem', item)"
                class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                title="删除"
              >
                <TrashIcon class="h-3 w-3" />
              </button>
            </div>
          </div>

          <!-- 中间内容 -->
          <div class="space-y-1">
            <div class="text-sm font-medium line-clamp-1">
              {{ item.name }}
            </div>
            <div class="text-xs text-foreground/60 line-clamp-1">
              {{ item.description }}
            </div>

            <!-- 小票显示 - 移动端 -->
            <div
              v-if="getInvoiceImages(item.invoice).length > 0"
              class="flex flex-wrap gap-1 mt-1"
            >
              <div
                v-for="(img, index) in getInvoiceImages(item.invoice)"
                :key="index"
                class="relative w-6 h-6 cursor-pointer group rounded overflow-hidden border border-border hover:border-primary-500 transition-colors"
                @click="openFullscreen(invoiceImageMap[img] || '')"
              >
                <img
                  :src="invoiceImageMap[img]"
                  class="w-full h-full object-cover"
                  :alt="`小票 ${index + 1}`"
                />
                <!-- 悬停遮罩 -->
                <div
                  class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all"
                >
                  <svg
                    class="w-2 h-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- 标签、金额和编辑按钮在同一行 -->
            <div
              class="flex flex-wrap items-center justify-between gap-1 text-xs"
            >
              <div class="flex flex-wrap gap-1">
                <span
                  class="bg-primary-500/10 text-primary-700 px-1.5 py-0.5 rounded border border-primary-500/20"
                >
                  {{ item.flowType }}
                </span>
                <span
                  class="bg-surface-muted text-foreground/80 px-1.5 py-0.5 rounded border border-border"
                >
                  {{ item.industryType }}
                </span>
                <span
                  class="bg-surface-muted text-foreground/80 px-1.5 py-0.5 rounded border border-border"
                >
                  {{ item.payType }}
                </span>
                <span
                  v-if="item.account?.name"
                  class="bg-surface-muted text-foreground/80 px-1.5 py-0.5 rounded border border-border"
                >
                  {{ item.account.name }}
                </span>
                <span
                  v-if="item.attribution"
                  class="bg-surface-muted text-foreground/70 px-1.5 py-0.5 rounded border border-border"
                >
                  {{ item.attribution }}
                </span>
              </div>
              <!-- 右侧：金额和编辑按钮 -->
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full border',
                    item.flowType === '收入'
                      ? 'bg-primary-500/10 text-primary-700 border-primary-500/20'
                      : item.flowType === '支出'
                        ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-surface-muted text-foreground/70 border-border',
                  ]"
                >
                  {{ Number(item.money || 0).toFixed(2) }}
                </span>
                <button
                  @click="$emit('editItem', item)"
                  class="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                  title="编辑"
                >
                  <PencilIcon class="h-3 w-3" />
                </button>

                <button
                  @click="$emit('editInvoice', item)"
                  class="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-500/10 transition-colors"
                  title="编辑小票"
                >
                  <TicketIcon class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div
      v-if="!loading && flows.length && totalPages > 1"
      class="p-2 md:px-4 md:py-3 bg-surface-muted border-t border-border"
    >
      <div class="flex items-center justify-center gap-2">
        <!-- 分页信息 -->
        <div class="text-sm text-foreground/70 text-center hidden md:block">
          共 {{ total }} 条记录
        </div>

        <!-- 分页控件 - 响应式布局 -->
        <div class="flex flex-row items-center justify-center gap-4">
          <!-- 每页显示数量选择 -->
          <select
            :value="pageSize"
            @change="
              $emit(
                'changePageSize',
                ($event.target as HTMLSelectElement).value,
              )
            "
            class="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
          >
            <option value="20">20条/页</option>
            <option value="50">50条/页</option>
            <option value="100">100条/页</option>
          </select>

          <!-- 分页按钮 -->
          <div class="flex items-center gap-1">
            <!-- 上一页 -->
            <button
              @click="$emit('changePage', currentPage - 1)"
              :disabled="currentPage <= 1"
              class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground transition-colors"
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
                @click="$emit('changePage', Number(page))"
                :class="[
                  'h-7 w-7 sm:h-8 sm:w-8 text-center text-xs sm:text-sm border rounded transition-colors',
                  page === currentPage
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-border hover:bg-surface bg-background text-foreground',
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-1 text-foreground/40 text-xs">...</span>
            </template>

            <!-- 下一页 -->
            <button
              @click="$emit('changePage', currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground transition-colors"
              title="下一页"
            >
              <ChevronRightIcon class="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 图片蒙版 -->
  <div class="overlay" v-if="fullscrenn">
    <div class="flex justify-center items-center">
      <img
        :src="fullscreenImage"
        class="max-h-[95vh] max-w-[95vw] object-contains"
        alt="Fullscreen Image"
      />
    </div>
    <span
      class="close-button bg-secondary-800/80 hover:bg-secondary-800"
      @click="closeFullscreen"
      >&times;</span
    >
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TicketIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";
import { formatDay, generateMobileFriendlyPageNumbers } from "~/utils/common";
import { doApi } from "~/utils/api";

interface FlowItem {
  id: string | number;
  day: string;
  flowType: string;
  industryType: string;
  payType: string;
  account?: { id?: number; name?: string; accountType?: string } | null;
  accountBal?: number | null;
  money: number;
  name: string;
  invoice: string;
  description: string;
  attribution: string;
}

interface Props {
  flows: FlowItem[];
  selectedItems: (string | number)[];
  isAllSelected: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pageNumbers: (number | string)[];
  loading?: boolean;
}

const props = defineProps<Props>();

// 生成移动端友好的页码
const mobileFriendlyPageNumbers = computed(() => {
  return generateMobileFriendlyPageNumbers(
    props.currentPage,
    props.totalPages,
    3,
  );
});

defineEmits<{
  toggleSelectAll: [];
  toggleSelectItem: [id: string | number];
  editItem: [item: FlowItem];
  editInvoice: [item: FlowItem];
  deleteItem: [item: FlowItem];
  changePage: [page: number | string];
  changePageSize: [size: string];
}>();

// 小票图片管理
const invoiceImageMap = ref<Record<string, string>>({});

// 根据文件扩展名获取 MIME 类型
const getMimeTypeFromFileName = (fileName: string): string => {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext] || "image/jpeg"; // 默认为 jpeg
};

// 获取小票图片
const getInvoiceImage = async (invoice: string) => {
  if (!invoice || invoice === "") {
    return "";
  }
  try {
    const res = await doApi.download("api/entry/flow/invoice/show", {
      invoice,
    });
    if (!res) return "";

    // 获取正确的 MIME 类型
    const mimeType = getMimeTypeFromFileName(invoice);

    // 确保 Blob 有正确的 MIME 类型，这样浏览器才能正确识别图片
    // 如果原 Blob 没有类型或类型不正确，创建新的 Blob 并指定正确的类型
    let blob: Blob;
    if (res instanceof Blob) {
      // 如果原 Blob 已经有正确的类型，直接使用；否则创建新的 Blob
      if (res.type === mimeType) {
        blob = res;
      } else {
        blob = new Blob([res], { type: mimeType });
      }
    } else {
      blob = new Blob([res], { type: mimeType });
    }

    return URL.createObjectURL(blob);
  } catch (e) {
    return "";
  }
};

// 处理单个流水的小票
const processFlowInvoices = async (flow: FlowItem) => {
  if (flow.invoice) {
    const invoices = flow.invoice.split(",");
    for (let invoice of invoices) {
      if (invoice.trim() && !invoiceImageMap.value[invoice]) {
        const imageUrl = await getInvoiceImage(invoice);
        if (imageUrl) {
          invoiceImageMap.value[invoice] = imageUrl;
        }
      }
    }
  }
};

// 处理所有流水的小票
const processAllInvoices = async () => {
  if (!props.loading && props.flows.length > 0) {
    for (let flow of props.flows) {
      await processFlowInvoices(flow);
    }
  }
};

// 获取指定流水的小票列表
const getInvoiceImages = (invoiceString: string): string[] => {
  if (!invoiceString) return [];
  return invoiceString
    .split(",")
    .filter((invoice) => invoice.trim() && invoiceImageMap.value[invoice]);
};

// 监听流水数据变化，处理小票
watch(
  () => [props.flows, props.loading],
  () => {
    if (!props.loading && props.flows.length > 0) {
      processAllInvoices();
    }
  },
  { immediate: true },
);

// 全屏展示小票
const fullscrenn = ref(false);
const fullscreenImage = ref("");
const openFullscreen = (image: string) => {
  fullscrenn.value = true;
  fullscreenImage.value = image;
  window.addEventListener("keydown", handleKeydown);
};
const closeFullscreen = () => {
  fullscrenn.value = false;
  window.removeEventListener("keydown", handleKeydown);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && fullscrenn.value) {
    fullscrenn.value = false;
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 30px;
  color: white;
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}
</style>
