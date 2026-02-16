<template>
  <div class="p-2 md:p-4 bg-surface-muted min-h-full space-y-3">
    <div class="bg-surface rounded-lg shadow-sm border border-border p-3">
      <div class="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
        <div class="flex gap-2">
          <select
            v-model="query.status"
            @change="loadData"
            class="px-3 py-2 text-sm border border-border rounded-lg bg-surface text-foreground"
          >
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">停用</option>
            <option value="-1">归档</option>
          </select>
          <input
            v-model="query.keyword"
            @input="debounceSearch"
            placeholder="搜索账户名称/机构/账号"
            class="px-3 py-2 text-sm border border-border rounded-lg bg-surface text-foreground min-w-64"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="openDialog()"
            class="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-500 text-white rounded-lg"
          >
            新增账户
          </button>
          <button
            @click="loadData"
            class="px-3 py-2 text-sm bg-surface border border-border rounded-lg"
          >
            刷新
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div class="bg-primary-600 text-white rounded-lg p-3">
        <div class="text-xs opacity-90">账户数</div>
        <div class="text-xl font-bold">{{ stats.total }}</div>
      </div>
      <div class="bg-green-600 text-white rounded-lg p-3">
        <div class="text-xs opacity-90">总资产余额</div>
        <div class="text-xl font-bold">{{ formatMoney(stats.balance) }}</div>
      </div>
      <div class="bg-blue-600 text-white rounded-lg p-3">
        <div class="text-xs opacity-90">累计流入</div>
        <div class="text-xl font-bold">{{ formatMoney(stats.income) }}</div>
      </div>
      <div class="bg-red-600 text-white rounded-lg p-3">
        <div class="text-xs opacity-90">累计流出</div>
        <div class="text-xl font-bold">{{ formatMoney(stats.expense) }}</div>
      </div>
    </div>

    <div class="bg-surface rounded-lg border border-border overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-surface-muted">
          <tr>
            <th class="px-3 py-2 text-left">名称</th>
            <th class="px-3 py-2 text-left">类型</th>
            <th class="px-3 py-2 text-left">当前余额</th>
            <th class="px-3 py-2 text-left">累计流入</th>
            <th class="px-3 py-2 text-left">累计流出</th>
            <th class="px-3 py-2 text-left">负债</th>
            <th class="px-3 py-2 text-left">状态</th>
            <th class="px-3 py-2 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="px-3 py-6 text-center text-foreground/60">
              加载中...
            </td>
          </tr>
          <tr v-else-if="accounts.length === 0">
            <td colspan="8" class="px-3 py-6 text-center text-foreground/60">
              暂无账户
            </td>
          </tr>
          <tr
            v-else
            v-for="item in accounts"
            :key="item.id"
            class="border-t border-border"
          >
            <td class="px-3 py-2">
              <div class="font-medium">{{ item.name }}</div>
              <div class="text-xs text-foreground/60">
                {{ item.institution || "-" }} {{ item.accountNo || "" }}
              </div>
            </td>
            <td class="px-3 py-2">{{ item.accountType }}</td>
            <td class="px-3 py-2">{{ formatMoney(item.currentBalance || 0) }}</td>
            <td class="px-3 py-2">{{ formatMoney(item.totalIncome || 0) }}</td>
            <td class="px-3 py-2">{{ formatMoney(item.totalExpense || 0) }}</td>
            <td class="px-3 py-2">{{ formatMoney(item.totalLiability || 0) }}</td>
            <td class="px-3 py-2">{{ statusText(item.status) }}</td>
            <td class="px-3 py-2 space-x-2">
              <button
                @click="openDialog(item)"
                class="text-primary-600 hover:text-primary-500"
              >
                编辑
              </button>
              <button @click="removeItem(item)" class="text-red-600 hover:text-red-500">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="dialogVisible"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="dialogVisible = false"
    >
      <div class="bg-surface rounded-lg w-full max-w-md border border-border" @click.stop>
        <div class="px-4 py-3 border-b border-border font-semibold">
          {{ editForm.id ? "编辑账户" : "新增账户" }}
        </div>
        <div class="p-4 space-y-3">
          <div>
            <label class="text-sm">账户名称</label>
            <input
              v-model="editForm.name"
              class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
            />
          </div>
          <div>
            <label class="text-sm">账户类型</label>
            <select
              v-model="editForm.accountType"
              class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
            >
              <option value="银行卡">银行卡</option>
              <option value="信用卡">信用卡</option>
              <option value="支付宝">支付宝</option>
              <option value="微信">微信</option>
              <option value="投资账户">投资账户</option>
              <option value="现金">现金</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-sm">初始余额</label>
              <input
                v-model.number="editForm.initialBalance"
                type="number"
                step="0.01"
                class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
              />
            </div>
            <div>
              <label class="text-sm">当前余额</label>
              <input
                v-model.number="editForm.currentBalance"
                type="number"
                step="0.01"
                class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-sm">机构/平台</label>
              <input
                v-model="editForm.institution"
                class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
              />
            </div>
            <div>
              <label class="text-sm">账号标识</label>
              <input
                v-model="editForm.accountNo"
                class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
              />
            </div>
          </div>
          <div>
            <label class="text-sm">状态</label>
            <select
              v-model.number="editForm.status"
              class="w-full mt-1 px-3 py-2 border border-border rounded bg-background"
            >
              <option :value="1">启用</option>
              <option :value="0">停用</option>
              <option :value="-1">归档</option>
            </select>
          </div>
        </div>
        <div class="px-4 py-3 border-t border-border flex justify-end gap-2">
          <button
            @click="dialogVisible = false"
            class="px-3 py-2 text-sm border border-border rounded"
          >
            取消
          </button>
          <button
            @click="saveItem"
            class="px-3 py-2 text-sm bg-primary-600 text-white rounded"
          >
            保存
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

