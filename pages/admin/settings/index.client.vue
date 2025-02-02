<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const settings = ref<SystemSetting | any>({});

onMounted(() => {
  getConfig();
});

const getConfig = () => {
  doApi.get("api/admin/entry/settings/get").then((res) => {
    settings.value = res;
  });
};

const saveConfig = () => {
  doApi.post("api/admin/entry/settings/update", settings.value).then(() => {
    Alert.success("保存成功");
    getConfig();
  });
};
</script>

<template>
  <div class="admin-page-container">
    <div
      class="tw-flex tw-flex-col tw-p-2 tw-max-w-[760px]"
      style="margin: 0 auto"
    >
      <v-text-field
        clearable
        label="站点名称"
        v-model="settings.title"
        variant="outlined"
      ></v-text-field>
      <v-textarea
        rows="2"
        label="站点描述"
        v-model="settings.description"
        variant="outlined"
      ></v-textarea>
      <v-textarea
        rows="2"
        label="站点关键词"
        v-model="settings.keywords"
        variant="outlined"
      ></v-textarea>
      <!-- <v-text-field
        clearable
        label="系统版本号"
        v-model="settings.version"
        variant="outlined"
      ></v-text-field> -->
      <v-select
        clearable
        label="是否开放注册功能？"
        v-model="settings.openRegister"
        :items="[
          { title: '开放', value: true },
          { title: '不开放', value: false },
        ]"
        variant="outlined"
      ></v-select>
      <p class="tw-my-2 tw-text-sm tw-text-gray-500">
        最后修改时间: {{ formatDate(settings.updateBy || 0) }}
      </p>
      <p class="tw-my-2 tw-text-sm tw-text-gray-500">
        系统版本: {{ settings.version }}
      </p>

      <div class="tw-flex tw-space-x-4 tw-justify-center">
        <!-- <v-btn class="tw-w-40" variant="flat" @click="getConfig()">
          重置
        </v-btn> -->
        <v-btn
          class="tw-w-40"
          variant="flat"
          color="primary"
          @click="saveConfig()"
        >
          保存
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
