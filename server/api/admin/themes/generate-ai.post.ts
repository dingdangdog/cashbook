import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";
import { getAIClient, getAIProviderConfig } from "~~/server/lib/ai/client";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, description, mode } = body;

  if (!name?.trim() || !description?.trim() || !mode) {
    return error("name、description、mode 不能为空");
  }

  if (!["light", "dark"].includes(mode)) {
    return error("mode 必须为 light 或 dark");
  }

  const client = await getAIClient();
  const config = await getAIProviderConfig();

  if (!client || !config) {
    return error("AI 服务未配置，请先配置 AI 服务商");
  }

  // 组装AI提示词
  const prompt = `你是一个专业的UI/UX设计师，擅长设计主题配色方案。

用户需求：
- 主题名称：${name.trim()}
- 主题描述：${description.trim()}
- 主题模式：${mode === "light" ? "浅色模式" : "深色模式"}

请根据用户需求，生成一个完整的主题配色方案。配色方案需要以JSON格式输出，格式如下：

{
  "background": "R G B",
  "foreground": "R G B",
  "surface": "R G B",
  "surfaceMuted": "R G B",
  "border": "R G B",
  "muted": "R G B",
  "primary": {
    "50": "R G B",
    "100": "R G B",
    "200": "R G B",
    "300": "R G B",
    "400": "R G B",
    "500": "R G B",
    "600": "R G B",
    "700": "R G B",
    "800": "R G B",
    "900": "R G B",
    "950": "R G B"
  }
}

要求：
1. 所有颜色值使用 RGB 格式，格式为 "R G B"（三个0-255的数字，用空格分隔）
2. background 是背景色，foreground 是前景文字色，两者要有足够的对比度
3. surface 是表面色，surfaceMuted 是次要表面色
4. border 是边框色，muted 是次要文字色
5. primary 是主色调，需要提供完整的色阶（50-950），从浅到深
6. 如果是浅色模式，背景色应该较亮，前景色应该较暗
7. 如果是深色模式，背景色应该较暗，前景色应该较亮
8. 配色要符合用户描述的风格和主题名称的意境
9. 只输出JSON，不要输出任何其他文字或markdown格式

请直接输出JSON对象，不要用代码块包裹。`;

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的UI/UX设计师，擅长设计主题配色方案。你总是以JSON格式输出配色方案，不包含任何其他文字。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return error("AI 未返回有效响应");
    }

    // 解析AI返回的JSON（尝试从markdown代码块中提取）
    let colorsJson: any;
    try {
      // 尝试直接解析
      colorsJson = JSON.parse(content);
    } catch (e) {
      // 如果失败，尝试从markdown代码块中提取
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          colorsJson = JSON.parse(jsonMatch[1]);
        } catch (e2) {
          return error("AI 返回的配色方案格式错误，无法解析 JSON: " + String(e2));
        }
      } else {
        return error("AI 返回的配色方案格式错误，无法找到有效的 JSON 内容");
      }
    }

    // 验证并规范化配色方案
    const colors = normalizeColors(colorsJson);

    // 生成主题编码（基于名称和模式）
    const code = generateThemeCode(name.trim(), mode);

    // 检查编码是否已存在
    const existing = await prisma.systemTheme.findUnique({
      where: { code },
    });

    if (existing) {
      // 如果编码已存在，添加时间戳后缀
      const timestamp = Date.now().toString().slice(-6);
      const uniqueCode = `${code}-${timestamp}`;
      return await createTheme(uniqueCode, name.trim(), mode, colors);
    }

    return await createTheme(code, name.trim(), mode, colors);
  } catch (e: any) {
    console.error("AI生成主题失败:", e);
    return error(
      "AI生成主题失败: " + (e?.message || String(e) || "未知错误")
    );
  }
});

/** 规范化配色方案 */
function normalizeColors(colors: any): string {
  const normalized: any = {};

  // 基础颜色
  if (colors.background) normalized.background = colors.background;
  if (colors.foreground) normalized.foreground = colors.foreground;
  if (colors.surface) normalized.surface = colors.surface;
  if (colors.surfaceMuted) normalized.surfaceMuted = colors.surfaceMuted;
  if (colors.border) normalized.border = colors.border;
  if (colors.muted) normalized.muted = colors.muted;

  // 主色调
  if (colors.primary) {
    normalized.primary = {};
    const primary = colors.primary;
    for (const key of ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]) {
      if (primary[key]) {
        normalized.primary[key] = primary[key];
      }
    }
  }

  return JSON.stringify(normalized);
}

/** 生成主题编码 */
function generateThemeCode(name: string, mode: string): string {
  // 将中文名称转换为拼音或英文编码
  // 简化处理：移除空格和特殊字符，转小写，加上模式前缀
  const code = name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // 如果包含中文字符，使用拼音或直接使用简化编码
  // 这里简化处理，使用模式前缀 + 简化名称
  const prefix = mode === "light" ? "light" : "dark";
  return `${prefix}-${code || "theme"}`;
}

/** 创建主题 */
async function createTheme(
  code: string,
  name: string,
  mode: string,
  colors: string
) {
  const created = await prisma.systemTheme.create({
    data: {
      code,
      name,
      mode: mode as "light" | "dark",
      colors,
      isActive: true,
      isDefault: false,
      sortBy: 0,
    },
  });
  return success(created);
}
