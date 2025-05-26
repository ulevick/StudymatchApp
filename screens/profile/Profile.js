import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { authInstance } from '../../services/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../../styles/profileStyles';
import global from '../../styles/global';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { UserContext } from '../../contexts/UserContext';

function getAgeFromBirthday(birthdayString) {
  if (!birthdayString) return null;
  const [year, month, day] = birthdayString.split('/');
  const birthDate = new Date(year, Number(month) - 1, Number(day));
  if (isNaN(birthDate.getTime())) return null;
  const diffMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

const Profile = ({ navigation }) => {
  const { userData, loading } = useContext(UserContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  const userId = authInstance.currentUser?.uid;
  if (!userId) {
    navigation.replace('SignIn');
    return null;
  }

  if (loading) {
    return (
      <View style={global.loadingContainer} testID="loading-view">
        <ActivityIndicator
          testID="loading-spinner"
          size="large"
          color="#fff" />
        <Text style={global.loadingText} testID="loading-text">
          Kraunama...
        </Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={global.loadingContainer} testID="error-view">
        <Text style={global.loadingText} testID="error-text">
          Vartotojo duomenų nerasta.
        </Text>
      </View>
    );
  }

  const photos = userData.photos || [];
  const userAge = getAgeFromBirthday(userData.birthday);
  const displayName = userData.name
    ? `${userData.name}${userAge ? `, ${userAge}` : ''}`
    : 'Vartotojas';

  const nextPhoto = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }
  };

  return (
    <View style={styles.container}>
      <Header onFilterPress={() => navigation.navigate('Filter')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoSection} testID="photo-section">
          {photos.length > 1 && (
            <View style={styles.progressBar} testID="progress-bar">
              {photos.map((_, index) => (
                <View
                  key={index}
                  testID="progress-dot"
                  style={[
                    styles.progressDot,
                    index === currentIndex && styles.activeDot,
                  ]} />
              ))}
            </View>
          )}
          {photos.length > 0 ? (
            <TouchableOpacity
              testID="photo-button"
              onPress={nextPhoto}
              activeOpacity={0.9}>
              <Image
                testID="user-photo"
                source={{ uri: photos[currentIndex] }}
                style={styles.photo} />
            </TouchableOpacity>
          ) : (
            <View
              style={[styles.photo, styles.photoPlaceholder]}
              testID="photo-placeholder">
              <Ionicons name="person-circle-outline" size={100} color="#ccc" />
            </View>
          )}
          <Text style={styles.userName} testID="user-name">
            {displayName}
          </Text>
          <TouchableOpacity
            testID="edit-button"
            style={styles.editIcon}
            onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="pencil" size={25} color="#fff" />
          </TouchableOpacity>
        </View>

        <InfoCard title="Statusas">
          <Text style={styles.cardText}>
            {userData.university}, {userData.studyProgram}
          </Text>
          <Text style={styles.cardText}>
            {userData.studyLevel}, {userData.course} kursas
          </Text>
        </InfoCard>

        <InfoCard title="Apie Mane">
          <Text style={styles.cardText}>
            {userData.aboutMe || 'Dar neparašyta...'}
          </Text>
        </InfoCard>

        <InfoCard title="Ko ieško?">
          <Text style={styles.cardText}>
            {userData.searchTypes && userData.searchTypes.length > 0
              ? userData.searchTypes
                .map((type) => {
                  if (type === 'kambarioko') return 'Kambarioko';
                  if (type === 'bendraminciu') return 'Bendraminčių';
                  return type;
                })
                .join(', ')
              : 'Nenurodyta'}
          </Text>
        </InfoCard>

        <InfoCard title="Pomėgiai">
          <View style={global.chipsRow}>
            {userData.preferences ? (
              Object.values(userData.preferences).map((pref, i) => (
                <View key={i} style={global.chip}>
                  <Text style={global.chipText}>{pref}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cardText}>Nėra pasirinkimų</Text>
            )}
          </View>
        </InfoCard>
      </ScrollView>
      <Footer activeTab="profile" onTabPress={(tab) => navigation.navigate(tab)} />
    </View>
  );
};

const InfoCard = ({ title, children }) => (
  <View style={global.card}>
    <Text style={global.cardTitle}>{title}</Text>
    {children}
  </View>
);

export default Profile;
