<template>
  <div class="el-dialog-main">
    <div class="book-cards common-center">
      <el-card class="book-card" shadow="hover"> Always </el-card>
      <el-card class="book-card" shadow="hover"> Hover </el-card>
      <el-card class="book-card" shadow="hover"> Never </el-card>
    </div>
  </div>
  <hr/>
  <footer class="custom-dialog-footer common-center">
    <el-button type="primary">添加账本</el-button>
  </footer>
</template>

<script setup lang="ts">

</script>

<style scoped>

.book-card{
  width: 10rem;
  height: 4rem;
  margin: 1rem;
}
.book-card:hover{
  background-color: rgba(115, 204, 229, 0.473)
}
</style>
