<template>
  <div
    class="bg-surface text-foreground shadow-sm border border-border overflow-hidden rounded-lg"
  >
    <!-- 查询条件显示 -->
    <div
      class="px-2 py-1 bg-surface-muted border-b border-border"
    >
      <div class="flex flex-wrap gap-2 text-sm">
        <span
          v-if="flowQuery.startDay"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-700 border border-primary-500/20"
        >
          开始: {{ flowQuery.startDay }}
        </span>
        <span
          v-if="flowQuery.endDay"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-700 border border-primary-500/20"
        >
          结束: {{ flowQuery.endDay }}
        </span>
        <span
          v-if="flowQuery.flowType"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface text-foreground/80 border border-border"
        >
          {{ flowQuery.flowType }}
        </span>
        <span
          v-if="flowQuery.industryType"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface text-foreground/80 border border-border"
        >
          {{ flowQuery.industryType }}
        </span>
        <span
          v-if="flowQuery.payType"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface text-foreground/80 border border-border"
        >
          {{ flowQuery.payType }}
        </span>
        <span
          v-if="flowQuery.attribution"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface text-foreground/70 border border-border"
        >
          {{ flowQuery.attribution }}
        </span>
        <span
          v-if="!hasFilters"
          class="text-foreground/60 text-xs"
        >
          显示全部数据
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
      ></div>
      <span class="ml-2 text-foreground/60">加载中...</span>
    </div>

    <!-- 表格内容 -->
    <div v-else class="flow-container">
      <!-- 桌面端表格 -->
      <div
        class="hidden lg:block overflow-x-auto min-h-40"
        :style="{ height: getTableHeight() + 'px' }"
      >
        <table class="w-full">
          <thead class="bg-surface-muted sticky top-0 z-10">
            <tr class="border-b border-border">
              <th
                v-for="header in headers"
                :key="header.key"
                class="px-3 py-2 min-w-20 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider"
                :class="
                  header.key === 'money'
                    ? 'cursor-pointer hover:bg-surface'
                    : ''
                "
                @click="header.key === 'money' ? toggleSort() : null"
              >
                <div class="flex items-center gap-1">
                  {{ header.title }}
                  <div v-if="header.key === 'money'" class="flex flex-col">
                    <ChevronUpIcon
                      class="h-3 w-3"
                      :class="
                        flowQuery.moneySort === 'asc'
                          ? 'text-primary-600'
                          : 'text-foreground/30'
                      "
                    />
                    <ChevronDownIcon
                      class="h-3 w-3 -mt-0.5"
                      :class="
                        flowQuery.moneySort === 'desc'
                          ? 'text-primary-600'
                          : 'text-foreground/30'
                      "
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-border overflow-y-auto"
          >
            <tr v-if="flowPageRef.data.length === 0">
              <td
                :colspan="headers.length"
                class="px-4 py-8 text-center text-foreground/60"
              >
                暂无数据
              </td>
            </tr>
            <tr
              v-else
              v-for="item in flowPageRef.data"
              :key="item.id"
              class="hover:bg-surface-muted transition-colors"
            >
              <td
                class="px-3 py-2 text-sm whitespace-nowrap"
              >
                {{ item.day }}
              </td>
              <td
                class="px-3 py-2 text-sm whitespace-nowrap"
              >
                {{ item.flowType }}
              </td>
              <td
                class="px-3 py-2 text-sm max-w-32 truncate"
                :title="item.industryType"
              >
                {{ item.industryType }}
              </td>
              <td
                class="px-3 py-2 text-sm max-w-32 truncate"
                :title="item.payType"
              >
                {{ item.payType }}
              </td>
              <td class="px-3 py-2 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full border',
                    Number(item.money) > 100
                      ? 'bg-red-500/10 text-red-600 border-red-500/20'
                      : 'bg-surface-muted text-foreground/70 border-border',
                  ]"
                >
                  {{ Number(item.money || 0).toFixed(2) }}
                </span>
              </td>
              <td
                class="px-3 py-2 text-sm max-w-32 truncate"
                :title="item.name"
              >
                {{ item.name }}
              </td>
              <td class="px-3 py-2 text-sm">
                <!-- 小票显示 -->
                <div
                  v-if="getInvoiceImages(item.invoice || '').length > 0"
                  class="flex flex-wrap gap-1"
                >
                  <div
                    v-for="(img, index) in getInvoiceImages(item.invoice || '')"
                    :key="index"
                    class="relative w-8 h-8 cursor-pointer group rounded overflow-hidden border border-border hover:border-primary-500 transition-colors"
                    @click="openFullscreen(invoiceImageMap[img])"
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
                class="px-3 py-2 text-sm max-w-32 truncate"
                :title="item.description"
              >
                {{ item.description }}
              </td>
              <td
                v-if="actions"
                class="px-3 py-2 whitespace-nowrap text-sm font-medium"
              >
                <div class="flex gap-2">
                  <button
                    @click="$emit('editItem', item)"
                    class="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-500/10 transition-colors"
                    title="编辑"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="editTicket(item)"
                    class="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-500/10 transition-colors"
                    title="编辑小票"
                  >
                    <TicketIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteFlow(item)"
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
      <div
        class="lg:hidden overflow-y-auto"
        :style="{ height: getTableHeight() + 'px' }"
      >
        <div
          v-if="flowPageRef.data.length === 0"
        class="p-8 text-center text-foreground/60"
        >
          暂无数据
        </div>
        <div
          v-else
          v-for="item in flowPageRef.data"
          :key="item.id"
        class="p-2 border-b border-border last:border-b-0 hover:bg-surface-muted transition-colors"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h3 class="text-sm font-medium">
                {{ item.name }}
              </h3>
              <p class="text-xs text-foreground/60 mt-1">
                {{ item.day }}
              </p>
            </div>
            <span
              :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full border',
                Number(item.money) > 100
                  ? 'bg-red-500/10 text-red-600 border-red-500/20'
                  : 'bg-surface-muted text-foreground/70 border-border',
              ]"
            >
              {{ Number(item.money || 0).toFixed(2) }}
            </span>
          </div>
          <div class="space-y-1 text-xs text-foreground/60">
            <p v-if="item.description">{{ item.description }}</p>

            <!-- 小票显示 - 移动端 -->
            <div
              v-if="getInvoiceImages(item.invoice || '').length > 0"
              class="flex flex-wrap gap-1 mt-1"
            >
              <div
                v-for="(img, index) in getInvoiceImages(item.invoice || '')"
                :key="index"
                class="relative w-8 h-8 cursor-pointer group rounded overflow-hidden border border-border hover:border-primary-500 transition-colors"
                @click="openFullscreen(invoiceImageMap[img])"
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

            <div class="flex flex-wrap gap-1">
              <span
                class="bg-surface-muted text-foreground/80 px-1.5 py-0.5 rounded border border-border"
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
            </div>
            <!-- 操作按钮 -->
            <div
              v-if="actions"
              class="flex items-center justify-end gap-2 mt-2"
            >
              <button
                @click="$emit('editItem', item)"
                class="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                title="编辑"
              >
                <PencilIcon class="h-3 w-3" />
              </button>
              <button
                @click="editTicket(item)"
                class="p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                title="编辑小票"
              >
                <TicketIcon class="h-3 w-3" />
              </button>
              <button
                @click="deleteFlow(item)"
                class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                title="删除"
              >
                <TrashIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="border-t border-border"></div>

      <!-- 统计信息和分页 -->
      <div class="px-2 py-1 bg-surface-muted">
        <!-- 统计信息 -->
        <div class="flex flex-wrap gap-1 mb-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500/10 text-primary-700 border border-primary-500/20"
          >
            总收入: ¥{{ Number(flowPageRef.totalIn || 0).toFixed(2) }}
          </span>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-600 border border-red-500/20"
          >
            总支出: ¥{{ Number(flowPageRef.totalOut || 0).toFixed(2) }}
          </span>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-surface text-foreground/70 border border-border"
          >
            不计收支: ¥{{ Number(flowPageRef.notInOut || 0).toFixed(2) }}
          </span>
        </div>

        <!-- 分页控件 -->
        <div
          v-if="flowPageRef.total > (flowQuery.pageSize || 20)"
          class="flex flex-col md:flex-row items-center justify-center gap-2"
        >
          <!-- 分页信息 -->
          <div class="text-sm text-foreground/70 text-center">
            显示第 {{ (currentPage - 1) * (flowQuery.pageSize || 20) + 1 }} -
            {{
              Math.min(
                currentPage * (flowQuery.pageSize || 20),
                flowPageRef.total
              )
            }}
            条， 共 {{ flowPageRef.total }} 条记录
          </div>

          <!-- 分页操作 -->
          <div class="flex items-center justify-center gap-4">
            <!-- 每页显示数量 -->
            <select
              v-model="flowQuery.pageSize"
              @change="changePageSize"
              class="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
            >
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
              <option value="100">100条/页</option>
            </select>

            <!-- 分页按钮 -->
            <div class="flex items-center gap-1">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage <= 1"
                class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground transition-colors"
              >
                <ChevronLeftIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>

              <!-- 移动端友好的页码按钮 -->
              <template
                v-for="(page, index) in mobileFriendlyPageNumbers"
                :key="index"
              >
                <button
                  v-if="page !== '...'"
                  @click="changePage(Number(page))"
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

              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage >= totalPages"
                class="p-1.5 sm:p-2 border border-border rounded hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed bg-background text-foreground transition-colors"
              >
                <ChevronRightIcon class="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <FlowEditInvoiceDialog
    v-if="showFlowEditInvoiceDialog"
    :item="selectedFlow"
    :success-callback="doQuery"
  />

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
import { ref, computed, onMounted, watch } from "vue";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TicketIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";
import { generateMobileFriendlyPageNumbers } from "~/utils/common";
import FlowEditInvoiceDialog from "~/components/dialog/FlowEditInvoiceDialog.vue";
import { Alert } from "~/utils/alert";
import { Confirm } from "~/utils/confirm";
import { doApi } from "~/utils/api";
import { showFlowEditDialog, showFlowEditInvoiceDialog } from "~/utils/flag";

