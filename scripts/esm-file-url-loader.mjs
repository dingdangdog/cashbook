/**
 * Node ESM Loader: 将 Windows 绝对路径转为 file:// URL，修复 ERR_UNSUPPORTED_ESM_URL_SCHEME。
 * 使用方式: NODE_OPTIONS="--experimental-loader=./scripts/esm-file-url-loader.mjs" pnpm dev
 */
import { pathToFileURL } from "node:url";

const isWindowsPath = (s) =>
  typeof s === "string" && /^[a-zA-Z]:[\\/]/.test(s);

export async function resolve(specifier, context, nextResolve) {
  const url = isWindowsPath(specifier)
    ? pathToFileURL(specifier).href
    : specifier;
  return nextResolve(url, context);
}
