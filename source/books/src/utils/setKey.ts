import { createVNode, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateMixed } from './common'
import { getBook, createBook } from '../api/api.book'
import type { Book } from '../types/model/book'

export const isOpen = ref(false);

// 输入钥匙的提示语（登录提示语）
const confimNode = () => {
    return createVNode('ul',
        undefined,
        [
            createVNode('li', undefined, '若有账本，请输入钥匙并点击【打开】以打开账本。'),
            createVNode('li', undefined, '若无账本，请点击【创建】前往创建账本。'),
            createVNode('li', undefined, '注意：无法跳过，点击【x】将自动前往账本创建页。'),
        ]);
}
/**
 * 打开钥匙输入框
 */
export async function openSet() {
    if (isOpen.value == true) {
      return;
    }
    isOpen.value = true;
    ElMessageBox.prompt(confimNode, '请输入钥匙打开你的账本', {
        // 1、输入钥匙 或 点击创建
        confirmButtonText: '打开',
        cancelButtonText: '创建',
        roundButton: true,
        inputPattern: /^[a-zA-Z0-9]{11}$/,
        inputErrorMessage: '请输入账本创建时，系统自动生成的11位字符钥匙。'
    }).then(({ value }) => {
        // 2.1、输入钥匙并点击确定，根据钥匙获取账本信息，判断钥匙是否有效
        getBook(value.trim())
            .then((book: Book) => {
                isOpen.value = false;
                // 2.1.1、钥匙正确，登录
                localStorage.setItem('bookKey', book.bookKey);
                localStorage.setItem('bookName', book.bookName);
                ElMessageBox.alert('非常感谢您的使用！', '账本（' + book.bookName + '）打开成功', {
                    confirmButtonText: '不用谢~',
                    cancelButtonText: '不客气~',
                    showCancelButton: true,
                    callback: () => {
                        location.reload();
                    }
                });
            }).catch(() => {
                isOpen.value = false;
                // 2.1.2、钥匙错误，提醒重试或创建
                ElMessageBox.alert('账本不存在，请先创建！', '账本打开失败', {
                    confirmButtonText: '去创建',
                    cancelButtonText: '去重试',
                    showCancelButton: true
                }).then(() => {
                    // 2.1.2.1、去创建
                    register();
                }).catch(() => {
                    // 2.1.2.2、刷新重试
                    location.reload();
                });
            });
    }).catch(() => {
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
            localStorage.setItem('bookKey', book.bookKey);
            localStorage.setItem('bookName', book.bookName);
            ElMessageBox.alert('请保管好你的钥匙（' + book.bookKey + '）！！！', '（' + book.bookName + '）账本创建成功', {
                confirmButtonText: '好的~',
                callback: () => {
                    location.reload();
                }
            })
        })
        .catch(() => {
            // 创建失败
            ElMessageBox.alert('请重试或提交issue反馈！', '账本创建失败', {
                confirmButtonText: '确定',
                cancelButtonText: '反馈',
                showCancelButton: true,
                callback: () => {
                    location.reload();
                }
            }).catch(() => { location.href = "https://github.com/DingDangDog/ddd-cashbook/issues" })
        });
}


// 创建的提示语
const registerNode = () => {
    return createVNode('ul',
        undefined,
        [
            createVNode('li', undefined, '请输入账本名称（必须为4-12位）'),
            createVNode('li', undefined, '点击【确定】后，系统会为你生成11位随机账本钥匙'),
            createVNode('li', undefined, '注意：钥匙用于开启账本，请妥善保管！！！'),
        ]);
}
/**
 * 创建主
 */
export async function register() {
    ElMessageBox.prompt(registerNode, '欢迎创建账本', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\S]{4,12}$/,
        inputErrorMessage: '请输入4-12位账本名称。'
    }).then((confim) => {
        // 输入完成，确定创建
        const key = generateMixed(11);
        create(confim.value, key);
    }).catch(() => {
        // 取消创建，系统重新加载
        location.reload();
    })
}


// 清除钥匙的提示语
const clearMessageNode = () => {
    return createVNode('ul',
        undefined,
        [
            createVNode('li', undefined, '确定关闭当前账本? '),
            createVNode('li', undefined, '关闭前，请记住你的账本钥匙（' + localStorage.getItem('bookKey') + '），以便下次使用！'),
        ]);
}

/**
 * 清除账本钥匙
 */
export async function clearUser() {
    ElMessageBox.alert(clearMessageNode, '关闭账本（' + localStorage.getItem('bookName') + ')', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        showCancelButton: true
    }).then(() => {
        localStorage.removeItem('bookKey');
        localStorage.removeItem('bookName');
        ElMessage({
            type: 'success',
            message: '关闭成功',
        })
        location.reload();
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: '取消关闭',
        })
    });

}


export default openSet;