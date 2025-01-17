<template>
  <v-dialog
    v-model="showSetConvertDialog"
    width="40rem"
    :fullscreen="miniFullscreen()"
  >
    <v-card>
      <v-card-title>CSV导入映射配置</v-card-title>
      <v-card-text
        class="form-inputs tw-border tw-border-gray-400 tw-m-2 tw-bg-gray-100"
      >
        <v-row
          class="form-row tw-border tw-rounded-md tw-border-gray-500 my-2 tw-bg-gray-500/10"
          v-for="(r, index) in editRelations"
        >
          <v-col cols="5">
            <v-text-field
              clearable
              label="原类型"
              hide-details="auto"
              variant="outlined"
              v-model="r.source"
              color="warning"
              :style="`color:${getItemColor(r.target)}`"
              style="text-shadow: black 1px 1px 1px"
            ></v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field
              clearable
              label="映射后类型"
              hide-details="auto"
              variant="outlined"
              v-model="r.target"
              color="success"
              :style="`color:${getItemColor(r.target)}`"
              style="text-shadow: black 1px 1px 1px"
            ></v-text-field>
          </v-col>
          <v-col cols="2">
            <div style="height: 100%; display: flex; align-items: center">
              <v-btn
                variant="outlined"
                color="error"
                @click="removePair(index)"
                >删除</v-btn
              >
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <div class="tw-flex tw-w-full tw-justify-center tw-space-x-4">
          <v-btn
            variant="elevated"
            color="error"
            @click="cancelTypeRelationChange"
          >
            取消
          </v-btn>
          <v-btn variant="elevated" color="success" @click="addPair">
            新增配置
          </v-btn>
          <v-btn
            variant="elevated"
            color="primary"
            @click="confirmTypeRelationChange"
          >
            保存修改
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { showSetConvertDialog } from "~/utils/flag";
import { miniFullscreen } from "@/utils/common";
import { getTypeRelation } from "~/utils/apis";
import { typeRelationStore } from "~/utils/store";

const editRelations = ref<TypeRelation[] | any>([]);

// Fetch and load the initial data
onMounted(() => {
  getTypeRelation().then((res) => {
    typeRelationStore.value = res;
    editRelations.value = res;
  });
});

// Add a new empty key-value pair
const addPair = () => {
  editRelations.value.unshift({
    bookId: localStorage.getItem("bookId"),
    source: "",
    target: "",
  });
};

// Remove a key-value pair at a specific index
const removePair = (index: number) => {
  editRelations.value.splice(index, 1);
};

// Confirm changes and update the data
const confirmTypeRelationChange = () => {
  doApi
    .post("api/entry/typeRelation/update", {
      types: editRelations.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then(() => {
      Alert.success("保存成功");
      typeRelationStore.value = editRelations.value;
      showSetConvertDialog.value = false;
    })
    .catch(() => {
      Alert.error("保存失败");
    });
};

// Cancel changes and reset to the original data
const cancelTypeRelationChange = () => {
  showSetConvertDialog.value = false;
};

const colorArray = [
  "#E57373",
  "#9FA8DA",
  "#FF80AB",
  "#90CAF9",
  "#EA80FC",
  "#29B6F6",
  "#B388FF",
  "#4FC3F7",
  "#00E676",
  "#80CBC4",
  "#F57F17",
  "#1DE9B6",
  "#64DD17",
  "#78909C",
  "#BCAAA4",
]; // 颜色数组
const colorMap = new Map<string, string>(); // 用于存储已经分配的文本及其对应颜色
let colorIndex = 0;

const getItemColor = (text: string) => {
  // 如果文本已经存在于 colorMap 中，则返回已有的颜色
  if (colorMap.has(text)) {
    return colorMap.get(text)!;
  }
  // 否则，从颜色数组中获取一个颜色
  const color = colorArray[colorIndex];
  // 将文本和颜色映射存入 colorMap
  colorMap.set(text, color);
  // 更新 colorIndex，确保循环使用颜色数组
  colorIndex = (colorIndex + 1) % colorArray.length;
  // 返回该文本的颜色
  return color;
};
</script>
<style scoped>
.set-convert-container {
  /* min-width: 40rem; */
  margin: 0 auto;
}

.form-inputs {
  height: 35rem;
  padding: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.btn-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.v-input__inner {
  width: 100%;
}
</style>
