module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    jest: true, // 👈 svarbiausia eilutė
  },
  overrides: [
    {
      files: ['e2e/**/*.{js,ts,tsx}'],
      plugins: ['detox'],
      env: { 'detox/detox': true, jest: true }
    }
  ]
};
