<template>
  <div class="p-2 md:p-4 bg-surface-muted min-h-full">
    <!-- 顶部操作栏 -->
    <div
      class="bg-surface rounded-lg shadow-sm border border-border p-3 mb-3"
    >
      <div
        class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div class="w-full flex flex-col md:flex-row md:items-center gap-3">
          <div class="flex gap-2 items-center">
            <select
              v-model="statusFilter"
              @change="loadData"
              class="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">全部状态</option>
              <option value="0">未收款</option>
              <option value="1">已收款</option>
              <option value="-1">不要了</option>
              <option value="-2">已放弃</option>
              <option value="-3">不可抗力</option>
            </select>
            <input
              v-model="searchName"
              @input="debounceSearch"
              placeholder="搜索待收款名称"
              class="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div class="w-full flex gap-2 flex-wrap justify-end">
          <button
            @click="() => openReceivableDialog()"
            class="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <PlusIcon class="h-4 w-4" />
            添加待收款
          </button>
          <button
            @click="loadData"
            class="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <ArrowPathIcon class="h-4 w-4" />
            刷新
          </button>
        </div>
      </div>
    </div>

    <!-- 统计概览卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      <!-- <div class="bg-blue-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">待收款总数</div>
        <div class="text-lg md:text-xl font-bold">{{ statistics.total }}</div>
      </div> -->
      <div class="bg-orange-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">待收款项</div>
        <div class="text-lg md:text-xl font-bold">{{ statistics.pending }}</div>
      </div>
      <div class="bg-red-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">待收金额</div>
        <div class="text-lg md:text-xl font-bold">
          {{ formatCurrency(statistics.pendingAmount) }}
        </div>
      </div>
      <div class="bg-primary-600 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">已收款项</div>
        <div class="text-lg md:text-xl font-bold">
          {{ statistics.collected }}
        </div>
      </div>
      <div class="bg-primary-700 text-white rounded-lg p-3 shadow-sm">
        <div class="text-xs opacity-90 mb-1">已收金额</div>
        <div class="text-lg md:text-xl font-bold">
          {{ formatCurrency(statistics.collectedAmount) }}
        </div>
      </div>
    </div>

    <!-- 待收款列表 -->
    <div
      class="bg-surface shadow-sm border border-border overflow-hidden rounded-lg"
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
        v-if="!loading && receivables.length"
        class="hidden lg:block overflow-x-auto"
      >
        <table class="w-full">
          <thead>
            <tr
              class="bg-surface-muted border-b border-border"
            >
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                名称
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                金额
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                发生日期
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                预期收款日
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                实际收款日
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                逾期状态
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                状态
              </th>
              <th
                class="px-4 py-2 text-left text-sm font-medium text-muted"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="item in receivables"
              :key="item.id"
              class="hover:bg-surface-muted transition-colors"
            >
              <td
                class="px-4 py-2 text-sm font-medium text-foreground"
              >
                <div class="flex flex-col">
                  <span>{{ item.name }}</span>
                  <span
                    v-if="item.description"
                    class="text-xs text-muted"
                    >{{ item.description }}</span
                  >
                </div>
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                <span
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400"
                >
                  {{ formatCurrency(item.money || 0) }}
                </span>
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-foreground"
              >
                {{ item.occurDay }}
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-foreground"
              >
                {{ item.expectDay || "-" }}
              </td>
              <td
                class="px-4 py-2 whitespace-nowrap text-sm text-foreground"
              >
                {{ item.actualDay || "-" }}
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                <span
                  v-if="getOverdueStatus(item).text"
                  :class="getOverdueStatus(item).style"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getOverdueStatus(item).text }}
                </span>
                <span v-else class="text-muted text-xs">
                  -
                </span>
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm">
                <span
                  :class="getStatusStyle(item.status)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="px-4 py-2 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center gap-2">
                  <button
                    @click="openReceivableDialog(item)"
                    class="text-primary-600 hover:text-primary-500 transition-colors"
                    title="编辑"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="item.status === 0"
                    @click="openCollectDialog(item)"
                    class="text-primary-600 hover:text-primary-500 transition-colors"
                    title="收款"
                  >
                    <CheckIcon class="h-4 w-4" />
                  </button>
                  <!-- <button
                    v-if="item.status === 1"
                    @click="openToFlowDialog(item)"
                    class="text-accent-600 hover:text-accent-500 transition-colors"
                    title="转为流水"
                  >
                    <ArrowRightIcon class="h-4 w-4" />
                  </button> -->
                  <button
                    @click="deleteReceivable(item)"
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
        v-if="!loading && receivables.length"
        class="lg:hidden max-h-[60vh] overflow-y-auto"
      >
        <div
          v-for="item in receivables"
          :key="item.id"
          class="p-2 border-b border-border last:border-b-0"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h3 class="text-sm font-medium text-foreground">
                {{ item.name }}
              </h3>
              <p
                v-if="item.description"
                class="text-xs text-muted mt-1"
              >
                {{ item.description }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span
                class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              >
                {{ formatCurrency(item.money || 0) }}
              </span>
            </div>
          </div>
          <div class="w-full flex justify-end gap-1 mb-2">
            <span
              :class="getStatusStyle(item.status)"
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
            >
              {{ getStatusText(item.status) }}
            </span>
            <span
              v-if="getOverdueStatus(item).text"
              :class="getOverdueStatus(item).style"
              class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
            >
              {{ getOverdueStatus(item).text }}
            </span>
          </div>
          <div
            class="grid grid-cols-2 gap-2 text-xs text-muted mb-2"
          >
            <p>
              <span class="font-medium">发生日期:</span> {{ item.occurDay }}
            </p>
            <p v-if="item.expectDay">
              <span class="font-medium">预期收款:</span> {{ item.expectDay }}
            </p>
            <p v-if="item.actualDay">
              <span class="font-medium">实际收款:</span> {{ item.actualDay }}
            </p>
          </div>
          <div class="flex justify-end gap-1">
            <button
              @click="openReceivableDialog(item)"
              class="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors"
              title="编辑"
            >
              <PencilIcon class="h-3 w-3" />
            </button>
            <button
              v-if="item.status === 0"
              @click="openCollectDialog(item)"
              class="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors"
              title="收款"
            >
              <CheckIcon class="h-3 w-3" />
            </button>
            <!-- <button
              v-if="item.status === 1"
              @click="openToFlowDialog(item)"
              class="p-1.5 bg-accent-600 hover:bg-accent-500 text-white rounded transition-colors"
              title="转为流水"
            >
              <ArrowRightIcon class="h-3 w-3" />
            </button> -->
            <button
              @click="deleteReceivable(item)"
              class="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              title="删除"
            >
              <TrashIcon class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && (!receivables || receivables.length === 0)"
        class="text-center py-12"
      >
        <div class="text-muted mb-4">
          <CurrencyDollarIcon class="mx-auto h-12 w-12" />
        </div>
        <h3 class="text-lg font-medium text-foreground mb-2">
          暂无待收款
        </h3>
        <p class="text-muted mb-4">
          开始添加您的待收款记录吧
        </p>
        <button
          @click="() => openReceivableDialog()"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
        >
          <PlusIcon class="h-4 w-4" />
          添加待收款
        </button>
      </div>

      <!-- 分页 -->
      <div
        v-if="
          !loading &&
          receivables.length &&
          pagination.total > pagination.pageSize
        "
        class="px-4 py-3 bg-surface-muted border-t border-border"
      >
        <div class="flex justify-between items-center">
          <div class="text-sm text-foreground">
            共 {{ pagination.total }} 条记录，第 {{ pagination.pageNum }} /
            {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.pageNum - 1)"
              :disabled="pagination.pageNum <= 1"
              class="px-3 py-1 text-sm bg-surface border border-border rounded-lg hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <button
              @click="changePage(pagination.pageNum + 1)"
              :disabled="
                pagination.pageNum >=
                Math.ceil(pagination.total / pagination.pageSize)
              "
              class="px-3 py-1 text-sm bg-surface border border-border rounded-lg hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑待收款对话框 -->
    <div
      v-if="receivableDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-surface rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-foreground">
            {{ editedReceivable.id ? "编辑" : "添加" }}待收款
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >待收款名称 <span class="text-red-500">*</span></label
              >
              <input
                v-model="editedReceivable.name"
                type="text"
                placeholder="请输入待收款名称"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >金额 <span class="text-red-500">*</span></label
              >
              <input
                v-model="editedReceivable.money"
                type="number"
                step="0.01"
                placeholder="请输入金额"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >发生日期 <span class="text-red-500">*</span></label
              >
              <UiDatePicker
                v-model="editedReceivable.occurDay"
                class="w-full"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >预期收款日期</label
              >
              <UiDatePicker
                v-model="editedReceivable.expectDay"
                class="w-full"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >实际收款日期</label
              >
              <UiDatePicker
                v-model="editedReceivable.actualDay"
                class="w-full"
              />
            </div>
            <div v-if="editedReceivable.id">
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >状态</label
              >
              <select
                v-model="editedReceivable.status"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="0">未收款</option>
                <option value="1">已收款</option>
                <option value="-1">不要了</option>
                <option value="-2">已放弃</option>
                <option value="-3">不可抗力</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >备注</label
              >
              <textarea
                v-model="editedReceivable.description"
                rows="3"
                placeholder="请输入备注信息"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        <div
          class="px-6 py-4 bg-surface-muted rounded-b-lg flex gap-3 justify-end"
        >
          <button
            @click="receivableDialog = false"
            class="px-4 py-2 text-foreground hover:bg-surface-muted rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="saveReceivable"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- 收款对话框 -->
    <div
      v-if="collectDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-surface rounded-lg shadow-xl max-w-md w-full"
      >
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-green-950 dark:text-white">
            确认收款
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="text-sm text-muted mb-4">
              对待收款 "{{ selectedReceivable?.name }}" ({{
                formatCurrency(selectedReceivable?.money || 0)
              }}) 进行收款确认
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >实际收款日期 <span class="text-red-500">*</span></label
              >
              <UiDatePicker v-model="collectData.actualDay" class="w-full" />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >名称</label
              >
              <input
                v-model="collectData.name"
                type="text"
                placeholder="可修改收款名称"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >备注</label
              >
              <textarea
                v-model="collectData.description"
                rows="3"
                placeholder="可添加收款备注"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        <div
          class="px-6 py-4 bg-surface-muted rounded-b-lg flex gap-3 justify-end"
        >
          <button
            @click="collectDialog = false"
            class="px-4 py-2 text-foreground hover:bg-surface-muted rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmCollect"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            确认收款
          </button>
        </div>
      </div>
    </div>

    <!-- 转为流水对话框 -->
    <div
      v-if="toFlowDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-surface rounded-lg shadow-xl max-w-md w-full"
      >
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-green-950 dark:text-white">
            转为收入流水
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="text-sm text-muted mb-4">
              将待收款 "{{ selectedReceivable?.name }}" ({{
                formatCurrency(selectedReceivable?.money || 0)
              }}) 转换为收入流水
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >实际收款日期 <span class="text-red-500">*</span></label
              >
              <UiDatePicker v-model="toFlowData.actualDay" class="w-full" />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >收款方式</label
              >
              <select
                v-model="toFlowData.payType"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="现金">现金</option>
                <option value="支付宝">支付宝</option>
                <option value="微信">微信</option>
                <option value="银行卡">银行卡</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >收入类型</label
              >
              <select
                v-model="toFlowData.industryType"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="其他收入">其他收入</option>
                <option value="工资收入">工资收入</option>
                <option value="投资收益">投资收益</option>
                <option value="借款回收">借款回收</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-foreground mb-2"
                >流水归属</label
              >
              <select
                v-model="toFlowData.attribution"
                class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">请选择归属</option>
                <option
                  v-for="attr in attributionList"
                  :key="attr"
                  :value="attr"
                >
                  {{ attr }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div
          class="px-6 py-4 bg-surface-muted rounded-b-lg flex gap-3 justify-end"
        >
          <button
            @click="toFlowDialog = false"
            class="px-4 py-2 text-foreground hover:bg-surface-muted rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="convertToFlow"
            class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            转换
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div
      v-if="confirmDeleteDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-surface rounded-lg shadow-xl max-w-sm w-full"
      >
        <div class="px-6 py-4 border-b border-border">
          <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
            确认删除
          </h3>
        </div>
        <div class="p-6">
          <p class="text-foreground">
            您确定要删除这个待收款记录吗？此操作不可撤销。
          </p>
        </div>
        <div
          class="px-6 py-4 bg-surface-muted rounded-b-lg flex gap-3 justify-end"
        >
          <button
            @click="confirmDeleteDialog = false"
            class="px-4 py-2 text-foreground hover:bg-surface-muted rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";

// 需要登录
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

const bookId = localStorage.getItem("bookId");

// Data
const loading = ref(false);
const statusFilter = ref("");
const searchName = ref("");
const receivables = ref<Receivable[]>([]);
const statistics = ref({
  total: 0,
  pending: 0,
  collected: 0,
  pendingAmount: 0,
  collectedAmount: 0,
});

// 分页
const pagination = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
});

