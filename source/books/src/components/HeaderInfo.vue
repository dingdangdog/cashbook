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
      <el-button plain @click="showOnlineDialog()"> 在线同步 </el-button>
      <el-button plain @click="showPlanDialog()"> 额度设置 </el-button>
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

  <!-- 弹出框表单：账本密钥修改 -->
  <el-dialog
    style="width: 30vw"
    v-model="keyDialog.visable"
    :title="keyDialog.title"
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
        <el-button @click="resetKeyForm()"> 取消 </el-button>
        <el-button type="primary" @click="confirmKeyForm(dialgoFormRef)">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 弹出框表单：额度设置 -->
  <el-dialog
    style="width: 30vw"
    v-model="planDialog.visable"
    :title="planDialog.title"
  >
    <div class="el-dialog-main">
      <el-form ref="planFormRef" :model="planRef" :rules="planFormRules">
        <el-form-item label="月份" :label-width="formLabelWidth" prop="month">
          <el-date-picker
            v-model="planRef.month"
            type="month"
            format="YYYY-MM"
            placeholder="月份"
          />
        </el-form-item>

        <el-form-item
          label="额度"
          :label-width="formLabelWidth"
          prop="limitMoney"
        >
          <el-input-number v-model="planRef.limitMoney" :min="0" />
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetPlanForm()"> 取消 </el-button>
        <el-button type="primary" @click="confirmPlanForm(planFormRef)">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>

  
  <!-- 弹出框表单：在线同步 -->
  <el-dialog
    style="width: 30vw"
    v-model="onlineDialog.visable"
    :title="onlineDialog.title"
  >
    <div class="el-dialog-main">
      <el-form ref="onlineFormRef" :model="onlineRef" :rules="onlineFormRules">

        <el-form-item
          label="服务器地址"
          :label-width="formLabelWidth"
          prop="serverAddress"
        >
          <el-input v-model="onlineRef.serverAddress" placeholder="如：http://localhost:8080"/>
        </el-form-item>

        <el-form-item
          label="服务授权码"
          :label-width="formLabelWidth"
          prop="secret"
        >
          <el-input v-model="onlineRef.secret" placeholder="服务器授权密钥"/>
        </el-form-item>
      </el-form>
    </div>
    <!-- 表单确认按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <!-- <el-button type="info" @click="getSecret()">
          获取授权码
        </el-button> -->

        <el-button type="success" @click="toUpload(onlineFormRef)">
          上传
        </el-button>
        
        <el-button type="primary" @click="toDownload(onlineFormRef)">
          下载
        </el-button>
        <el-button @click="resetOnlineForm()"> 取消 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { Tools } from "@element-plus/icons-vue";
import { ref, reactive } from "vue";
import { useToggle } from "@vueuse/shared";
import { clearUser } from "../utils/setKey";
import { isDark } from "../utils/store";
import { getServerInfo } from "../api/api.server";
import { defineAsyncComponent } from "vue";
import type { Book } from "@/types/model/book";
import type { Plan } from "@/types/model/plan";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessageBox, ElMessage, ElLoading } from "element-plus";
import { changeKey } from "@/api/api.book";
import { setPlans, getPlan } from "../api/api.plan";
import { upload, download } from "../api/api.online";
import { dateFormater } from '../utils/common'
import type { OnlineSync } from "@/types/model/online";

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

const keyDialog = ref({
  visable: false,
  title: '',
})

// 表单输入框宽度
const formLabelWidth = ref("100px");
if (document.body.clientWidth <= 480) {
  formLabelWidth.value = "60px";
}

const changeBookKey = () => {
  keyDialog.value.visable = true;
  keyDialog.value.title =
    "修改密钥，原密钥：(" + localStorage.getItem("bookKey") + ")";
};

