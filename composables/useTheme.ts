export const useAppTheme = () => {
  const isDark = ref(false);

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      // Use toggle method for cleaner code
      document.documentElement.classList.toggle('dark', isDark.value);
      
      // Save to localStorage
      localStorage.setItem("theme", isDark.value ? "dark" : "light");
    }
  };

  const initTheme = () => {
    if (typeof window !== 'undefined') {
      // Get saved theme or default to system preference
      const savedTheme = localStorage.getItem("theme");
      
      if (savedTheme) {
        isDark.value = savedTheme === "dark";
      } else {
        // Default to system preference
        isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      
      // Apply initial theme using toggle for consistency
      document.documentElement.classList.toggle('dark', isDark.value);
    }
  };

  return {
    isDark,
    toggleTheme,
    initTheme,
  };
};
