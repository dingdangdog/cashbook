<template>
  <!-- 表格查询框与操作按钮 -->
  <el-row class="queryRow">
    <div class="queryParam">
      <el-select v-model="dictQueryRef.type" class="m-2" placeholder="字典类型" clearable>
        <el-option
          v-for="item in dictTypeOptions"
          :key="item.dictKey"
          :label="item.dictValue"
          :value="item.dictKey"
        />
      </el-select>
    </div>

    <div class="queryParam">
      <el-input v-model="dictQueryRef.dictValue" placeholder="字典值" />
    </div>

    <!-- <div class="queryParam">
      <el-input v-model="flowQuery.description" placeholder="描述" />
    </div> -->

    <!-- <div class="queryParam query-icon">
      <el-button :icon="Search" circle @click="doQuery()" />
    </div> -->

    <div class="queryParam pc-button">
      <el-button type="primary" @click="openCreateDialog(formTitle[0])">新增</el-button>
    </div>
  </el-row>

  <hr />
  <!-- 表格主体数据列表 -->
  <div class="el-table-div">
    <el-table
      v-loading="loading"
      :data="dictPageRef.pageData"
      stripe
      row-key="row"
      max-height="calc(100vh - 20rem)"
    >
      <el-table-column type="index" label="序号" min-width="40" />
      <el-table-column prop="id" label="ID" v-if="false" />
      <el-table-column prop="type" label="字典类型" :formatter="getDictTypeName" min-width="100" />
      <el-table-column prop="dictKey" label="字典Key" v-if="false" min-width="100" />
      <el-table-column prop="dictValue" label="字典值" min-width="100" />
      <el-table-column prop="sort" label="排序" min-width="60" />
      <el-table-column label="操作" width="120">
        <template v-slot="scop">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="openUpdateDialog(formTitle[1], scop.row)"
          />
          <el-button type="danger" :icon="Delete" circle @click="deleteById(scop.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <hr />
  <!-- 表格分页插件 -->
  <div class="pageDiv">
    <span class="pageSpan">
      <!-- {{ flowQuery }},{{ flowPageRef }} -->
      <el-pagination
        :current-page="dictQueryRef.pageNum"
        :page-size="dictQueryRef.pageSize"
        :total="dictPageRef.totalCount"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="pageSizeChange"
        @current-change="pageNumChange"
        background
        layout="->, total, sizes, prev, pager, next"
      >
      </el-pagination>
    </span>
  </div>

  <!-- 弹出框表单：新增和修改通用 -->
  <el-dialog style="width: 30vw" v-model="dialogFormVisible" :title="dialgoFormTitle">
    <div class="el-dialog-main">
      <el-form ref="dialgoFormRef" :model="dictRef" :rules="rules">
        <el-form-item label="字典类型" :label-width="formLabelWidth" prop="type">
          <el-select
            v-model="dictRef.type"
            placeholder="选择"
            clearable
            :disabled="!(isCreate && isAbled)"
            :change="dictTypeChange()"
          >
            <el-option
              v-for="item in dictTypeOptions"
              :key="item.dictKey"
              :label="item.dictValue"
              :value="item.dictKey"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="字典key" :label-width="formLabelWidth" prop="dictKey" v-show="false">
          <el-input v-model="dictRef.dictKey" :disabled="!(isCreate && isAbled)" />
        </el-form-item>

        <el-form-item label="字典值" :label-width="formLabelWidth" prop="dictValue">
          <el-input v-model="dictRef.dictValue" :disabled="!(isCreate && isAbled)" />
        </el-form-item>

        <el-form-item label="排序" :label-width="formLabelWidth" prop="sort">
          <el-input-number v-model="dictRef.sort" :min="0" :disabled="!(isCreate && isAbled)" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(dialgoFormRef, false)"> 取消 </el-button>
        <el-button type="primary" @click="confirmForm(dialgoFormRef, false)"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, reactive, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 私有引入
import { getDictByType, getDictPage, addDict, update, deleteDict } from '@/api/api.dict'
import { getFlowPage } from '@/api/api.flow'
import type { Page } from '@/types/page'
import type { Dict, DictQuery } from '@/types/model/dict'
import type { FlowQuery } from '@/types/model/flow'

// 初始化后自动执行
onMounted(() => {
  doQuery()
  getDictByType('dictType').then((data) => {
    dictTypeOptions.value = data
  })
})

/*
 * 集中定义常量
 */
const dictTypeOptions = ref<Dict[]>([])

// 分页数据结果
const dictPage: Page<Dict> = {
  pageNum: 1,
  pageSize: 0,
  totalPage: 1,
  totalCount: 0,
  totalMoney: 0,
  pageData: []
}

// 初始化空对象，用于新增、修改的弹出框数据绑定
const dict: Dict = {
  id: undefined,
  type: undefined,
  dictKey: undefined,
  dictValue: undefined,
  sort: undefined
}

const dictQuery: DictQuery = {
  pageNum: 1,
  pageSize: 20,
  id: undefined,
  type: undefined,
  dictKey: undefined,
  dictValue: undefined
}

const dictQueryRef = ref(dictQuery)

