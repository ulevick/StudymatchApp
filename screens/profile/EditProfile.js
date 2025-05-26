// EditProfile.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import { UserContext } from '../../contexts/UserContext';
import { authInstance, db } from '../../services/firebase';
import { doc, setDoc } from '@react-native-firebase/firestore';
import Colors from '../../constants/colors';
import global from '../../styles/global';
import styles from '../../styles/editProfileStyles';
import studyPrograms from '../../constants/studyPrograms';

const MAX_IMAGES = 4;
const REQUIRED_IMAGES = 2;

export default function EditProfile({ navigation }) {
  const { userData, setUserData, loading } = useContext(UserContext);

  const [photos, setPhotos] = useState(Array(MAX_IMAGES).fill(null));
  const [studyLevel, setStudyLevel] = useState('');
  const [faculty, setFaculty] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [course, setCourse] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [searchTypes, setSearchTypes] = useState([]);
  const [preferences, setPreferences] = useState([]);

  const university = userData?.university || '';

  useEffect(() => {
    if (userData) {
      setPhotos(
        userData.photos ? fillArray(userData.photos, MAX_IMAGES) : Array(MAX_IMAGES).fill(null)
      );
      setStudyLevel(userData.studyLevel || '');
      setFaculty(userData.faculty || '');
      setStudyProgram(userData.studyProgram || '');
      setCourse(userData.course || '');
      setAboutMe(userData.aboutMe || '');
      setCharCount(userData.aboutMe ? userData.aboutMe.length : 0);

      if (Array.isArray(userData.searchTypes)) setSearchTypes(userData.searchTypes);
      if (userData.preferences) {
        const prefs = Array.isArray(userData.preferences)
          ? userData.preferences
          : Object.values(userData.preferences);
        setPreferences(prefs);
      }
    }
  }, [userData]);

  function fillArray(data, size) {
    const arr = Array(size).fill(null);
    data.forEach((item, idx) => {
      if (idx < size) arr[idx] = item;
    });
    return arr;
  }

  const pickImage = (index) => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setPhotos((prev) => {
          const newPhotos = [...prev];
          newPhotos[index] = uri;
          return newPhotos;
        });
      }
    });
  };

  const removeImage = (index) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = null;
      return newPhotos;
    });
  };

  const toggleSearchType = (type) => {
    setSearchTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePreference = (pref) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const studyLevelOptions = [
    { label: 'Bakalauras', value: 'Bakalauras' },
    { label: 'Magistrantūra', value: 'Magistrantūra' },
  ];

  const facultyData = studyPrograms[university]?.[studyLevel] || {};
  const facultyOptions = Object.keys(facultyData).map((facultyName) => ({
    label: facultyName,
    value: facultyName,
  }));

  const programList = facultyData?.[faculty] || [];
  const programOptions = programList.map((pr) => ({
    label: pr,
    value: pr,
  }));

  const courseOptions =
    studyLevel === 'Bakalauras'
      ? ['1', '2', '3', '4'].map((n) => ({ label: `Kursas ${n}`, value: n }))
      : studyLevel === 'Magistrantūra'
        ? ['1', '2'].map((n) => ({ label: `Kursas ${n}`, value: n }))
        : [];

  const handleSave = async () => {
    const filledPhotos = photos.filter((p) => p !== null);
    if (filledPhotos.length < REQUIRED_IMAGES) {
      Alert.alert('Pridėkite nuotraukų', `Įkelkite bent ${REQUIRED_IMAGES} nuotraukas.`);
      return;
    }

    try {
      const userId = authInstance.currentUser?.uid;
      if (!userId) {
        Alert.alert('Klaida', 'Nerastas vartotojo identifikatorius.');
        return;
      }

      const fullData = {
        ...userData,
        photos: filledPhotos,
        studyLevel,
        faculty,
        studyProgram,
        course,
        aboutMe,
        searchTypes,
        preferences,
      };

      const ref = doc(db, 'users', userId);
      await setDoc(ref, fullData, { merge: true });

      setUserData(fullData);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Klaida', 'Nepavyko išsaugoti duomenų.');
    }
  };

  const dropdownIcon = () => <Ionicons name="chevron-down" size={24} color="#7F9CAB" />;

  if (loading) {
    return (
      <View style={global.loadingContainer}>
        <ActivityIndicator testID="loading-spinner" size="large" color="#fff" />
        <Text testID="loading-text" style={global.loadingText}>
          Kraunama...
        </Text>
      </View>
    );
  }

  const renderSlot = (index) => {
    const uri = photos[index];
    return (
      <View style={styles.slot} key={index}>
        {uri ? (
          <>
            <Image
              testID={`slot-image-${index}`}
              source={{ uri }}
              style={styles.slotImage} />
            <TouchableOpacity
              testID={`slot-remove-${index}`}
              style={styles.removeIcon}
              onPress={() => removeImage(index)}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            testID={`slot-placeholder-${index}`}
            style={styles.placeholderContent}
            onPress={() => pickImage(index)}>
            <Ionicons name="add" size={28} color="#7F9CAB" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#89A1B4" />
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Redaguoti profilį</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.slotsContainer}>
          <View style={styles.slotRow}>
            {renderSlot(0)}
            {renderSlot(1)}
          </View>
          <View style={styles.slotRow}>
            {renderSlot(2)}
            {renderSlot(3)}
          </View>
        </View>

        <View style={global.card}>
          <Text style={global.cardTitle}>Studijų informacija</Text>

          <View style={styles.selectRow}>
            <Text style={styles.label}>Studijų lygis</Text>
            <RNPickerSelect
              onValueChange={(value) => {
                setStudyLevel(value);
                setFaculty('');
                setStudyProgram('');
                setCourse('');
              }}
              items={studyLevelOptions}
              value={studyLevel}
              placeholder={{ label: 'Pasirinkite studijų lygį', value: '' }}
              style={pickerSelectStyles}
              Icon={dropdownIcon}
              useNativeAndroidPickerStyle={false} />
          </View>

          <View style={styles.selectRow}>
            <Text style={styles.label}>Fakultetas</Text>
            <RNPickerSelect
              onValueChange={(value) => {
                setFaculty(value);
                setStudyProgram('');
                setCourse('');
              }}
              items={facultyOptions}
              value={faculty}
              placeholder={{ label: 'Pasirinkite fakultetą', value: '' }}
              style={pickerSelectStyles}
              Icon={dropdownIcon}
              useNativeAndroidPickerStyle={false}
              disabled={!studyLevel} />
          </View>

          <View style={styles.selectRow}>
            <Text style={styles.label}>Studijų kryptis</Text>
            <RNPickerSelect
              onValueChange={(value) => setStudyProgram(value)}
              items={programOptions}
              value={studyProgram}
              placeholder={{ label: 'Pasirinkite studijų kryptį', value: '' }}
              style={pickerSelectStyles}
              Icon={dropdownIcon}
              useNativeAndroidPickerStyle={false}
              disabled={!faculty} />
          </View>

          <View style={styles.selectRow}>
            <Text style={styles.label}>Kursas</Text>
            <RNPickerSelect
              onValueChange={(value) => setCourse(value)}
              items={courseOptions}
              value={course}
              placeholder={{ label: 'Pasirinkite kursą', value: '' }}
              style={pickerSelectStyles}
              Icon={dropdownIcon}
              useNativeAndroidPickerStyle={false}
              disabled={!studyProgram} />
          </View>
        </View>

        <View style={global.card}>
          <View style={styles.aboutMeHeader}>
            <Text style={global.cardTitle}>Apie Mane</Text>
            <Text style={styles.charCount}>{charCount}/500</Text>
          </View>
          <TextInput
            style={styles.aboutMeInput}
            value={aboutMe}
            onChangeText={(text) => {
              setAboutMe(text);
              setCharCount(text.length);
            }}
            maxLength={500}
            multiline
            placeholder="Parašykite apie save..."
            placeholderTextColor="#ccc" />
        </View>

        <View style={global.card}>
          <Text style={global.cardTitle}>Ko ieškau?</Text>
          <View style={styles.searchOptionsRow}>
            <TouchableOpacity
              style={[
                styles.searchOptionCard,
                { backgroundColor: Colors.lightyellow },
                searchTypes.includes('kambarioko') && styles.searchOptionCardSelected,
              ]}
              onPress={() => toggleSearchType('kambarioko')}>
              <Image
                source={require('../../assets/images/kambariokuicon.png')}
                style={styles.searchOptionIcon}
                resizeMode="contain" />
              <Text style={styles.searchOptionText}>Kambarioko</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchOptionCard,
                { backgroundColor: Colors.lightblue },
                searchTypes.includes('bendraminciu') && styles.searchOptionCardSelected,
              ]}
              onPress={() => toggleSearchType('bendraminciu')}>
              <Image
                source={require('../../assets/images/bendraminciuicon.png')}
                style={styles.searchOptionIcon}
                resizeMode="contain" />
              <Text style={styles.searchOptionText}>Bendraminčių</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={global.card}>
          <Text style={global.cardTitle}>Pomėgiai</Text>
          <View style={global.chipsRow}>
            {preferences.map((pref) => (
              <View key={pref} style={styles.staticChip}>
                <Text style={styles.staticChipText}>{pref}</Text>
              </View>
            ))}
            <TouchableOpacity
              testID="add-pref-button"
              style={styles.addPrefChip}
              onPress={() =>
                Alert.alert('Redaguoti pomėgius', 'Pomėgių redagavimas bus pridėtas vėliau.')
              }>
              <Text style={styles.addPrefPlus}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          testID="save-button"
          style={styles.saveButton}
          onPress={handleSave}>
          <Text style={styles.saveButtonText}>Išsaugoti</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const pickerSelectStyles = {
  inputIOS: {
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.fieldText,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: Colors.black,
  },
  inputAndroid: {
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.fieldText,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: Colors.black,
  },
  iconContainer: {
    top: 15,
    right: 16,
  },
};
