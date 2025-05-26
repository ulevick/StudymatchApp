import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Animated,
} from 'react-native';

import { db, authInstance } from '../../services/firebase';
import {
    collection,
    doc,
    setDoc,
    query,
    where,
    getDocs,
} from '@react-native-firebase/firestore';

import universityMappings, { allowedDomains } from '../../constants/universityMappings';
import global        from '../../styles/global';
import registration  from '../../styles/registration';
import BackgroundReg1_2 from '../../components/BackgroundReg1_2';

const Reg_Stud1 = ({ route = {}, navigation }) => {
    /* ───────────── route params ───────────── */
    const IS_DETOX = global.detox;               // nustatoma prieš build-ą
    const {
        totalSteps   = 10,
        currentStep  = 1,
        mode         = 'register',
        originalEmail,
        email: initialEmail = '',
        studyLevel   = '',
        faculty      = '',
        studyProgram = '',
        course       = '',
    } = route.params || {};

    /* ───────────── state / refs ───────────── */
    const [email, setEmail]             = useState(initialEmail);
    const [emailError, setEmailError]   = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);

    const shakeAnim    = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [progressDone, setProgressDone] = useState(false);

    /* progress bar */
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue : currentStep,
            duration: 500,
            useNativeDriver: false,
        }).start(() => setProgressDone(true));
    }, [currentStep]);

    const progressWidth = progressAnim.interpolate({
        inputRange : [0, totalSteps],
        outputRange: ['0%', '100%'],
    });

    /* ───────────── helpers ───────────── */
    const validateUniversityEmail = (val) =>
        allowedDomains.some(d => val.toLowerCase().endsWith(`@${d}`));

    const getUniversityName = (val) => {
        const lower = val.toLowerCase();
        for (const d of allowedDomains) if (lower.endsWith(`@${d}`)) return universityMappings[d];
        return '';
    };

    const generateVerificationCode = () =>
        Math.floor(100000 + Math.random() * 900000).toString();

    const shake = () => Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:   0, duration: 50, useNativeDriver: true }),
    ]).start();

    /* ───────────── NEXT ───────────── */
    const handleNext = async () => {
        /* ❶ Detox režime – skipinam tinklą, bet TIK po to, kai vartotojas
              (testas) paspaudžia „Toliau“. */
        if (IS_DETOX) {
            navigation.push('Reg_Stud2', {
                email,
                originalEmail,
                mode,
                totalSteps,
                currentStep : currentStep + 1,
                studyLevel,
                faculty,
                studyProgram,
                course,
            });
            return;
        }

        // tuščias laukas
        if (email.trim() === '') { shake(); return; }

        setEmailError(false);
        setInvalidEmail(false);

        // 1. patikrinam formatą
        if (!validateUniversityEmail(email)) {
            setInvalidEmail(true);
            shake();
            return;
        }

        try {
            // 2. ar jau registruotas?
            const methods   = await authInstance.fetchSignInMethodsForEmail(email);
            const dupSnap   = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
            const used      = methods.length > 0 || !dupSnap.empty;

            if (used && email !== originalEmail) {
                setEmailError(true);
                shake();
                return;
            }

            // 3. išsiunčiam kodą
            const code = generateVerificationCode();
            await setDoc(doc(collection(db, 'verifications'), email), {
                email,
                code,
                verified : false,
                createdAt: new Date(),
                university: getUniversityName(email),
            });

            /* (realus laiško siuntimas, paliktas kaip buvo) */

            // 4. ➜ Reg_Stud2
            navigation.push('Reg_Stud2', {
                email,
                originalEmail,
                mode,
                totalSteps,
                currentStep : currentStep + 1,
                studyLevel,
                faculty,
                studyProgram,
                course,
            });
        } catch {
            Alert.alert('Klaida', 'Nepavyko patikrinti arba išsiųsti kodo.');
        }
    };

    const isNextDisabled = email.trim() === '';

    /* ───────────── JSX ───────────── */
    return (
        <View style={registration.wrapper}>
            <BackgroundReg1_2 />

            <ScrollView contentContainerStyle={registration.content}>
                {/* title */}
                <View style={registration.header}>
                    <Text style={registration.titleReg}>
                        Study<Text style={global.titleMatch}>match</Text>
                    </Text>
                </View>

                {/* progress */}
                <View style={registration.progressContainer}>
                    <View style={registration.progressTrack}>
                        <Animated.View
                            testID={progressDone ? 'progress-done' : undefined}
                            style={[registration.progressBar, { width: progressWidth }]}
                        />
                    </View>
                </View>

                {/* instructions */}
                <Text style={registration.instruction}>
                    Įvesk savo universitetinį el. paštą, kad patvirtintume, jog esi studentas.
                </Text>

                {/* input */}
                <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                    <TextInput
                        testID="email-input"
                        style={[
                            registration.input,
                            (emailError || invalidEmail) && registration.inputError,
                        ]}
                        placeholder="universitetinis el. paštas"
                        placeholderTextColor="#7F9CAB"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t);
                            if (emailError)   setEmailError(false);
                            if (invalidEmail) setInvalidEmail(false);
                        }}
                        autoCapitalize="none"
                        autoFocus
                    />
                </Animated.View>

                {emailError && (
                    <Text style={registration.errorText}>
                        Šis el. paštas jau yra užregistruotas.
                    </Text>
                )}
                {invalidEmail && (
                    <Text style={registration.errorText}>
                        Įvesk galiojantį universitetinį el. paštą.
                    </Text>
                )}

                {/* buttons */}
                <View style={registration.buttonRow}>
                    <TouchableOpacity
                        style={registration.backButton}
                        onPress={() => navigation.goBack()}>
                        <Text style={registration.backText}>Atgal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        testID="next-button"
                        style={[
                            registration.nextButton,
                            isNextDisabled && registration.nextButtonDisabled,
                        ]}
                        onPress={handleNext}
                        disabled={isNextDisabled}
                        accessibilityState={{ disabled: isNextDisabled }}>
                        <Text style={registration.nextText}>Toliau</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default Reg_Stud1;
