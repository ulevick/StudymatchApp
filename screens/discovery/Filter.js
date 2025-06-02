import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import debounce from 'lodash/debounce';

import CustomDropdown from '../../components/CustomDropdown';
import { preferencesData } from '../../constants/preferencesData';
import studyPrograms from '../../constants/studyPrograms';
import Colors from '../../constants/colors';
import { GENDER_FEMALE, GENDER_MALE } from '../../constants/gender';
import { LEVELS } from '../../constants/levels';
import { COURSES_BY_LEVEL } from '../../constants/courses';
import styles from '../../styles/filterStyles';
import { UserContext } from '../../contexts/UserContext';
import { authInstance, db } from '../../services/firebase';
import { doc, setDoc } from '@react-native-firebase/firestore';

const screenWidth = Dimensions.get('window').width;

const Filter = ({ navigation }) => {
  const genders = ['Visi', GENDER_FEMALE, GENDER_MALE];
  const levels = ['Visų lygių', ...LEVELS.map((l) => l.value)];
  const universities = ['Visų universitetų', ...Object.keys(studyPrograms)];

  const { userData, setUserData } = useContext(UserContext);
  const [gender, setGender] = useState(null);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(50);
  const [distanceKm, setDistanceKm] = useState(null);
  const [university, setUniversity] = useState(null);
  const [level, setLevel] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [studyProgram, setStudyProgram] = useState(null);
  const [course, setCourse] = useState(null);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const f = userData?.filter;
    if (!f) return;
    setGender(f.filterGender ?? null);
    setMinAge(f.filterAgeMin ?? 18);
    setMaxAge(f.filterAgeMax ?? 50);
    setDistanceKm(f.filterDistanceKm ?? null);
    setUniversity(f.filterUniversity ?? null);
    setLevel(f.filterLevel ?? null);
    setFaculty(f.filterFaculty ?? null);
    setStudyProgram(f.filterStudyProgram ?? null);
    setCourse(f.filterCourse ?? null);
    setSelectedPreferences(f.filterPreferences ?? []);
  }, [userData]);

  const handleSave = async (showAlert = false) => {
    try {
      const userId = authInstance.currentUser?.uid;
      if (!userId) {
        if (showAlert)
          Alert.alert('Klaida', 'Nepavyko gauti vartotojo identifikatoriaus');
        return;
      }

      const filterData = {
        filterGender: gender,
        filterAgeMin: minAge,
        filterAgeMax: maxAge,
        filterDistanceKm: distanceKm,
        filterUniversity: university,
        filterLevel: level,
        filterFaculty: faculty,
        filterStudyProgram: studyProgram,
        filterCourse: course,
        filterPreferences: selectedPreferences,
      };
      setUserData((prev) => ({ ...prev, filter: filterData }));
      await setDoc(doc(db, 'users', userId), { filter: filterData }, { merge: true });
    } catch (err) {
      console.error('Filter save error:', err);
      if (showAlert) Alert.alert('Klaida', 'Nepavyko išsaugoti filtro.');
    }
  };

  const debouncedSave = useCallback(
      debounce(() => handleSave(false), 500),
      [
        gender,
        minAge,
        maxAge,
        distanceKm,
        university,
        level,
        faculty,
        studyProgram,
        course,
        selectedPreferences,
      ]
  );

  useEffect(() => {
    debouncedSave();
    return () => debouncedSave.cancel();
  }, [
    gender,
    minAge,
    maxAge,
    distanceKm,
    university,
    level,
    faculty,
    studyProgram,
    course,
    selectedPreferences,
  ]);

  const togglePref = (item) =>
      setSelectedPreferences((prev) =>
          prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
      );

  const faculties =
      university &&
      university !== 'Visų universitetų' &&
      level &&
      level !== 'Visų lygių'
          ? Object.keys(studyPrograms[university]?.[level] || {})
          : [];

  const programOptions =
      university && level && faculty
          ? studyPrograms[university]?.[level]?.[faculty] || []
          : [];

  const courseOptions =
      level && level !== 'Visų lygių' ? COURSES_BY_LEVEL[level] || [] : [];

  return (
      <View style={styles.wrapper}>
        <View style={styles.topHeader}>
          <TouchableOpacity
              testID="back-button"
              onPress={async () => {
                await handleSave(true);
                navigation.goBack();
              }}
              style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#89A1B4" />
          </TouchableOpacity>
          <Text style={styles.topHeaderTitle}>Filtro nustatymai</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Lytis */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rodyti tik</Text>
            <CustomDropdown
                data={genders}
                selected={gender ?? 'Visi'}
                onSelect={(val) => setGender(val === 'Visi' ? null : val)}
            />
          </View>

          {/* Amžius */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Amžius</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.ageLabel}>{minAge} m.</Text>
              <Text style={styles.ageLabel}>{maxAge} m.</Text>
            </View>
            <MultiSlider
                values={[minAge, maxAge]}
                min={18}
                max={50}
                step={1}
                onValuesChange={([min, max]) => {
                  setMinAge(min);
                  setMaxAge(max);
                }}
                selectedStyle={{ backgroundColor: Colors.blue }}
                markerStyle={{ backgroundColor: Colors.blue }}
                sliderLength={screenWidth - 60}
                containerStyle={{ alignSelf: 'center' }}
            />
          </View>

          {/* Atstumas */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Atstumas</Text>
            <View style={styles.sliderRow}>
              <Text style={styles.ageLabel}>
                {distanceKm == null ? 'Neriboti' : `${distanceKm} km`}
              </Text>
            </View>
            <MultiSlider
                values={[distanceKm ?? 100]}
                min={1}
                max={100}
                step={1}
                onValuesChange={([val]) => setDistanceKm(val)}
                selectedStyle={{ backgroundColor: Colors.blue }}
                markerStyle={{ backgroundColor: Colors.blue }}
                sliderLength={screenWidth - 60}
                containerStyle={{ alignSelf: 'center' }}
            />
            <TouchableOpacity
                testID="reset-distance-button"
                onPress={() => setDistanceKm(null)}
                style={{ alignSelf: 'flex-end', marginTop: 6 }}
            >
              <Text style={{ color: Colors.blue, fontFamily: 'Poppins-Regular' }}>
                Neriboti
              </Text>
            </TouchableOpacity>
          </View>

          {/* Universitetas / lygis / fakultetas / programa / kursas */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rodyti studentus</Text>
            <CustomDropdown
                label="Universitetas"
                data={universities}
                selected={university ?? 'Visų universitetų'}
                onSelect={(val) => {
                  setUniversity(val === 'Visų universitetų' ? null : val);
                  setFaculty(null);
                  setStudyProgram(null);
                }}
            />
            <CustomDropdown
                label="Studijų lygis"
                data={levels}
                selected={level ?? 'Visų lygių'}
                onSelect={(val) => {
                  setLevel(val === 'Visų lygių' ? null : val);
                  setFaculty(null);
                  setStudyProgram(null);
                  setCourse(null);
                }}
            />
            {(faculties.length > 0 || faculty === null) && (
                <CustomDropdown
                    label="Fakultetas"
                    data={['Visų fakultetų', ...faculties]}
                    selected={faculty ?? 'Visų fakultetų'}
                    onSelect={(val) => {
                      setFaculty(val === 'Visų fakultetų' ? null : val);
                      setStudyProgram(null);
                    }}
                    disabled={!university || !level}
                />
            )}
            {(programOptions.length > 0 || studyProgram === null) && (
                <CustomDropdown
                    label="Studijų kryptis"
                    data={['Visų krypčių', ...programOptions]}
                    selected={studyProgram ?? 'Visų krypčių'}
                    onSelect={(val) =>
                        setStudyProgram(val === 'Visų krypčių' ? null : val)
                    }
                    disabled={!faculty}
                />
            )}
            <CustomDropdown
                label="Kursas"
                data={['Visų kursų', ...courseOptions.map((c) => c.label)]}
                selected={
                    courseOptions.find((c) => c.value === course)?.label || 'Visų kursų'
                }
                onSelect={(label) => {
                  if (label === 'Visų kursų') setCourse(null);
                  else {
                    const sel = courseOptions.find((c) => c.label === label);
                    setCourse(sel?.value || null);
                  }
                }}
                disabled={!level || level === 'Visų lygių'}
            />
          </View>

          {/* Pomėgiai */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pomėgiai</Text>
            <View style={styles.prefs}>
              {selectedPreferences.map((item, i) => (
                  <View key={i} style={[styles.prefChip, styles.prefSelected]}>
                    <Text style={styles.prefSelectedText}>{item}</Text>
                  </View>
              ))}
              <TouchableOpacity
                  testID="open-modal-button"
                  style={styles.prefAdd}
                  onPress={() => setShowModal(true)}
              >
                <Text style={styles.plus}>＋</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Modal */}
        <Modal visible={showModal} animationType="slide">
          <View style={styles.wrapper}>
            <View style={styles.topHeader}>
              <TouchableOpacity
                  testID="modal-back-button"
                  onPress={async () => {
                    await handleSave(true);
                    setShowModal(false);
                  }}
                  style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={28} color="#89A1B4" />
              </TouchableOpacity>
              <Text style={styles.topHeaderTitle}>Pasirinkite pomėgius</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {preferencesData.map((group, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitle}>{group.title}</Text>
                    <View style={styles.prefs}>
                      {group.items.map((item, i) => (
                          <TouchableOpacity
                              key={i}
                              style={[
                                styles.prefChip,
                                selectedPreferences.includes(item) &&
                                styles.prefSelected,
                              ]}
                              onPress={() => togglePref(item)}
                          >
                            <Text
                                style={[
                                  styles.prefText,
                                  selectedPreferences.includes(item) &&
                                  styles.prefSelectedText,
                                ]}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                      ))}
                    </View>
                  </View>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
  );
};

export default Filter;
