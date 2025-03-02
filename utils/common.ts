// 判断屏幕尺寸，窄屏为 true
export const miniFullscreen = () => {
  return window.innerWidth < 1080;
};

export const checkSignIn = () => {
  // console.log(useAuth().status.value);
  return useCookie("Authorization").value ? true : false;
};

export const getUUID = (num: number) => {
  const codes =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";

  let uuid = "";
  for (let i = 0; i < num; i++) {
    const randomNumber = Math.floor(Math.random() * 62) + 1;
    uuid += codes[randomNumber];
  }
  return uuid;
};

export const formatDate = (time?: number | Date | string): string => {
  let date;
  if (!time) {
    date = new Date();
  } else if (time instanceof Date) {
    date = time;
  } else {
    date = new Date(time);
  }

  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // 月份从 0 开始，需要加 1
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/***
 * 日期格式化方法
 *
 * @author DingDangDog
 * @param format 格式化后的日期格式，标准格式：YYYY-MM-dd HH:mm:ss。
 * @param date 待格式化的日期，可以是string或Date类型
 * @return 标准格式结果示例：2022-12-08 17:30:00
 */
export const dateFormater = (format: string, date: string | Date) => {
  date = new Date(date);

  const dataRegIndexs = [0, 1, 2, 3, 4, 5];
  const dataRegKeys = ["Y+", "M+", "d+", "H+", "m+", "s+"];
  const dataItem = [
    date.getFullYear().toString(),
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : (date.getMonth() + 1).toString(),
    date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString(),
    date.getHours().toString(),
    date.getMinutes().toString(),
    date.getSeconds().toString(),
  ];

  let ret;
  for (const index in dataRegIndexs) {
    ret = new RegExp("(" + dataRegKeys[index] + ")").exec(format);
    if (ret) {
      format = format.replace(
        ret[1],
        ret[1].length == 1
          ? dataItem[index]
          : dataItem[index].padStart(ret[1].length, "0")
      );
    }
  }
  return format;
};

export const toGithub = () => {
  window.open(`https://github.com/dingdangdog/cashbook`, "_blank");
};
