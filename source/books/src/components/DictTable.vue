<template>
  <!-- 表格查询框与操作按钮 -->
  <el-row class="queryRow">
    <div class="queryParam">
      <el-select v-model="distQueryRef.type" class="m-2" placeholder="字典类型" clearable>
        <el-option v-for="item in distTypeOptions" :key="item.distKey" :label="item.distValue" :value="item.distKey" />
      </el-select>
    </div>

    <div class="queryParam">
      <el-input v-model="distQueryRef.distValue" placeholder="字典值" />
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

  <hr/>
  <!-- 表格主体数据列表 -->
  <div class="el-table-div">
    <el-table v-loading="loading" :data="distPageRef.pageData" stripe row-key="row" max-height="calc(100vh - 20rem)">
      <el-table-column type="index" label="序号" min-width="40" />
      <el-table-column prop="id" label="ID" v-if=false />
      <el-table-column prop="type" label="字典类型" :formatter="getDistTypeName" min-width="100" />
      <el-table-column prop="distKey" label="字典Key" v-if=false min-width="100"/>
      <el-table-column prop="distValue" label="字典值" min-width="100"/>
      <el-table-column prop="sort" label="排序" min-width="60"/>
      <el-table-column label="操作" width="120">
        <template v-slot="scop">
          <el-button type="primary" :icon="Edit" circle @click="openUpdateDialog(formTitle[1], scop.row)" />
          <el-button type="danger" :icon="Delete" circle @click="deleteById(scop.row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <hr/>
  <!-- 表格分页插件 -->
  <div class="pageDiv">
    <span class="pageSpan">
      <!-- {{ flowQuery }},{{ flowPageRef }} -->
      <el-pagination :current-page="distQueryRef.pageNum" :page-size="distQueryRef.pageSize" :total="distPageRef.totalCount"
        :page-sizes="[10, 20, 50, 100]" @size-change="pageSizeChange" @current-change="pageNumChange" background
        layout="->, total, sizes, prev, pager, next">
      </el-pagination>
    </span>
  </div>


  <!-- 弹出框表单：新增和修改通用 -->
  <el-dialog style="width:30vw;" v-model="dialogFormVisible" :title="dialgoFormTitle">

    <div class="el-dialog-main">
      <el-form ref="dialgoFormRef" :model="distRef" :rules="rules">

        <el-form-item label="字典类型" :label-width="formLabelWidth" prop="type">
          <el-select v-model="distRef.type" placeholder="选择" clearable :disabled="!(isCreate && isAbled)" :change="distTypeChange()" >
            <el-option v-for="item in distTypeOptions" :key="item.distKey" :label="item.distValue"
              :value="item.distKey" />
          </el-select>
        </el-form-item>

        <el-form-item label="字典key" :label-width="formLabelWidth" prop="distKey" v-show="false">
          <el-input v-model="distRef.distKey" :disabled="!(isCreate && isAbled)" />
        </el-form-item>

        <el-form-item label="字典值" :label-width="formLabelWidth" prop="distValue">
          <el-input v-model="distRef.distValue" :disabled="!(isCreate && isAbled)"/>
        </el-form-item>

        <el-form-item label="排序" :label-width="formLabelWidth" prop="sort">
          <el-input-number v-model="distRef.sort" :min="0" :disabled="!(isCreate && isAbled)"/>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(dialgoFormRef, false)">
          取消
        </el-button>
        <el-button type="primary" @click="confirmForm(dialgoFormRef, false)">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script setup lang="ts">
// 第三方库引入
import { ref, onMounted, reactive, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus'

// 私有引入
import { getDistByType, getDistPage, addDist, update, deleteDist } from '../api/api.dist'
import { getFlowPage } from '../api/api.flow'
import type { Page } from '../types/page';
import type { Dist, DistQuery } from '@/types/model/dist';
import type { FlowQuery } from '@/types/model/flow';

// 初始化后自动执行
onMounted(() => {
  doQuery();
  getDistByType('distType').then(data => {
    distTypeOptions.value = data;
  });
});

/*
 * 集中定义常量
 */
const distTypeOptions = ref<Dist[]>([]);

// 分页数据结果
const distPage: Page<Dist> = {
  pageNum: 1,
  pageSize: 0,
  totalPage: 1,
  totalCount: 0,
  totalMoney: 0,
  pageData: []
};

// 初始化空对象，用于新增、修改的弹出框数据绑定
const dist: Dist = {
  id: undefined,
  type: undefined,
  distKey: undefined,
  distValue: undefined,
  sort: undefined
};

const distQuery: DistQuery = {
  pageNum: 1,
  pageSize: 20,
  id: undefined,
  type: undefined,
  distKey: undefined,
  distValue: undefined,
}

const distQueryRef = ref(distQuery)

// 表单输入框校验规则
const rules = ref<FormRules>({
  type: [{ required: true, message: '请选择字典类型！', trigger: 'blur' },],
  distValue: [{ required: true, message: '请输入字典值！', trigger: 'blur' }]
});


const getDistTypeName = (value: Dist) => {
  var label: string | undefined;
  distTypeOptions.value.forEach(distType => {
    if (distType.distKey == value.type) {
      label =  distType.distValue 
      return;
    }
  })
  return label;
}

// 表单弹窗标题选项
const formTitle = [
  '新增字典',
  '修改字典'
];
/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true);
// 表单弹窗显示控制器
const dialogFormVisible = ref(false);
// 表单弹窗标题
const dialgoFormTitle = ref(formTitle[0]);
// 表单输入框宽度
const formLabelWidth = ref('100px');
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = '60px';
}
// 表单实例
const dialgoFormRef = ref<FormInstance>();
// 分页数据绑定
const distPageRef = ref(distPage);
// 表单弹窗数据绑定
const distRef = reactive(dist);

