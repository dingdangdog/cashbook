const prefiex = "api/admin/entry/theme";

export type ThemeMode = "light" | "dark";

export interface AdminTheme {
  id?: string;
  code: string;
  name: string;
  mode: ThemeMode;
  colors: string;
  isActive: boolean;
  isDefault: boolean;
  sortBy: number;
  createdAt?: string;
  updatedAt?: string;
}

export const page = (
  page: PageParam,
  param: Partial<AdminTheme> & any
): Promise<{ total: number; data: AdminTheme[] }> => {
  return doApi.post(`${prefiex}/page`, { ...page, ...param });
};

export const add = (data: Partial<AdminTheme>): Promise<AdminTheme> => {
  return doApi.post(`${prefiex}/add`, data);
};

export const del = (id: string): Promise<AdminTheme> => {
  return doApi.post(`${prefiex}/del`, { id });
};

export const update = (data: Partial<AdminTheme>): Promise<AdminTheme> => {
  return doApi.post(`${prefiex}/update`, data);
};

export const list = (
  data: Partial<AdminTheme>
): Promise<AdminTheme[]> => {
  return doApi.post(`${prefiex}/list`, data);
};

export const all = (): Promise<AdminTheme[]> => {
  return doApi.post(`${prefiex}/all`, {});
};

