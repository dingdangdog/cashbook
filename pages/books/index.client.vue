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

const pageQuery = ref<PageParam>({ pageSize: 15, pageNum: 1 });
const query = ref<Book | any>({});
const tabledata = ref<{ total?: number; data?: Book[] }>({});
const loading = ref(false);
const headers = ref([
  { title: "账本ID", key: "id", sortable: false },
  { title: "账本名称", key: "bookName", sortable: false },
  { title: "预算（每月）", key: "budget", sortable: false },
  {
    title: "创建时间",
    key: "createDate",
    value: (item: Book | any) => {
      return formatDate(item.createDate);
    },
    sortable: false,
  },
  { title: "共享KEY", key: "shareKey", sortable: false },
  { title: "操作", key: "actions", sortable: false },
]);

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
const toShare = (item: Book) => {
  Confirm.open({
    title: "提示",
    content: `确定要分享账本【${item.bookName}】吗？分享后无法取消分享！`,
    confirm: () => {
      // Alert.info("分享成功");
      doApi.post("api/entry/book/share", { id: item.id }).then((res) => {
        Alert.success("分享成功");
        getPages();
      });
    },
    cancel: () => {
      // 取消分享
      Alert.info("取消分享");
    },
  });
};
</script>

<template>
  <div class="tw-p-2">
    <div class="tw-flex tw-items-center tw-space-x-2 tw-pb-2">
      <div class="tw-w-80">
        <v-text-field
          clearable
          label="账本名称"
          v-model="query.name"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
      </div>
      <v-btn color="primary" @click="getPages"> 查询 </v-btn>
      <v-btn color="success" @click="getShare()"> 添加共享账本 </v-btn>
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
        <div class="tw-flex tw-space-x-2">
          <v-icon color="success" @click="editItemInfo(item)">
            mdi-pencil
          </v-icon>
          <v-icon color="primary" @click="toShare(item)" v-if="!item.shareKey">
            mdi-share
          </v-icon>
          <v-icon color="error" @click="toDelete(item)"> mdi-delete </v-icon>
        </div>
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
  <GetShareDialog
    @success="getPages"
    @cancel="cancelEdit"
    v-if="showGetShareDialog"
  />
</template>

<style scoped></style>
