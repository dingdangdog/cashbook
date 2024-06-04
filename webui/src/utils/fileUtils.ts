export const exportExcel = (fileName: string, title: any, data: any) => {

}

export const exportJson = (fileName: string, data: string) => {
  writeFile(fileName, data);
}

const writeFile = (fileName: string, content: any) => {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const fileUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = fileUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
}