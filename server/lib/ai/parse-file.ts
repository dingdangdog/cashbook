import * as XLSX from "xlsx";

/**
 * 从 Excel/CSV 文件 buffer 解析为行数组
 * @param buffer 文件二进制数据
 * @param sheetIndex 工作表索引，默认 0
 */
export function parseFileToRows(
  buffer: Buffer | ArrayBuffer | Uint8Array,
  sheetIndex = 0,
): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetNames = workbook.SheetNames;
  const name = sheetNames[sheetIndex] ?? sheetNames[0];
  const sheet = workbook.Sheets[name];
  if (!sheet) return [];

  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
}
