<template>
  <LoginView v-if="!userInfo.id" />
  <MainView v-if="userInfo.id" />
</template>

<script setup lang="ts">
import LoginView from '@/views/LoginView.vue'
import MainView from '@/views/MainVIew.vue'
import { userInfo, bookInfo } from '@/stores/flag'

// 用户信息初始化
const userId = localStorage.getItem('userId')
if (userId) {
  userInfo.value.id = userId
  userInfo.value.token = String(localStorage.getItem('token'))
  userInfo.value.name = String(localStorage.getItem('name'))
  if (localStorage.getItem('bookId')) {
    bookInfo.value.id = Number(localStorage.getItem('bookId'))
    bookInfo.value.bookName = String(localStorage.getItem('bookName'))
  }
}
</script>

<style scoped></style>
