// src/styles/authStyles.js
import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({

  // MainScreen.js/SignIn.js
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 25,
    paddingTop: 210,
  },
  containerSignIn: {
    flex: 1,
    backgroundColor: Colors.primary,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 25,
    paddingTop: 80,
  },
  inputSigIn: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-Regular',
    fontSize: 17,
    marginBottom: 20,
  },
  hatIcon: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: -35,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Poppins-Black',
    color: Colors.bgtext,
    marginBottom: -10,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: Colors.bgtext,
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 20,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  orText: {
    color: Colors.bgtext,
    fontFamily: 'Poppins-Bold',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.bgtext,
    borderRadius: 999,
    marginHorizontal: 15,
  },
  bgIcon: {
    position: 'absolute',
    bottom: -50,
    left: 140,
    right: 0,
    width: '100%',
    height: 320,
    resizeMode: 'contain',
    opacity: 0.2,
  },
  forgot: {
    alignSelf: 'flex-start',
    color: Colors.bgtext,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    marginBottom: 25,
    textDecorationLine: 'underline',
    marginLeft: 17,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 15,
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'flex-start',
    marginLeft: 17,
    marginTop:-7,
  },
});
