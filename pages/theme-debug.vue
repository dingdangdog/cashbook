<template>
  <div
    class="p-8 bg-white dark:bg-green-950/80 min-h-screen transition-colors duration-200"
  >
    <div class="max-w-2xl mx-auto">
      <h1
        class="text-3xl font-bold mb-8 text-green-950 dark:text-white"
      >
        主题调试页面
      </h1>

      <!-- 添加一个更明显的测试区域 -->
      <div
        class="mb-8 p-6 bg-red-100 dark:bg-red-900 border-4 border-red-500 dark:border-red-300 rounded-lg"
      >
        <h2
          class="text-2xl font-bold text-red-800 dark:text-red-200 mb-4"
        >
          🔴 明显的测试区域
        </h2>
        <p class="text-red-700 dark:text-red-300 text-lg">
          这个区域应该在浅色模式下是红色背景，深色模式下是深红色背景。
          如果你看不到明显的颜色变化，说明 TailwindCSS dark 模式没有生效。
        </p>
      </div>

      <div class="space-y-6">
        <!-- 当前主题状态 -->
        <div class="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2
            class="text-xl font-semibold mb-4 text-green-950 dark:text-white"
          >
            当前主题状态
          </h2>
          <div class="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>isDark:</strong> {{ isDark }}</p>
            <p><strong>HTML classes:</strong> {{ htmlClasses }}</p>
            <p><strong>localStorage theme:</strong> {{ localStorageTheme }}</p>
            <p><strong>System prefers dark:</strong> {{ systemPrefersDark }}</p>
          </div>
        </div>

        <!-- 主题切换按钮 -->
        <div class="flex gap-4 flex-wrap">
          <button
            @click="toggleTheme"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            切换主题
          </button>

          <button
            @click="setTheme(true)"
            class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-green-950/80 transition-colors"
          >
            设为深色
          </button>

          <button
            @click="setTheme(false)"
            class="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            设为浅色
          </button>

          <button
            @click="testTailwind"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            测试 TailwindCSS
          </button>
        </div>

        <!-- TailwindCSS 测试结果 -->
        <div
          v-if="tailwindTestResult"
          class="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg"
        >
          <h3
            class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2"
          >
            TailwindCSS 测试结果：
          </h3>
          <pre
            class="text-sm text-yellow-700 dark:text-yellow-300 font-mono"
            >{{ tailwindTestResult }}</pre
          >
        </div>

        <!-- 测试元素 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            class="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow"
          >
            <h3
              class="text-lg font-semibold mb-2 text-green-950 dark:text-white"
            >
              测试卡片 1
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              这是一个测试卡片，用于验证主题切换效果。
            </p>
          </div>

          <div
            class="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
          >
            <h3
              class="text-lg font-semibold mb-2 text-green-800 dark:text-green-300"
            >
              测试卡片 2
            </h3>
            <p class="text-green-600 dark:text-green-400">
              这是另一个测试卡片，使用了不同的颜色主题。
            </p>
          </div>
        </div>

        <!-- 调试信息 -->
        <div
          class="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg"
        >
          <h3
            class="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-300"
          >
            调试信息
          </h3>
          <div
            class="text-sm text-yellow-700 dark:text-yellow-400 font-mono"
          >
            <p>请查看浏览器控制台获取详细的主题切换日志。</p>
            <p>主题状态更新时间：{{ lastUpdate }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

const { isDark, toggleTheme, setTheme, getThemeState } = useAppTheme();

const htmlClasses = ref("");
const localStorageTheme = ref("");
const systemPrefersDark = ref(false);
const lastUpdate = ref("");
const tailwindTestResult = ref("");

const updateDebugInfo = () => {
  if (typeof window !== "undefined") {
    htmlClasses.value = document.documentElement.classList.toString();
    localStorageTheme.value = localStorage.getItem("theme") || "null";
    systemPrefersDark.value = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    lastUpdate.value = new Date().toLocaleTimeString();
  }
};

const testTailwind = () => {
  if (typeof window !== "undefined") {
    const testElement = document.createElement("div");
    testElement.className = "bg-red-500 dark:bg-blue-500";
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const backgroundColor = computedStyle.backgroundColor;

    document.body.removeChild(testElement);

    tailwindTestResult.value = `测试元素背景色: ${backgroundColor}\n当前是否为深色模式: ${
      isDark.value
    }\nHTML classes: ${document.documentElement.classList.toString()}`;

    console.log("[TailwindCSS Test]", {
      backgroundColor,
      isDark: isDark.value,
      htmlClasses: document.documentElement.classList.toString(),
    });
  }
};

onMounted(() => {
  updateDebugInfo();

  // 监听主题变化
  watch(isDark, () => {
    console.log("[Debug] Theme changed to:", isDark.value);
    updateDebugInfo();
  });
});
</script>
