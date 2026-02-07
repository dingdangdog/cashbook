import { defineStore } from "pinia";
import { useRequestFetch } from "#imports";
import { getDefaultColorsByMode } from "~/utils/theme-presets";

type ThemeMode = "light" | "dark";

interface ThemeDefaults {
  light: string;
  dark: string;
}

interface ThemeColorScale {
  [shade: string]: string;
}

interface ThemeColors {
  background?: string;
  foreground?: string;
  surface?: string;
  surfaceMuted?: string;
  border?: string;
  muted?: string;
  primary?: ThemeColorScale | string;
  secondary?: ThemeColorScale | string;
  accent?: ThemeColorScale | string;
  vars?: Record<string, string>;
}

interface ThemeEntry {
  id?: string;
  name: string;
  mode: ThemeMode;
  colors?: ThemeColors;
}

const COLOR_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];
const COLOR_FAMILIES: Array<"primary" | "secondary" | "accent"> = [
  "primary",
  "secondary",
  "accent",
];
const BASE_COLOR_VARS: Record<string, string> = {
  background: "--color-background",
  foreground: "--color-foreground",
  surface: "--color-surface",
  surfaceMuted: "--color-surface-muted",
  border: "--color-border",
  muted: "--color-muted",
};

const normalizeColorValue = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d+(\s+\d+){2}(?:\s*\/\s*[\d.]+)?$/.test(trimmed)) {
    return trimmed;
  }

  const rgbMatch = trimmed.match(/^rgba?\((.*)\)$/i);
  if (rgbMatch) {
    const parts = (rgbMatch[1] || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length >= 3) {
      const [r, g, b, a] = parts;
      return a ? `${r} ${g} ${b} / ${a}` : `${r} ${g} ${b}`;
    }
  }

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const normalizedHex =
      hex.length === 3
        ? hex
          .split("")
          .map((char) => char + char)
          .join("")
        : hex;
    if (normalizedHex.length !== 6) {
      return null;
    }
    const r = parseInt(normalizedHex.slice(0, 2), 16);
    const g = parseInt(normalizedHex.slice(2, 4), 16);
    const b = parseInt(normalizedHex.slice(4, 6), 16);
    if ([r, g, b].some((n) => Number.isNaN(n))) {
      return null;
    }
    return `${r} ${g} ${b}`;
  }

  return trimmed;
};

const pickFirst = (obj: any, keys: string[]): any => {
  for (const key of keys) {
    if (obj && typeof obj === "object" && key in obj) return obj[key];
  }
  return undefined;
};

const normalizeThemeColorsObject = (
  raw: any,
  mode: ThemeMode
): ThemeColors | undefined => {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const normalized: ThemeColors = {};

  // 基础色：兼容 camelCase / snake_case / kebab-case
  normalized.background = pickFirst(raw, ["background"]);
  normalized.foreground = pickFirst(raw, ["foreground"]);
  normalized.surface = pickFirst(raw, ["surface"]);
  normalized.surfaceMuted = pickFirst(raw, [
    "surfaceMuted",
    "surface_muted",
    "surface-muted",
  ]);
  normalized.border = pickFirst(raw, ["border"]);
  normalized.muted = pickFirst(raw, ["muted"]);

  // 色阶：primary / secondary / accent（允许字符串或色阶对象）
  normalized.primary = pickFirst(raw, ["primary"]);
  normalized.secondary = pickFirst(raw, ["secondary"]);
  normalized.accent = pickFirst(raw, ["accent"]);

  // 扩展变量：vars
  const vars = pickFirst(raw, ["vars"]);
  if (vars && typeof vars === "object") {
    normalized.vars = vars;
  }

  // 兼容一些 AI/用户直接给出 CSS 变量名的情况：{ "--color-xxx": "..." }
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k === "string" && k.startsWith("--") && typeof v === "string") {
      normalized.vars = normalized.vars || {};
      normalized.vars[k] = v;
    }
  }

  // 用默认主题补齐缺失字段，避免“看起来完全没生效”
  const defaults = getDefaultColorsByMode(mode);

  const mergeScale = (
    base?: ThemeColorScale | string,
    override?: ThemeColorScale | string
  ): ThemeColorScale | string | undefined => {
    if (override === undefined || override === null) return base;
    if (typeof override === "string") return override;
    const baseObj = base && typeof base === "object" ? base : {};
    return { ...(baseObj as ThemeColorScale), ...override };
  };

  return {
    ...defaults,
    ...normalized,
    primary: mergeScale(defaults.primary, normalized.primary),
    secondary: mergeScale(defaults.secondary, normalized.secondary),
    accent: mergeScale(defaults.accent, normalized.accent),
    vars: {
      ...(defaults.vars || {}),
      ...(normalized.vars || {}),
    },
  };
};

