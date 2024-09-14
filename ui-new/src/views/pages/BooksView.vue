<template>
  <div class="books-container">
    <!-- 表格查询框与操作按钮 -->
    <div class="main-inner-header">
      <div class="queryParam">
        <v-text-field
          label="账本名称"
          hide-details="auto"
          variant="outlined"
          v-model="booksQueryRef.bookName"
          clearable
        ></v-text-field>
      </div>
      <v-btn variant="elevated" class="btn-group-btn" color="success" @click="toAddBook()">
        新建账本
      </v-btn>
    </div>

    <hr />
    <!-- 表格主体数据列表 -->
    <div class="el-table-div">
      <v-data-table-virtual
        height="80vh"
        noDataText="暂无数据"
        hide-default-footer
        :items="books"
        :headers="headers"
        :loading="loading"
        @update:options="doQuery"
      >
        <template v-slot:top>
          <v-dialog v-model="deleteConfirmDialog" width="auto">
            <v-card>
              <v-card-title style="margin: 1rem">
                确定删除账本 【{{ deleteItem?.bookName }}】吗?
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="elevated" @click="cancelDelete">取消</v-btn>
                <v-btn color="error" variant="elevated" @click="confirmDelete">确定</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-icon class="btn-group-btn" color="success" @click="openUpdateDialog(item)">
            mdi-pencil
          </v-icon>
          <v-icon class="btn-group-btn" color="error" @click="toDelete(item)"> mdi-delete </v-icon>
        </template>
      </v-data-table-virtual>
    </div>

    <v-dialog width="25rem" v-model="addBookDialog.visible" :title="addBookDialog.title">
      <v-card>
        <v-card-title>{{ addBookDialog.title }}</v-card-title>
        <v-card-text>
          <v-text-field
            clearable
            label="账本名称"
            variant="outlined"
            v-model="editBook.bookName"
            required
          ></v-text-field>
          <v-text-field
            clearable
            label="创建时间"
            variant="outlined"
            v-model="editBook.createDate"
            disabled
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div style="text-align: center; width: 100%; margin-bottom: 1rem">
            <v-btn variant="elevated" class="btn-group-btn" @click="cancelEdit"> 取消 </v-btn>
            <v-btn
              variant="elevated"
              class="btn-group-btn"
              color="primary"
              @click="confirmBookForm()"
            >
              确定
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, watch } from 'vue'

// 私有引入
import { createBook, deleteBook, getBook, updateBook } from '@/api/api.book'
import type { BookQuery, Book } from '@/model/book'
import { checkUserAndBook } from '@/utils/common'
import { errorAlert, successAlert } from '@/utils/alert'

// 初始化后自动执行
onMounted(() => {
  doQuery()
})

const booksQueryRef = ref<BookQuery>({})

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

const allBooks = ref<Book[]>([])

const headers = ref([
  { title: 'ID', key: 'id' },
  { title: '账本名称', key: 'bookName' },
  { title: '创建时间', key: 'createDate' },
  { title: '操作', key: 'actions', sortable: false }
])

// 执行分页数据查询
const doQuery = () => {
  loading.value = true
  getBook(booksQueryRef.value.bookName || '')
    .then((res) => {
      if (res) {
        books.value = res
        allBooks.value = res
      }
    })
    .finally(() => {
      loading.value = false
    })
}

watch(booksQueryRef.value, () => {
  books.value = allBooks.value.filter((book) => {
    return book.bookName?.indexOf(booksQueryRef.value.bookName || '') !== -1
  })
})

const addBookDialog = ref({
  visible: false,
  title: '账本改名'
})

const toAddBook = () => {
  addBookDialog.value.visible = true
  addBookDialog.value.title = '创建账本'
}

const editBook = ref<Book>({})

const openUpdateDialog = (row: Book) => {
  editBook.value = row
  addBookDialog.value.visible = true
}
const confirmBookForm = () => {
  if (!editBook.value.bookName || editBook.value.bookName === '') {
    errorAlert('账本名称不能为空')
    return
  }

  if (addBookDialog.value.title === '创建账本') {
    createBook({ bookName: editBook.value.bookName })
      .then((_res) => {
        successAlert('账本创建成功')
        editBook.value = {}
        addBookDialog.value.visible = false
        doQuery()
      })
      .catch((err) => {
        console.log(err)
      })
  } else {
    updateBook(editBook.value)
      .then((_res) => {
        successAlert('修改成功')
        addBookDialog.value.visible = false
        doQuery()
      })
      .catch((err) => {
        errorAlert('修改失败')
        console.log(err)
      })
  }
}
const cancelEdit = () => {
  addBookDialog.value.visible = false
  editBook.value = {}
}

// 确认删除的一些逻辑
const deleteConfirmDialog = ref(false)
const deleteItem = ref<Book>()
const toDelete = (item: Book) => {
  deleteConfirmDialog.value = true
  deleteItem.value = item
}
const cancelDelete = () => {
  deleteConfirmDialog.value = false
  deleteItem.value = {}
}
const confirmDelete = () => {
  if (!deleteItem.value?.id) {
    errorAlert('请选择要删除的数据')
    return
  }
  deleteBook(deleteItem.value?.id)
    .then((res) => {
      successAlert(`删除[${res.bookName}]成功`)
      doQuery()
      deleteConfirmDialog.value = false
      checkUserAndBook()
    })
    .catch(() => {
      errorAlert('删除失败')
    })
}
</script>

<style>
.books-container {
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
}

.el-table {
  overflow-x: auto;
  overflow-y: auto;
}
</style>
