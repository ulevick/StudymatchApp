import 'react-native-gesture-handler/jestSetup';

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Silence Reanimated 2 warnings and fix act(...) issues
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);
