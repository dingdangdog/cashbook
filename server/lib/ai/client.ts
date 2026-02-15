import OpenAI from "openai";
import {
  getSystemAIProvidersPage,
  getSystemAIProviderById,
} from "~~/server/utils/db";

async function getProvider(providerId?: string | null) {
  if (providerId) {
    const p = await getSystemAIProviderById(providerId);
    if (p?.isActive) return p;
  }
  const { data: providers } = await getSystemAIProvidersPage(
    { isActive: true },
    { pageNum: 1, pageSize: 1 },
  );
  return providers[0] ?? null;
}

/** 获取 OpenAI 兼容客户端，可选指定服务商 ID */
export async function getAIClient(
  providerId?: string | null,
): Promise<OpenAI | null> {
  const provider = await getProvider(providerId);
  if (provider?.apiKey) {
    return new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.apiEndpoint || undefined,
    });
  }
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    return new OpenAI({ apiKey: key });
  }
  return null;
}

/** 获取 AI 配置（模型名等），可选指定服务商 ID */
export async function getAIProviderConfig(
  providerId?: string | null,
): Promise<{
  model: string;
  temperature?: number;
  maxTokens?: number;
} | null> {
  const provider = await getProvider(providerId);
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
