import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  GeoPoint,
} from '@react-native-firebase/firestore';
import { getCurrentLocation } from '../../utils/getCurrentLocation';
import registration from '../../styles/registration';
import PeopleBackground from '../../components/PeopleBackground';

const Reg_StudFinal = ({ route, navigation }) => {
  const {
    uid,
    email,
    name,
    birthday,
    gender,
    studyLevel,
    faculty,
    studyProgram,
    course,
    searchTypes,
    preferences,
    photos,
  } = route.params;

  const getUniversityName = (mail) => {
    const e = mail.toLowerCase();
    if (e.endsWith('@stud.vilniustech.lt') || e.endsWith('@vilniustech.lt'))
      return 'Vilnius Tech universitetas';
    if (
      e.endsWith('@stud.vu.lt') ||
      e.endsWith('@studentas.vu.lt') ||
      e.endsWith('@mif.stud.vu.lt') ||
      e.endsWith('@fsf.stud.vu.lt') ||
      e.endsWith('@vu.lt')
    )
      return 'Vilniaus universitetas';
    return '';
  };

  const handleFinalize = async () => {
    try {
      const coords = await getCurrentLocation();
      const db = getFirestore();

      const newUserData = {
        uid,
        email,
        name,
        birthday,
        gender,
        studyLevel,
        faculty,
        studyProgram,
        course,
        searchTypes,
        preferences,
        photos: photos || [],
        university: getUniversityName(email),
        aboutMe: '',
        verifiedAt: serverTimestamp(),
        location: coords
          ? new GeoPoint(coords.latitude, coords.longitude)
          : null,
        locationUpdatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), newUserData);
      navigation.replace('Profile', { uid });
    } catch (err) {
      console.error('Klaida išsaugant naudotoją:', err);
    }
  };

  return (
    <View style={registration.containerStu10}>
      <PeopleBackground />
      <View style={registration.inner}>
        <Text style={registration.bigTitle}>Tavo paskyra sėkmingai sukurta! 🎉</Text>

        <Text style={registration.infoText}>
          Dabar tau prieinamas visas StudyMatch pasaulis:{' '}
          <Text style={registration.highlightBlue}>draugai</Text>, kurie padės
          pasiruošti egzaminui per naktį,{' '}
          <Text style={registration.highlightBlue}>kambariokai metams</Text> ar
          net{' '}
          <Text style={registration.highlightBlue}>
            kompanija visam studijų laikotarpiui!
          </Text>
        </Text>

        <TouchableOpacity
          style={registration.loginButtonStud10}
          onPress={handleFinalize}
        >
          <Text style={registration.loginButtonText}>Pradėti</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Reg_StudFinal;
