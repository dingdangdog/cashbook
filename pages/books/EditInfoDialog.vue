<script setup lang="ts">
import { ref } from "vue";
import { add, update } from "./api";
import { editInfoFlag } from "./flag";

// 组件传入数据
let { item, title } = defineProps(["item", "title"]);
let emits = defineEmits(["success", "cancel"]);
// 编辑数据实体
const editItem = ref<Book | any>();

if (item) {
  editItem.value = { ...item };
}

const form = ref(false);
// 保存编辑数据
const save = () => {
  if (!form.value) {
    // formRef.validate()
    Alert.error("UnSubmit, Please Check Form!");
    return;
  }

  if (editItem.value?.id) {
    update(editItem.value).then((res) => {
      Alert.success("保存成功");
      editInfoFlag.value = false;
      emits("success");
    });
  } else {
    if (editItem.value) {
      add(editItem.value).then((res) => {
        Alert.success("保存成功");
        editInfoFlag.value = false;
        emits("success");
      });
    }
  }
};
const close = () => {
  editInfoFlag.value = false;
  emits("cancel");
};
</script>

<template>
  <v-dialog
    v-model="editInfoFlag"
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-form v-model="form" ref="formRef">
          <v-text-field
            variant="outlined"
            label="账本名称"
            v-model="editItem.bookName"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn density="default" @click="close()" variant="elevated">
          取消
        </v-btn>
        &nbsp;
        <v-btn
          density="default"
          @click="save()"
          color="primary"
          variant="elevated"
        >
          保存
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-dialog > .v-overlay__content {
  margin: 0 !important;
}
</style>
