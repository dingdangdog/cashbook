<script setup lang="ts">
import { showFlowEditInvoiceDialog } from "~/utils/flag";
import { ref } from "vue";

const { successCallback, item } = defineProps(["successCallback", "item"]);

const editInvoice = ref<Flow | any>({});
editInvoice.value = { ...item };
const invoices = ref<string[]>([]);
const getInvoiceImage = async (invoice: string) => {
  if (!invoice || invoice === "") {
    return "";
  }
  try {
    const res = await doApi.download("api/entry/flow/invoice/show", {
      invoice,
    });
    // console.log(res)
    return res ? URL.createObjectURL(res) : res;
  } catch (e) {
    return "";
  }
};
const invoiceImage = ref<Record<string, string>>({});

const initInvoiceImage = () => {
  if (editInvoice.value.invoice) {
    invoices.value = [];
    for (let invoice of editInvoice.value.invoice?.split(",")) {
      getInvoiceImage(invoice).then((res) => {
        invoices.value.push(invoice);
        invoiceImage.value[invoice] = res;
      });
    }
  }
};
initInvoiceImage();
// 上传新小票
const newInvoice = ref();

const uploadInvoiceFile = () => {
  if (!newInvoice.value) {
    Alert.error("未选择小票");
    return;
  }
  const formdata = new FormData();
  formdata.append("id", editInvoice.value.id);
  formdata.append("bookId", localStorage.getItem("bookId") || "");
  formdata.append("invoice", newInvoice.value);

  doApi.postform("api/entry/flow/invoice/upload", formdata).then((res) => {
    Alert.success("上传成功");
    editInvoice.value = res;

    // initInvoiceImage();
    closeDialog();
  });
};

const closeDialog = () => {
  showFlowEditInvoiceDialog.value = false;
  successCallback();
};

const isHovering = ref("");
const removeInvoice = (img: string) => {
  deleteInvoice.value = img;
  deleteInvoiceConfirmDialog.value = true;
};
const deleteInvoice = ref();
// 批量删除
const deleteInvoiceConfirmDialog = ref(false);

const confirmDeleteInvoice = () => {
  doApi
    .post("api/entry/flow/invoice/del", {
      id: editInvoice.value.id,
      bookId: localStorage.getItem("bookId"),
      invoice: deleteInvoice.value,
    })
    .then((res) => {
      editInvoice.value = res;
      Alert.success("删除成功!");
      closeDialog();
      deleteInvoiceConfirmDialog.value = false;
    })
    .catch(() => {
      Alert.error("删除失败!");
    });
};
const cancelDeleteInvoice = () => {
  deleteInvoice.value = "";
  deleteInvoiceConfirmDialog.value = false;
};
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
        <div class="flex items-center">
          <h4 class="m-4">现有小票</h4>
          <div class="flex space-x-2">
            <div v-for="(img, index) in invoices" :key="index">
              <div
                v-if="img"
                @mouseover="isHovering = img"
                @mouseleave="isHovering = ''"
                style="width: 6rem; height: 6rem; cursor: pointer"
                @click="removeInvoice(img)"
              >
                <v-img
                  :src="invoiceImage[img]"
                  style="width: 100%; height: 100%"
                >
                  <div
                    class="w-full h-full flex bg-red-400/20 justify-center items-center"
                    v-if="isHovering == img"
                  >
                    <v-icon color="error" size="large"> mdi-delete </v-icon>
                  </div>
                </v-img>
              </div>
            </div>
            <div v-if="invoices.length < 1">无</div>
          </div>
        </div>
        <div class="flex items-center mt-2">
          <h4 class="m-4 w-16">新小票</h4>
          <div class="flex-1">
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
          </div>
        </div>
      </v-card-text>
      <hr />
      <v-card-actions>
        <div class="w-full flex justify-center space-x-4">
          <v-btn color="error" variant="elevated" @click="closeDialog()"
            >取消
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="uploadInvoiceFile"
            >上传
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
          <v-img
            :src="invoiceImage[deleteInvoice]"
            style="max-width: 15rem; max-height: 15rem"
          ></v-img>
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