const loading = ref(false);
const accounts = ref<FundAccount[]>([]);
const query = ref<any>({
  pageNum: 1,
  pageSize: 50,
  status: "",
  keyword: "",
});
const stats = ref({
  total: 0,
  balance: 0,
  income: 0,
  expense: 0,
});

const dialogVisible = ref(false);
const editForm = ref<FundAccount>({
  accountType: "银行卡",
  initialBalance: 0,
  currentBalance: 0,
  status: 1,
});

let timer: NodeJS.Timeout | null = null;
const debounceSearch = () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    loadData();
  }, 300);
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await doApi.post<{
      datas: FundAccount[];
      total: number;
    }>("api/entry/account/list", query.value);
    accounts.value = res.datas || [];
    stats.value = {
      total: res.total || 0,
      balance: accounts.value.reduce((s, a) => s + Number(a.currentBalance || 0), 0),
      income: accounts.value.reduce((s, a) => s + Number(a.totalIncome || 0), 0),
      expense: accounts.value.reduce((s, a) => s + Number(a.totalExpense || 0), 0),
    };
  } catch (e) {
    Alert.error("加载账户失败");
  } finally {
    loading.value = false;
  }
};

const openDialog = (item?: FundAccount) => {
  if (item) {
    editForm.value = { ...item };
  } else {
    editForm.value = {
      accountType: "银行卡",
      initialBalance: 0,
      currentBalance: 0,
      status: 1,
    };
  }
  dialogVisible.value = true;
};

const saveItem = async () => {
  if (!editForm.value.name) {
    Alert.error("账户名称不能为空");
    return;
  }
  if (!editForm.value.accountType) {
    Alert.error("账户类型不能为空");
    return;
  }

  try {
    if (editForm.value.id) {
      await doApi.post("api/entry/account/update", editForm.value);
      Alert.success("更新成功");
    } else {
      await doApi.post("api/entry/account/add", editForm.value);
      Alert.success("新增成功");
    }
    dialogVisible.value = false;
    loadData();
  } catch (e) {
    Alert.error("保存失败");
  }
};

const removeItem = (item: FundAccount) => {
  Confirm.open({
    title: "删除确认",
    content: `确定删除账户【${item.name}】吗？`,
    confirm: async () => {
      try {
        await doApi.post("api/entry/account/del", { id: item.id });
        Alert.success("删除成功");
        loadData();
      } catch (e) {
        Alert.error("删除失败");
      }
    },
  });
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const statusText = (status?: number) => {
  if (status === 1) return "启用";
  if (status === 0) return "停用";
  if (status === -1) return "归档";
  return "未知";
};

onMounted(() => {
  loadData();
});
</script>
