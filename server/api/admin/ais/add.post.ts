import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    provider,
    apiProtocol,
    apiKey,
    apiEndpoint,
    name,
    apiModel,
    apiVersion,
    temperature,
    maxTokens,
    timeout,
    extraConfig,
    isActive,
  } = body;

  if (!provider?.trim() || !name?.trim() || !apiProtocol?.trim()) {
    return error("provider、name、apiProtocol 不能为空");
  }

  const created = await prisma.systemAIProvider.create({
    data: {
      provider: String(provider).trim(),
      apiProtocol: String(apiProtocol).trim(),
      apiKey: apiKey != null ? String(apiKey) : null,
      apiEndpoint: apiEndpoint != null ? String(apiEndpoint) : null,
      name: String(name).trim(),
      apiModel: apiModel != null ? String(apiModel) : null,
      apiVersion: apiVersion != null ? String(apiVersion) : null,
      temperature: temperature != null ? Number(temperature) : 0.5,
      maxTokens: maxTokens != null ? Number(maxTokens) : 3000,
      timeout: timeout != null ? Number(timeout) : 30000,
      extraConfig: extraConfig != null ? String(extraConfig) : null,
      isActive: Boolean(isActive !== false),
    },
  });
  return success(created);
});
