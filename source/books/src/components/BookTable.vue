<template>
  <!-- 表格查询框与操作按钮 -->
  <el-row class="queryRow">
    <div class="queryParam">
      <el-input v-model="booksQueryRef.bookName" placeholder="账本名称" />
    </div>

    <!-- <div class="queryParam pc-button">
      <el-button type="primary" @click="openCreateDialog(formTitle[0])">新增</el-button>
    </div> -->
  </el-row>

  <hr />
  <!-- 表格主体数据列表 -->
  <div class="el-table-div">
    <el-table v-loading="loading" :data="books" stripe row-key="row" max-height="calc(100vh - 20rem)">
      <el-table-column type="index" label="序号" min-width="40" />
      <el-table-column prop="id" label="ID" v-if="false" />
      <el-table-column prop="bookName" label="账本名称" min-width="100" />
      <el-table-column prop="createDate" label="创建时间" min-width="100" />
      <el-table-column label="操作" width="120">
        <!-- <template v-slot="scop"> -->
        <!-- <el-button type="primary" :icon="Edit" circle @click="openUpdateDialog(formTitle[1], scop.row)" /> -->
        <!-- <el-button type="danger" :icon="Delete" circle @click="deleteById(scop.row)" /> -->
        <!-- </template> -->
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, watch } from 'vue'

// 私有引入
import { getAllBook } from '../api/api.book'
import type { BookQuery, Book } from '@/types/model/book'

// 初始化后自动执行
onMounted(() => {
  doQuery()
})

const booksQuery: BookQuery = {
  id: undefined,
  bookName: undefined,
  createDate: undefined
}

const booksQueryRef = ref(booksQuery)

/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true)
// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}
// 分页数据绑定
const books = ref<Book[]>([])

// 执行分页数据查询
const doQuery = () => {
  getAllBook().then((res) => {
    console.log(res)
    books.value = res
    loading.value = false
  })
}

watch(booksQueryRef.value, () => {
  doQuery()
})
</script>

<style scoped>
.queryRow .queryParam {
  margin: 8px 3px;
  display: flex; /* 设置body为flex布局 */
  justify-content: center; /* 横向居中 */
  align-items: center; /* 纵向居中 */
}

.pageDiv {
  margin: 10px 0;
  /* width: 85%; */
}

.el-table {
  overflow-x: auto;
  overflow-y: auto;
}
</style>
