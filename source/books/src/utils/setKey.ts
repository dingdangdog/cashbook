import { createVNode, ref } from "vue";
import { ElMessage, ElMessageBox, ElInput } from "element-plus";
import { generateMixed } from "./common";
import { getBook, createBook } from "../api/api.book";
import type { Book } from "../types/model/book";
import { getCaptcha } from "@/api/api.server";

export const isOpen = ref(false);

const captcha = ref({
  value: "",
  key: "",
  img: ""
})
// 输入钥匙的提示语（登录提示语）
let confimNode = ref(() => {
  return createVNode("div", undefined, [
    createVNode("ul", undefined, [
      createVNode("li", undefined, "已有账本，请输入密钥并点击【打开】"),
      createVNode("li", undefined, "无账本，请点击【创建】"),
      createVNode("li", undefined, "注意：取消将自动前往创建页。")
    ]),
    createVNode("img", {
      center: true,
      src: captcha.value.img,
      onClick: ()=> {
        getCaptcha().then(res => {
          captcha.value.img = res.imageUrl
          captcha.value.key = res.captchaId
        })
      },
      alter: "Captcha",
      width: 200,
      height: 50,
    }),
    createVNode(ElInput, {
        type: "text",
        onInput: (val: string) => {
          captcha.value.value = val;
          //element-plus奇怪的bug，输入框输入不了内容，未查明，添加错误打断后续emit
          throw "";
        },
        placeholder: "请输入验证码"
    }),
  ])
});
/**
 * 打开钥匙输入框
 */
export async function openSet() {
  if (isOpen.value == true) {
    return;
  }
  isOpen.value = true;
  await getCaptcha()
    .then(async (res) => {
      captcha.value.img = res.imageUrl;
      captcha.value.key = res.captchaId;
  });
  ElMessageBox.prompt(confimNode.value, "打开账本", {
    // 1、输入钥匙 或 点击创建
    confirmButtonText: "打开",
    cancelButtonText: "创建",
    roundButton: true,
    inputPlaceholder: "请输入账本密钥",
    // inputPattern: /^[a-zA-Z0-9]{11}$/,
    // inputErrorMessage: '请输入账本创建时，系统自动生成的11位字符钥匙。'
  })
    .then(({ value }) => {
      // 2.1、输入钥匙并点击确定，根据钥匙获取账本信息，判断钥匙是否有效
      getBook(value.trim(), captcha.value.value.trim(), captcha.value.key.trim())
        .then((book: Book) => {
          isOpen.value = false;
          // 2.1.1、钥匙正确，登录
          localStorage.setItem("bookKey", book.bookKey);
          localStorage.setItem("bookName", book.bookName);
          ElMessageBox.alert(
            "非常感谢您的使用！",
            "账本（" + book.bookName + "）打开成功",
            {
              confirmButtonText: "不用谢~",
              cancelButtonText: "不客气~",
              showCancelButton: true,
              callback: () => {
                location.reload();
              },
            }
          );
        })
        .catch((err) => {
          if(err.response.data.errorMessage === "验证失败")
          {
            ElMessageBox.alert("验证码错误，请重新输入！", "验证码错误", {
              confirmButtonText: "确认",
            }).then(() => {
              location.reload()
            })
          }else{
          isOpen.value = false;
          // 2.1.2、钥匙错误，提醒重试或创建
          ElMessageBox.alert("账本不存在，请先创建！", "账本打开失败", {
            confirmButtonText: "去创建",
            cancelButtonText: "去重试",
            showCancelButton: true,
          })
            .then(() => {
              // 2.1.2.1、去创建
              register();
            })
            .catch(() => {
              // 2.1.2.2、刷新重试
              location.reload();
            });
            
          }
        });
    })
    .catch(() => {
      isOpen.value = false;
      // 2.2、去创建
      register();
    });
}

/**
 * 创建账本接口封装
 * @param bookName
 * @param bookKey
 */
export async function create(bookName: string, bookKey: string) {
  createBook({ bookName: bookName, bookKey: bookKey })
    .then((book: Book) => {
      // 创建成功
      localStorage.setItem("bookKey", book.bookKey);
      localStorage.setItem("bookName", book.bookName);
      ElMessageBox.alert(
        "请保管好你的钥匙（" + book.bookKey + "）！！！",
        "（" + book.bookName + "）账本创建成功",
        {
          confirmButtonText: "好的~",
          callback: () => {
            location.reload();
          },
        }
      );
    })
    .catch(() => {
      // 创建失败
      ElMessageBox.alert("请重试或提交issue反馈！", "账本创建失败", {
        confirmButtonText: "确定",
        cancelButtonText: "反馈",
        showCancelButton: true,
        callback: () => {
          location.reload();
        },
      }).catch(() => {
        location.href = "https://github.com/DingDangDog/ddd-cashbook/issues";
      });
    });
}

// 创建的提示语
const registerNode = () => {
  return createVNode("ul", undefined, [
    createVNode("li", undefined, "请输入1-12位账本名称"),
    createVNode("li", undefined, "系统会随机生成11位账本密钥"),
    createVNode("li", undefined, "注意：密钥用于开启账本，请妥善保管！！！"),
  ]);
};
/**
 * 创建主
 */
export async function register() {
  ElMessageBox.prompt(registerNode, "欢迎创建账本", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputPattern: /^[\S]{1,12}$/,
    inputErrorMessage: "请输入1-12位账本名称。",
  })
    .then((confim) => {
      // 输入完成，确定创建
      const key = generateMixed(11);
      create(confim.value, key);
    })
    .catch(() => {
      // 取消创建，系统重新加载
      location.reload();
    });
}

// 清除钥匙的提示语
const clearMessageNode = () => {
  return createVNode("ul", undefined, [
    createVNode("li", undefined, "确定关闭当前账本? "),
    createVNode(
      "li",
      undefined,
      "关闭前，请牢记当前账本密钥（" + localStorage.getItem("bookKey") + "）"
    ),
  ]);
};

/**
 * 清除账本钥匙
 */
export async function clearUser() {
  ElMessageBox.alert(
    clearMessageNode,
    "关闭账本（" + localStorage.getItem("bookName") + ")",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      showCancelButton: true,
    }
  )
    .then(() => {
      localStorage.removeItem("bookKey");
      localStorage.removeItem("bookName");
      ElMessage({
        type: "success",
        message: "关闭成功",
      });
      location.reload();
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消关闭",
      });
    });
}

export default openSet;