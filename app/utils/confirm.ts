export interface ConfirmModel {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  closeText?: string;
  confirm: () => void;
  cancel?: () => void;
  close?: () => void;
}

export const ThisConfirmModel = ref<ConfirmModel | undefined>();
export const openConfirmDialogFlag = ref(false);

export class Confirm {
  static open = (model: ConfirmModel) => {
    if (openConfirmDialogFlag.value && ThisConfirmModel.value) {
      // 如果是弹窗接弹窗，延迟100ms再打开
      openConfirmDialogFlag.value = false;
      setTimeout(() => {
        ThisConfirmModel.value = model;
        openConfirmDialogFlag.value = true;
      }, 100);
    } else {
      // 如果是第一个弹窗，直接打开
      ThisConfirmModel.value = model;
      openConfirmDialogFlag.value = true;
    }
  };

  static close = () => {
    openConfirmDialogFlag.value = false;
    ThisConfirmModel.value = undefined;
  };
}
