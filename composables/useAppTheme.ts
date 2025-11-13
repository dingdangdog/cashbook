// 全局主题状态
const globalIsDark = ref(false);
let isInitialized = false;

// TailwindCSS 主题管理 composable
export const useAppTheme = () => {
  // 检查当前主题状态
  const checkCurrentTheme = () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      console.log("[Theme] Checking current theme:", { savedTheme });
      if (savedTheme) {
        return savedTheme === "dark";
      } else {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        console.log("[Theme] Using system preference:", systemPrefersDark);
        return systemPrefersDark;
      }
    }
    return false;
  };

  // 应用主题到 DOM
  const applyTheme = (dark: boolean) => {
    if (typeof window !== "undefined") {
      const htmlElement = document.documentElement;

      console.log("[Theme] Applying theme:", dark ? "dark" : "light");
      console.log(
        "[Theme] HTML classes before:",
        htmlElement.classList.toString()
      );

      if (dark) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }

      console.log(
        "[Theme] HTML classes after:",
        htmlElement.classList.toString()
      );
    }
  };

  // 初始化主题（只执行一次）
  const initTheme = () => {
    console.log("[Theme] initTheme called, isInitialized:", isInitialized);
    if (isInitialized) return;

    const currentTheme = checkCurrentTheme();
    console.log("[Theme] Initializing with theme:", currentTheme);
    globalIsDark.value = currentTheme;
    applyTheme(currentTheme);
    isInitialized = true;
    console.log(
      "[Theme] Initialization complete, globalIsDark:",
      globalIsDark.value
    );
  };

  // 切换主题
  const toggleTheme = () => {
    console.log(
      "[Theme] toggleTheme called, current isDark:",
      globalIsDark.value
    );
    globalIsDark.value = !globalIsDark.value;
    console.log("[Theme] After toggle, isDark:", globalIsDark.value);

    if (typeof window !== "undefined") {
      // 保存到 localStorage
      const themeString = globalIsDark.value ? "dark" : "light";
      localStorage.setItem("theme", themeString);
      console.log("[Theme] Saved to localStorage:", themeString);

      // 应用主题
      applyTheme(globalIsDark.value);
    }
  };

  // 设置主题
  const setTheme = (dark: boolean) => {
    console.log("[Theme] setTheme called with:", dark);
    globalIsDark.value = dark;

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", dark ? "dark" : "light");
      applyTheme(dark);
    }
  };

  // 获取当前主题状态
  const getThemeState = () => {
    if (typeof window !== "undefined") {
      return {
        isDark: globalIsDark.value,
        isLight: !globalIsDark.value,
        systemPrefersDark: window.matchMedia("(prefers-color-scheme: dark)")
          .matches,
        savedTheme: localStorage.getItem("theme"),
      };
    }
    return {
      isDark: globalIsDark.value,
      isLight: !globalIsDark.value,
      systemPrefersDark: false,
      savedTheme: null,
    };
  };

  return {
    isDark: globalIsDark,
    initTheme,
    toggleTheme,
    setTheme,
    getThemeState,
  };
};
