import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { authInstance, db } from '../../services/firebase';
import {
    doc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
} from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../constants/colors';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import moment from 'moment';
import { UserContext } from '../../contexts/UserContext';
import styles from '../../styles/settingsStyles';
import CustomAlert from '../../components/CustomAlert';

const Settings = ({ navigation }) => {
    const userId = authInstance.currentUser?.uid;
    const { userData, loading } = useContext(UserContext);

    const [mustRenew, setMustRenew] = useState(false);
    const [showRenewAlert, setShowRenewAlert] = useState(false);
    const [customConfirmVisible, setCustomConfirmVisible] = useState(false);
    const [errorAlert, setErrorAlert] = useState({ visible: false, title: '', message: '' });

    useEffect(() => {
        if (!userData?.verifiedAt) {
            setMustRenew(true);
            return;
        }
        const monthsSince = moment().diff(moment(userData.verifiedAt), 'months');
        setMustRenew(monthsSince >= 12);
        if (monthsSince >= 12) {
            setShowRenewAlert(true);
        }
    }, [userData?.verifiedAt]);

    const baseParams = {
        email: userData?.email,
        originalEmail: userData?.email,
        totalSteps: 3,
        currentStep: 1,
        studyLevel: userData?.studyLevel ?? '',
        faculty: userData?.faculty ?? '',
        studyProgram: userData?.studyProgram ?? '',
        course: userData?.course ?? '',
    };

    const handleDelete = () => {
        setCustomConfirmVisible(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            await authInstance.currentUser?.delete();
            navigation.navigate('Login');
        } catch (e) {
            setErrorAlert({ visible: true, title: 'Klaida', message: 'Nepavyko ištrinti paskyros.' });
        }
    };

    const handleSignOut = async () => {
        try {
            await authInstance.signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        } catch (e) {
            setErrorAlert({ visible: true, title: 'Klaida', message: 'Nepavyko atsijungti.' });
        }
    };

    const handleRenew = async () => {
        try {
            await updateDoc(doc(db, 'users', userId), { verifiedAt: serverTimestamp() });
            setShowRenewAlert(false);
            navigation.navigate('Reg_Stud1', { ...baseParams, mode: 'renew' });
        } catch (e) {
            setErrorAlert({ visible: true, title: 'Klaida', message: 'Nepavyko atnaujinti statuso.' });
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
                    {/* Email status */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>El. pašto statusas</Text>

                        <View style={styles.emailRow}>
                            <Text
                                style={[styles.emailText, { flex: 1, marginRight: 8 }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {userData?.email}
                            </Text>
                            <Ionicons
                                name={
                                    userData?.verifiedAt && moment().diff(moment(userData.verifiedAt), 'months') < 12
                                        ? 'checkmark-circle-outline'
                                        : 'alert-circle-outline'
                                }
                                size={18}
                                color={
                                    userData?.verifiedAt && moment().diff(moment(userData.verifiedAt), 'months') < 12
                                        ? Colors.success
                                        : Colors.warning
                                }
                            />
                            <Text
                                style={
                                    userData?.verifiedAt && moment().diff(moment(userData.verifiedAt), 'months') < 12
                                        ? styles.verified
                                        : styles.unverified
                                }
                            >
                                {userData?.verifiedAt && moment().diff(moment(userData.verifiedAt), 'months') < 12
                                    ? 'Patvirtinta'
                                    : 'Nepatvirtintas'}
                            </Text>
                        </View>

                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.changeButton}
                                onPress={() => navigation.navigate('Reg_Stud1', { ...baseParams, mode: 'change' })}
                            >
                                <Text style={styles.changeText}>Pakeisti el. paštą</Text>
                            </TouchableOpacity>

                            {(!userData?.verifiedAt || moment().diff(moment(userData.verifiedAt), 'months') >= 12) && (
                                <TouchableOpacity style={styles.verifyButton} onPress={() => setShowRenewAlert(true)}>
                                    <Text style={styles.verifyText}>Atnaujinti statusą</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Help & support */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Pagalba & palaikymas</Text>
                        <Text style={styles.cardText}>Jei kyla klausimų, rašyk mums.</Text>
                    </View>

                    {/* Sign out */}
                    <TouchableOpacity  testID="sign-out-button" style={styles.logout} onPress={handleSignOut}>
                        <Text style={styles.logoutText}>Atsijungti</Text>
                    </TouchableOpacity>

                    {/* Delete account */}
                    <TouchableOpacity testID="delete-account-button" style={styles.delete} onPress={handleDelete}>
                        <Text style={styles.deleteText}>Ištrinti paskyrą</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            <Footer
                activeTab="settings"
                onTabPress={(tab) => {
                    if (mustRenew && tab !== 'settings') {
                        setShowRenewAlert(true);
                        return;
                    }
                    navigation.navigate(tab);
                }}
            />
            <CustomAlert
                visible={showRenewAlert}
                iconType="time"
                cancelText="Atšaukti"
                confirmText="Atnaujinti"
                title="Studento statusas pasibaigęs"
                message="Atnaujink studento statusą, kad galėtum tęsti programėlės naudojimą."
                onClose={() => setShowRenewAlert(false)}
                onConfirm={handleRenew}
            />
            <CustomAlert
                visible={customConfirmVisible}
                iconType="delete"
                cancelText="Atšaukti"
                confirmText="Ištrinti"
                title="Ištrinti paskyrą"
                message="Ar tikrai norite visam laikui ištrinti savo paskyrą?"
                onClose={() => setCustomConfirmVisible(false)}
                onConfirm={confirmDelete}
            />
            <CustomAlert
                visible={errorAlert.visible}
                cancelText="Gerai"
                title={errorAlert.title}
                message={errorAlert.message}
                onClose={() => setErrorAlert({ ...errorAlert, visible: false })}
            />
        </View>
    );
};

export default Settings;
