export type ThemeMode = "light" | "dark";

export interface ThemeColorScale {
  [shade: string]: string;
}

export interface ThemeColors {
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

export interface ThemePreset {
  name: string;
  displayName: string;
  mode: ThemeMode;
  isDefault: boolean;
  sortOrder: number;
  colors: ThemeColors;
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

const cloneColors = (colors: ThemeColors): ThemeColors =>
  JSON.parse(JSON.stringify(colors));

const invertScale = (scale: ThemeColorScale): ThemeColorScale => {
  const inverted: ThemeColorScale = {};
  COLOR_SHADES.forEach((shade, index) => {
    const targetShade = COLOR_SHADES[COLOR_SHADES.length - 1 - index];
    inverted[shade] = scale[targetShade] ?? scale[shade];
  });
  return inverted;
};

// 蓝色色阶 - 用于主色调
const BLUE_SCALE: ThemeColorScale = {
  "50": "#EFF6FF",
  "100": "#DBEAFE",
  "200": "#BFDBFE",
  "300": "#93C5FD",
  "400": "#60A5FA",
  "500": "#3B82F6",
  "600": "#2563EB",
  "700": "#1D4ED8",
  "800": "#1E40AF",
  "900": "#1E3A8A",
  "950": "#172554",
};

// 石板灰色阶 - 用于辅助色（亮色模式：浅灰，暗色模式：深灰）
const SLATE_SCALE: ThemeColorScale = {
  "50": "#F8FAFC",
  "100": "#F1F5F9",
  "200": "#E2E8F0",
  "300": "#CBD5E1",
  "400": "#94A3B8",
  "500": "#64748B",
  "600": "#475569",
  "700": "#334155",
  "800": "#1E293B",
  "900": "#0F172A",
  "950": "#020617",
};

// 靛蓝色阶 - 用于强调色
const INDIGO_SCALE: ThemeColorScale = {
  "50": "#EEF2FF",
  "100": "#E0E7FF",
  "200": "#C7D2FE",
  "300": "#A5B4FC",
  "400": "#818CF8",
  "500": "#6366F1",
  "600": "#4F46E5",
  "700": "#4338CA",
  "800": "#3730A3",
  "900": "#312E81",
  "950": "#1E1B4B",
};

// 默认亮色主题 - 白蓝配色
export const defaultLightThemeColors: ThemeColors = {
  background: "#FFFFFF", // 纯白背景
  foreground: "#0F172A", // 深色文字
  surface: "#FFFFFF", // 白色表面
  surfaceMuted: "#F8FAFC", // 极浅灰表面
  border: "#E2E8F0", // 浅灰边框
  muted: "#64748B", // 中性灰文字
  primary: BLUE_SCALE, // 蓝色主色调
  secondary: SLATE_SCALE, // 石板灰辅助色
  accent: INDIGO_SCALE, // 靛蓝强调色
};

// 默认暗色主题 - 黑蓝配色
export const defaultDarkThemeColors: ThemeColors = {
  background: "#020617", // 接近黑色背景
  foreground: "#F8FAFC", // 浅色文字
  surface: "#0F172A", // 深色表面
  surfaceMuted: "#020617", // 接近黑色表面
  border: "#1E293B", // 深灰边框
  muted: "#94A3B8", // 浅灰文字
  primary: invertScale(BLUE_SCALE), // 反转的蓝色主色调
  secondary: invertScale(SLATE_SCALE), // 反转的石板灰辅助色
  accent: invertScale(INDIGO_SCALE), // 反转的靛蓝强调色
};

export const defaultThemePresets: ThemePreset[] = [
  {
    name: "light-blue",
    displayName: "白蓝",
    mode: "light",
    isDefault: true,
    sortOrder: 1,
    colors: cloneColors(defaultLightThemeColors),
  },
  {
    name: "dark-blue",
    displayName: "黑蓝",
    mode: "dark",
    isDefault: true,
    sortOrder: 11,
    colors: cloneColors(defaultDarkThemeColors),
  },
];

export const getDefaultColorsByMode = (mode: ThemeMode): ThemeColors =>
  cloneColors(
    mode === "dark" ? defaultDarkThemeColors : defaultLightThemeColors
  );
