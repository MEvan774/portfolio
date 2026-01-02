const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant, e }) {
      addVariant("data-theme-dark", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `:where([data-theme="dark"], [data-theme="dark"] *) .${e(
            `data-theme-dark${separator}${className}`
          )}`;
        });
      });

      // optional alias
      addVariant("data-dark", ({ modifySelectors, separator }) => {
        modifySelectors(({ className }) => {
          return `:where([data-theme="dark"], [data-theme="dark"] *) .${e(
            `data-dark${separator}${className}`
          )}`;
        });
      });
    }),
    // ...existing plugins...
  ],
};