// Dialogs
const receivableDialog = ref(false);
const collectDialog = ref(false);
const toFlowDialog = ref(false);
const confirmDeleteDialog = ref(false);

// Edited items
const editedReceivable = ref<Receivable>({});
const selectedReceivable = ref<Receivable | null>(null);
const itemToDelete = ref<Receivable | null>(null);

// 归属列表
const attributionList = ref<string[]>([]);

// 收款数据
const collectData = ref({
  actualDay: getCurrentDate(),
  name: "",
  description: "",
});

// 转流水数据
const toFlowData = ref({
  actualDay: getCurrentDate(),
  payType: "现金",
  industryType: "其他收入",
  attribution: "",
});

// 防抖搜索
let searchTimer: NodeJS.Timeout | null = null;
const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.value.pageNum = 1;
    loadData();
  }, 500);
};

// 获取归属列表
const getAttributions = async () => {
  try {
    const res = await doApi.post<string[]>("api/entry/flow/getAttributions", {
      bookId: localStorage.getItem("bookId"),
    });
    attributionList.value = res;
  } catch (error) {
    console.error("Failed to load attributions:", error);
  }
};

// Lifecycle hooks
onMounted(() => {
  loadData();
  loadStatistics();
  getAttributions();
});

// Methods
async function loadData() {
  if (!bookId) {
    Alert.error("请先选择账本");
    return;
  }

  loading.value = true;

  try {
    const res = await doApi.post<{
      datas: Receivable[];
      total: number;
      pageNum: number;
      pageSize: number;
    }>("api/entry/receivable/list", {
      bookId: bookId,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      name: searchName.value || undefined,
      status:
        statusFilter.value !== "" ? Number(statusFilter.value) : undefined,
    });

    receivables.value = res.datas || [];
    pagination.value = {
      pageNum: res.pageNum,
      pageSize: res.pageSize,
      total: res.total,
    };
  } catch (err) {
    console.error("Failed to load receivable data:", err);
    Alert.error("加载待收款数据失败");
  } finally {
    loading.value = false;
  }
}

