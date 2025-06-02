import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { preferencesData } from '../../constants/preferencesData';
import global from '../../styles/global';
import registration from '../../styles/registration';
import BackgroundReg3_10 from '../../components/BackgroundReg3_10';

const PreferenceCategory = ({ category, selectedValue, onSelect }) => {
  return (
    <View style={registration.categoryBlock}>
      <Text style={registration.categoryTitle}>{category.title}</Text>
      <View style={registration.chipsRow}>
        {category.items.map((item) => {
          const isSelected = selectedValue === item;
          return (
            <TouchableOpacity
              key={item}
              style={[registration.chip, isSelected && registration.chipSelected]}
              onPress={() => onSelect(item)}>
              <Text style={[registration.chipText, isSelected && registration.chipTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const totalSteps = 10;
const currentStep = 9;

const Reg_Stud9 = ({ route, navigation }) => {
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
    searchTypes,
  } = route.params;

  const [selectedPreferences, setSelectedPreferences] = useState({});

  const handleSelectCategoryPreference = (categoryTitle, item) => {
    setSelectedPreferences((prev) => {
      const newSelections = { ...prev };
      if (newSelections[categoryTitle] === item) {
        delete newSelections[categoryTitle];
      } else {
        newSelections[categoryTitle] = item;
      }
      return newSelections;
    });
  };

  const handleNext = () => {
    navigation.navigate('Reg_Stud10', {
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
      preferences: selectedPreferences,
    });
  };

  const totalCategories = preferencesData.length;
  const selectedCount = Object.keys(selectedPreferences).length;
  const isNextDisabled = selectedCount === 0;

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

        <Text style={registration.instruction}>Pomėgiai</Text>

        {preferencesData.map((category) => (
          <PreferenceCategory
            key={category.title}
            category={category}
            selectedValue={selectedPreferences[category.title]}
            onSelect={(item) => handleSelectCategoryPreference(category.title, item)} />
        ))}

        <View style={registration.buttonRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={registration.backButton}>
            <Text style={registration.backText}>Atgal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="next-button"
            onPress={handleNext}
            style={[registration.nextButtonWithNumber, isNextDisabled && registration.nextButtonDisabled]}
            disabled={isNextDisabled}>
            <Text style={registration.nextText}>
              Toliau ({selectedCount}/{totalCategories})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Reg_Stud9;
