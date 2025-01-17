<script setup lang="ts">
import { ref } from "vue";
import { add, update } from "./api";
import { editInfoFlag } from "./flag";

// 组件传入数据
let { item, title } = defineProps(["item", "title"]);
let emits = defineEmits(["success", "cancel"]);
// 编辑数据实体
const editItem = ref<User | any>();

if (item) {
  editItem.value = { ...item };
}

const usernameRules = [
  (v: string) => !!v || "必填",
  (v: string) => (v && v.length >= 4) || "账号必须大于等于4个字符",
];
const passwordRules = [
  (v: string) => !!v || "必填",
  (v: string) => (v && v.length >= 8) || "密码必须大于等于8个字符",
];

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
      Alert.success("修改成功");
      editInfoFlag.value = false;
      emits("success");
    });
  } else {
    if (editItem.value) {
      add(editItem.value).then((res) => {
        Alert.success("添加成功");
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
            label="昵称"
            v-model="editItem.name"
          ></v-text-field>
          <v-text-field
            :rules="usernameRules"
            required
            variant="outlined"
            label="账号"
            v-model="editItem.username"
          ></v-text-field>
          <v-text-field
            :rules="passwordRules"
            required
            variant="outlined"
            label="密码"
            v-model="editItem.password"
          ></v-text-field>
          <v-text-field
            variant="outlined"
            label="Email"
            v-model="editItem.email"
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
