<script setup lang="ts">
import { deleteInvoiceApi, showInvoice, uploadInvoiceFileApi } from '@/api/api.flow'
import type { Flow } from '@/model/flow'
import { showFlowEditInvoiceDialog } from '@/stores/flag'
import { errorAlert, successAlert } from '@/utils/alert'
import { ref } from 'vue'

const { successCallback, item } = defineProps(['successCallback', 'item'])

const editInvoice = ref<Flow>({})
editInvoice.value = item

const getInvoiceImage = async (invoice: string) => {
  if (!invoice || invoice === '') {
    return ''
  }
  try {
    const res = await showInvoice(invoice)
    // console.log(res)
    return res.data ? URL.createObjectURL(res.data) : res
  } catch (e) {
    return ''
  }
}
const invoiceImage = ref<Record<string, string>>({})

const initInvoiceImage = () => {
  if (editInvoice.value.invoice) {
    for (let invoice of editInvoice.value.invoice?.split(',')) {
      getInvoiceImage(invoice).then((res) => {
        invoiceImage.value[invoice] = res
      })
    }
  }
}
initInvoiceImage()
// 上传新小票
const newInvoice = ref()

const uploadInvoiceFile = () => {
  if (!newInvoice.value) {
    errorAlert('未选择小票')
    return
  }
  const formdata = new FormData()
  formdata.append('id', String(editInvoice.value.id))
  formdata.append('invoice', newInvoice.value)
  uploadInvoiceFileApi(formdata).then((res) => {
    successAlert('上传成功')
    editInvoice.value = res

    initInvoiceImage()
  })
}

const closeDialog = () => {
  showFlowEditInvoiceDialog.value = false
  successCallback()
}

const isHovering = ref('')
const removeInvoice = (img: string) => {
  deleteInvoice.value = img
  deleteInvoiceConfirmDialog.value = true
}
const deleteInvoice = ref()
// 批量删除
const deleteInvoiceConfirmDialog = ref(false)

const confirmDeleteInvoice = () => {
  deleteInvoiceApi(editInvoice.value.id, deleteInvoice.value)
    .then((res) => {
      editInvoice.value = res
      successAlert('删除成功!')
      deleteInvoiceConfirmDialog.value = false
    })
    .catch(() => {
      errorAlert('删除失败!')
    })
}
const cancelDeleteInvoice = () => {
  deleteInvoice.value = ''
  deleteInvoiceConfirmDialog.value = false
}
</script>

<template>
  <v-dialog
    v-model="showFlowEditInvoiceDialog"
    width="30rem"
    transition="dialog-top-transition"
    persistent
  >
    <v-card>
      <v-card-title>上传小票</v-card-title>
      <v-card-text>
        <!-- <v-text-field disabled label="流水ID" v-model="editInvoice.id" hide-details="auto"></v-text-field> -->
        <div>
          <h4 style="padding: 0.5rem 0">现有小票</h4>
          <div style="display: flex; align-items: center; flex-wrap: wrap">
            <div v-for="(img, index) in editInvoice.invoice?.split(',')" :key="index">
              <div
                v-if="img"
                @mouseover="isHovering = img"
                @mouseleave="isHovering = ''"
                style="width: 6rem; height: 6rem; cursor: pointer; margin: 0 0.5rem"
                @click="removeInvoice(img)"
              >
                <v-img :src="invoiceImage[img]" style="width: 100%; height: 100%">
                  <div
                    style="
                      width: 100%;
                      height: 100%;
                      background-color: rgba(255, 255, 255, 0.7);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    "
                    v-if="isHovering == img"
                  >
                    <v-icon color="error" size="large"> mdi-delete </v-icon>
                  </div>
                </v-img>
              </div>
              <div v-else>无</div>
            </div>
          </div>
        </div>
        <div>
          <h4 style="padding: 0.5rem 0">上传新小票</h4>
          <div style="display: flex; align-items: center">
            <v-file-input
              label="选择小票文件"
              variant="outlined"
              accept="image/*"
              small-chips
              hide-details="auto"
              prepend-icon="mdi-invoice-text-outline"
              show-size
              v-model="newInvoice"
            ></v-file-input>
            <v-btn color="success" class="btn-group-btn" @click="uploadInvoiceFile">上传 </v-btn>
          </div>
        </div>
      </v-card-text>
      <hr />
      <v-card-actions>
        <div style="text-align: center; width: 100%">
          <v-btn color="warning" class="btn-group-btn" variant="outlined" @click="closeDialog()"
            >关闭
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="deleteInvoiceConfirmDialog" max-width="30rem">
    <v-card>
      <v-card-title class="text-h5"> 确定删除下面的流水小票吗? </v-card-title>
      <v-card-text>
        <div style="display: flex; justify-content: center">
          <v-img :src="invoiceImage[deleteInvoice]" style="width: 12rem; height: 12rem"></v-img>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="cancelDeleteInvoice">取消</v-btn>
        <v-btn color="primary" @click="confirmDeleteInvoice">确定</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
