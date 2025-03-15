<script setup lang="ts">
import { ref } from "vue";
import { showGetShareDialog } from "./flag";

// 组件传入数据
let { title } = defineProps(["title"]);
let emits = defineEmits(["success", "cancel"]);

const shareKey = ref("");
// 保存编辑数据
const save = () => {
  if (!shareKey.value) {
    Alert.error("请输入共享KEY");
    return;
  }
  doApi
    .post("api/entry/book/inshare", { key: shareKey.value })
    .then((res) => {
      Alert.success("添加成功");
      showGetShareDialog.value = false;
      emits("success");
    })
    .catch((err) => {
      // Alert.error(err);
    });
};
const close = () => {
  showGetShareDialog.value = false;
  emits("cancel");
};
</script>

<template>
  <v-dialog
    v-model="showGetShareDialog"
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <v-card>
      <v-card-title>
        <span class="tw-text-lg">添加共享账本</span>
      </v-card-title>
      <v-card-text>
        <p class="tw-text-gray-500 tw-text-sm">
          使用他人分享的共享Key添加共享账本。
        </p>
        <v-form ref="formRef">
          <v-text-field
            variant="outlined"
            label="共享Key"
            v-model="shareKey"
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
          确定
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
