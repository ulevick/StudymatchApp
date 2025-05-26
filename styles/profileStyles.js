import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 500;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primarysecond,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoSection: {
    alignItems: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  photo: {
    width: width,
    height: IMAGE_HEIGHT,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    backgroundColor: '#ffffff30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    top: 10,
    left: '2%',
    right: '2%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  progressDot: {
    flex: 1,
    height: 3,
    marginHorizontal: 2,
    borderRadius: 2,
    backgroundColor: '#ffffff50',
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  userName: {
    position: 'absolute',
    bottom: 10,
    left: 25,
    fontSize: 27,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 20,
    right: 34,
    backgroundColor: Colors.blue,
    borderRadius: 30,
    padding: 12,
    zIndex: 10,
  },
});
