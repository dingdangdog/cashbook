<template>
  <!-- Main Book Dialog -->
  <Teleport to="body">
    <div
      v-if="showBookDialogFlag.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click="cancelChange"
    >
      <div
        @click.stop
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-border"
      >
        <!-- Header -->
        <div
          class="px-4 py-2 md:px-6 md:py-4 border-b border-border"
        >
          <h2 class="text-xl font-semibold">
            打开账本
          </h2>
        </div>

        <!-- Content -->
        <div class="px-4 py-2 md:px-6 md:py-4 flex-1 overflow-y-auto">
          <div class="flex flex-wrap gap-2 md:gap-3">
            <button
              v-for="book in books"
              :key="book.id"
              class="px-2 py-1 md:px-4 md:py-2 rounded-lg border transition-all duration-200 max-w-32 md:max-w-40 group"
              :class="[
                checkSelectBook(book.bookId || '')
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'bg-surface-muted border-border text-foreground/80 hover:bg-primary-50 hover:border-primary-300',
              ]"
              @click="openBook(book)"
              :title="book.bookName"
            >
              <p class="truncate text-sm font-medium">
                {{ book.bookName }}
              </p>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-4 py-2 md:px-6 md:py-4 border-t border-border"
        >
          <div class="flex flex-wrap gap-3 justify-center">
            <button
              @click="cancelChange"
              class="px-2 py-1 md:px-4 md:py-2 border border-border text-foreground/80 rounded-md font-medium transition-colors hover:bg-surface-muted"
            >
              取消
            </button>
            <button
              @click="getShare"
              class="px-2 py-1 md:px-4 md:py-2 border border-primary-300 text-primary-700 rounded-md font-medium transition-colors hover:bg-primary-50"
            >
              添加共享账本
            </button>
            <button
              @click="addBook"
              class="px-2 py-1 md:px-4 md:py-2 bg-primary-600 text-white rounded-md font-medium transition-colors hover:bg-primary-700"
            >
              新建账本
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Add Book Dialog -->
  <Teleport to="body">
    <div
      v-if="addBookDialog.visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        @click.stop
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md border border-border"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold">
            {{ addBookDialog.title }}
          </h2>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-foreground/80"
            >
              账本名称
            </label>
            <input
              v-model="newBook.bookName"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground placeholder-foreground/40"
              placeholder="请输入账本名称"
              :class="{
                'border-red-500':
                  !newBook.bookName && newBook.bookName !== undefined,
              }"
            />
            <p
              v-if="!newBook.bookName && newBook.bookName !== undefined"
              class="text-red-500 text-xs"
            >
              必填
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-border">
          <div class="flex gap-3 justify-center">
            <button
              @click="addBookDialog.visible = false"
              class="px-4 py-2 border border-border text-foreground/80 rounded-md font-medium transition-colors hover:bg-surface-muted"
            >
              取消
            </button>
            <button
              @click="confirmBookForm()"
              :disabled="isAddingBook"
              class="px-4 py-2 bg-primary-600 text-white rounded-md font-medium transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isAddingBook" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                确定
              </span>
              <span v-else>确定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Get Share Dialog -->
  <Teleport to="body">
    <div
      v-if="showGetShareDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        @click.stop
        class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md border border-border"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border">
          <h2 class="text-lg font-semibold">
            添加共享账本
          </h2>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <p class="text-foreground/60 text-sm mb-4">
            使用他人分享的共享Key添加共享账本。
          </p>
          <div class="space-y-2">
            <label
              class="block text-sm font-medium text-foreground/80"
            >
              共享Key
            </label>
            <input
              v-model="shareKey"
              type="text"
              class="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground placeholder-foreground/40"
              placeholder="请输入共享Key"
              :class="{
                'border-red-500': !shareKey && shareKey !== undefined,
              }"
            />
            <p
              v-if="!shareKey && shareKey !== undefined"
              class="text-red-500 text-xs"
            >
              必填
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-border">
          <div class="flex gap-3 justify-center">
            <button
              @click="showGetShareDialog = false"
              class="px-4 py-2 border border-border text-foreground/80 rounded-md font-medium transition-colors hover:bg-surface-muted"
            >
              取消
            </button>
            <button
              @click="confirmGetShare()"
              :disabled="isAddingShareBook"
              class="px-4 py-2 bg-primary-600 text-white rounded-md font-medium transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isAddingShareBook" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                确定
              </span>
              <span v-else>确定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { showBookDialogFlag } from "~/utils/flag";

// ESC键监听
useEscapeKey(() => {
  if (showBookDialogFlag.value.visible) {
    cancelChange();
  }
}, showBookDialogFlag.value.visible);

const books = ref<Book[]>([]);

const initBooks = () => {
  doApi
    .post<Book[]>("api/entry/book/list", {})
    .then((res) => {
      books.value = res;
    })
    .catch((err) => {
      console.log(err);
    });
};

initBooks();

const openBook = (book: Book) => {
  if (localStorage.getItem("bookId") === book.bookId) {
    showBookDialogFlag.value.visible = false;
    return;
  }
  localStorage.setItem("bookId", book.bookId);
  localStorage.setItem("bookName", book.bookName);
  Alert.success(`切换账本：${book.bookName}，即将自动刷新`);
  showBookDialogFlag.value.visible = false;
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  // close book dialog
};

// 表单输入框宽度
const formLabelWidth = ref("100px");
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = "60px";
}

const addBookDialog = ref({
  visible: false,
  title: "添加账本",
});

const cancelChange = () => {
  if (localStorage.getItem("bookId")) {
    showBookDialogFlag.value.visible = false;
  } else {
    Alert.error("必须选择一个账本打开");
  }
};

const addBook = () => {
  addBookDialog.value.visible = true;
};
const required = (v: any) => {
  return !!v || "必填";
};

const newBook = ref<Book | any>({});
const isAddingBook = ref(false);

const confirmBookForm = () => {
  if (!newBook.value.bookName || isAddingBook.value) {
    return;
  }

  isAddingBook.value = true;
  doApi
    .post("api/entry/book/add", { bookName: newBook.value.bookName })
    .then((_res) => {
      Alert.success("账本添加成功");
      newBook.value.bookName = "";
      addBookDialog.value.visible = false;
      initBooks();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      isAddingBook.value = false;
    });
};

const checkSelectBook = (bookId: string | number) => {
  return localStorage.getItem("bookId") === bookId;
};

const getShare = () => {
  showGetShareDialog.value = true;
};
const showGetShareDialog = ref(false);
const shareKey = ref("");
const isAddingShareBook = ref(false);

const confirmGetShare = () => {
  if (!shareKey.value || isAddingShareBook.value) {
    if (!shareKey.value) {
      Alert.error("请输入共享KEY");
    }
    return;
  }

  isAddingShareBook.value = true;
  doApi
    .post("api/entry/book/inshare", { key: shareKey.value })
    .then((_res) => {
      Alert.success("添加成功");
      shareKey.value = "";
      showGetShareDialog.value = false;
      initBooks();
    })
    .catch((error) => {
      console.error(error);
      // Alert.error(error);
    })
    .finally(() => {
      isAddingShareBook.value = false;
    });
};
</script>

<style scoped>
/* 颜色已改为主题语义色，保留 scoped 区域为空即可 */
</style>