// 提交表单（新增或修改）
const confirmKeyForm = async (dialgoForm: FormInstance | undefined) => {
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
const resetKeyForm = () => {
  keyDialog.value.visable = false;
  newKey.value.key = "";
  newKey.value.keyAgain = "";
};



// 额度设置表单实例
const planFormRef = ref<FormInstance>();

const planModel: Plan = {
  month: new Date(),
  limitMoney: 0,
  usedMoney: undefined,
}

const planRef = reactive(planModel);

// 表单输入框校验规则
const planFormRules = ref<FormRules>({
  month: [{ required: true, message: "请选择额度月份", trigger: "blur" }],
  limitMoney: [{ required: true, message: "请填入额度", trigger: "blur" }],
});

const planDialog = ref({
  visable: false,
  title: '',
})
const showPlanDialog = () => {
  planDialog.value.visable = true;
  planDialog.value.title = '额度设置';
};


// 提交表单（新增或修改）
const confirmPlanForm = async (form: FormInstance | undefined) => {
  if (!form) return;
  if (
    !(await form.validate((valid, fields) => {
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
  getPlan(dateFormater('YYYY-MM', planRef.month) || '').then((plan) => {
    if (plan && plan.month) {
      ElMessageBox.confirm(
        "已存在额度设置(" + plan.month + "："+ plan.limitMoney +")，是否修改设置？",
        "通知",
        {
          confirmButtonText: "确定",
          type: "warning",
        }
      ).then(() => {
        toSetPlan(planRef, 1)
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '取消设置!',
        })
      });
    } else {
      toSetPlan(planRef, 0)
    }
  })
};

const toSetPlan = (plan: Plan, o: number) => {
  plan.month = dateFormater('YYYY-MM', plan.month || new Date)
  setPlans(plan, o).then(() => {
    ElMessage({
      type: 'success',
      message: '设置成功!',
    })
    
    resetPlanForm();
  })
}

// 重置表单数据
const resetPlanForm = () => {
  planDialog.value.visable = false;
  planRef.month = '';
  planRef.limitMoney = 0;
};


// 额度设置表单实例
const onlineFormRef = ref<FormInstance>();

const onlineModel: OnlineSync = {
  secret: window.localStorage.getItem("online-key")||undefined,
  serverAddress: window.localStorage.getItem("online-address")||undefined,
}
const onlineRef = reactive(onlineModel);

const onlineDialog = ref({
  visable: false,
  title: '',
})
const showOnlineDialog = () => {
  onlineDialog.value.visable = true;
  onlineDialog.value.title = '额度设置';
};

// 表单输入框校验规则
const onlineFormRules = ref<FormRules>({
  secret: [{ required: true, message: "请输入授权密钥", trigger: "blur" }],
  serverAddress: [{ required: true, message: "请输入服务器地址", trigger: "blur" }],
});


// 重置表单数据
const resetOnlineForm = () => {
  onlineDialog.value.visable = false;
  onlineRef.secret = undefined;
  onlineRef.serverAddress = undefined;
};

const saveOnline = () => {
  window.localStorage.setItem("online-key", onlineModel.secret||"")
  window.localStorage.setItem("online-address", onlineModel.serverAddress||"")
}

const toUpload = async (form: FormInstance | undefined) => {
  saveOnline()
  if (!form) return;
  if (
    !(await form.validate((valid, fields) => {
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
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(0, 0, 0, 0.7)',
  })
  upload(onlineModel).then(res => {
    if (res == 'true'){
      loading.close();
      ElMessage({
        type: 'success',
        message: '上传成功!',
      })
    } else {
      loading.close();
      console.log(res)
      if (res.code == 203) {
        if (!res.data?.auth?.state || res.data.auth.state == 0) {
          ElMessage.error("授权码无效");
        } else {
          ElMessage.error("授权码剩余天数：" + (res.data.auth.limit == -1 ? "不限" : res.data.auth.limit));
          ElMessage.error("授权码本日剩余次数：" + res.data.auth.day);
        }
      } else {
        ElMessage({
          type: 'error',
          message: res.message,
        })
      }
    }
  })
}
const toDownload = async (form: FormInstance | undefined) => {
  saveOnline()
  
  if (!form) return;
  if (
    !(await form.validate((valid, fields) => {
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
  ElMessageBox.confirm(
    '下载成功后将覆盖当前账本数据（流水、支付方式、消费类型、额度设置），确认下载？',
    '确认下载',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    download(onlineModel).then(res => {
      if (res == 1){
        loading.close();
        ElMessage({
          type: 'success',
          message: '下载成功!',
        })
        ElMessageBox.confirm(
          '下载成功，请重新登录当前账本。当前账本密码：' + window.localStorage.getItem("bookKey"),
          '下载成功',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        ).then(()=> {
          localStorage.removeItem("bookKey");
          localStorage.removeItem("bookName");
          location.reload();
        }).catch(()=>{
          localStorage.removeItem("bookKey");
          localStorage.removeItem("bookName");
          location.reload();
        })
      } else {
        loading.close();
        ElMessage({
          type: 'error',
          message: res.message,
        })
      }
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '取消下载',
    })
  })
}
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
  min-width: 520px;

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
