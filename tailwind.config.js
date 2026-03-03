/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        // 统一品牌与主题色（白绿 / 黑绿）
        // 更偏墨绿的品牌色，暗色模式下更深更稳
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#4ade80",
          400: "#22c55e",
          500: "#0f5f3a",
          600: "#064e3b",
          700: "#022c22",
          800: "#011610",
          900: "#010b08",
          950: "#000605",
        },
        // 应用背景：浅色为白+淡绿，深色为黑+墨绿
        surface: {
          DEFAULT: "#ffffff", // 主内容背景（亮色）
          muted: "#f0fdf4", // 浅绿背景，用于头部 / 侧栏
          soft: "#ecfdf3", // 更柔和的卡片背景
          dark: "#020617", // 主内容背景（暗色）
          deep: "#020617", // 兼容命名
          darkMuted: "#022c22", // 深色下的带绿背景
        },
        // 统一文本颜色
        ink: {
          primary: "#022c22", // 品牌绿系深色
          secondary: "#1f2933", // 中性深色
          muted: "#6b7280", // 次要文字
          onDark: "#e5e7eb", // 深色背景上的主文字
        },
        // 统一边框颜色
        frame: {
          light: "#d1fae5",
          DEFAULT: "#bbf7d0",
          dark: "#064e3b",
        },
        // 状态色（保持少量非绿色，用于语义）
        state: {
          danger: "#ef4444",
          warning: "#f97316",
          info: "#0ea5e9",
        },
      },
      fontFamily: {
        sans: [
          "Inter var",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft:
          "0 2px 15px -3px rgba(15, 23, 42, 0.05), 0 10px 20px -2px rgba(15, 23, 42, 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
