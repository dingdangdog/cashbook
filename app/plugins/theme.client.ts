/**
 * 客户端主题插件：应用加载时唯一负责初始化主题（拉取后端配置并应用）。
 * 与 stores/theme 配合；页面通过 useAppTheme() 获取状态与切换方法，不要在此处之外再调 initTheme。
 */
export default defineNuxtPlugin(async () => {
  const themeStore = useThemeStore();
  if (!themeStore.themeConfigLoaded.value) {
    await themeStore.initTheme();
  }
});

