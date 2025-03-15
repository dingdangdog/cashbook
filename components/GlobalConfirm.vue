<script setup lang="ts">
import { openConfirmDialogFlag, ThisConfirmModel } from "~/utils/confirm";

const cancel = () => {
  if (ThisConfirmModel.value && ThisConfirmModel.value.cancel) {
    ThisConfirmModel.value.cancel();
  }
  closeConfirm();
};
const close = () => {
  if (ThisConfirmModel.value && ThisConfirmModel.value.close) {
    ThisConfirmModel.value.close();
  }
  closeConfirm();
};
const confirm = () => {
  ThisConfirmModel.value?.confirm();
  closeConfirm();
};
const closeConfirm = () => {
  openConfirmDialogFlag.value = false;
  // ThisConfirmModel.value = model;

  // if (GlobalConfirmModels.value.length > 0) {
  //   setTimeout(() => {
  //     const model = GlobalConfirmModels.value.shift();
  //     openConfirmDialogFlag.value = true;
  //   }, 100);
  // }
};
</script>

<template>
  <v-dialog
    v-model="openConfirmDialogFlag"
    transition="dialog-bottom-transition"
    max-width="40rem"
    persistent
  >
    <v-card v-if="ThisConfirmModel">
      <v-card-title class="text-h5">
        {{ ThisConfirmModel.title }}
      </v-card-title>
      <v-card-text v-show="ThisConfirmModel?.content">
        <!-- {{ ThisConfirmModel.content }} -->
        <div class="tw-whitespace-pre tw-break-words">
          {{ ThisConfirmModel.content }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="info" variant="elevated" @click="cancel()"
          >{{ ThisConfirmModel.cancelText || "取消" }}
        </v-btn>
        <v-btn color="error" variant="elevated" @click="confirm()">
          {{ ThisConfirmModel.confirmText || "确定 " }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
