module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',   // import { MY_KEY } from '@env';
        path: '.env',         // kelias iki tavo .env
        allowUndefined: false // mest klaidą, jei kintamasis nerastas
      },
    ],

    // KITI (jei turi) Babel pluginai gali eiti čia …

    'react-native-reanimated/plugin', // ❗️ turi likti paskutinis
  ],
};
