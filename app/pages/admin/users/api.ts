const prefiex = "api/admin/entry/users";

export const page = (
  page: PageParam,
  param: User
): Promise<{ total: number; data: User[] }> => {
  return doApi.post(`${prefiex}/page`, { ...page, ...param });
};

export const add = (data: User): Promise<string> => {
  return doApi.post(`${prefiex}/add`, data);
};

export const del = (id: number): Promise<string> => {
  return doApi.post(`${prefiex}/del`, { id });
};

export const update = (data: User): Promise<string> => {
  return doApi.post(`${prefiex}/update`, data);
};

export const list = (data: User): Promise<User[]> => {
  return doApi.post(`${prefiex}/list`, data);
};

export const all = (): Promise<User[]> => {
  return doApi.post(`${prefiex}/all`, {});
};