async function loadStatistics() {
  if (!bookId) return;

  try {
    const res = await doApi.post<Receivable[]>("api/entry/receivable/all", {
      bookId: bookId,
    });

    const stats = {
      total: res.length,
      pending: res.filter((r) => r.status === 0).length,
      collected: res.filter((r) => r.status === 1).length,
      pendingAmount: res
        .filter((r) => r.status === 0)
        .reduce((sum, r) => sum + (r.money || 0), 0),
      collectedAmount: res
        .filter((r) => r.status === 1)
        .reduce((sum, r) => sum + (r.money || 0), 0),
    };

    statistics.value = stats;
  } catch (err) {
    console.error("Failed to load statistics:", err);
  }
}

function openReceivableDialog(item: Receivable | null = null) {
  if (item) {
    editedReceivable.value = { ...item };
  } else {
    editedReceivable.value = {
      occurDay: getCurrentDate(),
    };
  }
  receivableDialog.value = true;
}

function openCollectDialog(item: Receivable) {
  selectedReceivable.value = item;
  collectData.value = {
    actualDay: getCurrentDate(),
    name: item.name || "",
    description: item.description || "",
  };
  collectDialog.value = true;
}

function openToFlowDialog(item: Receivable) {
  selectedReceivable.value = item;
  toFlowData.value = {
    actualDay: getCurrentDate(),
    payType: "现金",
    industryType: "其他收入",
    attribution: "",
  };
  toFlowDialog.value = true;
}

