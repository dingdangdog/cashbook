<template>
  <!-- Main Book Dialog -->
  <Teleport to="body">
    <div
      v-if="showBookDialogFlag.visible"
      class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50 tw-p-4"
      @click="cancelChange"
    >
      <div
        @click.stop
        class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-2xl tw-max-h-[80vh] tw-flex tw-flex-col"
      >
        <!-- Header -->
        <div
          class="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700"
        >
          <h2
            class="tw-text-xl tw-font-semibold tw-text-gray-900 dark:tw-text-white"
          >
            打开账本
          </h2>
        </div>

        <!-- Content -->
        <div class="tw-px-6 tw-py-4 tw-flex-1 tw-overflow-y-auto">
          <div class="tw-flex tw-flex-wrap tw-gap-3">
                         <button
              v-for="book in books"
              :key="book.id"
              class="tw-px-4 tw-py-2 tw-rounded-lg tw-border tw-transition-all tw-duration-200 tw-max-w-40 tw-group"
              :class="[
                checkSelectBook(book.bookId || '') 
                  ? 'tw-bg-green-50 tw-border-green-500 tw-text-green-700 dark:tw-bg-green-900/20 dark:tw-border-green-400 dark:tw-text-green-300' 
                  : 'tw-bg-gray-50 tw-border-gray-200 tw-text-gray-700 hover:tw-bg-blue-50 hover:tw-border-blue-300 dark:tw-bg-gray-700 dark:tw-border-gray-600 dark:tw-text-gray-200 dark:hover:tw-bg-gray-600',
              ]"
              @click="openBook(book)"
              :title="book.bookName"
            >
              <p class="tw-truncate tw-text-sm tw-font-medium">
                {{ book.bookName }}
              </p>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="tw-px-6 tw-py-4 tw-border-t tw-border-gray-200 dark:tw-border-gray-700"
        >
          <div class="tw-flex tw-flex-wrap tw-gap-3 tw-justify-center">
            <button
              @click="cancelChange"
              class="tw-px-4 tw-py-2 tw-border tw-border-orange-300 tw-text-orange-600 tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-orange-50 dark:tw-border-orange-500 dark:tw-text-orange-400 dark:hover:tw-bg-orange-900/20"
            >
              取消
            </button>
            <button
              @click="getShare"
              class="tw-px-4 tw-py-2 tw-border tw-border-green-300 tw-text-green-600 tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-green-50 dark:tw-border-green-500 dark:tw-text-green-400 dark:hover:tw-bg-green-900/20"
            >
              添加共享账本
            </button>
            <button
              @click="addBook"
              class="tw-px-4 tw-py-2 tw-bg-green-600 tw-text-white tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-green-700 dark:tw-bg-green-500 dark:hover:tw-bg-green-600"
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
      class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50 tw-p-4"
      @click="addBookDialog.visible = false"
    >
      <div
        @click.stop
        class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-md"
      >
        <!-- Header -->
        <div
          class="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700"
        >
          <h2
            class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white"
          >
            {{ addBookDialog.title }}
          </h2>
        </div>

        <!-- Content -->
        <div class="tw-px-6 tw-py-4">
          <div class="tw-space-y-2">
            <label
              class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300"
            >
              账本名称
            </label>
            <input
              v-model="newBook.bookName"
              type="text"
              class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500 tw-focus:border-blue-500 dark:tw-bg-gray-700 dark:tw-border-gray-600 dark:tw-text-white dark:tw-focus:ring-blue-400"
              placeholder="请输入账本名称"
              :class="{
                'tw-border-red-500':
                  !newBook.bookName && newBook.bookName !== undefined,
              }"
            />
            <p
              v-if="!newBook.bookName && newBook.bookName !== undefined"
              class="tw-text-red-500 tw-text-xs"
            >
              必填
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="tw-px-6 tw-py-4 tw-border-t tw-border-gray-200 dark:tw-border-gray-700"
        >
          <div class="tw-flex tw-gap-3 tw-justify-center">
            <button
              @click="addBookDialog.visible = false"
              class="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-gray-700 tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-gray-50 dark:tw-border-gray-600 dark:tw-text-gray-300 dark:hover:tw-bg-gray-700"
            >
              取消
            </button>
            <button
              @click="confirmBookForm()"
              :disabled="isAddingBook"
              class="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-blue-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed dark:tw-bg-blue-500 dark:hover:tw-bg-blue-600"
            >
              <span v-if="isAddingBook" class="tw-flex tw-items-center">
                <svg
                  class="tw-animate-spin tw--ml-1 tw-mr-2 tw-h-4 tw-w-4 tw-text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="tw-opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="tw-opacity-75"
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
      class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50 tw-p-4"
      @click="showGetShareDialog = false"
    >
      <div
        @click.stop
        class="tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-xl tw-w-full tw-max-w-md"
      >
        <!-- Header -->
        <div
          class="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700"
        >
          <h2
            class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white"
          >
            添加共享账本
          </h2>
        </div>

        <!-- Content -->
        <div class="tw-px-6 tw-py-4">
          <p class="tw-text-gray-500 dark:tw-text-gray-400 tw-text-sm tw-mb-4">
            使用他人分享的共享Key添加共享账本。
          </p>
          <div class="tw-space-y-2">
            <label
              class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300"
            >
              共享Key
            </label>
            <input
              v-model="shareKey"
              type="text"
              class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500 tw-focus:border-blue-500 dark:tw-bg-gray-700 dark:tw-border-gray-600 dark:tw-text-white dark:tw-focus:ring-blue-400"
              placeholder="请输入共享Key"
              :class="{
                'tw-border-red-500': !shareKey && shareKey !== undefined,
              }"
            />
            <p
              v-if="!shareKey && shareKey !== undefined"
              class="tw-text-red-500 tw-text-xs"
            >
              必填
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="tw-px-6 tw-py-4 tw-border-t tw-border-gray-200 dark:tw-border-gray-700"
        >
          <div class="tw-flex tw-gap-3 tw-justify-center">
            <button
              @click="showGetShareDialog = false"
              class="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-gray-700 tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-gray-50 dark:tw-border-gray-600 dark:tw-text-gray-300 dark:hover:tw-bg-gray-700"
            >
              取消
            </button>
            <button
              @click="confirmGetShare()"
              :disabled="isAddingShareBook"
              class="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md tw-font-medium tw-transition-colors hover:tw-bg-blue-700 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed dark:tw-bg-blue-500 dark:hover:tw-bg-blue-600"
            >
              <span v-if="isAddingShareBook" class="tw-flex tw-items-center">
                <svg
                  class="tw-animate-spin tw--ml-1 tw-mr-2 tw-h-4 tw-w-4 tw-text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="tw-opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="tw-opacity-75"
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
.book-card-selected {
  background-color: rgba(18, 255, 0, 0.1);
}

.book-card {
  max-width: 10rem;
  margin: 0.5rem;
}
.book-name {
  max-width: 9rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.book-card:hover {
  cursor: pointer;
  background-color: rgba(115, 204, 229, 0.473);
}
</style>
