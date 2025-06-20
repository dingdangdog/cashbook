import { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-01-10",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Cashbook",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      link: [
        {
          rel: "manifest",
          href: "/manifest.json",
        },
        {
          rel: "shortcut icon",
          href: "/logo.png",
        },
        {
          rel: "icon",
          href: "/logo.png",
        },
      ],
    },
  },
  devServer: {
    port: 9090,
  },
  nitro: {
    // routeRules: {
    //   "/api/**": { swr: true },
    // },
  },
  runtimeConfig: {
    public: {},
    appVersion: "",
    dataPath: "",
    authSecret: "",
    adminUsername: "",
    adminPassword: "",
  },

  modules: [
    "@nuxtjs/i18n",
    "vuetify-nuxt-module",
    "@nuxtjs/tailwindcss",
    "nuxt-echarts",
    "@prisma/nuxt",
  ],

  i18n: {
    strategy: "prefix_except_default",
    defaultLocale: "zh",
    locales: [
      {
        code: "en",
        name: "English",
      },
      {
        code: "zh",
        name: "简体中文",
      },
    ],
    vueI18n: "./i18n.config.ts",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
  // 动态引入echars图表
  echarts: {
    features: ["LabelLayout", "UniversalTransition"],
    charts: ["BarChart", "LineChart", "PieChart"],
    components: [
      "DatasetComponent",
      "GridComponent",
      "TooltipComponent",
      "LegendComponent",
      "ToolboxComponent",
      "DataZoomComponent",
    ],
  },
  tailwindcss: {
    config: {
      prefix: "tw-",
      darkMode: "class",
      content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}",
        "./app.vue",
      ],
    },
  },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {},
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: "dark",
        themes: {
          light: {
            dark: false,
            colors: {
              primary: "#1976D2",
              secondary: "#26A69A",
              accent: "#FF4081",
              error: "#F44336",
              info: "#2196F3",
              success: "#4CAF50",
              warning: "#FB8C00",
              background: "#F5F5F5",
              surface: "#FFFFFF",
            },
          },
          dark: {
            dark: true,
            colors: {
              primary: "#2196F3",
              secondary: "#26A69A",
              accent: "#FF4081",
              error: "#FF5252",
              info: "#42A5F5",
              success: "#66BB6A",
              warning: "#FFA726",
              background: "#121212",
              surface: "#1E1E1E",
            },
          },
        },
      },
    },
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
  },
});
