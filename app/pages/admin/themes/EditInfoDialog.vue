<script setup lang="ts">
import { ref } from "vue";
import { add, update, type AdminTheme, type ThemeMode } from "./api";
import { editInfoFlag } from "./flag";

// 组件传入数据
const { item, title } = defineProps<{
  item: Partial<AdminTheme>;
  title: string;
}>();
const emits = defineEmits<{
  success: [];
  cancel: [];
}>();

const editItem = ref<Partial<AdminTheme>>({ ...(item || {}) });

if (editItem.value.isActive === undefined) editItem.value.isActive = true;
if (editItem.value.isDefault === undefined) editItem.value.isDefault = false;
if (editItem.value.sortBy === undefined) editItem.value.sortBy = 0;
if (!editItem.value.colors) {
  editItem.value.colors = "";
}

const errors = ref({
  code: "",
  name: "",
  mode: "",
  colors: "",
});

const validateForm = () => {
  errors.value = { code: "", name: "", mode: "", colors: "" };
  let isValid = true;

  if (!String(editItem.value.code || "").trim()) {
    errors.value.code = "code不能为空";
    isValid = false;
  }

  if (!String(editItem.value.name || "").trim()) {
    errors.value.name = "name不能为空";
    isValid = false;
  }

  const mode = String(editItem.value.mode || "").trim() as ThemeMode;
  if (!["light", "dark"].includes(mode)) {
    errors.value.mode = "mode必须为light或dark";
    isValid = false;
  }

  const colorsStr = String(editItem.value.colors || "").trim();
  if (colorsStr) {
    try {
      JSON.parse(colorsStr);
    } catch {
      errors.value.colors = "colors必须为合法JSON字符串（可留空）";
      isValid = false;
    }
  }

  return isValid;
};

const loading = ref(false);

const save = () => {
  if (!validateForm()) return;
  loading.value = true;

  const payload = {
    ...editItem.value,
    code: String(editItem.value.code || "").trim(),
    name: String(editItem.value.name || "").trim(),
    mode: String(editItem.value.mode || "").trim(),
    colors: String(editItem.value.colors || ""),
    isActive: Boolean(editItem.value.isActive),
    isDefault: Boolean(editItem.value.isDefault),
    sortBy: Number(editItem.value.sortBy || 0),
  } as Partial<AdminTheme>;

  if (payload.id) {
    update(payload)
      .then(() => {
        Alert.success("修改成功");
        editInfoFlag.value = false;
        emits("success");
      })
      .catch((err) => {
        Alert.error("修改失败: " + (err?.message || err));
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    add(payload)
      .then(() => {
        Alert.success("添加成功");
        editInfoFlag.value = false;
        emits("success");
      })
      .catch((err) => {
        Alert.error("添加失败: " + (err?.message || err));
      })
      .finally(() => {
        loading.value = false;
      });
  }
};

const close = () => {
  editInfoFlag.value = false;
  emits("cancel");
};
</script>

<template>
  <div
    v-if="editInfoFlag"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="close"
  >
    <div
      class="bg-surface rounded-xl shadow-xl w-full max-w-3xl border border-border"
      @click.stop
    >
      <div class="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 class="text-lg font-semibold text-foreground">{{ title }}</h3>
        <button
          @click="close"
          class="text-muted hover:text-foreground transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="px-6 py-4 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              code <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editItem.code"
              type="text"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 transition-colors',
                errors.code ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500 focus:border-primary-500',
              ]"
              placeholder="如：light-green"
            />
            <p v-if="errors.code" class="mt-1 text-sm text-red-500">{{ errors.code }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editItem.name"
              type="text"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 transition-colors',
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500 focus:border-primary-500',
              ]"
              placeholder="显示名称"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              mode <span class="text-red-500">*</span>
            </label>
            <select
              v-model="editItem.mode"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 transition-colors',
                errors.mode ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500',
              ]"
            >
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
            <p v-if="errors.mode" class="mt-1 text-sm text-red-500">{{ errors.mode }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">sortBy</label>
            <input
              v-model.number="editItem.sortBy"
              type="number"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
          </div>
        </div>
        <div class="flex flex-wrap gap-6">
          <label class="inline-flex items-center gap-2 text-foreground">
            <input v-model="editItem.isActive" type="checkbox" class="h-4 w-4 rounded" />
            <span class="text-sm">启用</span>
          </label>
          <label class="inline-flex items-center gap-2 text-foreground">
            <input v-model="editItem.isDefault" type="checkbox" class="h-4 w-4 rounded" />
            <span class="text-sm">默认（同模式仅保留一个）</span>
          </label>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">colors（JSON）</label>
          <textarea
            v-model="editItem.colors"
            rows="10"
            :class="[
              'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted font-mono text-xs focus:outline-none focus:ring-2 transition-colors',
              errors.colors ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500',
            ]"
            placeholder='{"background":"255 255 255","foreground":"15 23 42","primary":{"500":"34 197 94"}}'
          ></textarea>
          <p v-if="errors.colors" class="mt-1 text-sm text-red-500">{{ errors.colors }}</p>
          <p v-else class="mt-1 text-xs text-muted">建议包含：background/foreground/surface/surfaceMuted/border/muted + primary(50-950)。</p>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-border flex justify-end space-x-3">
        <button
          @click="close"
          :disabled="loading"
          class="px-4 py-2 bg-surface-muted hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
        >
          取消
        </button>
        <button
          @click="save"
          :disabled="loading"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? "保存中..." : "保存" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

