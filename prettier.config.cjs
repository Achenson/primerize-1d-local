/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindStylesheet: './src/index.css',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
};
