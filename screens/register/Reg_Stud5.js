// Reg_Stud5.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import global from '../../styles/global';
import registration from '../../styles/registration';
import BackgroundReg3_10 from '../../components/BackgroundReg3_10';
const totalSteps = 10;
const currentStep = 5;

const Reg_Stud5 = ({ route, navigation }) => {
  const { email, password, name } = route.params;
  const [birthday, setBirthday] = useState('');
  const [birthdayError, setBirthdayError] = useState('');
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

  const handleDateChange = (value) => {
    const digits = value.replace(/[^\d]/g, '');
    let formatted = digits.slice(0, 4);
    if (digits.length >= 5) {
      formatted += '/' + digits.slice(4, 6);
    }
    if (digits.length >= 7) {
      formatted += '/' + digits.slice(6, 8);
    }
    setBirthday(formatted);
    if (birthdayError) {setBirthdayError('');}
  };

  const isValidDate = (str) => {
    const parts = str.split('/');
    if (parts.length !== 3) {return false;}
    const [yearStr, monthStr, dayStr] = parts;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (
      isNaN(year) || isNaN(month) || isNaN(day) ||
      year < 1900 || year > 2100 ||
      month < 1 || month > 12 ||
      day < 1 || day > 31
    ) {
      return false;
    }

    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() + 1 === month &&
      dateObj.getDate() === day
    );
  };

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

  const handleNext = () => {
    const trimmed = birthday.trim();
    setBirthdayError('');

    if (!trimmed) {
      setBirthdayError('Įvesk savo gimimo datą.');
      triggerShake();
      return;
    }

    if (!isValidDate(trimmed)) {
      setBirthdayError('Neteisingas datos formatas.');
      triggerShake();
      return;
    }

    navigation.navigate('Reg_Stud6', {
      email,
      password,
      name,
      birthday: trimmed,
    });
  };

  const isNextDisabled = birthday.trim() === '';

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

        <Text style={registration.instruction}>Tavo gimimo diena?</Text>

        <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
          <TextInput
            placeholder="YYYY/MM/DD"
            placeholderTextColor="#aaa"
            value={birthday}
            onChangeText={handleDateChange}
            style={[registration.input, birthdayError && registration.inputError]}
            keyboardType="number-pad"
            maxLength={10} />
        </Animated.View>
        {birthdayError ? <Text style={registration.errorText}>{birthdayError}</Text> : null}

        <Text style={registration.notes}>
          Tavo profilyje bus rodomas tik amžius. Vėliau jo pakeisti nebus galima.
        </Text>

        <View style={registration.buttonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={registration.backButton}>
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

export default Reg_Stud5;
