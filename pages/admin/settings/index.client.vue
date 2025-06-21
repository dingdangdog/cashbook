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

const exportImging = ref(false);
const exportImgAll = () => {
  exportImging.value = true;
  // 使用download方法直接下载ZIP文件
  doApi
    .download("api/admin/entry/settings/exportImg")
    .then((blob) => {
      Alert.success("导出成功，正在下载...");
      const fileName = "Cashbook-images-" + new Date().getTime() + ".zip";
      // 创建下载链接
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => {
      Alert.error("导出失败: " + err);
    })
    .finally(() => {
      exportImging.value = false;
    });
};

const importImging = ref(false);
const importImgAll = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".zip"; // 只接受ZIP文件
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith(".zip")) {
      Alert.error("请上传ZIP格式的文件");
      return;
    }

    const formdata = new FormData();
    formdata.append("file", file);
    importImging.value = true;
    doApi
      .postform("api/admin/entry/settings/importImg", formdata)
      .then((res: any) => {
        Alert.success(res.message || "导入成功");
        getConfig();
      })
      .catch((err) => {
        Alert.error("导入失败: " + err);
      })
      .finally(() => {
        importImging.value = false;
      });
  };
  input.click();
};
</script>

<template>
  <div class="admin-page-container">
    <v-tabs v-model="settingTab" align-tabs="center" color="green-accent-2">
      <v-tab :value="1">基本设置</v-tab>
      <v-tab :value="2">备份与恢复</v-tab>
    </v-tabs>

    <v-tabs-window v-model="settingTab">
      <v-tabs-window-item :value="1">
        <div
          class="flex flex-col p-2 max-w-[760px]"
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
          <p class="my-2 text-sm text-gray-500">
            最后修改时间: {{ formatDate(settings.updateBy || 0) }}
          </p>
          <p class="my-2 text-sm text-gray-500">
            系统版本: {{ settings.version }}
          </p>

          <div class="flex space-x-4 justify-center">
            <!-- <v-btn class="w-40" variant="flat" @click="getConfig()">
          重置
        </v-btn> -->
            <v-btn
              class="w-40"
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
        <div class="max-w-3xl mx-auto p-4">
          <div class="p-4 m-2 bg-blue-100/20 rounded-lg">
            <h3 class="text-lg font-bold text-center mb-4">
              系统数据备份与恢复
            </h3>
            <div class="flex space-x-4 justify-center">
              <v-btn
                class="w-40"
                variant="flat"
                color="primary"
                @click="exportAll()"
                :loading="exporting"
              >
                备份
              </v-btn>

              <v-btn
                class="w-40"
                variant="flat"
                color="success"
                @click="importAll()"
                :loading="importing"
              >
                恢复
              </v-btn>
            </div>
          </div>
          <div class="p-4 m-2 bg-green-100/20 rounded-lg">
            <h3 class="text-lg font-bold text-center mb-4">
              小票图片备份与恢复
            </h3>
            <div class="flex space-x-4 justify-center">
              <v-btn
                class="w-40"
                variant="flat"
                color="primary"
                @click="exportImgAll()"
                :loading="exportImging"
              >
                备份
              </v-btn>

              <v-btn
                class="w-40"
                variant="flat"
                color="success"
                @click="importImgAll()"
                :loading="importImging"
              >
                恢复
              </v-btn>
            </div>
          </div>
        </div>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<style scoped></style>
