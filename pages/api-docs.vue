<script setup lang="ts">
const { isDark, toggleTheme } = useAppTheme();

import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";

const spec = ref<any>({});
const expandedTags = ref<Set<string>>(new Set());

const groupedPaths = computed(() => {
  const map = new Map<string, any[]>();
  if (!spec.value?.paths) return map;

  for (const [path, methods] of Object.entries(spec.value.paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      // @ts-ignore
      const tags = details?.tags || ["未分类"];
      for (const tag of tags) {
        if (!map.has(tag)) map.set(tag, []);
        map.get(tag)!.push({ path, method, details });
      }
    }
  }

  return map;
});

// 切换标签展开/收起状态
const toggleTag = (tag: string) => {
  if (expandedTags.value.has(tag)) {
    expandedTags.value.delete(tag);
  } else {
    expandedTags.value.add(tag);
  }
};

// 获取HTTP方法对应的颜色
const getMethodColor = (method: string) => {
  const colors = {
    get: "bg-blue-500",
    post: "bg-green-500",
    put: "bg-orange-500",
    delete: "bg-red-500",
    patch: "bg-purple-500",
  };
  return colors[method.toLowerCase() as keyof typeof colors] || "bg-gray-500";
};

// 获取接口文档
const response = await fetch("/openapi.json");
spec.value = await response.json();
</script>

<template>
  <!-- 主题切换按钮 - 移到最左侧 -->
  <div class="fixed top-2 right-2">
    <button
      @click="toggleTheme()"
      :class="[
        'p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
        isDark
          ? 'bg-gray-800/80 text-green-400 hover:bg-gray-800'
          : 'bg-white/80 text-green-600 hover:bg-white',
      ]"
      title="切换主题"
    >
      <SunIcon v-if="isDark" class="w-5 h-5" />
      <MoonIcon v-else class="w-5 h-5" />
    </button>
  </div>
  <div class="p-6 max-w-6xl mx-auto text-gray-800 dark:text-gray-200">
    <!-- 顶部信息 -->
    <div class="mb-10" v-if="spec.info">
      <h1 class="text-3xl font-bold">{{ spec.info.title }}</h1>
      <p class="text-gray-600">版本: {{ spec.info.version }}</p>
      <p class="mt-2">{{ spec.info.description }}</p>
    </div>

    <!-- 按 tag 分组渲染接口 -->
    <div v-for="[tag, apis] in groupedPaths" :key="tag" class="mb-8">
      <!-- 可展开的标签头部 -->
      <div
        @click="toggleTag(tag)"
        class="flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 p-4 rounded-lg border border-gray-200 transition-colors"
      >
        <h2 class="text-2xl font-bold text-purple-600">{{ tag }}</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500">{{ apis.length }} 个接口</span>
          <svg
            :class="{ 'rotate-180': expandedTags.has(tag) }"
            class="w-5 h-5 text-gray-400 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>

      <!-- 接口列表 - 可展开收起 -->
      <div v-show="expandedTags.has(tag)" class="mt-4 space-y-4">
        <div
          v-for="api in apis"
          :key="api.path + api.method"
          class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm dark:bg-gray-800"
        >
          <div class="flex items-center gap-2">
            <span
              :class="getMethodColor(api.method)"
              class="text-sm uppercase text-white dark:text-black inline-block px-2 py-1 rounded font-medium"
            >
              {{ api.method }}
            </span>
            <span class="text-gray-800 dark:text-gray-200 font-semibold">{{
              api.path
            }}</span>
            <p class="text-md text-gray-600 dark:text-gray-400">
              {{ api.details.summary }}
            </p>
          </div>

          <details class="mt-2">
            <summary class="cursor-pointer text-blue-600 underline text-sm">
              查看接口详情
            </summary>

            <div class="mt-2 text-black dark:text-white">
              <!-- 请求参数 (未展开 definitions 参数渲染，留做扩展) -->
              <!-- <div v-if="api.details.requestBody?.length">
                <h3 class="font-semibold text-sm mt-2">请求参数：</h3>
                <ul class="list-disc pl-5 text-sm text-gray-700">
                  <li v-for="param in api.details.parameters" :key="param.name">
                    <b>{{ param.name }}</b> - {{ param.in }}:
                    {{ param.description }}
                  </li>
                </ul>
              </div> -->
              <!-- 请求体 -->
              <div class="mt-3" v-if="api.details.requestBody">
                <div
                  v-if="api.details.requestBody?.content?.['application/json']"
                >
                  <h3
                    class="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1"
                  >
                    请求体:
                  </h3>
                  <pre
                    class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto"
                    >{{
                      JSON.stringify(
                        api.details.requestBody?.content?.["application/json"]
                          ?.schema,
                        null,
                        2
                      )
                    }}
                  </pre>
                </div>
                <div
                  v-if="
                    api.details.requestBody?.content?.['multipart/form-data']
                  "
                >
                  <h3
                    class="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1"
                  >
                    form-data:
                  </h3>
                  <pre
                    class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto"
                    >{{
                      JSON.stringify(
                        api.details.requestBody?.content?.[
                          "multipart/form-data"
                        ]?.schema,
                        null,
                        2
                      )
                    }}
                  </pre>
                </div>
              </div>

              <!-- 响应体 -->
              <div class="mt-3" v-if="api.details.responses">
                <h3
                  class="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1"
                >
                  响应体:
                </h3>
                <pre
                  class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm overflow-x-auto"
                  >{{
                    JSON.stringify(
                      api.details.responses?.["200"]?.content?.[
                        "application/json"
                      ]?.schema,
                      null,
                      2
                    )
                  }}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- 实体定义展示 -->
    <div v-if="spec.components?.schemas" class="mt-20">
      <h2 class="text-2xl font-bold text-green-600 mb-4">实体定义 (Schemas)</h2>
      <div
        v-for="(schema, name) in spec.components.schemas"
        :key="name"
        class="mb-4"
      >
        <details>
          <summary
            class="cursor-pointer text-green-700 dark:text-green-400 underline text-sm"
          >
            {{ name }}
          </summary>
          <pre
            class="bg-gray-50 dark:bg-gray-700 p-3 mt-1 rounded text-sm overflow-x-auto"
            >{{ JSON.stringify(schema, null, 2) }}
          </pre>
        </details>
      </div>
    </div>
  </div>
</template>
