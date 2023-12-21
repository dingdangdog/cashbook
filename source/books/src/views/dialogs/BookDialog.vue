<template>
  <div class="el-dialog-main">
    <div class="book-cards common-center">
      <el-card
        v-for="book in books"
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
  <el-dialog style="width: 30vw" v-model="addBookDialog.visable" :title="addBookDialog.title">
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

import { createBook, getBook, openBookApi } from '@/api/api.book'
import { showBookDialogFlag } from '@/stores/flag'

import router from '@/router/index'

onMounted(() => {
  initBooks()
})

const books = ref<Book[]>([])

const initBooks = () => {
  getBook()
    .then((res) => {
      books.value = res
    })
    .catch((err) => {
      console.log(err)
    })
}

const openBook = async (book: Book) => {
  if (localStorage.getItem('bookId') === book.id.toString()) {
    showBookDialogFlag.value.visible = false
    return
  }
  localStorage.setItem('bookId', book.id.toString())
  localStorage.setItem('bookName', book.bookName)
  openBookApi().then((res) => {
    ElMessage.success(res)
  })
  // close book dialog
  showBookDialogFlag.value.visible = false
  // window.location.href = "/index"
  router.push({ path: '/index' })
}

// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

const addBookDialog = ref({
  visable: false,
  title: '添加账本'
})

const addBook = () => {
  addBookDialog.value.visable = true
}

const newBook = ref<Book>({
  id: 0,
  bookName: '',
  userId: 0,
  createDate: ''
})
// 额度设置表单实例
const bookFormRef = ref<FormInstance>()

// 表单输入框校验规则
const bookFormRules = ref<FormRules>({
  bookName: [{ required: true, message: '请输入账本名称', trigger: 'blur' }]
})

const confirmBookForm = async (form: FormInstance | undefined) => {
  if (!form) return
  if (await form.validate()) {
    createBook({ bookName: newBook.value.bookName })
      .then((res) => {
        ElMessage.success('添加成功')
        addBookDialog.value.visable = false
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
    return 'book-card book-card-selected'
  } else {
    return 'book-card'
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
