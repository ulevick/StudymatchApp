import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';

import { db } from '../../services/firebase';
import {
    collection,
    doc,
    getDoc,
    updateDoc,
} from '@react-native-firebase/firestore';

import global from '../../styles/global';
import BackgroundReg1_2 from '../../components/BackgroundReg1_2';
import registration from '../../styles/registration';

const Reg_Stud2 = ({ route, navigation }) => {
    const {
        email,
        originalEmail,
        mode = 'register',
        totalSteps = 10,
        currentStep = 2,
        studyLevel   = '',
        faculty      = '',
        studyProgram = '',
        course       = '',
    } = route.params;

    const [code, setCode]       = useState(['', '', '', '', '', '']);
    const [codeError, setCodeError] = useState(false);
    const inputs       = useRef([]);
    const shakeAnim    = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [focusedIdx, setFocusedIdx] = useState(0);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue : currentStep,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [currentStep]);

    const progressWidth = progressAnim.interpolate({
        inputRange : [0, totalSteps],
        outputRange: ['0%', '100%'],
    });

    const fillDigitsFrom = (text, startIdx) => {
        const digits = text.replace(/\D/g, '').slice(0, 6 - startIdx).split('');
        if (digits.length === 0) return;

        const next = [...code];
        digits.forEach((d, i) => { next[startIdx + i] = d; });
        setCode(next);

        const last = startIdx + digits.length - 1;
        if (last < 6 && inputs.current[last]) {
            inputs.current[last].focus();
        }
        if (codeError) setCodeError(false);
    };

    const handleChange = (text, idx) => {
        if (text.length > 1) {
            fillDigitsFrom(text, idx);
            return;
        }

        if (!/^\d?$/.test(text)) return;
        const next = [...code];
        next[idx]  = text;
        setCode(next);

        if (codeError) setCodeError(false);
        if (text && idx < 5) inputs.current[idx + 1].focus();
    };

    const handleKeyPress = ({ nativeEvent }, idx) => {
        if (nativeEvent.key === 'Backspace' && code[idx] === '' && idx > 0) {
            inputs.current[idx - 1].focus();
        }
    };

    const shake = () =>
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
        ]).start();

    const verify = async () => {
        const fullCode = code.join('');
        if (fullCode.length < 6) {
            setCodeError(true);
            shake();
            return;
        }

        try {
            const docRef = doc(collection(db, 'verifications'), email);
            const snap   = await getDoc(docRef);

            if (!snap.exists || snap.data().code !== fullCode) {
                setCodeError(true);
                shake();
                return;
            }
            await updateDoc(docRef, { verified: true });

            if (totalSteps === 3) {
                navigation.replace('Reg_Stud7', {
                    email,
                    originalEmail,
                    mode,
                    totalSteps,
                    currentStep: currentStep + 1,
                    studyLevel,
                    faculty,
                    studyProgram,
                    course,
                });
            } else {
                navigation.navigate('Reg_Stud3', {
                    email,
                    studyLevel,
                    faculty,
                    studyProgram,
                    course,
                });
            }
        } catch {
            setCodeError(true);
            shake();
        }
    };

    const resend = async () => { };

    const isDisabled = code.join('').length < 6;

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
                            style={[registration.progressBar, { width: progressWidth }]}
                        />
                    </View>
                </View>

                {/* hint */}
                <Text style={registration.instruction}>
                    Patikrink savo el. paštą! Įvesk kodą, kurį ką tik išsiuntėme.
                </Text>

                {/* six inputs */}
                <Animated.View
                    style={[
                        registration.codeContainer,
                        { transform: [{ translateX: shakeAnim }] },
                    ]}>
                    {code.map((digit, i) => (
                        <TextInput
                            key={i}
                            testID={`code-input-${i}`}
                            ref={r => (inputs.current[i] = r)}
                            onFocus={() => setFocusedIdx(i)}
                            accessibilityState={{ selected: focusedIdx === i }}
                            style={[
                                registration.codeInput,
                                codeError && registration.inputError,
                            ]}
                            maxLength={6}
                            keyboardType="number-pad"
                            value={digit}
                            onChangeText={t => handleChange(t, i)}
                            onKeyPress={e => handleKeyPress(e, i)}
                            autoFocus={i === 0}
                        />
                    ))}
                </Animated.View>

                {codeError && (
                    <Text style={registration.errorText}>
                        Neteisingas kodas, bandyk dar kartą.
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
                            isDisabled && registration.nextButtonDisabled,
                        ]}
                        onPress={verify}
                        disabled={isDisabled}>
                        <Text style={registration.nextText}>Toliau</Text>
                    </TouchableOpacity>
                </View>

                {/* resend */}
                <Text style={registration.noteText}>
                    Nerandi laiško? Patikrink „Spam“ aplankus arba
                    <Text style={registration.linkText} onPress={resend}>
                        {' spausk čia, kad pakartotinai išsiųsti kodą.'}
                    </Text>
                </Text>
            </ScrollView>
        </View>
    );
};

export default Reg_Stud2;