async function saveReceivable() {
  if (!editedReceivable.value.name) {
    Alert.error("待收款名称不能为空");
    return;
  }

  if (!editedReceivable.value.occurDay) {
    Alert.error("发生日期不能为空");
    return;
  }

  if (
    !editedReceivable.value.money ||
    Number(editedReceivable.value.money) <= 0
  ) {
    Alert.error("金额不能为空且必须大于0");
    return;
  }

  loading.value = true;

  try {
    const data = {
      ...editedReceivable.value,
      bookId: bookId,
      money: Number(editedReceivable.value.money),
      status:
        editedReceivable.value.status !== undefined
          ? Number(editedReceivable.value.status)
          : 0,
    };

    if (editedReceivable.value.id) {
      await doApi.post("api/entry/receivable/update", data);
      Alert.success("待收款更新成功");
    } else {
      await doApi.post("api/entry/receivable/add", data);
      Alert.success("待收款添加成功");
    }

    receivableDialog.value = false;
    loadData();
    loadStatistics();
  } catch (err) {
    console.error("Failed to save receivable:", err);
    Alert.error("保存待收款失败");
  } finally {
    loading.value = false;
  }
}

async function confirmCollect() {
  if (!selectedReceivable.value) return;

  if (!collectData.value.actualDay) {
    Alert.error("实际收款日期不能为空");
    return;
  }

  loading.value = true;

  try {
    await doApi.post("api/entry/receivable/update", {
      bookId: bookId,
      id: selectedReceivable.value.id,
      name: collectData.value.name || selectedReceivable.value.name,
      description:
        collectData.value.description || selectedReceivable.value.description,
      actualDay: collectData.value.actualDay,
      status: 1, // 已收款
    });

    Alert.success("收款确认成功");
    collectDialog.value = false;
    loadData();
    loadStatistics();
  } catch (err) {
    console.error("Failed to confirm collect:", err);
    Alert.error("收款确认失败");
  } finally {
    loading.value = false;
  }
}

