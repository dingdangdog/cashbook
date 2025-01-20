<template>
  <Head>
    <Title>{{ SystemConfig?.title }} - 管理后台</Title>
  </Head>
  <div class="login-container">
    <!-- set input width -->
    <div class="icon-container">
      <h1 class="tw-text-2xl tw-text-bold tw-my-4">
        {{ SystemConfig?.title }} - 管理后台
      </h1>
    </div>
    <!-- <v-sheet rounded> -->
    <v-card class="login-card">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="loginParam.account"
          :readonly="loading"
          :rules="[required]"
          class="tw-mb-2"
          clearable
          required
          label="Accnout *"
          autocomplete="admin-account"
        ></v-text-field>

        <v-text-field
          v-model="loginParam.password"
          :readonly="loading"
          :rules="[required]"
          clearable
          required
          label="Password *"
          autocomplete="admin-password"
          placeholder="Enter your password"
          :type="lookPs ? 'text' : 'password'"
          :append-inner-icon="lookPs ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="lookPs = !lookPs"
        ></v-text-field>

        <br />
        <v-btn
          :disabled="!form"
          :loading="loading"
          block
          color="grey-darken-4"
          size="large"
          type="submit"
          variant="elevated"
        >
          Sign In
        </v-btn>
      </v-form>
    </v-card>
    <!-- </v-sheet> -->
  </div>
</template>

<script lang="ts" setup>
import type { AdminLogin } from "~/utils/model";

definePageMeta({
  // layout: "empty",
});

const form = ref(false);
const loading = ref(false);
const lookPs = ref(false);
const loginParam = ref<AdminLogin>({ account: "", password: "" });

const onSubmit = () => {
  if (!form.value) return;
  loading.value = true;
  return doApi
    .post("api/admin/login", loginParam.value)
    .then((res) => {
      // console.log(res)
      Alert.success("Login success");
      navigateTo({ path: "/admin/" });
    })
    .catch((e) => error(e.message))
    .finally(() => {
      loading.value = false;
    });
};

const required = (v: any) => {
  return !!v || "Field is required";
};

if (useCookie("Admin").value) {
  navigateTo("/admin/");
}
</script>

<style scoped>
/* Your CSS code here */

.login-container {
  height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon-container {
  margin-top: -10rem;
  min-width: 15rem;
  /* margin-left: -3rem; */
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  margin: 1rem auto !important;
  padding: 1rem;
  max-width: 30rem;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.9) !important;
}
</style>
