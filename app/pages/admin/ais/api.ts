const prefix = "api/admin/ais";

export interface AdminAI {
  id?: string;
  provider?: string;
  apiProtocol?: string;
  apiKey?: string | null;
  apiEndpoint?: string | null;
  name?: string;
  apiModel?: string | null;
  apiVersion?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
  timeout?: number;
  extraConfig?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const page = (
  page: PageParam,
  param: Partial<AdminAI> & Record<string, unknown>
): Promise<{ total: number; data: AdminAI[] }> => {
  return doApi.post(`${prefix}/page`, { ...page, ...param });
};

export const add = (data: Partial<AdminAI>): Promise<AdminAI> => {
  return doApi.post(`${prefix}/add`, data);
};

export const del = (id: string): Promise<AdminAI> => {
  return doApi.post(`${prefix}/del`, { id });
};

export const update = (data: Partial<AdminAI>): Promise<AdminAI> => {
  return doApi.post(`${prefix}/update`, data);
};

export const list = (data?: Partial<AdminAI>): Promise<AdminAI[]> => {
  return doApi.post(`${prefix}/list`, data || {});
};

export const all = (): Promise<AdminAI[]> => {
  return doApi.post(`${prefix}/all`, {});
};
