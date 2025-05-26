// index.js arba App.js (pagrindinis įėjimo failas)
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import React from 'react';
global.detox = false;
import { AppRegistry } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import App from './App';
import { name as appName } from './app.json';

function Root() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <App />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

AppRegistry.registerComponent(appName, () => Root);
