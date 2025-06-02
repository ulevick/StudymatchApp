import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

const ANDROID = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
const IOS = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

export const getCurrentLocation = async () => {
  const perm = Platform.OS === 'ios' ? IOS : ANDROID;
  let status = await check(perm);
  if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
    status = await request(perm);
  }
  if (status !== RESULTS.GRANTED) return null;

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      p => resolve({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
      }),
      reject,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  }).catch(err => {
    console.log('Lokacijos klaida:', err);
    return null;
  });
};
