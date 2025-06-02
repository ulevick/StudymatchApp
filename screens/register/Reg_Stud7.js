import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { db, authInstance } from '../../services/firebase';
import { updateDoc, getDoc, doc } from '@react-native-firebase/firestore';

import studyPrograms        from '../../constants/studyPrograms';
import { LEVELS }           from '../../constants/levels';
import { COURSES_BY_LEVEL } from '../../constants/courses';
import universityMappings   from '../../constants/universityMappings';

import BackgroundReg3_10 from '../../components/BackgroundReg3_10';
import registration      from '../../styles/registration';
import global            from '../../styles/global';

const Reg_Stud7 = ({ route, navigation }) => {
  const {
    email,
    password,
    name,
    birthday,
    gender,
    studyLevel:   paramStudyLevel   = '',
    faculty:      paramFaculty      = '',
    studyProgram: paramStudyProgram = '',
    course:       paramCourse       = '',

    mode        = 'register',
    totalSteps  = 10,
    currentStep = 7,
  } = route.params;

  const domain            = email.split('@')[1]?.toLowerCase();
  const defaultUniversity = universityMappings[domain] || '';

  const [university]  = useState(defaultUniversity);
  const [studyLevel, setStudyLevel]     = useState(paramStudyLevel);
  const [faculty, setFaculty]           = useState(paramFaculty);
  const [studyProgram, setStudyProgram] = useState(paramStudyProgram);
  const [course, setCourse]             = useState(paramCourse);

  useEffect(() => {
    const unsub = authInstance.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) return;
        const d = snap.data();

        setStudyLevel((p)     => p || d.studyLevel     || '');
        setFaculty((p)        => p || d.faculty        || '');
        setStudyProgram((p)   => p || d.studyProgram   || '');
        setCourse((p)         => p || d.course         || '');
      } catch (e) {
        console.log('Nepavyko užkrauti studijų duomenų:', e);
      }
    });
    return unsub;
  }, []);

  const studyLevelOptions = LEVELS;

  const facultyOptions =
    university && studyLevel && studyPrograms[university]?.[studyLevel]
      ? Object.keys(studyPrograms[university][studyLevel]).map((f) => ({
        label: f,
        value: f,
      }))
      : [];

  const programOptions =
    faculty && studyPrograms[university]?.[studyLevel]?.[faculty]
      ? studyPrograms[university][studyLevel][faculty].map((p) => ({
        label: p,
        value: p,
      }))
      : [];

  const courseOptions = COURSES_BY_LEVEL[studyLevel] || [];

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, totalSteps],
    outputRange: ['0%', '100%'],
  });

  const handleNext = async () => {
    if (!studyLevel || !faculty || !studyProgram || !course) return;

    if (totalSteps === 3) {
      try {
        const uid = authInstance.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, 'users', uid), {
            email,
            university,
            studyLevel,
            faculty,
            studyProgram,
            course,
            verifiedAt: new Date(),
          });

          if (authInstance.currentUser?.email !== email) {
            try { await authInstance.currentUser.updateEmail(email); } catch {}
          }
        }
      } catch {
        Alert.alert('Klaida', 'Nepavyko išsaugoti duomenų.');
        return;
      }

      navigation.replace('Reg_EmailSuccess', { mode });
      return;
    }

    navigation.navigate('Reg_Stud8', {
      email,
      password,
      name,
      birthday,
      gender,
      studyLevel,
      faculty,
      studyProgram,
      course,
    });
  };

  const dropdownIcon  = () => (
    <Ionicons name="chevron-down" size={24} color="#7F9CAB" />
  );
  const isNextDisabled = !studyLevel || !faculty || !studyProgram || !course;

  return (
    <View style={registration.wrapper}>
      <BackgroundReg3_10 />

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

        {/* instructions */}
        <Text style={registration.instruction}>
          Įvesk informaciją apie savo studijas!
        </Text>

        {/* pickers */}
        <RNPickerSelect
          onValueChange={(v) => {
            setStudyLevel(v);
            setFaculty('');
            setStudyProgram('');
            setCourse('');
          }}
          items={studyLevelOptions}
          value={studyLevel}
          placeholder={{ label: 'Studijų lygis', value: '' }}
          style={registration}
          useNativeAndroidPickerStyle={false}
          Icon={dropdownIcon}
        />

        <RNPickerSelect
          onValueChange={(v) => {
            setFaculty(v);
            setStudyProgram('');
            setCourse('');
          }}
          items={facultyOptions}
          value={faculty}
          placeholder={{ label: 'Fakultetas', value: '' }}
          style={registration}
          useNativeAndroidPickerStyle={false}
          Icon={dropdownIcon}
          disabled={!studyLevel}
        />

        <RNPickerSelect
          onValueChange={setStudyProgram}
          items={programOptions}
          value={studyProgram}
          placeholder={{ label: 'Studijų kryptis', value: '' }}
          style={registration}
          useNativeAndroidPickerStyle={false}
          Icon={dropdownIcon}
          disabled={!faculty}
        />

        <RNPickerSelect
          onValueChange={setCourse}
          items={courseOptions}
          value={course}
          placeholder={{ label: 'Kursas', value: '' }}
          style={registration}
          useNativeAndroidPickerStyle={false}
          Icon={dropdownIcon}
          disabled={!studyProgram}
        />

        {/* buttons */}
        <View style={registration.buttonRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={registration.backButton}>
            <Text style={registration.backText}>Atgal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="next-button"
            onPress={handleNext}
            style={[
              registration.nextButton,
              isNextDisabled && registration.nextButtonDisabled,
            ]}
            disabled={isNextDisabled}>
            <Text style={registration.nextText}>Toliau</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Reg_Stud7;
