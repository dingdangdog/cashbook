import prisma from "~~/server/lib/prisma";
import { success, error } from "~~/server/utils/common";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    id,
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
  if (!id) return error("缺少 id");

  const data: any = {};
  if (provider !== undefined) data.provider = String(provider).trim();
  if (apiProtocol !== undefined) data.apiProtocol = String(apiProtocol).trim();
  if (apiKey !== undefined) data.apiKey = apiKey != null ? String(apiKey) : null;
  if (apiEndpoint !== undefined)
    data.apiEndpoint = apiEndpoint != null ? String(apiEndpoint) : null;
  if (name !== undefined) data.name = String(name).trim();
  if (apiModel !== undefined) data.apiModel = apiModel != null ? String(apiModel) : null;
  if (apiVersion !== undefined)
    data.apiVersion = apiVersion != null ? String(apiVersion) : null;
  if (temperature !== undefined) data.temperature = Number(temperature);
  if (maxTokens !== undefined) data.maxTokens = Number(maxTokens);
  if (timeout !== undefined) data.timeout = Number(timeout);
  if (extraConfig !== undefined)
    data.extraConfig = extraConfig != null ? String(extraConfig) : null;
  if (isActive !== undefined) data.isActive = Boolean(isActive);

  const updated = await prisma.systemAIProvider.update({
    where: { id: String(id) },
    data,
  });
  return success(updated);
});
