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

export const toDocumentation = () => {
  window.open("https://doc.cashbook.oldmoon.top", "_blank");
};

// 主题切换功能已移至 useAppTheme composable

/**
 * 生成移动端友好的分页页码数组
 * @param currentPage 当前页码
 * @param totalPages 总页数
 * @param maxVisiblePages 移动端最大可见页码数（默认3个）
 * @returns 页码数组，包含数字和省略号
 */
export const generateMobileFriendlyPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 3
): (number | string)[] => {
  if (totalPages <= maxVisiblePages) {
    // 如果总页数不超过最大可见页数，直接返回所有页码
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  if (currentPage <= 2) {
    // 当前页在前部：[1] [2] ... [最后一页]
    pages.push(1);
    if (totalPages > 1) {
      pages.push(2);
    }
    if (totalPages > 3) {
      pages.push("...");
    }
    if (totalPages > 2) {
      pages.push(totalPages);
    }
  } else if (currentPage >= totalPages - 1) {
    // 当前页在后部：[1] ... [倒数第二页] [最后一页]
    pages.push(1);
    if (totalPages > 3) {
      pages.push("...");
    }
    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }
    pages.push(totalPages);
  } else {
    // 当前页在中间：[1] ... [当前页] ... [最后一页]
    pages.push(1);
    pages.push("...");
    pages.push(currentPage);
    pages.push("...");
    pages.push(totalPages);
  }

  return pages.filter((page, index, arr) => {
    // 去除重复的页码和多余的省略号
    if (typeof page === 'number') {
      return page >= 1 && page <= totalPages && arr.indexOf(page) === index;
    }
    // 确保省略号不重复
    return index === 0 || arr[index - 1] !== "...";
  });
};
