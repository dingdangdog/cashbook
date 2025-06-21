// Theme plugin for client-side theme handling
export default defineNuxtPlugin({
  name: "theme-plugin",
  enforce: "pre", // Run before other plugins
  setup() {
    // Function to apply theme based on preference
    const applyTheme = () => {
      try {
        // Check localStorage first
        const savedTheme = localStorage.getItem("theme");

        if (
          savedTheme === "dark" ||
          (!savedTheme &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (error) {
        console.error("Error applying theme:", error);
      }
    };

    // Apply theme immediately
    if (process.client) {
      applyTheme();

      // Listen for system preference changes
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          // Only apply if user hasn't set a preference
          if (!localStorage.getItem("theme")) {
            if (e.matches) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        });
    }
  },
});
