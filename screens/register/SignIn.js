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
    getDoc,
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
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [errEmail, setErrEmail] = useState(false);
    const [errPass, setErrPass]   = useState(false);

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const triggerShake = () =>
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue:-10,  duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue:  0,  duration: 50, useNativeDriver: true }),
        ]).start();

    const handleSignIn = async () => {
        if (!email || !password) {
            setErrEmail(!email);
            setErrPass(!password);
            setErrorMsg('Užpildyk visus laukus.');
            triggerShake();
            return;
        }

        try {
            const { user } = await signInWithEmailAndPassword(authInstance, email, password);
            try {
                const coords = await getCurrentLocation();
                if (coords) {
                    const fs = getFirestore();
                    await updateDoc(doc(fs, 'users', user.uid), {
                        location           : new GeoPoint(coords.latitude, coords.longitude),
                        locationUpdatedAt  : serverTimestamp(),
                    });
                }
            } catch {
                console.log('Lokacijos atnaujinimas nepavyko');
            }

            const fs = getFirestore();
            const snap = await getDoc(doc(fs, 'users', user.uid));
            const data = snap.data() || {};
            const isExpired =
                !data.verifiedAt ||
                (Date.now() - data.verifiedAt.toDate().getTime()) > 1000 * 60 * 60 * 24 * 365;
            if (isExpired) {
                return navigation.replace('Settings', {
                    showVerifyAlert: true,
                });
            }
            navigation.replace('Profile', { uid: user.uid });

        } catch (error) {
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
                Pradėk studijas su naujomis pažintimis – rask draugų ir kambariokų!
            </Text>

            <Animated.View style={{ width: '100%', transform: [{ translateX: shakeAnim }] }}>
                {/* Email input */}
                <TextInput
                    testID="login-email"
                    placeholder="El. paštas"
                    placeholderTextColor="#7F9CAB"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={t => { setEmail(t); setErrEmail(false); setErrorMsg(''); }}
                    style={[ authStyles.inputSigIn, errEmail && authStyles.inputError ]}
                    color="#333"
                />

                {/* Password input */}
                <View style={authStyles.inputWrapper}>
                    <TextInput
                        testID="login-password"
                        placeholder="Slaptažodis"
                        placeholderTextColor="#7F9CAB"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={t => { setPassword(t); setErrPass(false); setErrorMsg(''); }}
                        style={[ authStyles.inputSigIn, { marginBottom:0 }, errPass && authStyles.inputError ]}
                        color="#333"
                    />
                    <TouchableOpacity
                        style={authStyles.icon}
                        onPress={() => setShowPassword(v => !v)}
                    >
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {errorMsg !== '' && <Text testID="login-error" style={authStyles.errorText}>{errorMsg}</Text>}

            <Text style={authStyles.forgot}>Pamiršai slaptažodį?</Text>

            <TouchableOpacity
                testID="login-submit"
                style={global.loginButton}
                onPress={handleSignIn}
            >
                <Text style={global.loginText}>Prisijungti</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SignIn;
