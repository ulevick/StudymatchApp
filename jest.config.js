module.exports = {
  preset: 'react-native',
  setupFiles: ['./jestSetup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native' +
    '|react-native-vector-icons' +
    '|@react-native' +
    '|@react-navigation' +
    ')/)',
  ],
  moduleNameMapper: {
    '^firebase/app$': '<rootDir>/__mocks__/firebaseApp.js',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebaseFirestore.js',
    '^firebase/auth$': '<rootDir>/__mocks__/firebaseAuth.js',
  },
};
