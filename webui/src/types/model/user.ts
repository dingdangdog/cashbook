
export interface User {
  id?: string;
  name?: string;
  userName: string;
  password: string;
  againPassword?: string;
}

export interface LoginUser {
  id: string;
  name: string;
  token: string;
  background: string;
}

export interface NewPassword{
  old: string,
  new: string
}
