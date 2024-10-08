<template>
  <v-dialog
    v-model="showBookDialogFlag.visible"
    width="40rem"
    transition="dialog-top-transition"
    persistent
  >
    <v-card>
      <v-card-title>打开账本</v-card-title>
      <v-card-text>
        <v-chip
          v-for="book in books"
          :key="book.id"
          class="book-card"
          :class="checkSelectBook(book.id || '')"
          @click="openBook(book)"
          :title="book.bookName"
        >
          {{ book.bookName }}
        </v-chip>
      </v-card-text>
      <hr />
      <v-card-actions>
        <div style="text-align: center; width: 100%">
          <v-btn color="warning" class="btn-group-btn" variant="outlined" @click="cancelChange"
            >取消</v-btn
          >
          <v-btn color="success" class="btn-group-btn" variant="outlined" @click="addBook"
            >新建账本</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog width="25rem" v-model="addBookDialog.visible" scrim="rgba(0,0,0,0)">
    <v-card>
      <v-card-title>{{ addBookDialog.title }}</v-card-title>
      <v-card-text>
        <v-text-field
          label="账本名称"
          v-model="newBook.bookName"
          clearable
          hide-details="auto"
          variant="outlined"
          :rules="[required]"
          required
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <div style="text-align: center; width: 100%; margin-bottom: 1rem">
          <span class="btn-group-btn">
            <v-btn variant="elevated" color="primary" @click="confirmBookForm()"> 确定 </v-btn>
          </span>
          <span class="btn-group-btn">
            <v-btn variant="elevated" @click="addBookDialog.visible = false"> 取消 </v-btn>
          </span>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Book } from '@/model/book'

import { createBook, getBook, openBookApi } from '@/api/api.book'
import { showBookDialogFlag } from '@/stores/flag'
import { errorAlert, successAlert } from '@/utils/alert'

const books = ref<Book[]>([])

const initBooks = () => {
  getBook('')
    .then((res) => {
      books.value = res
    })
    .catch((err) => {
      console.log(err)
    })
}

initBooks()

const openBook = (book: Book) => {
  if (localStorage.getItem('bookId') === String(book.id)) {
    showBookDialogFlag.value.visible = false
    return
  }
  openBookApi()
    .then((res) => {
      localStorage.setItem('bookId', String(book.id))
      localStorage.setItem('bookName', book.bookName || '')
      successAlert(book.bookName + res + '，即将刷新')
      showBookDialogFlag.value.visible = false
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    })
    .catch((err) => {
      errorAlert(err)
    })
  // close book dialog
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

const cancelChange = () => {
  if (localStorage.getItem('bookId')) {
    showBookDialogFlag.value.visible = false
  } else {
    errorAlert('必须选择一个账本打开')
  }
}

const addBook = () => {
  addBookDialog.value.visible = true
}
const required = (v: any) => {
  return !!v || '必填'
}

const newBook = ref<Book>({
  id: 0,
  bookName: '',
  userId: 0,
  createDate: ''
})

const confirmBookForm = () => {
  if (!newBook.value.bookName) {
    return
  }
  createBook({ bookName: newBook.value.bookName })
    .then((_res) => {
      successAlert('账本添加成功')
      newBook.value.bookName = ''
      addBookDialog.value.visible = false
      initBooks()
    })
    .catch((err) => {
      console.log(err)
    })
}

const checkSelectBook = (bookId: string | number) => {
  return localStorage.getItem('bookId') === bookId.toString() ? 'book-card-selected' : ''
}
</script>

<style scoped>
.book-card-selected {
  background-color: rgba(18, 255, 0, 0.1);
}

.book-card {
  max-width: 10rem;
  margin: 0.5rem;
  padding: 1rem 2rem !important;
  text-overflow: ellipsis;
}

.book-card:hover {
  cursor: pointer;
  background-color: rgba(115, 204, 229, 0.473);
}
</style>