export const useThemeStore = defineStore("theme", () => {
  const currentMode = ref<ThemeMode>("light");
  const isDark = ref(false);
  const themeNames = ref<ThemeDefaults>({
    light: "light-blue",
    dark: "dark-blue",
  });
  const themeConfigLoaded = ref(false);
  const isFetchingThemes = ref(false);
  const themes = ref<{ light?: ThemeEntry; dark?: ThemeEntry }>({});

  const resetCssVariables = (html: HTMLElement) => {
    Object.values(BASE_COLOR_VARS).forEach((varName) => {
      html.style.removeProperty(varName);
    });

    COLOR_FAMILIES.forEach((family) => {
      COLOR_SHADES.forEach((shade) => {
        html.style.removeProperty(`--color-${family}-${shade}`);
      });
    });
  };

  const applyColorScale = (
    html: HTMLElement,
    family: "primary" | "secondary" | "accent",
    scale?: ThemeColorScale | string
  ) => {
    if (!scale) {
      return;
    }

    if (typeof scale === "string") {
      const normalized = normalizeColorValue(scale);
      if (normalized) {
        html.style.setProperty(`--color-${family}-500`, normalized);
      }
      return;
    }

    COLOR_SHADES.forEach((shade) => {
      const value = scale[shade];
      if (!value) {
        return;
      }
      const normalized = normalizeColorValue(value);
      if (normalized) {
        html.style.setProperty(`--color-${family}-${shade}`, normalized);
      }
    });
  };

  const applyThemeColors = (theme?: ThemeEntry) => {
    if (!process.client) {
      return;
    }

    const html = document.documentElement;
    resetCssVariables(html);

    const fallbackMode = (theme?.mode || currentMode.value) as ThemeMode;
    const colors =
      theme?.colors ||
      normalizeThemeColorsObject({}, fallbackMode) ||
      getDefaultColorsByMode(fallbackMode);

    Object.entries(BASE_COLOR_VARS).forEach(([key, varName]) => {
      const value = (colors as any)[key];
      if (!value || typeof value !== "string") {
        return;
      }
      const normalized = normalizeColorValue(value);
      if (normalized) {
        html.style.setProperty(varName, normalized);
      }
    });

    COLOR_FAMILIES.forEach((family) => {
      applyColorScale(html, family, (colors as any)[family]);
    });

    if (colors.vars && typeof colors.vars === "object") {
      Object.entries(colors.vars).forEach(([varName, value]) => {
        const normalized = normalizeColorValue(value);
        if (normalized) {
          html.style.setProperty(varName, normalized);
        }
      });
    }
  };

  const applyThemeToDocument = () => {
    if (!process.client) {
      return;
    }

    const html = document.documentElement;
    const shouldUseDark = currentMode.value === "dark";
    const activeTheme = shouldUseDark ? themes.value.dark : themes.value.light;

    const themeName = activeTheme?.name
      ? activeTheme.name
      : shouldUseDark
        ? themeNames.value.dark
        : themeNames.value.light;

    isDark.value = shouldUseDark;

    if (shouldUseDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    if (themeName) {
      html.setAttribute("data-theme", themeName);
    } else {
      html.removeAttribute("data-theme");
    }

    applyThemeColors(activeTheme);
  };

  const transformThemeResponse = (themeData: any): ThemeEntry | undefined => {
    if (!themeData) {
      return undefined;
    }

    let colors: ThemeColors | undefined;
    if (themeData.colors) {
      if (typeof themeData.colors === "string") {
        try {
          const parsed = JSON.parse(themeData.colors);
          colors = normalizeThemeColorsObject(parsed, themeData.mode);
        } catch {
          colors = undefined;
        }
      } else if (typeof themeData.colors === "object") {
        colors = normalizeThemeColorsObject(themeData.colors, themeData.mode);
      }
    }

    return {
      id: themeData.id,
      // 优先使用 code 作为 data-theme，避免中文/空格等造成不确定性
      name: themeData.code || themeData.name,
      mode: themeData.mode,
      colors,
    };
  };

  const requestFetch = useRequestFetch();

  // 从 localStorage 加载主题名称
  const loadThemeNamesFromStorage = (): ThemeDefaults | null => {
    if (!process.client) {
      return null;
    }

    try {
      const saved = localStorage.getItem("themeNames");
      if (saved) {
        const parsed = JSON.parse(saved) as ThemeDefaults;
        if (parsed.light && parsed.dark) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("读取主题名称失败:", error);
    }

    return null;
  };

  // 保存主题名称到 localStorage
  const saveThemeNamesToStorage = (names: ThemeDefaults) => {
    if (!process.client) {
      return;
    }

    try {
      localStorage.setItem("themeNames", JSON.stringify(names));
    } catch (error) {
      console.error("保存主题名称失败:", error);
    }
  };

  const fetchThemeConfig = async () => {
    if (isFetchingThemes.value) {
      return;
    }

    isFetchingThemes.value = true;

    try {
      const response: any = await requestFetch("/api/themes/active");

      // 后端统一返回格式：{ c: number, m: string, d: any }
      if (response?.c === 200 && response.d) {
        const lightTheme = transformThemeResponse(response.d.light);
        const darkTheme = transformThemeResponse(response.d.dark);

        // 只有在用户没有保存过主题名称时，才使用服务器返回的默认主题
        const savedThemeNames = loadThemeNamesFromStorage();

        if (lightTheme) {
          themes.value.light = lightTheme;
          // 如果用户没有保存过主题名称，才使用服务器返回的默认值
          if (!savedThemeNames) {
            themeNames.value.light = lightTheme.name;
          }
        }

        if (darkTheme) {
          themes.value.dark = darkTheme;
          // 如果用户没有保存过主题名称，才使用服务器返回的默认值
          if (!savedThemeNames) {
            themeNames.value.dark = darkTheme.name;
          }
        }
      } else if (response?.c && response?.c !== 200) {
        console.error("加载主题配置失败:", response?.m || "未知错误");
      }
    } catch (error) {
      console.error("加载主题配置失败:", error);
    } finally {
      themeConfigLoaded.value = true;
      isFetchingThemes.value = false;
      applyThemeToDocument();
    }
  };

  const initTheme = async () => {
    if (!process.client) {
      return;
    }

    // 优先从 cookie 读取（SSR 时已设置），然后从 localStorage 读取
    const themeModeCookie = useCookie<ThemeMode>("themeMode", {
      default: () => "light",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    const savedMode =
      (themeModeCookie.value as ThemeMode) ||
      (localStorage.getItem("themeMode") as ThemeMode | null);
    if (savedMode && ["light", "dark"].includes(savedMode)) {
      currentMode.value = savedMode;
      // 确保 localStorage 和 cookie 同步
      localStorage.setItem("themeMode", savedMode);
      if (themeModeCookie.value !== savedMode) {
        themeModeCookie.value = savedMode;
      }
    }

    // 从 cookie 或 localStorage 加载主题名称
    const themeNamesCookie = useCookie<string>("themeNames", {
      default: () => "",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    let savedThemeNames: ThemeDefaults | null = null;
    if (themeNamesCookie.value) {
      try {
        savedThemeNames = JSON.parse(themeNamesCookie.value) as ThemeDefaults;
      } catch (e) {
        // 忽略解析错误
      }
    }

    if (!savedThemeNames) {
      savedThemeNames = loadThemeNamesFromStorage();
    }

    if (savedThemeNames) {
      themeNames.value = savedThemeNames;
      // 确保 localStorage 和 cookie 同步
      saveThemeNamesToStorage(savedThemeNames);
      if (themeNamesCookie.value !== JSON.stringify(savedThemeNames)) {
        themeNamesCookie.value = JSON.stringify(savedThemeNames);
      }
    }

    if (!themeConfigLoaded.value) {
      await fetchThemeConfig();
    } else {
      applyThemeToDocument();
    }
  };

  const setMode = (mode: ThemeMode) => {
    if (currentMode.value === mode) {
      return;
    }

    currentMode.value = mode;

    if (process.client) {
      localStorage.setItem("themeMode", mode);
      // 同步到 cookie，用于 SSR
      const themeModeCookie = useCookie<ThemeMode>("themeMode", {
        default: () => "light",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      themeModeCookie.value = mode;
      applyThemeToDocument();
    }
  };

  const toggleMode = () => {
    setMode(currentMode.value === "light" ? "dark" : "light");
  };

  const toggleTheme = () => {
    toggleMode();
  };

  watch(
    () => ({ ...themeNames.value }),
    (newNames) => {
      // 当主题名称变化时，保存到 localStorage 和 cookie
      if (process.client) {
        saveThemeNamesToStorage(newNames);
        // 同步到 cookie，用于 SSR
        const themeNamesCookie = useCookie<string>("themeNames", {
          default: () => "",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
        themeNamesCookie.value = JSON.stringify(newNames);
      }
      applyThemeToDocument();
    }
  );

  watch(
    () => [themes.value.light, themes.value.dark],
    () => {
      applyThemeToDocument();
    }
  );

  return {
    currentMode,
    isDark,
    themeNames,
    themeConfigLoaded,
    initTheme,
    fetchThemeConfig,
    setMode,
    toggleMode,
    toggleTheme,
  };
});
