import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.primarySecond || '#F1F2F4' },

  /* Header */
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary || '#F1F2F4',
  },
  backButton: { marginRight: 10 },
  topHeaderTitle: {
    fontSize: 18,
    color: Colors.edittext || '#89A1B4',
    fontFamily: 'Poppins-Medium',
  },

  /* Cards */
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: Colors.white || '#fff',
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },

  /* Slider row */
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  ageLabel: {
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },

  /* Preferences chips */
  prefs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  prefChip: {
    borderWidth: 1,
    borderColor: '#89A1B4',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.white,
  },
  prefSelected: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  prefText: {
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  prefSelectedText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  prefAdd: {
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#aaa',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  plus: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },

  /* Save button */
  saveButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});