const { query, actions = false } = defineProps(["query", "actions"]);

const flowQuery = ref<FlowQuery>({ pageNum: 1, pageSize: 20, ...query });

// 编辑相关变量
const selectedFlow = ref<Flow | any>({});
const dialogFormTitle = ref("修改流水");

const typeLabel = ref("支出/收入类型");
const payTypeLabel = ref("支付/收款方式");

const typeDefault = ["请先选择流水类型"];
// 消费类型/收入类型
const expenseTypeOptions = ref(typeDefault);
// 支付类型
const paymentTypeOptions = ref(typeDefault);

// 修改FlowType后联动
const changeTypes = () => {
  if (flowQuery.value.flowType === "支出") {
    typeLabel.value = "支出类型";
    payTypeLabel.value = "支付方式";
  } else if (flowQuery.value.flowType === "收入") {
    typeLabel.value = "收入类型";
    payTypeLabel.value = "收款方式";
  } else {
    typeLabel.value = "支出/收入类型";
    payTypeLabel.value = "支付/收款方式";
  }
  if (!flowQuery.value.flowType) {
    expenseTypeOptions.value = typeDefault;
    paymentTypeOptions.value = typeDefault;
    return;
  }
  getIndustryType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    expenseTypeOptions.value = data.map((item) => {
      return item.value;
    });
  });
  getPayType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    paymentTypeOptions.value = data.map((item) => {
      return { title: item.value };
    });
  });
};

