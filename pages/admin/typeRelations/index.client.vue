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
    const books = await doApi.post("api/admin/entry/books/list", {}) as Book[];
    bookOptions.value = [
      { text: "全部账本", value: "" },
      { text: "🔧 模板数据", value: "0" },
      ...books.map((book: Book) => ({
        text: `${book.bookName} (${book.bookId})`,
        value: book.bookId
      }))
    ];
  } catch (error) {
    console.error("获取账本列表失败:", error);
  }
};

const headers = ref([
  { title: "账本信息", key: "bookInfo", sortable: false },
  { title: "用户ID", key: "userId", sortable: false },
  { title: "原类型", key: "source", sortable: false },
  { title: "目标类型", key: "target", sortable: false },
  { title: "操作", key: "actions", sortable: false },
]);

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
          // console.log(res)
          Alert.success("删除成功");
          getPages();
        })
        .catch(() => {
          error("delete fail");
        });
    },
    cancel: () => {
      // 取消删除
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

const changePage = (param: {
  page: number;
  itemsPerPage: number;
  sortBy: any;
}) => {
  pageQuery.value.pageNum = param.page;
  pageQuery.value.pageSize = param.itemsPerPage;
  getPages();
};

// 初始化
onMounted(() => {
  getBookList();
  getPages();
});
</script>

<template>
  <div class="admin-page-container">
    <div class="tw-flex tw-items-center tw-space-x-4 tw-pb-2">
      <div class="tw-w-80">
        <v-select
          clearable
          label="选择账本"
          v-model="query.bookId"
          :items="bookOptions"
          item-title="text"
          item-value="value"
          variant="outlined"
          hide-details="auto"
        ></v-select>
      </div>
      <div class="tw-w-80">
        <v-text-field
          clearable
          label="用户ID"
          type="number"
          v-model="query.userId"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
      </div>
      <div class="tw-flex tw-items-center tw-space-x-2">
        <v-switch
          v-model="showTemplateData"
          color="primary"
          hide-details
          @update:modelValue="getPages"
        ></v-switch>
        <span class="tw-text-sm tw-text-gray-600">显示模板数据</span>
      </div>
      <v-btn color="primary" @click="getPages"> 查询 </v-btn>
      <v-btn color="success" @click="addItem()"> 新增 </v-btn>
    </div>
    <v-data-table-server
      noDataText="noDataText"
      :items-per-page="pageQuery.pageSize"
      :items="tabledata?.data"
      :itemsLength="tabledata?.total || 0"
      :headers="headers"
      :loading="loading"
      @update:options="changePage"
      height="calc(100vh - 3*var(--v-layout-top) - 1rem)"
    >
      <!-- 账本信息自定义插槽 -->
      <template v-slot:item.bookInfo="{ item }">
        <div class="tw-flex tw-flex-col">
          <div class="tw-flex tw-items-center tw-space-x-2">
            <span v-if="item.bookId === '0'" class="tw-px-2 tw-py-1 tw-bg-orange-100 tw-text-orange-800 tw-text-xs tw-rounded">
              模板数据
            </span>
            <span class="tw-font-medium" :class="item.bookId === '0' ? 'tw-text-orange-600' : 'tw-text-blue-600'">
              {{ item.bookId === '0' ? '系统模板' : (item.bookName || '未知账本') }}
            </span>
          </div>
          <div class="tw-flex tw-space-x-2 tw-text-xs tw-text-gray-500">
            <span>DB ID: {{ item.bookDbId || 'N/A' }}</span>
            <span>|</span>
            <span>业务ID: {{ item.bookId }}</span>
          </div>
        </div>
      </template>
      
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.actions="{ item }">
        <v-icon size="small" class="me-2" @click="editItemInfo(item)">
          mdi-pencil
        </v-icon>
        <!-- <v-icon size="small" class="me-2" @click="editItemFields(item)">
          mdi-information
        </v-icon> -->
        <v-icon size="small" class="me-2" @click="toDelete(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table-server>
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
