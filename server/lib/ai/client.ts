import OpenAI from "openai";
import { getSystemAIProvidersPage } from "~~/server/utils/db";

/** 获取第一个可用的 OpenAI 兼容客户端 */
export async function getAIClient(): Promise<OpenAI | null> {
  const { data: providers } = await getSystemAIProvidersPage(
    { isActive: true },
    { pageNum: 1, pageSize: 1 },
  );
  const provider = providers[0];
  if (provider?.apiKey) {
    return new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.apiEndpoint || undefined,
    });
  }
  // 回退到环境变量
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    return new OpenAI({ apiKey: key });
  }
  return null;
}

/** 获取第一个可用的 AI 配置（模型名等） */
export async function getAIProviderConfig(): Promise<{
  model: string;
  temperature?: number;
  maxTokens?: number;
} | null> {
  const { data: providers } = await getSystemAIProvidersPage(
    { isActive: true },
    { pageNum: 1, pageSize: 1 },
  );
  const provider = providers[0];
  if (provider) {
    return {
      model: provider.apiModel || "gpt-4o-mini",
      temperature: provider.temperature ?? 0.5,
      maxTokens: provider.maxTokens ?? 3000,
    };
  }
  return {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.5,
    maxTokens: 3000,
  };
}
