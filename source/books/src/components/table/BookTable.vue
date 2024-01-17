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
    <el-table
      v-loading="loading"
      :data="books"
      row-key="row"
      max-height="calc(100vh - 12rem)"
    >
      <!--      <el-table-column type="index" label="序号" min-width="40" />-->
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="bookName" label="账本名称" min-width="100" />
      <el-table-column prop="createDate" label="创建时间" min-width="100" />
      <el-table-column label="操作" width="120">
        <template v-slot="scop">
          <el-button type="primary" :icon="Edit" circle @click="openUpdateDialog(scop.row)" />
          <el-button type="danger" :icon="Delete" circle @click="deleteById(scop.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog style="width: 20vw" v-model="addBookDialog.visible" :title="addBookDialog.title">
    <div class="el-dialog-main">
      <el-form ref="bookFormRef" :model="editBook" :rules="bookFormRules">
        <el-form-item label="账本名称" :label-width="formLabelWidth" prop="bookName">
          <el-input v-model="editBook.bookName" />
        </el-form-item>
        <el-form-item label="创建时间" :label-width="formLabelWidth" prop="createDate">
          <el-input v-model="editBook.createDate" disabled />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="confirmBookForm(bookFormRef)"> 确定 </el-button>
        <el-button @click="cancelEdit"> 取消 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, watch } from 'vue'
import { Delete, Edit } from '@element-plus/icons-vue'

// 私有引入
import { deleteBook, getBook, updateBook } from '@/api/api.book'
import type { BookQuery, Book } from '@/types/model/book'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// 初始化后自动执行
onMounted(() => {
  doQuery()
})

const booksQuery: BookQuery = {
  id: undefined,
  bookName: '',
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
  getBook(booksQueryRef.value.bookName).then((res) => {
    // console.log(res)
    books.value = res
    loading.value = false
  })
}

watch(booksQueryRef.value, () => {
  doQuery()
})

const addBookDialog = ref({
  visible: false,
  title: '账本改名'
})

// 表单输入框校验规则
const bookFormRules = ref<FormRules>({
  bookName: [{ required: true, message: '请输入账本名称', trigger: 'blur' }]
})

// 账本编辑表单实例
const bookFormRef = ref<FormInstance>()

const editBook = ref<Book>({
  id: 0,
  bookName: '',
  userId: 0,
  createDate: ''
})

const openUpdateDialog = (row: Book) => {
  editBook.value = row
  addBookDialog.value.visible = true
}
const confirmBookForm = async (form: FormInstance | undefined) => {
  if (!form) return
  if (await form.validate()) {
    updateBook(editBook.value)
      .then((_res) => {
        ElMessage.success('修改成功')
        addBookDialog.value.visible = false
        doQuery()
      })
      .catch((err) => {
        ElMessage.success('修改失败')
        console.log(err)
      })
  } else {
    return false
  }
}
const cancelEdit = () => {
  addBookDialog.value.visible = false
  bookFormRef.value?.resetFields()
}

const deleteById = (row: Book) => {
  ElMessageBox.confirm('确定删除此账本？删除后无法找回！', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteBook(row.id)
        .then(() => {
          doQuery()
          ElMessage({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(() => {
          ElMessage({
            type: 'error',
            message: '删除失败'
          })
        })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除'
      })
    })
}
</script>

<style scoped>
.queryRow .queryParam {
  margin: 8px 3px;
  display: flex; /* 设置body为flex布局 */
  justify-content: center; /* 横向居中 */
  align-items: center; /* 纵向居中 */
}

.el-table {
  overflow-x: auto;
  overflow-y: auto;
}
</style>
