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
const query = ref<User | any>({});
const tabledata = ref<{ total?: number; data?: User[] }>({});
const loading = ref(false);
const headers = ref([
  { title: "用户ID", key: "id", sortable: false },
  { title: "用户昵称", key: "name", sortable: false },
  { title: "用户账号", key: "username", sortable: false },
  { title: "用户密码（加密后）", key: "password", sortable: false },
  { title: "Email", key: "email", sortable: false },
  {
    title: "创建时间",
    key: "createDate",
    value: (item: User | any) => {
      return formatDate(item.createDate);
    },
    sortable: false,
  },
  { title: "操作", key: "actions", sortable: false },
]);

const editItem = ref<User | any>();
const editDialogTitle = ref("Title");
// 新增
const addItem = () => {
  editDialogTitle.value = "添加用户";
  editItem.value = {};
  editInfoFlag.value = true;
};
// 编辑基本信息
const editItemInfo = (item: User) => {
  editDialogTitle.value = "编辑用户";
  editItem.value = item;
  editInfoFlag.value = true;
};

// 取消编辑的回调
const cancelEdit = () => {
  // cancel hook
};

const toDelete = (item: User) => {
  Confirm.open({
    title: "删除确认",
    content: "",
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
    <div class="flex items-center space-x-4 pb-2">
      <div class="w-80">
        <v-text-field
          clearable
          label="用户ID"
          v-model="query.id"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
      </div>
      <div class="w-80">
        <v-text-field
          clearable
          label="用户名称"
          v-model="query.name"
          variant="outlined"
          hide-details="auto"
        ></v-text-field>
      </div>
      <div class="w-80">
        <v-text-field
          clearable
          label="账号"
          v-model="query.username"
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
