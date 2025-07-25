<script setup lang="ts">
import { ref, computed } from "vue";

const spec = ref<any>({});
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

// 获取接口文档
doApi.get("api/openapi.json").then((res) => {
  spec.value = res;
});
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto text-gray-800">
    <!-- 顶部信息 -->
    <div class="mb-10" v-if="spec.info">
      <h1 class="text-3xl font-bold">{{ spec.info.title }}</h1>
      <p class="text-gray-600">版本: {{ spec.info.version }}</p>
      <p class="mt-2">{{ spec.info.description }}</p>
    </div>

    <!-- 按 tag 分组渲染接口 -->
    <div v-for="[tag, apis] in groupedPaths" :key="tag" class="mb-10">
      <h2 class="text-2xl font-bold text-purple-600 mb-4">{{ tag }}</h2>

      <div
        v-for="api in apis"
        :key="api.path + api.method"
        class="mb-4 border border-gray-200 rounded-lg p-4"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-sm uppercase text-white bg-blue-500 inline-block px-2 py-1 rounded"
          >
            {{ api.method }}
          </span>
          <span class="text-gray-800 font-semibold">{{ api.path }}</span>
          <p class="text-md text-gray-600">{{ api.details.summary }}</p>
        </div>

        <details class="mt-2">
          <summary class="cursor-pointer text-blue-600 underline text-sm">
            查看接口详情
          </summary>

          <div class="mt-2">
            <!-- 请求参数 (未展开 definitions 参数渲染，留做扩展) -->
            <div v-if="api.details.parameters?.length">
              <h3 class="font-semibold text-sm mt-2">请求参数：</h3>
              <ul class="list-disc pl-5 text-sm text-gray-700">
                <li v-for="param in api.details.parameters" :key="param.name">
                  <b>{{ param.name }}</b> - {{ param.in }}:
                  {{ param.description }}
                </li>
              </ul>
            </div>

            <!-- 响应体 -->
            <div class="mt-3">
              <h3 class="font-semibold text-sm text-gray-700 mb-1">响应体:</h3>
              <pre class="bg-gray-100 p-2 rounded text-sm overflow-x-auto"
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

    <!-- 实体定义展示 -->
    <div v-if="spec.components?.schemas" class="mt-20">
      <h2 class="text-2xl font-bold text-green-600 mb-4">实体定义 (Schemas)</h2>
      <div
        v-for="(schema, name) in spec.components.schemas"
        :key="name"
        class="mb-4"
      >
        <details>
          <summary class="cursor-pointer text-green-700 underline text-sm">
            {{ name }}
          </summary>
          <pre class="bg-gray-50 p-3 mt-1 rounded text-sm overflow-x-auto"
            >{{ JSON.stringify(schema, null, 2) }}
          </pre>
        </details>
      </div>
    </div>
  </div>
</template>
