// src/styles/registration.js
import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({

  //REGISTRATION CSS
  wrapper: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 45,
    paddingBottom: 20,
    zIndex: 1,
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  titleReg: {
    fontFamily: 'Poppins-Black',
    fontSize: 32,
    color: Colors.bgtext,
    marginBottom: -10,
    letterSpacing: 2,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 25,
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#cccccc',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.lightGreen,
    borderRadius: 3,
  },
  instruction: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.bgtext,
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    borderWidth: 1,
    borderColor: Colors.white,
    color: Colors.fieldText,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 7,
    paddingHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 25,
  },
  backButton: {
    backgroundColor: Colors.backButton,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  nextButton: {
    backgroundColor: Colors.nextButton,
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 25,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  backText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    color: Colors.nextButton,
  },
  nextText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 17,
    color: Colors.primary,
  },

  //Reg_Stud2
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeInput: {
    width: 53,
    height: 55,
    backgroundColor: Colors.white,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    borderWidth: 1,
    borderColor: Colors.white,
    color: Colors.fieldText,
  },
  noteText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.noteText,
    marginTop: 20,
    marginLeft: 8,
  },
  linkText: {
    color: Colors.noteText,
    fontFamily: 'Poppins-Bold',
  },

  //Reg_Stud3
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

  //Reg_Stud4
  notes: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.noteText,
    marginTop: 9,
    marginLeft: 8,
  },

  //Reg_Stud6
  option: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 15,
  },
  optionText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.fieldText,
    textAlign: 'center',
  },
  selectedOptionFemale: {
    borderColor: Colors.lightpink,
    borderWidth: 2,
  },
  selectedOptionMale: {
    borderColor: Colors.lightblue,
    borderWidth: 2,
  },

  //Reg_Stud7
  inputIOS: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    paddingVertical: 13,
    paddingHorizontal: 20,
    color: Colors.fieldText,
    backgroundColor: Colors.white,
    borderRadius: 30,
    marginBottom: 15,
  },
  inputAndroid: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: Colors.fieldText,
    backgroundColor: Colors.white,
    borderRadius: 30,
    marginBottom: 15,
  },
  placeholder: {
    fontFamily: 'Poppins-Regular',
    color: Colors.placeholder,
  },
  iconContainer: {
    position: 'absolute',
    top: -10,
    bottom: 0,
    right: 10,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },

  //Reg_Stud8
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionCard: {
    width: 170,
    height: 160,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  roomMateCard: {
    backgroundColor: Colors.lightyellow,
  },
  likeMindedCard: {
    backgroundColor: Colors.blue,
  },
  optionCardSelected: {
    borderColor: Colors.lightGreen,
    borderWidth: 4,
  },
  optionIcon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 10,
  },

  //Reg_Stud9
  categoryBlock: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.bgtext,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 20,
    backgroundColor: Colors.chip,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: Colors.selectedchip,
  },
  chipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.bgtext,
  },
  chipTextSelected: {
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
  },
  nextButtonWithNumber: {
    backgroundColor: Colors.nextButton,
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
  },

  //Reg_Stud10
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoWrapper: {
    width: '48%',
    aspectRatio: 0.7,
    marginBottom: 15,
    position: 'relative',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: Colors.photoPlaceholder,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPhotoContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPlusSign: {
    fontSize: 36,
    color: Colors.bgtext,
    fontFamily: 'Poppins-Light',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },

  //Reg_StudFinal
  containerStu10: {
    flex: 1,
    backgroundColor: Colors.primary, // šviesus fonas
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    width: '85%',
    alignItems: 'center',
  },
  bigTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 30,
    color: Colors.bgtext,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: Colors.bgtext,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 35,
  },
  highlightBlue: {
    color: '#145498',
    fontWeight: 'Poppins-Bold',
  },
  loginButtonStud10: {
    backgroundColor: Colors.bgtext,
    paddingVertical: 13,
    paddingHorizontal: 90,
    borderRadius: 30,
    marginTop: 90,
  },
  loginButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: Colors.white,
  },
  footerText: {
    fontFamily: 'Poppins-Black',
    fontSize: 20,
    color: '#28292E',
    marginTop: 150,
  },

});
