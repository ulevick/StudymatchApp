// Reg_Stud10.js
import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { db, authInstance } from '../../services/firebase';
import { doc, setDoc, collection } from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../../contexts/UserContext';
import global from '../../styles/global';
import registration from '../../styles/registration';
import BackgroundReg3_10 from '../../components/BackgroundReg3_10';

const MAX_IMAGES = 4;
const REQUIRED = 2;

const Reg_Stud10 = ({ route, navigation }) => {
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
    preferences,
  } = route.params;

  const finalSearchTypes = Array.isArray(searchTypes)
    ? searchTypes
    : (searchTypes ? [searchTypes] : []);

  const [images, setImages] = useState(Array(MAX_IMAGES).fill(null));
  const { setUserData } = useContext(UserContext);

  const getFilledCount = () => images.filter((img) => img !== null).length;

  const pickImage = (index) => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) {
        return;
      }
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImages((prev) => {
          const newImages = [...prev];
          newImages[index] = uri;
          return newImages;
        });
      }
    });
  };

  const removeImage = (index) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
  };

  const handleNext = async () => {
    const filledCount = getFilledCount();

    try {
      const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      const photoArray = images.filter((uri) => uri !== null);

      const fullUserData = {
        uid: firebaseUser.uid,
        email,
        name,
        birthday,
        gender,
        studyLevel,
        faculty,
        studyProgram,
        course,
        searchTypes: finalSearchTypes,
        preferences,
        photos: photoArray,
        university: getUniversityName(email),
        aboutMe: '',
        createdAt: new Date(),
      };

      const ref = doc(db, 'users', firebaseUser.uid);
      await setDoc(ref, fullUserData);

      // ❌ NEREIKIA: setUserData(fullUserData)

      // Toliau perduodam tik reikalingus duomenis UI'ui, bet neperrašom konteksto
      navigation.replace('Reg_StudFinal', {
        uid: firebaseUser.uid, // būtina perduoti UID, kad Reg_StudFinal žinotų dokumentą
        email,
        name,
        birthday,
        gender,
        studyLevel,
        faculty,
        studyProgram,
        course,
        searchTypes: finalSearchTypes,
        preferences,
        photos: photoArray,
      });
    } catch (err) {
      alert(err.message || 'Nepavyko sukurti paskyros.');
    }
  };


  const getUniversityName = (email) => {
    const e = email.toLowerCase();
    if (e.endsWith('@stud.vilniustech.lt') || e.endsWith('@vilniustech.lt')) {
      return 'Vilnius Tech universitetas';
    } else if (
      e.endsWith('@stud.vu.lt') ||
      e.endsWith('@studentas.vu.lt') ||
      e.endsWith('@mif.stud.vu.lt') ||
      e.endsWith('@fsf.stud.vu.lt') ||
      e.endsWith('@vu.lt')
    ) {
      return 'Vilniaus universitetas';
    }
    return '';
  };

  const filledCount = getFilledCount();

  const totalSteps = 10;
  const currentStep = 10;
  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, totalSteps],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={registration.wrapper}>
      <BackgroundReg3_10 />
      <ScrollView contentContainerStyle={registration.content}>
        <View style={registration.header}>
          <Text style={registration.titleReg}>
            Study
            <Text style={global.titleMatch}>match</Text>
          </Text>
        </View>

        <View style={registration.progressContainer}>
          <View style={registration.progressTrack}>
            <Animated.View style={[registration.progressBar, { width: progressWidth }]} />
          </View>
        </View>

        <Text style={registration.instruction}>
          Įkelk bent {REQUIRED} nuotraukas
        </Text>

        <View style={registration.gridContainer}>
          {images.map((uri, index) => (
            <View key={index} style={registration.photoWrapper}>
              <TouchableOpacity
                style={registration.photoPlaceholder}
                onPress={() => pickImage(index)}>
                {uri ? (
                  <Image source={{ uri }} style={registration.photo} />
                ) : (
                  <View style={registration.emptyPhotoContent}>
                    <Text style={registration.emptyPlusSign}>+</Text>
                  </View>
                )}
              </TouchableOpacity>
              {uri && (
                <TouchableOpacity
                  style={registration.deleteButton}
                  onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={registration.buttonRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={registration.backButton}>
            <Text style={registration.backText}>Atgal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="next-button"
            onPress={handleNext}
            disabled={filledCount < REQUIRED}
            style={[
              registration.nextButtonWithNumber,
              filledCount < REQUIRED && registration.nextButtonDisabled,
            ]}>
            <Text style={registration.nextText}>
              Toliau ({filledCount}/{REQUIRED})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Reg_Stud10;
