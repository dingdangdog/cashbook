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

const settingTab = ref(1);

const exporting = ref(false);
const exportAll = () => {
  exporting.value = true;
  // doApi.download("api/admin/entry/settings/export").then((res) => {});
  doApi
    .get("api/admin/entry/settings/export")
    .then((res) => {
      Alert.success("导出成功，请保存文件");
      const fileName = "Cashbook-backup-" + new Date().getTime() + ".json";
      exportJson(fileName, JSON.stringify(res));
    })
    .finally(() => {
      exporting.value = false;
    });
};

const importing = ref(false);
const importAll = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      const formdata = new FormData();
      const blob = new Blob([data], { type: "application/json" });
      formdata.append("file", blob);
      importing.value = true;
      doApi
        .postform("api/admin/entry/settings/import", formdata)
        .then(() => {
          Alert.success("导入成功");
          getConfig();
        })
        .finally(() => {
          importing.value = false;
        });
    };
    reader.readAsText(file);
  };
  input.click();
};
</script>

<template>
  <div class="admin-page-container">
    <v-tabs v-model="settingTab" align-tabs="center" color="green-accent-2">
      <v-tab :value="1">基本设置</v-tab>
      <v-tab :value="2">数据备份</v-tab>
    </v-tabs>

    <v-tabs-window v-model="settingTab">
      <v-tabs-window-item :value="1">
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
      </v-tabs-window-item>

      <v-tabs-window-item :value="2">
        <div class="tw-max-w-3xl tw-mx-auto tw-p-4">
          <div class="tw-flex tw-space-x-4 tw-justify-center">
            <v-btn
              class="tw-w-40"
              variant="flat"
              color="primary"
              @click="exportAll()"
              :loading="exporting"
            >
              备份
            </v-btn>

            <v-btn
              class="tw-w-40"
              variant="flat"
              color="success"
              @click="importAll()"
              :loading="importing"
            >
              恢复
            </v-btn>
          </div>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<style scoped></style>