async function convertToFlow() {
  if (!selectedReceivable.value) return;

  if (!toFlowData.value.actualDay) {
    Alert.error("实际收款日期不能为空");
    return;
  }

  loading.value = true;

  try {
    await doApi.post("api/entry/receivable/toflow", {
      bookId: bookId,
      id: selectedReceivable.value.id,
      actualDay: toFlowData.value.actualDay,
      payType: toFlowData.value.payType,
      industryType: toFlowData.value.industryType,
      attribution: toFlowData.value.attribution,
    });

    Alert.success("成功转换为收入流水");
    toFlowDialog.value = false;
    loadData();
    loadStatistics();
  } catch (err) {
    console.error("Failed to convert to flow:", err);
    Alert.error("转换为流水失败");
  } finally {
    loading.value = false;
  }
}

function deleteReceivable(item: Receivable) {
  itemToDelete.value = item;
  confirmDeleteDialog.value = true;
}

async function confirmDelete() {
  if (!itemToDelete.value) return;

  loading.value = true;

  try {
    await doApi.post("api/entry/receivable/del", {
      id: itemToDelete.value.id,
      bookId: bookId,
    });

    Alert.success("待收款删除成功");
    confirmDeleteDialog.value = false;
    loadData();
    loadStatistics();
  } catch (err) {
    console.error("Failed to delete receivable:", err);
    Alert.error("待收款删除失败");
  } finally {
    loading.value = false;
    itemToDelete.value = null;
  }
}

function changePage(pageNum: number) {
  pagination.value.pageNum = pageNum;
  loadData();
}

// Utility functions
function getCurrentDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

function getStatusText(status: number | undefined): string {
  switch (status) {
    case 0:
      return "未收款";
    case 1:
      return "已收款";
    case -1:
      return "不要了";
    case -2:
      return "已放弃";
    case -3:
      return "不可抗力";
    default:
      return "未知";
  }
}

function getStatusStyle(status: number | undefined): string {
  switch (status) {
    case 0:
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case 1:
      return "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400";
    case -1:
      return "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400";
    case -2:
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case -3:
      return "bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-400";
    default:
      return "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400";
  }
}

function getOverdueStatus(item: Receivable): { text: string; style: string } {
  // 如果没有预期收款日期，返回空
  if (!item.expectDay) {
    return { text: "", style: "" };
  }

  const today = new Date();
  const expectDate = new Date(item.expectDay);

  // 清除时间部分，只比较日期
  today.setHours(0, 0, 0, 0);
  expectDate.setHours(0, 0, 0, 0);

  // 如果已收款 (status === 1)
  if (item.status === 1 && item.actualDay) {
    const actualDate = new Date(item.actualDay);
    actualDate.setHours(0, 0, 0, 0);

    if (actualDate > expectDate) {
      return {
        text: "延期收款",
        style:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
    } else {
      return {
        text: "按时收款",
        style:
          "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400",
      };
    }
  }

  // 如果未收款 (status === 0)
  if (item.status === 0) {
    if (today > expectDate) {
      return {
        text: "已逾期",
        style: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
    } else {
      return {
        text: "未到期",
        style:
          "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400",
      };
    }
  }

  // 其他状态（不要了、已放弃、不可抗力）
  if (item.status === -1 || item.status === -2 || item.status === -3) {
    if (today > expectDate) {
      return {
        text: "已过期",
        style:
          "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400",
      };
    } else {
      return {
        text: "未到期",
        style:
          "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400",
      };
    }
  }

  return { text: "", style: "" };
}
</script>

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
