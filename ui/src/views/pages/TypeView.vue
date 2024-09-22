<template>
  <div class="type-container">
    <v-navigation-drawer v-model="searchDrawer" temporary location="right">
      <div style="padding: 0.5rem">
        <div class="queryParam">
          <v-autocomplete
            label="类型的类型"
            hide-details="auto"
            variant="outlined"
            v-model="typeQueryRef.type"
            :items="typerOptions"
            clearable
          >
          </v-autocomplete>
        </div>
        <div class="queryParam">
          <v-text-field
            clearable
            label="类型名称"
            hide-details="auto"
            variant="outlined"
            v-model="typeQueryRef.value"
          ></v-text-field>
        </div>
        <!-- <v-btn class="btn-group-btn" color="primary" @click="doQuery">筛选</v-btn> -->
      </div>
    </v-navigation-drawer>
    <!-- 表格查询框与操作按钮 -->
    <div class="main-inner-header">
      <!-- 点击自动映射会发生什么？会将现有的流水数据中的`消费类型`按照`自动映射配置`的设置关系进行自动转换。 -->
      <v-btn class="btn-group-btn" color="success" @click="showConfig">分类映射配置</v-btn>
      <v-btn class="btn-group-btn" color="error" @click="hisFlowTypeConvert()">历史数据映射 </v-btn>
      <v-btn class="btn-group-btn" color="primary" @click="searchDrawer = true">筛选</v-btn>
    </div>

    <hr />
    <!-- 表格主体数据列表 -->
    <div class="v-table-div">
      <v-data-table-virtual
        height="80vh"
        noDataText="暂无数据"
        hide-default-footer
        :items="types"
        :headers="headers"
        :loading="loading"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-icon class="btn-group-btn" color="success" @click="openUpdateDialog(item)">
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table-virtual>
    </div>

    <v-dialog
      width="25rem"
      v-model="typeDialog.visible"
      :title="typeDialog.title"
      :fullscreen="DialogFullscreen"
    >
      <v-card>
        <v-card-title>{{ typeDialog.title }}</v-card-title>
        <p style="margin: 0.5rem 1rem; font-size: 0.9rem; color: pink">
          修改类型名称会自动修改关联的所有流水
        </p>
        <v-card-text>
          <v-text-field
            clearable
            label="流水类型"
            variant="outlined"
            v-model="editType.flowType"
            disabled
          ></v-text-field>
          <v-text-field
            clearable
            label="类型的类型"
            variant="outlined"
            v-model="editType.type"
            disabled
          ></v-text-field>
          <v-text-field
            clearable
            label="原类型名称"
            variant="outlined"
            v-model="editType.oldValue"
            disabled
          ></v-text-field>
          <v-text-field
            clearable
            focused
            label="新类型名称"
            variant="outlined"
            v-model="editType.value"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <div style="text-align: center; width: 100%; margin-bottom: 1rem">
            <v-btn class="btn-group-btn" color="warning" @click="cancelEdit"> 取消 </v-btn>
            <v-btn
              class="btn-group-btn"
              color="primary"
              variant="elevated"
              @click="confirmTypeForm()"
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
import { onMounted, ref, watch } from 'vue'

import type { Typer } from '@/model/typer'
import { update, getAll } from '@/api/api.typer'
import { typeConvert } from '@/utils/flowConvert'
import { errorAlert, infoAlert, successAlert } from '@/utils/alert'
import { DialogFullscreen, showSetConvertDialog } from '@/stores/flag'

// 加载蒙版显示控制器
const searchDrawer = ref(false)
const loading = ref(true)
const typerOptions = ref<string[]>(['消费类型', '支付方式'])

const headers = ref([
  { title: '所属流水类型', key: 'flowType' },
  { title: '类型的类型', key: 'type' },
  { title: '类型的名称', key: 'value' },
  { title: '操作', key: 'actions' }
])
// 列表数据绑定
const types = ref<Typer[]>([])
const allTypes = ref<Typer[]>([])

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

// 账本编辑表单实例
const openUpdateDialog = (row: Typer) => {
  editType.value.flowType = row.flowType
  editType.value.type = row.type
  editType.value.oldValue = row.value
  editType.value.value = ''
  typeDialog.value.visible = true
}
const confirmTypeForm = () => {
  if (!editType.value.value) return
  update(editType.value)
    .then((res) => {
      if (res > 0) {
        successAlert('修改成功，同步修改' + res + '条流水数据')
      } else {
        errorAlert('修改失败')
      }
      typeDialog.value.visible = false
      doQuery()
    })
    .catch((err) => {
      errorAlert('修改失败')
      console.log(err)
    })
}
const cancelEdit = () => {
  typeDialog.value.visible = false
}

const doQuery = () => {
  loading.value = true
  getAll(typeQueryRef.value)
    .then((res) => {
      if (res) {
        successAlert('查询成功')
        types.value = res
        allTypes.value = res
      }
    })
    .catch((err) => {
      errorAlert('查询出错')
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  doQuery()
})

watch(typeQueryRef.value, () => {
  types.value = allTypes.value.filter((type) => {
    return (
      type.type?.indexOf(typeQueryRef.value.type || '') !== -1 &&
      type.value?.indexOf(typeQueryRef.value.value || '') !== -1
    )
  })
})

const hisFlowTypeConvert = async () => {
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
  if (doConvert.length === 0) {
    infoAlert('没有类型需要转换')
  } else {
    successAlert('转换结果如下：' + doConvert)
  }
  // loading.close()
  doQuery()
}

const showConfig = () => {
  showSetConvertDialog.value = true
}
</script>

<style>
.type-container {
  width: 100%;
  height: 100%;
  padding: 0.5rem 1rem;
}

.v-table {
  overflow-x: auto;
  overflow-y: auto;
}
</style>
