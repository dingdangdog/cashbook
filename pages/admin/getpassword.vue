<script setup lang="ts">
const entry = ref({
  username: "",
  password: "",
});

const newPassword = ref("");
const newAccount = ref("");
const getPassword = () => {
  doApi.post<any>("api/admin/getPassword", entry.value).then((res) => {
    newPassword.value = res;
    newAccount.value = entry.value.username;
  });
};
</script>

<template>
  <Head>
    <Title>密码生成 - {{ SystemConfig?.title }}</Title>
    <Meta name="description" :content="SystemConfig?.description" />
    <Meta
      name="keywords"
      :content="`Cashbook,记账本,私人记账,开源账本,dingdangdog,月上老狗,${SystemConfig?.keywords}`"
    />
  </Head>
  <div
    class="tw-w-scerrn tw-h-screen tw-flex tw-flex-col tw-justify-center tw-items-center"
  >
    <v-card class="tw-w-80">
      <v-card-text>
        <v-text-field
          v-model="entry.username"
          class="tw-mb-2"
          clearable
          required
          label="Account *"
          autocomplete="admin-account"
        ></v-text-field>

        <v-text-field
          v-model="entry.password"
          clearable
          required
          label="Password *"
          autocomplete="admin-password"
          placeholder="Enter your password"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="getPassword()">加密</v-btn>
      </v-card-actions>
    </v-card>

    <div v-show="newPassword" class="">
      <p>账号：{{ newAccount }}</p>
      <p>加密密码：{{ newPassword }}</p>
    </div>
  </div>
</template>

<style scoped></style>
