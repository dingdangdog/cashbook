import { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: "2025-01-10",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
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
    appUrl: "",
    dataPath: "",
    authSecret: "",
    authOrigin: "", // 即 NUXT_AUTH_ORIGIN，权限框架使用
    adminUsername: "",
    adminPassword: "",
  },

  modules: [
    "@nuxtjs/i18n",
    "vuetify-nuxt-module",
    "@nuxtjs/tailwindcss",
    "nuxt-echarts",
    "@sidebase/nuxt-auth",
    "@prisma/nuxt",
  ],

  auth: {
    // baseURL: process.env.NUXT_AUTH_ORIGIN,
    // globalAppMiddleware: false,
    // originEnvKey: "NUXT_AUTH_ORIGIN",
    provider: {
      type: "authjs",
      trustHost: false,
      addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: false,
      enableOnWindowFocus: true,
    },
  },
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
    },
  },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {},
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: "dark",
        themes: {},
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
