/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    // Minimal autoprefixer for essential browser support only
    autoprefixer: {
      grid: false,
      flexbox: false,
    },
  },
};

export default config; 