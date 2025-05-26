// src/styles/global.js
import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({

    // MAIN CSS
    titleMatch:{
        color: Colors.titleMatch,
    },
    loginButton: {
        backgroundColor: Colors.loginButton,
        paddingVertical: 13,
        paddingHorizontal: 90,
        borderRadius: 25,
        marginBottom: 5,
    },
    loginText: {
        color: Colors.primary,
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: Colors.regButton,
        paddingVertical: 12,
        paddingHorizontal: 85,
        borderRadius: 25,
        marginTop: 5,
    },
    registerText: {
        color: Colors.primary,
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
    },

    //Profile.js
    loadingContainer: {
        flex: 1,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: Colors.white,
        fontFamily: 'Poppins-Regular',
    },
    card: {
        backgroundColor: Colors.white,
        marginVertical: 8,
        padding: 15,
        borderRadius: 0,
    },
    cardTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        color: Colors.fieldText,
        marginBottom: 5,
    },
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginTop: 5,
    },
    chip: {
        backgroundColor: Colors.blue,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginRight: 8,
        marginBottom: 3,
    },
    chipText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        color: Colors.white,
    },
});
