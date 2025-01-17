<template>
  <div class="tw-p-2">
    <v-navigation-drawer v-model="searchDrawer" temporary location="right">
      <div style="padding: 0.5rem">
        <div class="queryParam">
          <v-autocomplete
            label="类型分类"
            hide-details="auto"
            variant="outlined"
            v-model="typeQueryRef.type"
            :items="typerOptions"
            clearable
          >
          </v-autocomplete>
        </div>
        <div class="queryParam">
          <v-text-field
            clearable
            label="类型名称"
            hide-details="auto"
            variant="outlined"
            v-model="typeQueryRef.value"
          ></v-text-field>
        </div>
        <!-- <v-btn color="primary" @click="doQuery">筛选</v-btn> -->
      </div>
    </v-navigation-drawer>
    <!-- 表格查询框与操作按钮 -->
    <div class="tw-flex tw-space-x-2 tw-justify-between tw-p-2">
      <div class="tw-flex tw-space-x-2">
        <!-- 点击自动映射会发生什么？会将现有的流水数据中的`支出类型`按照`自动映射配置`的设置关系进行自动转换。 -->
        <v-btn color="success" @click="showConfig">CSV导入映射配置</v-btn>
        <v-btn color="error" @click="hisFlowTypeConvert()">历史数据映射 </v-btn>
      </div>
      <div>
        <v-btn color="primary" @click="searchDrawer = true">筛选</v-btn>
      </div>
    </div>

    <hr />
    <!-- 表格主体数据列表 -->
    <div class="v-table-div">
      <v-data-table-virtual
        height="80vh"
        hide-default-footer
        :items="types"
        :headers="headers"
        :loading="loading"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-icon color="success" @click="openUpdateDialog(item)">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table-virtual>
    </div>

    <v-dialog
      width="25rem"
      v-model="typeDialog.visible"
      :title="typeDialog.title"
      :fullscreen="miniFullscreen()"
    >
      <v-card>
        <v-card-title>{{ typeDialog.title }}</v-card-title>
        <p style="margin: 0.5rem 1rem; font-size: 0.9rem; color: pink">
          修改类型名称会自动修改关联的所有流水
        </p>
        <v-card-text>
          <!-- <v-text-field
            clearable
            label="流水类型"
            variant="outlined"
            v-model="editType.flowType"
            disabled
          ></v-text-field> -->
          <v-text-field
            clearable
            label="类型分类"
            variant="outlined"
            v-model="editType.type"
            disabled
          ></v-text-field>
          <v-text-field
            clearable
            label="原类型名称"
            variant="outlined"
            v-model="editType.oldValue"
            disabled
          ></v-text-field>
          <v-text-field
            clearable
            focused
            label="新类型名称"
            variant="outlined"
            v-model="editType.value"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="tw-flex tw-justify-center tw-w-full tw-space-x-4">
            <v-btn color="warning" variant="elevated" @click="cancelEdit">
              取消
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              @click="confirmTypeChange()"
            >
              确定
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import { onMounted, ref, watch } from "vue";

import type { Typer } from "~/utils/model";
import { typeConvert } from "~/utils/flowConvert";
import { showSetConvertDialog } from "~/utils/flag";
import { miniFullscreen } from "~/utils/common";

// 加载蒙版显示控制器
const searchDrawer = ref(false);
const loading = ref(true);
const typerOptions = ref<string[]>(["支出类型/收入类型", "支付方式/收款方式"]);

const headers = ref([
  // { title: "流水类型", key: "flowType" },
  { title: "分类", key: "type" },
  { title: "名称", key: "value" },
  { title: "操作", key: "actions" },
]);
// 列表数据绑定
const types = ref<Typer[]>([]);
const allTypes = ref<Typer[]>([]);

const typeQueryRef = ref<Typer>({
  value: "",
});

const editType = ref<Typer>({
  type: "",
  value: "",
});

const typeDialog = ref({
  visible: false,
  title: "流水类型批量改名",
});

// 账本编辑表单实例
const openUpdateDialog = (row: Typer) => {
  editType.value.bookId = localStorage.getItem("bookId") || "";
  editType.value.flowType = row.flowType;
  editType.value.type = row.type;
  editType.value.oldValue = row.value;
  editType.value.value = "";
  typeDialog.value.visible = true;
};
const confirmTypeChange = () => {
  if (!editType.value.value) return;
  doApi
    .post<any>("api/entry/flow/type/update", editType.value)
    .then((res) => {
      // console.log(res);
      if (res && res.count > 0) {
        Alert.success("修改成功，同步修改" + res.count + "条流水数据");
      } else {
        Alert.error("修改失败");
      }
      typeDialog.value.visible = false;
      doQuery();
    })
    .catch((err) => {
      Alert.error("修改失败");
      console.log(err);
    });
};
const cancelEdit = () => {
  typeDialog.value.visible = false;
};

const doQuery = () => {
  loading.value = true;
  // console.log(typeQueryRef.value);
  doApi
    .post<Typer[]>("api/entry/flow/type/getAll", {
      ...typeQueryRef.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      // console.log(res);
      if (res) {
        // Alert.success("查询成功");
        types.value = res;
        allTypes.value = res;
      }
    })
    .catch((err) => {
      Alert.error("查询出错");
      console.log(err);
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  doQuery();
});

watch(typeQueryRef.value, () => {
  types.value = allTypes.value.filter((type) => {
    return (
      type.type?.indexOf(typeQueryRef.value.type || "") !== -1 &&
      type.value?.indexOf(typeQueryRef.value.value || "") !== -1
    );
  });
});

const hisFlowTypeConvert = async () => {
  let doConvert: string = "";
  for (let i = 0; i < types.value.length; i++) {
    let t = types.value[i];
    if (t.type === "支出类型/收入类型") {
      if (t.value !== typeConvert(t.value?.replace("-WX", ""))) {
        t.oldValue = t.value;
        t.value = typeConvert(t.value?.replace("-WX", ""));
        doConvert += t.oldValue + "-->" + t.value;
        const res = await doApi.post<any>("api/entry/flow/type/update", t);

        if (res && res.count > 0) {
          doConvert += " success<br/>";
        } else {
          doConvert += " fail<br/>";
        }
      }
    }
  }
  if (doConvert.length === 0) {
    Alert.info("没有类型需要转换");
  } else {
    Alert.success("转换结果如下：" + doConvert);
  }
  // loading.close()
  doQuery();
};

const showConfig = () => {
  showSetConvertDialog.value = true;
};
</script>

<style>
.type-container {
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
}

.v-table {
  overflow-x: auto;
  overflow-y: auto;
}
</style>
