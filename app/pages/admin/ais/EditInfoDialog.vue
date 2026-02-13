<script setup lang="ts">
import { ref, watch } from "vue";
import { add, update, type AdminAI } from "./api";
import { editInfoFlag } from "./flag";

const props = defineProps<{
  item: Partial<AdminAI>;
  title: string;
}>();
const emit = defineEmits<{ success: []; cancel: [] }>();

const editItem = ref<Partial<AdminAI>>({ ...props.item });
watch(
  () => props.item,
  (v) => (editItem.value = { ...v }),
  { deep: true }
);

const errors = ref<Record<string, string>>({});
const validate = () => {
  errors.value = {};
  if (!String(editItem.value.provider || "").trim())
    errors.value.provider = "服务商标识不能为空";
  if (!String(editItem.value.name || "").trim())
    errors.value.name = "显示名称不能为空";
  if (!String(editItem.value.apiProtocol || "").trim())
    errors.value.apiProtocol = "API 协议不能为空";
  return Object.keys(errors.value).length === 0;
};

const loading = ref(false);
const save = () => {
  if (!validate()) return;
  loading.value = true;
  const payload = {
    ...editItem.value,
    provider: String(editItem.value.provider || "").trim(),
    apiProtocol: String(editItem.value.apiProtocol || "").trim(),
    name: String(editItem.value.name || "").trim(),
    apiKey: editItem.value.apiKey != null ? String(editItem.value.apiKey) : null,
    apiEndpoint:
      editItem.value.apiEndpoint != null
        ? String(editItem.value.apiEndpoint)
        : null,
    apiModel:
      editItem.value.apiModel != null ? String(editItem.value.apiModel) : null,
    apiVersion:
      editItem.value.apiVersion != null
        ? String(editItem.value.apiVersion)
        : null,
    temperature:
      editItem.value.temperature != null
        ? Number(editItem.value.temperature)
        : 0.5,
    maxTokens:
      editItem.value.maxTokens != null
        ? Number(editItem.value.maxTokens)
        : 3000,
    timeout:
      editItem.value.timeout != null ? Number(editItem.value.timeout) : 30000,
    extraConfig:
      editItem.value.extraConfig != null
        ? String(editItem.value.extraConfig)
        : null,
    isActive: Boolean(editItem.value.isActive !== false),
  } as Partial<AdminAI>;

  const req = payload.id ? update(payload) : add(payload);
  req
    .then(() => {
      Alert.success(payload.id ? "修改成功" : "添加成功");
      editInfoFlag.value = false;
      emit("success");
    })
    .catch((e) => Alert.error((e?.message || e) as string))
    .finally(() => (loading.value = false));
};

const close = () => {
  editInfoFlag.value = false;
  emit("cancel");
};
</script>

<template>
  <div
    v-if="editInfoFlag"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    @click="close"
  >
    <div
      class="bg-surface rounded-xl shadow-xl w-full max-w-2xl border border-border my-4"
      @click.stop
    >
      <div
        class="px-6 py-4 border-b border-border flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold text-foreground">{{ title }}</h3>
        <button
          type="button"
          @click="close"
          class="text-muted hover:text-foreground transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              服务商标识 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editItem.provider"
              type="text"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2',
                errors.provider ? 'border-red-500' : 'border-border focus:ring-primary-500',
              ]"
              placeholder="如 openai, deepseek"
            />
            <p v-if="errors.provider" class="mt-1 text-sm text-red-500">{{ errors.provider }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              显示名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editItem.name"
              type="text"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2',
                errors.name ? 'border-red-500' : 'border-border focus:ring-primary-500',
              ]"
              placeholder="如 OpenAI GPT-4"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              API 协议 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="editItem.apiProtocol"
              type="text"
              :class="[
                'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2',
                errors.apiProtocol ? 'border-red-500' : 'border-border focus:ring-primary-500',
              ]"
              placeholder="如 openai, gemini"
            />
            <p v-if="errors.apiProtocol" class="mt-1 text-sm text-red-500">{{ errors.apiProtocol }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">API 密钥</label>
            <input
              v-model="editItem.apiKey"
              type="password"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="可选"
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-foreground mb-2">API 端点</label>
            <input
              v-model="editItem.apiEndpoint"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="可选，自定义端点"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">模型名称</label>
            <input
              v-model="editItem.apiModel"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="如 gpt-4"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">API 版本</label>
            <input
              v-model="editItem.apiVersion"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="可选"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">temperature</label>
            <input
              v-model.number="editItem.temperature"
              type="number"
              step="0.1"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">maxTokens</label>
            <input
              v-model.number="editItem.maxTokens"
              type="number"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">超时(ms)</label>
            <input
              v-model.number="editItem.timeout"
              type="number"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div class="md:col-span-2 flex items-center">
            <label class="inline-flex items-center gap-2 text-foreground">
              <input v-model="editItem.isActive" type="checkbox" class="h-4 w-4 rounded" />
              <span class="text-sm">启用</span>
            </label>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-foreground mb-2">额外配置(JSON)</label>
            <textarea
              v-model="editItem.extraConfig"
              rows="3"
              class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground placeholder-muted font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="{}"
            />
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-border flex justify-end gap-3">
        <button
          type="button"
          @click="close"
          :disabled="loading"
          class="px-4 py-2 border border-border rounded-lg bg-surface-muted text-foreground hover:bg-muted transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          @click="save"
          :disabled="loading"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <span
            v-if="loading"
            class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          <span>{{ loading ? "保存中..." : "保存" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
