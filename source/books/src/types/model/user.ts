
export interface User {
  id?: number;
  name?: string;
  userName: string;
  password: string;
}

export interface LoginUser {
  id: number;
  token: string;
}