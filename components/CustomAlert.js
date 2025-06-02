// components/CustomAlert.js
import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import Colors from '../constants/colors';
import regStyles from '../styles/registration';

const clockIcon = require('../assets/images/time-left.png');
const binIcon   = require('../assets/images/bin.png');

const CustomAlert = ({
                         visible,
                         title,
                         message,
                         onClose,
                         onConfirm,
                         cancelText = 'Atšaukti',
                         confirmText = 'Tęsti',
                         iconType   = 'time',       // <— čia perduodame 'time' arba 'delete'
                     }) => {
    // pasirinkti ikoną pagal iconType
    const iconSource = iconType === 'delete' ? binIcon : clockIcon;

    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Image
                        source={iconSource}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={[styles.buttons, regStyles.buttonRow]}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[regStyles.backButton, styles.modalBackButton]}
                        >
                            <Text style={regStyles.backText}>{cancelText}</Text>
                        </TouchableOpacity>

                        {onConfirm && (
                            <TouchableOpacity
                                onPress={onConfirm}
                                style={[regStyles.nextButton, styles.modalNextButton]}
                            >
                                <Text style={regStyles.nextText}>{confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center', alignItems: 'center',
    },
    container: {
        width: '85%', backgroundColor: '#fff',
        borderRadius: 16, paddingVertical: 24,
        paddingHorizontal: 20, alignItems: 'center',
    },
    iconImage: {
        width: 48, height: 48, marginBottom: 12,
    },
    title: {
        fontSize: 18, fontFamily: 'Poppins-Bold',
        color: Colors.timeicon, textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15, fontFamily: 'Poppins-Regular',
        color: '#235F9D', textAlign: 'center',
        lineHeight: 22, marginBottom: 12,
    },
    buttons: {
        width: '100%', justifyContent: 'space-between',
    },
    modalBackButton: {
        paddingHorizontal: 30, marginHorizontal: 6,
    },
    modalNextButton: {
        paddingHorizontal: 30, marginHorizontal: 6,
    },
});
