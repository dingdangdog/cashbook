import { ref } from "vue";

export const showBookDialogFlag = ref({
  visible: false,
});

export const showFlowExcelImportDialog = ref(false);
// 流水Json导入弹出框
export const showFlowJsonImportDialog = ref(false);
export const showFlowEditInvoiceDialog = ref(false);

export const showFlowTableDialog = ref(false);

export const showSetConvertDialog = ref(false);
export const showChangePasswordDialog = ref(false);

export const showFlowEditDialog = ref(false);
export const showAutoMergeFlowsDialog = ref(false);
export const showAutoDeduplicationFlowsDialog = ref(false);
export const showUserPreferenceDialog = ref(false);
