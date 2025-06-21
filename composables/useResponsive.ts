export const useResponsive = () => {
  const isMobile = ref(false);
  const isTablet = ref(false);
  const isDesktop = ref(false);

  const updateBreakpoints = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      isMobile.value = width < 768; // md breakpoint
      isTablet.value = width >= 768 && width < 1024; // lg breakpoint
      isDesktop.value = width >= 1024;
    }
  };

  const initResponsive = () => {
    if (typeof window !== 'undefined') {
      updateBreakpoints();
      window.addEventListener("resize", updateBreakpoints);
    }
  };

  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener("resize", updateBreakpoints);
    }
  };

  return {
    isMobile,
    isTablet,
    isDesktop,
    initResponsive,
    cleanup,
  };
};
