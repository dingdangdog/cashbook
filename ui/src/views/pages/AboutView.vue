<template>
  <div class="about">
    <img
      src="https://images.oldmoon.top/images/dingdangdog/dingdangdog-1674980314.png"
      alt="icon"
      style="width: 10rem; height: 10rem"
    />
    <p>
      Powered by
      <a href="#" @click="openSource()">cashbook_v{{ version }}</a>
    </p>
    <!-- <hr /> -->
    <p>友链：<a href="#" @click="openOldmoon()">oldmoon.top</a></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const version = ref(localStorage.getItem('version'))

const openSource = () => {
  window.open('https://github.com/DingDangDog/cashbook')
}

const openOldmoon = () => {
  window.open('https://www.oldmoon.top')
}
</script>

<style>
.about {
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem;
  border: solid 1px var(--el-menu-border-color);
  /* min-height: 100vh; */
  text-align: center;
  /* position: absolute;
  left: 50%;
  top: 50%; */
}
</style>