// 基础表头配置
const baseHeaders = [
  { title: "日期", key: "day", sortable: false },
  { title: "流水类型", key: "flowType", sortable: false },
  { title: "消费类型", key: "industryType", sortable: false },
  { title: "支付方式", key: "payType", sortable: false },
  { title: "金额", key: "money" },
  { title: "名称", key: "name", sortable: false },
  { title: "小票", key: "invoice", sortable: false },
  { title: "备注", key: "description", sortable: false },
];

// 根据 actions 属性动态生成表头
const headers = computed(() => {
  const result = [...baseHeaders];
  if (actions) {
    result.push({ title: "操作", key: "actions", sortable: false });
  }
  return result;
});

// 组件属性绑定
const loading = ref(true);
// 分页数据绑定
const flowPageRef = ref<Page<Flow>>({
  pageNum: 1,
  pageSize: 0,
  pages: 1,
  total: 0,
  totalOut: 0,
  totalIn: 0,
  notInOut: 0,
  data: [],
});

// 计算属性
const currentPage = computed(() => flowQuery.value.pageNum || 1);
const totalPages = computed(() =>
  Math.ceil((flowPageRef.value?.total || 0) / (flowQuery.value.pageSize || 20))
);

const hasFilters = computed(() => {
  return !!(
    flowQuery.value.startDay ||
    flowQuery.value.endDay ||
    flowQuery.value.flowType ||
    flowQuery.value.industryType ||
    flowQuery.value.payType ||
    flowQuery.value.attribution
  );
});

