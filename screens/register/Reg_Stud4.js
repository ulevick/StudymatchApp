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
const currentStep = 4;

const Reg_Stud4 = ({ route, navigation }) => {
  const email = route?.params?.email;
  const password = route?.params?.password;
  const [name, setName] = useState('');

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

  const handleNext = () => {
    const trimmedName = name.trim();
    if (trimmedName === '') return;

    navigation.navigate('Reg_Stud5', {
      email,
      password,
      name: trimmedName,
    });
  };

  const isNextDisabled = name.trim() === '';

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

        <Text style={registration.instruction}>Koks tavo vardas?</Text>
        <TextInput
          placeholder="Įrašyk savo vardą"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          style={registration.input} />
        <Text style={registration.notes}>Vėliau jo pakeisti nebus galima.</Text>

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

export default Reg_Stud4;
