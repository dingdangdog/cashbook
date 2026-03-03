const prefiex = "api/entry/book";

export const page = (
  page: PageParam,
  param: Book
): Promise<{ total: number; data: Book[] }> => {
  return doApi.post(`${prefiex}/page`, { ...page, ...param });
};

export const add = (data: Book): Promise<string> => {
  return doApi.post(`${prefiex}/add`, data);
};

export const del = (id: number): Promise<string> => {
  return doApi.post(`${prefiex}/del`, { id });
};

export const update = (data: Book): Promise<string> => {
  return doApi.post(`${prefiex}/update`, data);
};

export const list = (data: Book): Promise<Book[]> => {
  return doApi.post(`${prefiex}/list`, data);
};

export const all = (): Promise<Book[]> => {
  return doApi.post(`${prefiex}/all`, {});
};