// 生成移动端友好的页码
const mobileFriendlyPageNumbers = computed(() => {
  return generateMobileFriendlyPageNumbers(
    currentPage.value,
    totalPages.value,
    3
  );
});

// 排序切换
const toggleSort = () => {
  if (!flowQuery.value.moneySort) {
    flowQuery.value.moneySort = "asc";
  } else if (flowQuery.value.moneySort === "asc") {
    flowQuery.value.moneySort = "desc";
  } else {
    flowQuery.value.moneySort = "";
  }
  doQuery();
};

// 分页操作
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  flowQuery.value.pageNum = page;
  doQuery();
};

const changePageSize = () => {
  flowQuery.value.pageNum = 1;
  doQuery();
};

// 执行分页数据查询
const doQuery = () => {
  loading.value = true;
  doApi
    .post<Page<Flow>>("api/entry/flow/page", {
      ...flowQuery.value,
      
    })
    .then((res) => {
      flowPageRef.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

changeTypes();

const getTableHeight = () => {
  return window.innerWidth < 1080
    ? window.innerHeight - 64 * 5.5
    : window.innerHeight - 64 * 6;
};

// 组件挂载时初始化数据
doQuery();
onMounted(() => {});

// 暴露方法给父组件调用
defineExpose({
  doQuery,
  refresh: doQuery, // 暴露刷新方法
});

// 编辑流水
const editFlow = (item: Flow) => {
  dialogFormTitle.value = "修改流水";
  selectedFlow.value = item;
  showFlowEditDialog.value = true;
};

// 编辑小票
const editTicket = (item: Flow) => {
  selectedFlow.value = item;
  showFlowEditInvoiceDialog.value = true;
};

// 删除流水
const deleteFlow = (item: Flow) => {
  if (!item.id) {
    Alert.error("请选择要删除的数据");
    return;
  }
  Confirm.open({
    title: "删除确认",
    content: `确定删除流水 【${item.name}:${item.money}】吗?`,
    confirm: () => {
      doApi
        .post("api/entry/flow/del", {
          id: item.id,
          
        })
        .then(() => {
          Alert.success("删除成功");
          doQuery();
        })
        .catch(() => {
          Alert.error("删除失败");
        });
    },
  });
};

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
const processFlowInvoices = async (flow: Flow) => {
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
  if (!loading.value && flowPageRef.value.data.length > 0) {
    for (let flow of flowPageRef.value.data) {
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
  () => [flowPageRef.value.data, loading.value],
  () => {
    if (!loading.value && flowPageRef.value.data.length > 0) {
      processAllInvoices();
    }
  },
  { immediate: true }
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
.flow-container {
  min-height: 300px;
}

/* 自定义滚动条样式 */
.overflow-x-auto::-webkit-scrollbar,
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track,
.overflow-y-auto::-webkit-scrollbar-track {
  background-color: rgb(var(--color-surface-muted));
}

.overflow-x-auto::-webkit-scrollbar-thumb,
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover,
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}

/* 全屏预览样式 */
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
