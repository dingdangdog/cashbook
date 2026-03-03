import type { CommonChartData } from "./model";

export const getSystemInfo = async () => {
  return await doApi.get("api/config");
};

export const daily = async (data: any): Promise<CommonChartData[]> => {
  return doApi.post<CommonChartData[]>("api/entry/analytics/daily", {
    ...data,
    bookId: localStorage.getItem("bookId"),
  });
};

export const getIndustryType = (flowType: string): Promise<any[]> => {
  return doApi.post<any[]>("api/entry/flow/type/getIndustryType", {
    flowType,
    bookId: localStorage.getItem("bookId"),
  });
};

export const getPayType = (flowType: string): Promise<any[]> => {
  return doApi.post<any[]>("api/entry/flow/type/getPayType", {
    flowType,
    bookId: localStorage.getItem("bookId"),
  });
};

export const getTypeRelation = (): Promise<TypeRelation[]> => {
  return doApi.post<TypeRelation[]>("api/entry/typeRelation/list", {
    bookId: localStorage.getItem("bookId"),
  });
};
