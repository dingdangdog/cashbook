const prefiex = "api/admin/entry/typeRelations";

export const page = (
  page: PageParam,
  param: TypeRelation
): Promise<{ total: number; data: TypeRelation[] }> => {
  return doApi.post(`${prefiex}/page`, { ...page, ...param });
};

export const add = (data: TypeRelation): Promise<string> => {
  return doApi.post(`${prefiex}/add`, data);
};

export const del = (id: number): Promise<string> => {
  return doApi.post(`${prefiex}/del`, { id });
};

export const update = (data: TypeRelation): Promise<string> => {
  return doApi.post(`${prefiex}/update`, data);
};

export const list = (data: TypeRelation): Promise<TypeRelation[]> => {
  return doApi.post(`${prefiex}/list`, data);
};

export const all = (): Promise<TypeRelation[]> => {
  return doApi.post(`${prefiex}/all`, {});
};
