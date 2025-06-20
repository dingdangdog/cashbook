<script setup lang="ts">
import { ref, onMounted } from "vue";
import { add, update } from "./api";
import { editInfoFlag } from "./flag";

// 组件传入数据
let { item, title } = defineProps(["item", "title"]);
let emits = defineEmits(["success", "cancel"]);
// 编辑数据实体
const editItem = ref<TypeRelation | any>();

// 账本列表
const bookOptions = ref<{ text: string; value: string }[]>([]);

// 获取账本列表
const getBookList = async () => {
  try {
    const books = await doApi.post("api/admin/entry/books/list", {}) as Book[];
    bookOptions.value = books.map((book: Book) => ({
      text: `${book.bookName} (${book.bookId})`,
      value: book.bookId
    }));
  } catch (error) {
    console.error("获取账本列表失败:", error);
  }
};

if (item) {
  editItem.value = { ...item };
} else {
  editItem.value = {};
}

const form = ref(false);
// 保存编辑数据
const save = () => {
  if (!form.value) {
    // formRef.validate()
    Alert.error("UnSubmit, Please Check Form!");
    return;
  }

  if (editItem.value?.id) {
    update(editItem.value).then((res) => {
      Alert.success(res);
      editInfoFlag.value = false;
      emits("success");
    });
  } else {
    if (editItem.value) {
      add(editItem.value).then((res) => {
        Alert.success(res);
        editInfoFlag.value = false;
        emits("success");
      });
    }
  }
};
const close = () => {
  editInfoFlag.value = false;
  emits("cancel");
};

onMounted(() => {
  getBookList();
});
</script>

<template>
  <v-dialog
    v-model="editInfoFlag"
    transition="dialog-bottom-transition"
    max-width="600"
  >
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-form v-model="form" ref="formRef">
          <!-- <v-text-field
            variant="outlined"
            label="用户ID"
            type="number"
            v-model="editItem.userId"
            :rules="[v => !!v || '用户ID不能为空']"
            required
          ></v-text-field>
          
          <v-select
            variant="outlined"
            label="选择账本"
            v-model="editItem.bookId"
            :items="bookOptions"
            item-title="text"
            item-value="value"
            :rules="[v => !!v || '请选择账本']"
            required
          ></v-select> -->
          
          <v-text-field
            variant="outlined"
            label="原类型"
            v-model="editItem.source"
            :rules="[v => !!v || '原类型不能为空']"
            required
          ></v-text-field>
          
          <v-text-field
            variant="outlined"
            label="目标类型"
            v-model="editItem.target"
            :rules="[v => !!v || '目标类型不能为空']"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn density="default" @click="close()" variant="elevated">
          取消
        </v-btn>
        &nbsp;
        <v-btn
          density="default"
          @click="save()"
          color="primary"
          variant="elevated"
        >
          保存
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-dialog > .v-overlay__content {
  margin: 0 !important;
}
</style>
