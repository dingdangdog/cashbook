<template>
  <!-- 表格查询框与操作按钮 -->
  <el-row class="queryRow">
    <div class="queryParam pc-button">
      <el-button type="primary" @click="dialogUpdateVisible = true">导入</el-button>
    </div>
    <div class="queryParam pc-button">
      <el-button type="success" @click="exportFlows()">导出</el-button>
    </div>
    
    <!-- <div class="queryParam pc-button">
      <el-button type="primary"  @click="excelImportVisible = true">Excel导入</el-button>
    </div> -->

    <div class="queryParam">
      <el-date-picker
        :style="datePickerStyle"
        class="date-picker"
        v-model="flowQuery.startDay"
        type="date"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        placeholder="开始时间"
      />
    </div>
    <div class="queryParam">
      <el-date-picker
        :style="datePickerStyle"
        class="date-picker"
        v-model="flowQuery.endDay"
        type="date"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        placeholder="结束时间"
      />
    </div>
    <div class="queryParam">
      <el-select v-model="flowQuery.type" class="m-2" placeholder="消费类型" clearable>
        <el-option
          v-for="item in expenseTypeOptions"
          :key="item.dictKey"
          :label="item.dictValue"
          :value="item.dictKey"
        />
      </el-select>
    </div>

    <div class="queryParam">
      <el-select v-model="flowQuery.payType" class="m-2" placeholder="支付方式" clearable>
        <el-option
          v-for="item in paymentTypeOptions"
          :key="item.dictKey"
          :label="item.dictValue"
          :value="item.dictKey"
        />
      </el-select>
    </div>

    <div class="queryParam">
      <el-input v-model="flowQuery.name" placeholder="名称" />
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
      :data="flowPageRef.pageData"
      :default-sort="{ prop: 'money', order: 'null' }"
      @sort-change="moneySortFunc"
      stripe
      row-key="row"
      max-height="calc(100vh - 20rem)"
    >
      <el-table-column type="index" label="序号" min-width="40" />
      <el-table-column prop="id" label="ID" v-if="false" />
      <el-table-column prop="day" label="日期" :formatter="timeFormatter" min-width="100" />
      <el-table-column prop="type" label="消费类型" min-width="80" />
      <el-table-column prop="money" label="金额（元）" min-width="80" sortable="custom" />
      <el-table-column prop="payType" label="支付方式" min-width="80" />
      <el-table-column prop="name" label="名称" min-width="100" />
      <el-table-column prop="description" label="描述" v-if="deviceAgent() === 'pc'" />
      <el-table-column label="操作" width="150">
        <template v-slot="scop">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="openUpdateDialog(formTitle[1], scop.row)"
          />
          <el-button type="danger" :icon="Delete" circle @click="deleteById(scop.row.id)" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <hr />
  <!-- 表格分页插件 -->
  <div class="pageDiv">
    <span class="pageSpan">
      <b style="float: left">消费总额：{{ Number(flowPageRef.totalMoney.toFixed(2)) }}</b>
      <!-- {{ flowQuery }},{{ flowPageRef }} -->
      <el-pagination
        :current-page="flowQuery.pageNum"
        :page-size="flowQuery.pageSize"
        :total="flowPageRef.totalCount"
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
  <el-dialog v-model="dialogFormVisible" :title="dialgoFormTitle" :fullscreen="miniScreen">
    <div class="el-dialog-main">
      <el-form ref="dialgoFormRef" :model="flowRef" :rules="rules">
        <el-form-item label="日期" :label-width="formLabelWidth" prop="day">
          <el-date-picker
            v-model="flowRef.day"
            type="date"
            format="YYYY/MM/DD"
            :default-value="new Date(flowRef.day || new Date())"
            value-format="YYYY-MM-DD"
            placeholder="选择"
          >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="消费类型" :label-width="formLabelWidth" prop="type">
          <el-select v-model="flowRef.type" placeholder="选择" clearable>
            <el-option
              v-for="item in expenseTypeOptions"
              :key="item.dictKey"
              :label="item.dictValue"
              :value="item.dictKey"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="金额" :label-width="formLabelWidth" prop="money">
          <el-input-number v-model="flowRef.money" :min="0" />
        </el-form-item>

        <el-form-item label="支付方式" :label-width="formLabelWidth" prop="payType">
          <el-select v-model="flowRef.payType" placeholder="选择" clearable>
            <el-option
              v-for="item in paymentTypeOptions"
              :key="item.dictKey"
              :label="item.dictValue"
              :value="item.dictKey"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="flowRef.name" />
        </el-form-item>

        <el-form-item label="描述" :label-width="formLabelWidth" prop="description" textarea>
          <el-input v-model="flowRef.description" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(dialgoFormRef, false)"> 取消 </el-button>
        <el-button type="primary" @click="confirmForm(dialgoFormRef, false)"> 确定 </el-button>
        <el-button
          type="success"
          v-if="formTitle[0] === dialgoFormTitle"
          @click="confirmForm(dialgoFormRef, true)"
        >
          确定并继续
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 文件导入窗口 -->
  <el-dialog v-model="dialogUpdateVisible" title="文件上传" :fullscreen="miniScreen">
    <!-- <el-upload submit="submitExcel()" :auto-upload="false">
      <el-button type="primary">导入Excel文件</el-button>
      <template #tip>
        <div class="el-upload__tip">
          仅支持上传excel文件
        </div>
      </template>
    </el-upload> -->

    <div class="el-dialog-main">
      <el-radio-group v-model="importFlag" class="ml-4">
        <el-radio label="overwrite" size="large"><b style="color: red">删除原有流水</b></el-radio>
        <el-radio label="add" size="large"><b>保留原有流水</b></el-radio>
      </el-radio-group>
      <hr />
      <el-upload :auto-upload="false" :on-change="readJsonInfo" v-model:file-list="fileList">
        <el-button type="primary">导入Json文件</el-button>
        <template #tip>
          <div class="el-upload__tip">仅支持上传Json文件</div>
        </template>
      </el-upload>
    </div>
  </el-dialog>

  <el-dialog v-model="excelImportVisible" title="Excel导入流水" :fullscreen="miniScreen">
    <FlowExcelImport />
  </el-dialog>
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, reactive, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadUserFile } from 'element-plus'

