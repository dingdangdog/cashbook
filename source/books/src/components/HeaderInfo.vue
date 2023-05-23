<template>
  <div class="header-container">
    <!-- 图标 -->
    <div class="header-info header-icon">
      <img
        alt="oldmoon logo"
        class="logo"
        src="../static/images/cashbook.png"
        :width="icon.width"
        :height="icon.height"
      />
    </div>

    <!-- 页面标题 -->
    <div class="header-info header-title" text-algin="center">
      <h1>CashBook</h1>
    </div>

    <!-- 其他按钮 -->
    <div class="header-info header-buttons">
      <el-button plain @click="openDistDialog()"> 字典管理 </el-button>
      <el-button id="theme-button" plain @click="toggleDark()"
        >{{ isDark ? "☪" : "☼" }}
      </el-button>
    </div>

    <!-- 其他信息 -->
    <div class="header-info header-setting">
      <el-dropdown id="setting-dropdown">
        <span class="el-dropdown-link">
          <span v-if="haveUserIdRef()">{{ bookName }}&nbsp;&nbsp;</span
          ><el-icon><Tools /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="changeBookKey()"
              >密钥修改</el-dropdown-item
            >
            <el-dropdown-item @click="clearUser()">关闭账本</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <el-dialog v-model="distTable.show" :title="distTable.title">
    <DistTable />
  </el-dialog>

  <!-- 弹出框表单：新增和修改通用 -->
  <el-dialog
    style="width: 30vw"
    v-model="changeKeyVisable"
    :title="changeKeyTitle"
  >
    <div class="el-dialog-main">
      <el-form ref="dialgoFormRef" :model="newKey" :rules="rules">
        <el-form-item label="新密钥" :label-width="formLabelWidth" prop="key">
          <el-input v-model="newKey.key" />
        </el-form-item>

        <el-form-item
          label="重复密钥"
          :label-width="formLabelWidth"
          prop="keyAgain"
        >
          <el-input v-model="newKey.keyAgain" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm()"> 取消 </el-button>
        <el-button type="primary" @click="confirmForm(dialgoFormRef)">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { Tools } from "@element-plus/icons-vue";
import { ref } from "vue";
import { useToggle } from "@vueuse/shared";
import { clearUser } from "../utils/setKey";
import { isDark } from "../utils/store";
import { getServerInfo } from "../api/api.server";
import { defineAsyncComponent } from "vue";
import type { Book } from "@/types/model/book";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessageBox, ElMessage } from "element-plus";
import { changeKey } from "@/api/api.book";

// 异步组件引用
const DistTable = defineAsyncComponent(() => import("./DistTable.vue"));

const distTable = ref({
  show: false,
  title: "",
});

const openDistDialog = () => {
  distTable.value.show = true;
  distTable.value.title = "字典管理";
};

// 图标大小设置
const icon = ref({
  width: 55,
  height: 55,
});

if (document.body.clientWidth <= 480) {
  icon.value.width = 40;
  icon.value.height = 40;
}

// 设置账本
const bookName = localStorage.getItem("bookName");
// 判断是否打开账本
const haveUserId = (): boolean => {
  if (bookName && "none" !== bookName) {
    return true;
  } else {
    return false;
  }
};
const haveUserIdRef = ref(haveUserId);

// 设置主题色
const toggleDark = useToggle(isDark);

// 服务器信息封装
const serverInfo = ref({
  id: 1,
  version: "",
  environment: "",
  createDate: new Date(),
  startDate: new Date(),
});

// 获取服务器信息
getServerInfo().then((res) => {
  serverInfo.value.id = res.id;
  serverInfo.value.version = res.version || "";
  serverInfo.value.environment = res.environment || "";
  serverInfo.value.createDate = res.createDate;

  localStorage.setItem("version", serverInfo.value.version);
});

var book: Book = {
  id: 0,
  bookName: localStorage.getItem("bookName") || "",
  bookKey: "",
  createDate: "",
};

// 表单实例
const dialgoFormRef = ref<FormInstance>();
const newKey = ref({
  key: "",
  keyAgain: "",
});
// 表单输入框校验规则
const rules = ref<FormRules>({
  key: [{ required: true, message: "请输入新密钥！", trigger: "blur" }],
  keyAgain: [
    { required: true, message: "请再次输入新密钥！", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请再次输入新密钥！"));
        } else if (value !== newKey.value.key) {
          callback(new Error("两次输入密钥不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

const changeKeyVisable = ref(false);
const changeKeyTitle = ref("");

// 表单输入框宽度
const formLabelWidth = ref("100px");
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = "60px";
}

const changeBookKey = () => {
  changeKeyVisable.value = true;
  changeKeyTitle.value =
    "修改密钥，原密钥：(" + localStorage.getItem("bookKey") + ")";
};

// 提交表单（新增或修改）
const confirmForm = async (dialgoForm: FormInstance | undefined) => {
  if (!dialgoForm) return;
  if (
    !(await dialgoForm.validate((valid, fields) => {
      if (valid) {
        console.log("submit!");
      } else {
        console.log("error submit!", fields);
        return false;
      }
    }))
  ) {
    return;
  }
  book.bookKey = newKey.value.key;
  changeKey(book)
    .then((res) => {
      ElMessageBox.confirm(
        "修改成功，新密钥(" + res.bookKey + ")，请重新登录",
        "通知",
        {
          confirmButtonText: "确定",
          type: "warning",
        }
      ).then(() => {
        localStorage.removeItem("bookKey");
        localStorage.removeItem("bookName");
        location.reload();
      })
      .catch(() => {
        localStorage.removeItem("bookKey");
        localStorage.removeItem("bookName");
        location.reload();
      });
    })
    .catch(() => {
      // ElMessage({
      //   type: "error",
      //   message: err.data,
      // });
    });

  // resetForm();
};

// 重置表单数据
const resetForm = () => {
  changeKeyVisable.value = false;
  newKey.value.key = "";
  newKey.value.keyAgain = "";
};
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-info {
  padding: 0.5rem;
}

.header-title > h1 {
  margin-top: 1.2rem;
  margin-bottom: 0.8rem;
}

.header-buttons {
  min-width: 360px;

  display: flex;
  justify-content: right;
  align-items: right;
}

#theme-button {
  font-size: 1.5rem;
}

.header-setting {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 5rem;
}
#setting-dropdown {
  font-size: 1rem;
  padding: 0.5rem;
}
</style>
