<template>
  <v-dialog
    v-model="showChangePasswordDialog"
    transition="dialog-bottom-transition"
    width="30rem"
  >
    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title> 修改密码 </v-card-title>
        <v-card-text>
          <v-text-field
            label="原密码"
            autocomplete="current-password"
            placeholder="请输入旧密码"
            variant="outlined"
            v-model="changPasswordData.old"
            :type="lookKey ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            required
            :append-inner-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="lookKey = !lookKey"
          ></v-text-field>
          <v-text-field
            label="新密码"
            placeholder="请输入新密码"
            variant="outlined"
            v-model="changPasswordData.new"
            :type="lookKey ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            required
            :append-inner-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="lookKey = !lookKey"
          ></v-text-field>
          <v-text-field
            label="重复新密码"
            placeholder="请再次输入新密码"
            variant="outlined"
            v-model="changPasswordData.againNew"
            :type="lookKey ? 'text' : 'password'"
            :readonly="loading"
            :rules="[required]"
            required
            :append-inner-icon="lookKey ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="lookKey = !lookKey"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div class="tw-w-full tw-flex tw-justify-center tw-space-x-4">
            <v-btn
              text="取消"
              variant="elevated"
              color="error"
              @click="closeDialog()"
            ></v-btn>
            <v-btn
              text="确定"
              variant="elevated"
              color="success"
              @click="submitChange"
            ></v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { showChangePasswordDialog } from "~/utils/flag";
import { ref } from "vue";

interface NewPassword {
  old?: string;
  new?: string;
  againNew?: string;
}

const loading = ref(false);
const lookKey = ref(false);
const required = (v: any) => {
  return !!v || "必填";
};

const changPasswordData = ref<NewPassword>({});
const submitChange = () => {
  if (loading.value) {
    return;
  }
  if (changPasswordData.value.new != changPasswordData.value.againNew) {
    Alert.error("两次密码不一致");
    return;
  }
  loading.value = true;
  doApi
    .post("api/entry/user/changePassword", changPasswordData.value)
    .then((res) => {
      if (res) {
        showChangePasswordDialog.value = false;
        Alert.success("密码修改成功！");
        // cleanLoginInfo();
        // 跳转到首页
        // router.push({ path: '/' })
      } else {
        Alert.error("密码重置失败，请重试！");
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const closeDialog = () => {
  showChangePasswordDialog.value = false;
};
</script>

<style scoped></style>
