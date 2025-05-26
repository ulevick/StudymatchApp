// Reg_Stud8.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import global from '../../styles/global';
import registration from '../../styles/registration';
import BackgroundReg3_10 from '../../components/BackgroundReg3_10';

const totalSteps = 10;
const currentStep = 8;

const Reg_Stud8 = ({ route, navigation }) => {
  const {
    email,
    password,
    name,
    birthday,
    gender,
    studyLevel,
    faculty,
    studyProgram,
    course,
  } = route.params;

  const [searchTypes, setSearchTypes] = useState([]);

  const toggleSearchType = (type) => {
    setSearchTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleNext = () => {
    navigation.navigate('Reg_Stud9', {
      email,
      password,
      name,
      birthday,
      gender,
      studyLevel,
      faculty,
      studyProgram,
      course,
      searchTypes,
    });
  };

  const isNextDisabled = searchTypes.length === 0;

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

        <Text style={registration.instruction}>Ko ieškai?</Text>

        <View style={registration.optionsRow}>
          <TouchableOpacity
            style={[
              registration.optionCard,
              registration.roomMateCard,
              searchTypes.includes('kambarioko') && registration.optionCardSelected,
            ]}
            onPress={() => toggleSearchType('kambarioko')}>
            <Image
              source={require('../../assets/images/kambariokuicon.png')}
              style={registration.optionIcon} />
            <Text style={registration.optionText}>Kambarioko</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              registration.optionCard,
              registration.likeMindedCard,
              searchTypes.includes('bendraminciu') && registration.optionCardSelected,
            ]}
            onPress={() => toggleSearchType('bendraminciu')}>
            <Image
              source={require('../../assets/images/bendraminciuicon.png')}
              style={registration.optionIcon} />
            <Text style={registration.optionText}>Bendraminčių</Text>
          </TouchableOpacity>
        </View>

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

export default Reg_Stud8;
