<template>
  <main
    class="tw-grid tw-min-h-screen tw-place-items-center tw-bg-white tw-px-6 lg:tw-px-8"
  >
    <div class="tw-text-center">
      <p class="tw-text-xl tw-font-semibold tw-text-indigo-600">500</p>
      <h1
        class="tw-mt-4 tw-text-2xl tw-font-bold tw-tracking-tight tw-text-gray-900 sm:tw-text-3xl"
      >
        呕吼，服务出错了！
      </h1>
      <h1
        class="tw-mt-4 tw-text-xl tw-font-bold tw-tracking-tight tw-text-gray-900 sm:tw-text-2xl"
      >
        OPS, Server Error!
      </h1>
      <p class="tw-text-sm tw-my-2 tw-text-red-400">
        {{ error }}
      </p>
      <div
        class="tw-mt-8 tw-flex tw-items-center tw-justify-center tw-gap-x-6 tw-space-x-4"
      >
        <a
          href="/"
          class="tw-rounded-md tw-bg-indigo-600 tw-px-3.5 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-indigo-500 tw-focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
          >返回首页</a
        >
        <button
          @click="clearCache"
          class="tw-rounded-md tw-bg-green-600 tw-px-3.5 tw-py-2.5 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm hover:tw-bg-green-500 tw-focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600 tw-cursor-pointer"
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
