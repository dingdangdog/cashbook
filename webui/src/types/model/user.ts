
export interface User {
  id?: number;
  name?: string;
  userName: string;
  password: string;
  againPassword?: string;
}

export interface LoginUser {
  id: number;
  name: string;
  token: string;
  background: string;
}

export interface NewPassword{
  old: string,
  new: string
}
