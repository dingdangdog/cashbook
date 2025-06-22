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
    // 使用根目录的 tailwind.config.js 文件
  },
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/.prisma/client/index-browser.js",
      },
    },
  },
});
