import {Dimensions, StyleSheet} from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  tabText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#aaa',
  },
  activeTab: {
    color: '#1da1f2',
    fontFamily: 'Poppins-Bold',
  },
  mapBlock: { flex: 1 },
  map: { flex: 1 },
  chipColumn: { position: 'absolute', top: 70, left: 16, zIndex: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  chipLabel: { marginLeft: 6, fontSize: 12, fontWeight: '600' },
  markerIconWrap: { backgroundColor: '#fff', padding: 4, borderRadius: 20 },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 32 },
  spotTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  roundIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ctaBtn: {
    alignSelf: 'center',
    backgroundColor: Colors.blue,
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginTop: 20,
  },
  ctaTxt: { color: '#fff', fontWeight: '600' },


});
