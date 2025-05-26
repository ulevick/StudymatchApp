import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { authInstance, db } from '../../services/firebase';
import { doc, deleteDoc } from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import moment from 'moment';
import { UserContext } from '../../contexts/UserContext';
import styles from '../../styles/settingsStyles';

const Settings = ({ navigation }) => {
  /* ───────────── user info ───────────── */
  const userId = authInstance.currentUser?.uid;
  const { userData, loading } = useContext(UserContext);

  const isVerified = !!userData?.verifiedAt &&
      moment().diff(moment(userData.verifiedAt), 'months') < 12;

  /* ───────────── common params ───────────── */
  const baseParams = {
    email        : userData?.email,
    originalEmail: userData?.email,
    totalSteps   : 3,
    currentStep  : 1,
    studyLevel   : userData?.studyLevel   ?? '',
    faculty      : userData?.faculty      ?? '',
    studyProgram : userData?.studyProgram ?? '',
    course       : userData?.course       ?? '',
  };

  /* ───────────── actions ───────────── */
  const handleDelete = () => {
    Alert.alert(
        'Ištrinti paskyrą',
        'Ar tikrai nori ištrinti paskyrą?',
        [
          { text: 'Atšaukti', style: 'cancel' },
          {
            text: 'Ištrinti',
            style: 'destructive',
            onPress: () => {
              // įvyniojam async IIFE, kad onPress grąžintų void
              (async () => {
                try {
                  await deleteDoc(doc(db, 'users', userId));
                  await authInstance.currentUser?.delete();
                  navigation.navigate('Login');
                } catch {
                  Alert.alert('Klaida', 'Nepavyko ištrinti paskyros.');
                }
              })();
            },
          },
        ],
    );
  };

  const handleSignOut = async () => {
    try {
      await authInstance.signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch {
      Alert.alert('Klaida', 'Nepavyko atsijungti');
    }
  };

  return (
      <View style={styles.container}>
        <Header onFilterPress={() => navigation.navigate('Filter')} />

        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#999" />
            </View>
        ) : (
            <ScrollView contentContainerStyle={styles.content}>
              {/* e-pašto statusas */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>El. pašto statusas</Text>

                <View style={styles.emailRow}>
                  <Text style={styles.emailText}>{userData?.email}</Text>
                  <Ionicons
                      name={isVerified ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                      size={18}
                      color={isVerified ? Colors.success : Colors.warning}
                  />
                  <Text style={isVerified ? styles.verified : styles.unverified}>
                    {isVerified ? 'Patvirtinta' : 'Nepatvirtintas'}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  {/* pakeisti */}
                  <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() =>
                          navigation.navigate('Reg_Stud1', {
                            ...baseParams,
                            mode: 'change',
                          })
                      }
                  >
                    <Text style={styles.changeText}>Pakeisti el. paštą</Text>
                  </TouchableOpacity>

                  {/* patvirtinti */}
                  {!isVerified && (
                      <TouchableOpacity
                          style={styles.verifyButton}
                          onPress={() =>
                              navigation.navigate('Reg_Stud1', {
                                ...baseParams,
                                mode: 'verify',
                              })
                          }
                      >
                        <Text style={styles.verifyText}>Patvirtinti el. paštą</Text>
                      </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* pagalba */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Pagalba & palaikymas</Text>
                <Text style={styles.cardText}>Jei kyla klausimų, rašyk mums.</Text>
              </View>

              {/* atsijungti */}
              <TouchableOpacity
                  style={styles.logout}
                  onPress={() => {
                    // apvyniojame promise-returning funkciją
                    handleSignOut();
                  }}
              >
                <Text style={styles.logoutText}>Atsijungti</Text>
              </TouchableOpacity>

              {/* ištrinti paskyrą */}
              <TouchableOpacity
                  style={styles.delete}
                  onPress={() => {
                    // tik wrapper, kad onPress grąžintų void
                    handleDelete();
                  }}
              >
                <Text style={styles.deleteText}>Ištrinti paskyrą</Text>
              </TouchableOpacity>
            </ScrollView>
        )}

        <Footer
            activeTab="settings"
            onTabPress={tab => navigation.navigate(tab)}
        />
      </View>
  );
};

export default Settings;
