const prefix = "api/admin/config";

export interface SystemConfigRow {
  id?: number;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  version?: string | null;
  openRegister?: boolean;
  createAt?: string | null;
  updateAt?: string | null;
}

export const getConfig = (): Promise<SystemConfigRow> => {
  return doApi.get(prefix + "/get");
};

export const updateConfig = (
  data: Partial<SystemConfigRow>
): Promise<SystemConfigRow> => {
  return doApi.post(prefix + "/update", data);
};
