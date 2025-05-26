import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
  GeoPoint,
} from '@react-native-firebase/firestore';

import { authInstance } from '../../services/firebase';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import global from '../../styles/global';
import authStyles from '../../styles/authStyles';
import PeopleBackground from '../../components/PeopleBackground';

const SignIn = ({ navigation }) => {
  /* ───────────── form state ───────────── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* ───────────── error state ───────────── */
  const [errorMsg, setErrorMsg] = useState('');
  const [errEmail, setErrEmail] = useState(false);
  const [errPass, setErrPass] = useState(false);

  /* ───────────── animation (shake) ───────────── */
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const triggerShake = () =>
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
      ]).start();

  /* ───────────── sign‑in ───────────── */
  const handleSignIn = async () => {
    // tušti laukai
    if (!email || !password) {
      setErrEmail(!email);
      setErrPass(!password);
      setErrorMsg('Užpildyk visus laukus.');
      triggerShake();
      return;
    }

    try {
      // Firebase Auth
      const { user } = await signInWithEmailAndPassword(authInstance, email, password);

      /* lokacijos atnaujinimas */
      try {
        const coords = await getCurrentLocation();
        if (coords) {
          const db = getFirestore();
          await updateDoc(doc(db, 'users', user.uid), {
            location: new GeoPoint(coords.latitude, coords.longitude),
            locationUpdatedAt: serverTimestamp(),
          });
        }
      } catch (locErr) {
        console.log('Nepavyko atnaujinti lokacijos:', locErr);
      }

      // sėkmingai → profilis
      navigation.replace('Profile', { uid: user.uid });
    } catch (error) {
      // auth klaidos → tokia pati logika kaip Reg_Stud1
      let message = 'Nepavyko prisijungti. Patikrink el. paštą ir slaptažodį.';
      if (error.code === 'auth/invalid-email')  message = 'Netinkamas el. pašto formatas.';
      if (error.code === 'auth/user-not-found') message = 'Vartotojas nerastas.';
      if (error.code === 'auth/wrong-password') message = 'Neteisingas slaptažodis.';

      setErrEmail(true);
      setErrPass(true);
      setErrorMsg(message);
      triggerShake();
    }
  };

  /* ───────────── JSX ───────────── */
  return (
      <View style={authStyles.containerSignIn}>
        <PeopleBackground />

        <Image
            source={require('../../assets/images/hat.png')}
            style={authStyles.hatIcon}
        />

        <Text style={authStyles.title}>
          Study<Text style={global.titleMatch}>match</Text>
        </Text>

        <Text style={authStyles.subtitle}>
          Pradėk studijas su naujomis pažintimis – rask draugų, kambariokų ir
          bendrystę nuo pirmos dienos!
        </Text>

        {/* abu inputai su shake */}
        <Animated.View style={{ width: '100%', transform: [{ translateX: shakeAnim }] }}>
          {/* el. paštas */}
          <TextInput
              testID="login-email"
              placeholder="El. paštas"
              placeholderTextColor="#7F9CAB"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrEmail(false);
                setErrorMsg('');
              }}
              style={[
                authStyles.inputSigIn,
                errEmail && authStyles.inputError,
              ]}
              color="#333"
          />

          {/* slaptažodis */}
          <View style={authStyles.inputWrapper}>
            <TextInput
                testID="login-password"
                placeholder="Slaptažodis"
                placeholderTextColor="#7F9CAB"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrPass(false);
                  setErrorMsg('');
                }}
                style={[
                  authStyles.inputSigIn,
                  { marginBottom: 0 },
                  errPass && authStyles.inputError,
                ]}
                color="#333"
            />
            <TouchableOpacity
                style={authStyles.icon}
                onPress={() => setShowPassword((prev) => !prev)}>
              <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#888"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* klaidos tekstas */}
        {errorMsg !== '' && (
            <Text style={authStyles.errorText}>{errorMsg}</Text>
        )}

        <Text style={authStyles.forgot}>Pamiršai slaptažodį?</Text>

        <TouchableOpacity testID="login-submit" style={global.loginButton} onPress={handleSignIn}>
          <Text style={global.loginText}>Prisijungti</Text>
        </TouchableOpacity>
      </View>
  );
};

export default SignIn;
