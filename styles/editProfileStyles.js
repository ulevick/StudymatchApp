import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primarySecond, // ~ #F1F2F4
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary, // #F1F2F4
  },
  backButton: {
    marginRight: 10,
  },
  topHeaderTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.edittext, // gali būti Colors.placeholder
    fontFamily: 'Poppins-Medium',
  },
  scrollContent: {
    paddingBottom: 80,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Nuotraukų slot
  slotsContainer: {
    marginBottom: 20,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  slot: {
    width: (width - 16 * 2 - 10) / 2,
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.photoPlaceholder, // #E8EBEE vietoj #EAF1F4
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.placeholder, // #7F9CAB
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 20,
    padding: 2,
    zIndex: 10,
  },
  placeholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },

  // Studijų pasirinkimai
  selectRow: {
    marginBottom: 2,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.white,
    marginBottom: 5,
  },

  // Apie mane
  aboutMeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: Colors.grayDark, // #666
  },
  aboutMeInput: {
    marginTop: 5,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.fieldText, // #333
  },

  // "Ko ieškau?"
  searchOptionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  searchOptionCard: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 110,
  },
  searchOptionCardSelected: {
    borderWidth: 2,
    borderColor: Colors.borderchip, // #145498
  },
  searchOptionIcon: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  searchOptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.fieldText, // #333
    textAlign: 'center',
  },

  // Pomėgiai
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  staticChip: {
    borderWidth: 1,
    borderColor: Colors.bgtext, // #000
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  staticChipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: Colors.bgtext, // #000
  },
  addPrefChip: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.bgtext, // #000
    borderRadius: 20,
    paddingHorizontal: 70,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  addPrefPlus: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.bgtext, // #000
    marginTop: -2,
  },

  // Mygtukas "Išsaugoti"
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
  cardTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Poppins-Bold',
  },

});
