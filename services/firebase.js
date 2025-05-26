import { getApp, initializeApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

let app;
try {
  app = getApp();
} catch (e) {
  app = initializeApp();
}

const db = getFirestore(app);
const authInstance = getAuth(app);

export { app, db, authInstance };
