/**
 * 在设置 ESM loader 后启动 Nuxt，用于修复 Windows 下 ERR_UNSUPPORTED_ESM_URL_SCHEME。
 */
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const loaderPath = join(rootDir, "scripts", "esm-file-url-loader.mjs");
const loaderUrl = pathToFileURL(loaderPath).href;

const env = {
  ...process.env,
  NODE_OPTIONS: [
    process.env.NODE_OPTIONS,
    `--experimental-loader=${loaderUrl}`,
  ]
    .filter(Boolean)
    .join(" "),
};

const [,, cmd, ...args] = process.argv;
const nuxtBin = join(rootDir, "node_modules", "nuxt", "bin", "nuxt.mjs");
const child = spawn(process.execPath, [nuxtBin, cmd || "dev", ...args], {
  stdio: "inherit",
  shell: false,
  env,
  cwd: rootDir,
});
child.on("exit", (code) => process.exit(code ?? 0));
