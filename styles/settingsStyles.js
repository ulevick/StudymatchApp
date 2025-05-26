import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primarysecond },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  content: { paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailText: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#555',
  },
  verified: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.success,
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 15,
  },
  unverified: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.warning,
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  changeButton: {
    backgroundColor: '#000',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  verifyButton: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verifyText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  cardText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#555',
  },
  logout: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    marginTop: 20,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: Colors.bgGreen,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  delete: {
    backgroundColor: '#fff',
    marginHorizontal: 40,
    marginTop: 10,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteText: {
    color: 'red',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
});
