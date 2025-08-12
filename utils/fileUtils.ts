export const exportExcel = (fileName: string, title: any, data: any) => {};

export const exportJson = (fileName: string, data: string) => {
  writeFile(fileName, data);
};

export const exportCsv = (fileName: string, data: any[]) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // 定义CSV表头
  const headers = [
    "交易时间",
    "交易名称",
    "交易金额",
    "流水类型",
    "支出类型/收入类型",
    "支付方式/收款方式",
    "小票",
    "流水归属",
    "备注",
  ];

  // 构建CSV内容
  let csvContent = "\ufeff"; // 添加BOM，确保中文正确显示
  csvContent += headers.join(",") + "\n";

  // 添加数据行
  data.forEach((item) => {
    const row = [
      item.day || "",
      item.name || "",
      item.money || "",
      item.flowType || "",
      item.industryType || "",
      item.payType || "",
      (item.invoice || "").replace(/,/g, "|"),
      item.attribution || "",
      item.description || "",
    ];

    // 处理字段中的逗号和换行符，用双引号包围
    const escapedRow = row.map((field) => {
      if (
        typeof field === "string" &&
        (field.includes(",") || field.includes("\n") || field.includes('"'))
      ) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });

    csvContent += escapedRow.join(",") + "\n";
  });

  // 使用writeFile函数下载文件
  writeFile(fileName, csvContent);
};

const writeFile = (fileName: string, content: any) => {
  const blob = new Blob([content], { type: "application/octet-stream" });
  const fileUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = fileUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
};
