
export interface User {
  id?: number;
  name?: string;
  userName: string;
  password: string;
}

export interface LoginUser {
  id: number;
  name: string;
  token: string;
}

export interface NewPassword{
  old: string,
  new: string
}