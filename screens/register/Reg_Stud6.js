import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import global from '../../styles/global';
import registration from '../../styles/registration';
import BackgroundReg3_10 from '../../components/BackgroundReg3_10';
import { GENDER_FEMALE, GENDER_MALE } from '../../constants/gender';
const totalSteps = 10;
const currentStep = 6;

const Reg_Stud6 = ({ route, navigation }) => {
  const { email, password, name, birthday } = route.params;
  const [selectedGender, setSelectedGender] = useState('');

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

  const handleSelectGender = (gender) => {
    setSelectedGender(gender);
  };

  const handleNext = () => {
    navigation.navigate('Reg_Stud7', {
      email,
      password,
      name,
      birthday,
      gender: selectedGender,
    });
  };

  const isNextDisabled = selectedGender === '';

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

        <Text style={registration.instruction}>Kokia tavo lytis?</Text>

        <TouchableOpacity
          style={[
            registration.option,
            selectedGender === GENDER_FEMALE && registration.selectedOptionFemale,
          ]}
          onPress={() => handleSelectGender(GENDER_FEMALE)}>
          <Text style={registration.optionText}>Moteris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            registration.option,
            selectedGender === GENDER_MALE && registration.selectedOptionMale,
          ]}
          onPress={() => handleSelectGender(GENDER_MALE)}>
          <Text style={registration.optionText}>Vyras</Text>
        </TouchableOpacity>

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

export default Reg_Stud6;
