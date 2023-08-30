export interface Server {
  id: number;
  version?: string;
  environment?: string;
  createDate: Date;
}

export interface Captcha {
  captchaId: string;
  imageUrl: string;
}
