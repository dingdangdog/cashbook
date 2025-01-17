<template>
  <header
    class="top-index sticky top-0 left-0 flex justify-center items-center w-full shadow-md bg-gray-950"
  >
    <div class="w-full h-16">
      <div class="px-2 md:px-4 h-full flex justify-between items-center">
        <div class="flex items-center">
          <div class="block md:hidden" v-show="haveMenu">
            <v-btn icon="mdi-menu" size="large" @click="tiggleMenu()"></v-btn>
          </div>
          <a href="/" class="block md:hidden">
            <img
              v-show="!haveMenu"
              src="/favicon.ico"
              class="w-12 h-12 object-contain rounded-full"
            />
          </a>
          <a
            href="/"
            class="text-lg md:text-xl h-full font-boldtw-justify-center items-center hidden md:flex"
          >
            <img
              src="/favicon.ico"
              class="w-12 h-12 object-contain rounded-full"
            />
            <span class="min-w-16 ml-2">MyNuxt</span>
          </a>
        </div>
        <div class="flex-1 h-full flex justify-end items-center">
          <div class="px-0 md:px-4 h-full flex items-center justify-center">
            <!-- <a
              href="/client"
              class="px-4 text-base font-bold hover:text-sky-500 hidden md:flex h-full items-center"
              target="_blank"
              >客户端
            </a> -->
            <a
              href="/guide"
              class="px-4 text-base font-bold hover:text-blue-400 h-full flex items-center"
              target="_blank"
              v-show="showGide"
              >用户指南
            </a>
            <a
              href="/auth/login"
              class="px-4 text-base font-bold hover:text-blue-400 hidden md:flex h-full items-center"
              v-show="!logined"
            >
              登录/注册
            </a>
            <a
              href="/cc/create"
              class="px-4 text-base font-bold hover:text-blue-400 hidden md:flex h-full items-center"
              v-show="logined"
              >开始创作
            </a>
            <a
              href="/user/info"
              class="pl-4 text-base font-bold hover:text-blue-400 hidden md:flex h-full items-center"
              v-show="logined"
              >个人中心
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { checkSignIn } from "@/utils/common";

const { showGide, haveMenu } = defineProps(["showGide", "haveMenu"]);
const emit = defineEmits(["tiggleMenu"]);

const logined = ref(false);
if (checkSignIn()) {
  logined.value = true;
}

onMounted(async () => {
  if (logined.value) {
    getUserInfo();
    const timer = setInterval(async () => {
      try {
        const user = await getUserInfo();
        if (!user) {
          GlobalUserInfo.value = {};
          clearInterval(timer);
        }
      } catch (err) {
        clearInterval(timer);
      }
    }, 5000);
  }
});

const tiggleMenu = () => {
  emit("tiggleMenu");
};
</script>

<style scoped></style>