// 私有引入
import { getFlowPage, deleteFlow, createFlow, update, getAll, importFlows } from '@/api/api.flow'
import { getDictByType } from '@/api/api.dict'
import { dateFormater, deviceAgent, timeFormatter } from '@/utils/common'
import { exportJson } from '@/utils/fileUtils'
import { flowQuery } from '@/utils/store'
import type { Page } from '@/types/page'
import type { Flow } from '@/types/model/flow'
import type { Dict } from '@/types/model/dict'

import { defineAsyncComponent } from 'vue'
// 异步组件引用
const FlowExcelImport = defineAsyncComponent(() => import('@/components/dialog/FlowExcelImport.vue'))

// 初始化后自动执行
onMounted(() => {
  doQuery()
  getDictByType('expenseType').then((data) => {
    expenseTypeOptions.value = data
  })
  getDictByType('paymentType').then((data) => {
    paymentTypeOptions.value = data
  })
})

const miniScreen = ref(false)
if (document.body.clientWidth <= 480) {
  miniScreen.value = true
}

const datePickerStyle = ref('')

if (document.body.clientWidth <= 480) {
  datePickerStyle.value = 'width: auto'
}

// const tableRef = ref();
// tableRef.value.height = document.documentElement.clientHeight * 0.65;

// const tableRef = ref({
//   'height': document.documentElement.clientHeight * 0.63
// });

// if (document.body.clientWidth <= 480) {
//   tableRef.value.height = document.documentElement.clientHeight * 0.7;
// }

/*
 * 集中定义常量
 */
const expenseTypeOptions = ref<Dict[]>([])

const paymentTypeOptions = ref<Dict[]>([])

// 分页数据结果
const flowPage: Page<Flow> = {
  pageNum: 1,
  pageSize: 0,
  totalPage: 1,
  totalCount: 0,
  totalMoney: 0,
  pageData: []
}

// 初始化空对象，用于新增、修改的弹出框数据绑定
const flow: Flow = {
  id: undefined,
  day: undefined,
  type: undefined,
  payType: undefined,
  money: undefined,
  name: undefined,
  description: undefined
}

// 表单输入框校验规则
const rules = ref<FormRules>({
  day: [{ required: true, type: 'date', message: '请选择日期！', trigger: 'blur' }],
  type: [{ required: true, message: '请选择消费类型！', trigger: 'blur' }],
  money: [{ required: true, message: '请输入金额！', trigger: 'blur' }],
  payType: [{ required: true, message: '请选择支付方式！', trigger: 'blur' }]
})

// 表单弹窗标题选项
const formTitle = ['新增流水', '修改流水']
/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true)
// 表单弹窗显示控制器
const dialogFormVisible = ref(false)
// 导入弹窗显示控制器
const dialogUpdateVisible = ref(false)
// 导入弹窗显示控制器
const excelImportVisible = ref(false)
// 表单弹窗标题
const dialgoFormTitle = ref(formTitle[0])
// 表单输入框宽度
const formLabelWidth = ref('200px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '100px'
}
// 表单实例
const dialgoFormRef = ref<FormInstance>()
// 分页数据绑定
const flowPageRef = ref(flowPage)
// 表单弹窗数据绑定
const flowRef = reactive(flow)

