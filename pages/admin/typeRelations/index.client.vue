<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

import { del, page } from "./api";
import { editInfoFlag } from "./flag";
import EditInfoDialog from "./EditInfoDialog.vue";

const pageQuery = ref<PageParam>({ pageSize: 15, pageNum: 1 });
const query = ref<TypeRelation | any>({});
const tabledata = ref<{ total?: number; data?: TypeRelation[] }>({});
const loading = ref(false);
const headers = ref([
  { title: "账本ID", key: "bookId", sortable: false },
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
  page(pageQuery.value, query.value).then((res) => {
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
</script>

<template>
  <div class="admin-page-container">
    <div class="tw-flex tw-items-center tw-space-x-4 tw-pb-2">
      <div class="tw-w-80">
        <v-text-field
          clearable
          label="账本ID"
          v-model="query.bookId"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
      </div>
      <div class="tw-w-80">
        <v-text-field
          clearable
          label="用户ID"
          v-model="query.userId"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
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
