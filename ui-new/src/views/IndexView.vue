<template>
  <LoginView v-if="!userInfo.token" />
  <MainView v-if="userInfo.token" />
</template>

<script setup lang="ts">
import LoginView from '@/views/LoginView.vue'
import MainView from '@/views/MainView.vue'
import { userInfo, bookInfo } from '@/stores/flag'

// 用户信息初始化
const token = localStorage.getItem('token')
if (token) {
  userInfo.value.token = token
  userInfo.value.id = String(localStorage.getItem('userId'))
  userInfo.value.name = String(localStorage.getItem('name'))
  if (localStorage.getItem('bookId')) {
    bookInfo.value.id = String(localStorage.getItem('bookId'))
    bookInfo.value.bookName = String(localStorage.getItem('bookName'))
  }
}
</script>

<style scoped></style>