// 切换页码
const pageNumChange = (pageNum: number) => {
  flowQuery.pageNum = pageNum
  doQuery()
}

// 切换分页容量
const pageSizeChange = (pageSize: number) => {
  flowQuery.pageSize = pageSize
  doQuery()
}

// 执行分页数据查询
const doQuery = () => {
  getFlowPage(flowQuery).then((res) => {
    flowPageRef.value = res
    // console.log(JSON.stringify(flowPage) + "doQuery");
    loading.value = false
  })
}

// 金额排序
const moneySortFunc = (obj: any) => {
  console.log(obj)
  if (obj.order === 'ascending') {
    flowQuery.moneySort = 'ASC'
  } else if (obj.order === 'descending') {
    flowQuery.moneySort = 'DESC'
  } else {
    flowQuery.moneySort = ''
  }
  doQuery()
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
  flowRef.id = undefined
  // flowRef.day = flowRef.day;
  flowRef.type = undefined
  flowRef.payType = undefined
  flowRef.money = undefined
  flowRef.name = undefined
  flowRef.description = undefined
  dialogFormVisible.value = showDialog
}

// 创建
const createOne = () => {
  createFlow({
    day: dateFormater('YYYY-MM-dd', flowRef.day || new Date()),
    type: flowRef.type,
    money: flowRef.money,
    payType: flowRef.payType,
    name: flowRef.name,
    description: flowRef.description
  })
    .then((res) => {
      if (res.id) {
        doQuery()
        ElMessage({
          type: 'success',
          message: '新增成功!'
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
  update(flowRef.id || -1, {
    day: dateFormater('YYYY-MM-dd', flowRef.day || new Date()),
    type: flowRef.type,
    money: flowRef.money,
    payType: flowRef.payType,
    name: flowRef.name,
    description: flowRef.description
  })
    .then((res) => {
      // console.log(res);
      if (res.id) {
        doQuery()
        ElMessage({
          type: 'success',
          message: '更新成功!'
        })
      }
    })
    .catch(() => {
      ElMessage({
        type: 'error',
        message: '更新出现异常'
      })
    })
}

// 删除
const deleteById = (id: number) => {
  ElMessageBox.confirm('确定删除此流水？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      deleteFlow(id)
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

// 打开新增弹窗
const openCreateDialog = (title: string) => {
  dialgoFormTitle.value = title
  dialogFormVisible.value = true
}
// 打开修改弹窗
const openUpdateDialog = (title: string, updateFlow: Flow) => {
  dialgoFormTitle.value = title
  dialogFormVisible.value = true

  flowRef.id = updateFlow.id
  flowRef.day = updateFlow.day
  flowRef.type = updateFlow.type
  flowRef.payType = updateFlow.payType
  flowRef.money = updateFlow.money
  flowRef.name = updateFlow.name
  flowRef.description = updateFlow.description
}

/**
 * 文件上传相关代码
 */
const importFlag = ref('overwrite')

const fileList = ref<UploadUserFile[]>([])

const importFlowList: any = []
// 读取json文件并导入
const readJsonInfo = (flie: UploadFile) => {
  flie.raw?.text().then((data) => {
    const jsonFlows: Flow[] = JSON.parse(data)
    jsonFlows.forEach((flow) => {
      // 数据转换
      importFlowList.push({
        id: flow.id,
        day: flow.day,
        type: flow.type,
        bookId: parseInt(bookId || '0'),
        payType: flow.payType,
        money: flow.money,
        name: flow.name,
        description: flow.description
      })
    })
    // 调用导入接口
    importFlows(importFlag.value, importFlowList)
      .then(() => {
        ElMessageBox.alert('', '导入成功', {
          confirmButtonText: '确定',
          callback: () => {
            location.reload()
          }
        })
      })
      .catch(() => {
        ElMessage.error('导入失败，请重试！')
      })
    //console.log(importFlowList);
  })
}

const bookName = localStorage.getItem('bookName')
const bookId = localStorage.getItem('bookId')
// 导出方法(前台导出，后台负责要导出的查询数据)
const exportFlows = () => {
  getAll(flowQuery)
    .then((data) => {
      const fileName = bookName + '-' + new Date().getTime() + '.json'
      exportJson(fileName, JSON.stringify(data))
    })
    .catch(() => {
      ElMessage.error('数据获取出错，无法导出！')
    })
}

watch(flowQuery, () => {
  doQuery()
})
</script>

<style scoped>
.queryRow .queryParam {
  margin: 0.5rem 0.5rem;
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
