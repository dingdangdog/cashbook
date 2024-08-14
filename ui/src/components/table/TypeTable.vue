<template>
  <!-- 表格查询框与操作按钮 -->
  <el-row class="queryRow">
    <div class="queryParam">
      <el-input v-model="typeQueryRef.value" placeholder="类型名称" />
    </div>
    <div class="queryParam">
      <el-select v-model="typeQueryRef.type" class="m-2" placeholder="类型类型" clearable>
        <el-option
          v-for="item in typerOptions"
          :key="item.value"
          :label="item.value"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="queryParam">
      <el-button type="primary" @click="hisFlowTypeConvert">自动映射</el-button>
    </div>
  </el-row>

  <hr />
  <!-- 表格主体数据列表 -->
  <div class="el-table-div">
    <el-table
      v-loading="loading"
      :data="types"
      row-key="row"
      max-height="calc(100vh - 12rem)"
    >
      <el-table-column type="index" label="序号" min-width="40" />
      <el-table-column prop="flowType" label="所属流水类型" min-width="100" />
      <el-table-column prop="type" label="Type类型" min-width="100" />
      <el-table-column prop="value" label="Type名称" min-width="100" />
      <el-table-column label="操作" width="120">
        <template v-slot="scop">
          <el-button type="primary" :icon="Edit" circle @click="openUpdateDialog(scop.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <el-dialog style="width: 20vw" v-model="typeDialog.visible" :title="typeDialog.title">
    <div class="el-dialog-main">
      <el-form ref="typeFormRef" :model="editType" :rules="typeFormRules">
        <el-form-item label="关联流水类型" :label-width="formLabelWidth" prop="flowType">
          <el-input v-model="editType.flowType" disabled />
        </el-form-item>
        <el-form-item label="原类型名称" :label-width="formLabelWidth" prop="value">
          <el-input v-model="editType.oldValue" disabled />
        </el-form-item>
        <el-form-item label="新类型名称" :label-width="formLabelWidth" prop="value">
          <el-input v-model="editType.value" />
        </el-form-item>
        <el-form-item label="类型类型" :label-width="formLabelWidth" prop="type">
          <el-input v-model="editType.type" disabled />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="confirmTypeForm(typeFormRef)"> 确定 </el-button>
        <el-button @click="cancelEdit"> 取消 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'
import { onMounted, ref, watch } from 'vue'

import type { Typer } from '@/types/model/typer'
import { ElMessage, type FormInstance, type FormRules, ElLoading, ElMessageBox } from 'element-plus'
import { update, getAll } from '@/api/api.typer'
import { typeConvert } from '@/utils/flowConvert'

// 加载蒙版显示控制器
const loading = ref(true)
// 表单输入框宽度
const formLabelWidth = ref('100px')
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px'
}

const typerOptions = ref<Typer[]>([
  { value: '消费类型' },
  { value: '支付方式' }
])

// 列表数据绑定
const types = ref<Typer[]>([])

const typeQueryRef = ref<Typer>({
  value: ''
})

const editType = ref<Typer>({
  type: '',
  value: ''
})

const typeDialog = ref({
  visible: false,
  title: '类型改名'
})

// 表单输入框校验规则
const typeFormRules = ref<FormRules>({
  value: [{ required: true, message: '请输入类型新名称', trigger: 'blur' }]
})

// 账本编辑表单实例
const typeFormRef = ref<FormInstance>()

const openUpdateDialog = (row: Typer) => {
  editType.value.flowType = row.flowType
  editType.value.type = row.type
  editType.value.oldValue = row.value
  editType.value.value = ''
  typeDialog.value.visible = true
}
const confirmTypeForm = async (form: FormInstance | undefined) => {
  if (!form) return
  if (await form.validate()) {
    update(editType.value)
      .then((res) => {
        if (res > 0) {
          ElMessage.success('修改成功，同步修改' + res + '条流水数据')
        } else {
          ElMessage.error('修改失败')
        }
        typeDialog.value.visible = false
        doQuery()
      })
      .catch((err) => {
        ElMessage.error('修改失败')
        console.log(err)
      })
  } else {
    return false
  }
}
const cancelEdit = () => {
  typeDialog.value.visible = false
  typeFormRef.value?.resetFields()
}

const doQuery = () => {
  getAll(typeQueryRef.value).then((res) => {
    types.value = res
    loading.value = false
  }).catch((err) => {
    ElMessage.error('查询出错')
    console.log(err)
  })
}

onMounted(() => {
  doQuery()
})

watch(typeQueryRef.value, () => {
  doQuery()
})

const hisFlowTypeConvert = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  let doConvert: string = ''
  for (let i = 0; i < types.value.length; i++) {
    let t = types.value[i]
    if (t.type === '消费类型') {
      if (t.value !== typeConvert(t.value?.replace('-WX', ''))) {
        t.oldValue = t.value
        t.value = typeConvert(t.value?.replace('-WX', ''))
        doConvert += t.oldValue + '-->' + t.value
        await update(t).then((res) => {
          if (res > 0) {
            doConvert += ' success<br/>'
          } else {
            doConvert += ' fail<br/>'
          }
        })
      }
    }
  }
  ElMessageBox.alert(
    doConvert.length === 0 ? '没有类型需要转换' : doConvert,
    '转换结果',
    {
      confirmButtonText: 'OK',
      center: true,
      dangerouslyUseHTMLString: true
    }
  )
    .then(() => {
      loading.close()
      doQuery()
    })
    .catch(() => {
      loading.close()
      doQuery()
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