// 切换页码
const pageNumChange = (pageNum: number) => {
  distQueryRef.value.pageNum = pageNum;
  doQuery();
};

// 切换分页容量
const pageSizeChange = (pageSize: number) => {
  distQueryRef.value.pageSize = pageSize;
  doQuery();
};

// 执行分页数据查询
const doQuery = () => {
  getDistPage(distQueryRef.value).then(res => {
    distPageRef.value = res;
    // console.log(JSON.stringify(flowPage) + "doQuery");
    loading.value = false;
  });
};

// 提交表单（新增或修改）
const confirmForm = async (dialgoForm: FormInstance | undefined, closeDialog: boolean) => {
  if (!dialgoForm) return;
  if (! await dialgoForm.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
      return false;
    }
  })) {
    return;
  }
  if (formTitle[0] === dialgoFormTitle.value) {
    // 新增
    createOne();
  } else {
    // 修改
    updateOne();
  }
  resetForm(dialgoForm, closeDialog);
};

// 重置表单数据
const resetForm = (formEl: FormInstance | undefined, showDialog: boolean) => {
  if (!formEl) return;
  distRef.id = undefined;
  // flowRef.day = flowRef.day;
  distRef.type = undefined;
  distRef.distKey = undefined;
  distRef.distValue = undefined;
  distRef.sort = undefined;
  dialogFormVisible.value = showDialog;
};

// 创建
const createOne = () => {
  addDist({
    type: distRef.type,
    distKey: distRef.distValue,
    distValue: distRef.distValue,
    sort: distRef.sort
  }).then(res => {
    if (res.id) {
      doQuery();
      ElMessage({
        type: 'success',
        message: '新增成功!',
      })
      getDistByType('distType').then(data => {
        distTypeOptions.value = data;
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'error',
      message: '新增出现异常',
    })
  });
};

// 更新
const updateOne = () => {
  update(distRef.id || -1, {
    type: distRef.type,
    distKey: distRef.distKey,
    distValue: distRef.distValue,
    sort: distRef.sort
  }).then(res => {
    // console.log(res);
    if (res.id) {
      doQuery();
      ElMessage({
        type: 'success',
        message: '修改成功!',
      })
      getDistByType('distType').then(data => {
        distTypeOptions.value = data;
      });
    }
  }).catch(() => {
    ElMessage({
      type: 'error',
      message: '修改出现异常',
    })
  });
};

// 删除
const deleteById = (row: Dist) => {
  let query: FlowQuery= {
    pageNum: 1,
    pageSize: 1,
  }
  if (row.type == "expenseType") {
    query.type = row.distKey
  } else if (row.type == "paymentType") {
    query.payType = row.distKey
  }
  getFlowPage(query).then((res) => {
    if (res.totalCount > 0 ){
      ElMessageBox.alert (
        '此字典值存在相关流水，不可删除！',
        '提示',
        {
          confirmButtonText: '确定',
          type: 'warning',
        }
      )
    } else {
      ElMessageBox.confirm(
        '确定删除此字典值吗？',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        deleteDist(row.id || 0).then(() => {
          doQuery();
          ElMessage({
            type: 'success',
            message: '删除成功!',
          })
          getDistByType('distType').then(data => {
            distTypeOptions.value = data;
          });
        }).catch(() => {
          ElMessage({
            type: 'error',
            message: '删除失败',
          })
        });
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: '取消删除',
        })
      })
        }
      })
};

// 表单是否是修改表单
const isAbled = ref(false);
const isCreate = ref(false);
// 打开新增弹窗
const openCreateDialog = (title: string) => {
  dialgoFormTitle.value = title;
  dialogFormVisible.value = true;
  isCreate.value = true;

  distRef.id = undefined;
  distRef.type = undefined;
  distRef.distKey = undefined;
  distRef.distValue = undefined;
  distRef.sort = undefined;
}
// 打开修改弹窗
const openUpdateDialog = (title: string, updateDist: Dist) => {
  dialgoFormTitle.value = title;
  dialogFormVisible.value = true;
  isCreate.value = false; 

  distRef.id = updateDist.id;
  distRef.type = updateDist.type;
  distRef.distKey = updateDist.distKey;
  distRef.distValue = updateDist.distValue;
  distRef.sort = updateDist.sort;
};

const distTypeChange = () => {
  if (distRef.type == "distType") {
    isAbled.value = false;
  } else {
    isAbled.value = true;
  }
}

watch(distQueryRef.value, () => {
  doQuery();
});

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
