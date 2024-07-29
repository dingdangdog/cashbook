<template>
  <div class="el-dialog-main">
    <div class="book-cards common-center">
      <el-card
        :key="book.id"
        v-for="book in books"
        class="book-card"
        :class="checkSelectBook(book.id)"
        shadow="hover"
        @click="openBook(book)"
      >
        {{ book.bookName }}
      </el-card>
    </div>
  </div>
  <hr />
  <footer class="custom-dialog-footer common-center">
    <el-button type="primary" @click="addBook">添加账本</el-button>
  </footer>
  <el-dialog style="width: 30vw" v-model="addBookDialog.visible" :title="addBookDialog.title">
    <div class="el-dialog-main">
      <el-form ref="bookFormRef" :model="newBook" :rules="bookFormRules">
        <el-form-item label="账本名称" :label-width="formLabelWidth" prop="bookName">
          <el-input v-model="newBook.bookName" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="confirmBookForm(bookFormRef)"> 确定 </el-button>
        <el-button @click="resetBookForm"> 重置 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Book } from '@/types/model/book'

import { createBook, getBook } from '@/api/api.book'
import { showBookDialogFlag } from '@/stores/flag'
import router from '@/router'

onMounted(() => {
  initBooks()
})

const books = ref<Book[]>([])

const initBooks = () => {
  getBook(localStorage.getItem('userId'))
    .then((res) => {
      books.value = res
    })
    .catch((err) => {
      console.log(err)
    })
}

const openBook = (book: Book) => {
  if (localStorage.getItem('bookId') === book.id.toString()) {
    showBookDialogFlag.value.visible = false
    return
  }
  localStorage.setItem('bookId', book.id.toString())
  localStorage.setItem('bookName', book.bookName)
  ElMessage.success('账本已打开')
  // openBookApi().then((res) => {
  //   ElMessage.success(res)
  // })
  // close book dialog
  showBookDialogFlag.value.visible = false
  router.push({ path: '/index/calendar' })
}

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

const addBookDialog = ref({
  visible: false,
  title: '添加账本'
})

const addBook = () => {
  addBookDialog.value.visible = true
}

const newBook = ref<Book>({
  id: 0,
  bookName: '',
  userId: 0,
  createDate: ''
})
// 账本编辑表单实例
const bookFormRef = ref<FormInstance>()

// 表单输入框校验规则
const bookFormRules = ref<FormRules>({
  bookName: [{ required: true, message: '请输入账本名称', trigger: 'blur' }]
})

const confirmBookForm = async (form: FormInstance | undefined) => {
  if (!form) return
  if (await form.validate()) {
    createBook({ userId: localStorage.getItem('userId'), bookName: newBook.value.bookName })
      .then((_res) => {
        ElMessage.success('添加成功')
        addBookDialog.value.visible = false
        initBooks()
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    return false
  }
}
const resetBookForm = () => {
  if (!bookFormRef.value) return
  bookFormRef.value.resetFields()
}

const checkSelectBook = (bookId: number) => {
  if (localStorage.getItem('bookId') === bookId.toString()) {
    return 'book-card-selected'
  } else {
    return ''
  }
}
</script>

<style scoped>
.book-card-selected {
  background-color: rgba(18, 255, 0, 0.1);
}
.book-card {
  width: 10rem;
  height: 4rem;
  margin: 1rem;
}
.book-card:hover {
  cursor: pointer;
  background-color: rgba(115, 204, 229, 0.473);
}
</style>
