export const useTheme = () => {
  const themeStore = useThemeStore();

  onMounted(async () => {
    await themeStore.initTheme();
  });

  return {
    currentMode: themeStore.currentMode,
    isDark: themeStore.isDark,
    themeNames: themeStore.themeNames,
    themeConfigLoaded: themeStore.themeConfigLoaded,
    fetchThemeConfig: themeStore.fetchThemeConfig,
    setMode: themeStore.setMode,
    toggleMode: themeStore.toggleMode,
  };
};
