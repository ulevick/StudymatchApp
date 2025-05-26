// Reg_Stud3.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import global from '../../styles/global';
import BackgroundReg3_10 from '../../components/BackgroundReg3_10';
import registration from '../../styles/registration';
const totalSteps = 10;
const currentStep = 3;

const Reg_Stud3 = ({ route, navigation }) => {
  const email = route?.params?.email || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, totalSteps],
    outputRange: ['0%', '100%'],
  });

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePasswordChange = (value) => {
    if (passwordError) setPasswordError('');
    setPassword(value);
  };

  const handleConfirmChange = (value) => {
    if (confirmError) setConfirmError('');
    setConfirmPassword(value);
  };

  const handleNext = () => {
    setPasswordError('');
    setConfirmError('');
    let hasError = false;

    if (password.trim().length < 6) {
      setPasswordError('Slaptažodis turi būti bent 6 simbolių.');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmError('Slaptažodžiai nesutampa.');
      hasError = true;
    }
    if (hasError) {
      triggerShake();
      return;
    }
    navigation.navigate('Reg_Stud4', { email, password });
  };

  // Disable "Toliau" until both fields have input; errors handle length mismatches
  const isNextDisabled = password.trim().length === 0 || confirmPassword.trim().length === 0;

  return (
    <View style={registration.wrapper}>
      <BackgroundReg3_10 />
      <ScrollView contentContainerStyle={registration.content}>
        <View style={registration.header}>
          <Text style={registration.titleReg}>Study
            <Text style={global.titleMatch}>match</Text>
          </Text>
        </View>

        <View style={registration.progressContainer}>
          <View style={registration.progressTrack}>
            <Animated.View style={[registration.progressBar, { width: progressWidth }]} />
          </View>
        </View>

        <Text style={registration.instruction}>Puiku! Sukurk slaptažodį</Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <View style={registration.inputWrapper}>
            <TextInput
              placeholder="Slaptažodis"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
              style={[registration.input, passwordError && registration.inputError]} />
            <TouchableOpacity
              style={registration.icon}
              onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={23}
                color="#888" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text testID="password-error" style={registration.errorText}>{passwordError}</Text> : null}

          <View style={registration.inputWrapper}>
            <TextInput
              placeholder="Pakartok slaptažodį"
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirm}
              value={confirmPassword}
              onChangeText={handleConfirmChange}
              style={[registration.input, confirmError && registration.inputError]} />
            <TouchableOpacity
              style={registration.icon}
              onPress={() => setShowConfirm(!showConfirm)}>
              <Ionicons
                name={showConfirm ? 'eye-off' : 'eye'}
                size={23}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {confirmError ? <Text style={registration.errorText}>{confirmError}</Text> : null}
        </Animated.View>

        <View style={registration.buttonRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={registration.backButton}>
            <Text style={registration.backText}>Atgal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="next-button"
            onPress={handleNext}
            style={[registration.nextButton, isNextDisabled && registration.nextButtonDisabled]}
            disabled={isNextDisabled}>
            <Text style={registration.nextText}>Toliau</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Reg_Stud3;
