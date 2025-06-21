<template>
  <main
    class="grid min-h-screen place-items-center bg-white px-6 lg:px-8"
  >
    <div class="text-center">
      <p class="text-xl font-semibold text-indigo-600">500</p>
      <h1
        class="mt-4 text-2xl font-bold tracking-tight text-green-950 sm:text-3xl"
      >
        呕吼，服务出错了！
      </h1>
      <h1
        class="mt-4 text-xl font-bold tracking-tight text-green-950 sm:text-2xl"
      >
        OPS, Server Error!
      </h1>
      <p class="text-sm my-2 text-red-400">
        {{ error }}
      </p>
      <div
        class="mt-8 flex items-center justify-center gap-x-6 space-x-4"
      >
        <a
          href="/"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >返回首页</a
        >
        <button
          @click="clearCache"
          class="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
        >
          清除缓存
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
// import { Confirm } from "~/utils/comfirm";
const route = useRoute();
const error = route.query.e;

const clearCache = () => {
  console.log("11111");
  // 清除 localStorage
  localStorage.clear();
  // 清除 sessionStorage
  sessionStorage.clear();
  // 清除 Cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
  // 刷新页面
  location.href = "/login";
};
</script>

<style scoped></style>