// 表单输入框校验规则
const rules = ref<FormRules>({
  type: [{ required: true, message: '请选择字典类型！', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典值！', trigger: 'blur' }]
})

const getDictTypeName = (value: Dict) => {
  var label: string | undefined
  dictTypeOptions.value.forEach((dictType) => {
    if (dictType.dictKey == value.type) {
      label = dictType.dictValue
      return
    }
  })
  return label
}

// 表单弹窗标题选项
const formTitle = ['新增字典', '修改字典']
/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true)
// 表单弹窗显示控制器
const dialogFormVisible = ref(false)
// 表单弹窗标题
const dialgoFormTitle = ref(formTitle[0])
// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}
// 表单实例
const dialgoFormRef = ref<FormInstance>()
// 分页数据绑定
const dictPageRef = ref(dictPage)
// 表单弹窗数据绑定
const dictRef = reactive(dict)

// 切换页码
const pageNumChange = (pageNum: number) => {
  dictQueryRef.value.pageNum = pageNum
  doQuery()
}

// 切换分页容量
const pageSizeChange = (pageSize: number) => {
  dictQueryRef.value.pageSize = pageSize
  doQuery()
}

// 执行分页数据查询
const doQuery = () => {
  getDictPage(dictQueryRef.value).then((res) => {
    dictPageRef.value = res
    // console.log(JSON.stringify(flowPage) + "doQuery");
    loading.value = false
  })
}

// 提交表单（新增或修改）
const confirmForm = async (dialgoForm: FormInstance | undefined, closeDialog: boolean) => {
  if (!dialgoForm) return
  if (
    !(await dialgoForm.validate((valid, fields) => {
      if (valid) {
        console.log('submit!')
      } else {
        console.log('error submit!', fields)
        return false
      }
    }))
  ) {
    return
  }
  if (formTitle[0] === dialgoFormTitle.value) {
    // 新增
    createOne()
  } else {
    // 修改
    updateOne()
  }
  resetForm(dialgoForm, closeDialog)
}

// 重置表单数据
const resetForm = (formEl: FormInstance | undefined, showDialog: boolean) => {
  if (!formEl) return
  dictRef.id = undefined
  // flowRef.day = flowRef.day;
  dictRef.type = undefined
  dictRef.dictKey = undefined
  dictRef.dictValue = undefined
  dictRef.sort = undefined
  dialogFormVisible.value = showDialog
}

// 创建
const createOne = () => {
  addDict({
    type: dictRef.type,
    dictKey: dictRef.dictValue,
    dictValue: dictRef.dictValue,
    sort: dictRef.sort
  })
    .then((res) => {
      if (res.id) {
        doQuery()
        ElMessage({
          type: 'success',
          message: '新增成功!'
        })
        getDictByType('dictType').then((data) => {
          dictTypeOptions.value = data
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '新增出现异常'
      })
    })
}

// 更新
const updateOne = () => {
  update(dictRef.id || -1, {
    type: dictRef.type,
    dictKey: dictRef.dictKey,
    dictValue: dictRef.dictValue,
    sort: dictRef.sort
  })
    .then((res) => {
      // console.log(res);
      if (res.id) {
        doQuery()
        ElMessage({
          type: 'success',
          message: '修改成功!'
        })
        getDictByType('dictType').then((data) => {
          dictTypeOptions.value = data
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '修改出现异常'
      })
    })
}

// 删除
const deleteById = (row: Dict) => {
  let query: FlowQuery = {
    pageNum: 1,
    pageSize: 1
  }
  if (row.type == 'expenseType') {
    query.type = row.dictKey
  } else if (row.type == 'paymentType') {
    query.payType = row.dictKey
  }
  getFlowPage(query).then((res) => {
    if (res.totalCount > 0) {
      ElMessageBox.alert('此字典值存在相关流水，不可删除！', '提示', {
        confirmButtonText: '确定',
        type: 'warning'
      })
    } else {
      ElMessageBox.confirm('确定删除此字典值吗？', '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteDict(row.id || 0)
            .then(() => {
              doQuery()
              ElMessage({
                type: 'success',
                message: '删除成功!'
              })
              getDictByType('dictType').then((data) => {
                dictTypeOptions.value = data
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
  })
}

// 表单是否是修改表单
const isAbled = ref(false)
const isCreate = ref(false)
// 打开新增弹窗
const openCreateDialog = (title: string) => {
  dialgoFormTitle.value = title
  dialogFormVisible.value = true
  isCreate.value = true

  dictRef.id = undefined
  dictRef.type = undefined
  dictRef.dictKey = undefined
  dictRef.dictValue = undefined
  dictRef.sort = undefined
}
// 打开修改弹窗
const openUpdateDialog = (title: string, updateDict: Dict) => {
  dialgoFormTitle.value = title
  dialogFormVisible.value = true
  isCreate.value = false

  dictRef.id = updateDict.id
  dictRef.type = updateDict.type
  dictRef.dictKey = updateDict.dictKey
  dictRef.dictValue = updateDict.dictValue
  dictRef.sort = updateDict.sort
}

const dictTypeChange = () => {
  if (dictRef.type == 'dictType') {
    isAbled.value = false
  } else {
    isAbled.value = true
  }
}

watch(dictQueryRef.value, () => {
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
