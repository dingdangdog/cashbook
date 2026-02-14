const prefix = "api/admin/users";

export const page = (
  pageParam: PageParam,
  param: User | Record<string, unknown>,
): Promise<{ total: number; data: User[] }> => {
  return doApi.post(`${prefix}/page`, { ...pageParam, ...param });
};

export const add = (data: { username: string; password: string; name?: string; email?: string; roles?: string }): Promise<User> => {
  return doApi.post(`${prefix}/add`, data);
};

export const del = (id: number): Promise<string> => {
  return doApi.post(`${prefix}/del`, { id });
};

export const update = (data: { id: number; name?: string; email?: string; roles?: string }): Promise<string> => {
  return doApi.post(`${prefix}/update`, data);
};

export const changePassword = (userId: number, newPassword: string): Promise<string> => {
  return doApi.post(`${prefix}/changePassword`, { userId, newPassword });
};
