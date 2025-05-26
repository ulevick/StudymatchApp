import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  /* header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '600', color: '#333', marginRight: 6 },

  tagBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tagIcon: { width: 14, height: 14, resizeMode: 'contain' },

  /* chat list */
  chatContainer: { paddingHorizontal: 16, paddingTop: 10 },

  /* bubbles */
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 10,
    marginBottom: 8,
  },
  bubbleOwn: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  bubbleTheir: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  bubbleTxt: { fontSize: 15, color: '#333' },

  /* input */
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: Colors.blue,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  sendTxt: { color: '#fff', fontWeight: '600' },
});
