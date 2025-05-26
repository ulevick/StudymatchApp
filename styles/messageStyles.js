import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContainer:   { paddingBottom: 100 },
  titleScreen:       { fontSize: 18, fontWeight: 'bold', marginVertical: 8, marginLeft: 16, color: '#333' },
  unreadDot:         { color: 'red', fontSize: 18, fontWeight: 'bold' },

  sectionContainer:  { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 4 },
  sectionTitle:      { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },

  /* Likes & matches */
  matchLikeRow:      { flexDirection: 'row', alignItems: 'flex-start' },
  likesBlock:        { width: 110, alignItems: 'center', marginRight: 12 },
  likesImage:        { width: 110, height: 170, borderRadius: 8, resizeMode: 'cover' },
  likesOverlay:      { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8 },
  iconsOverlay:      { position: 'absolute', top: 6, left: 6, flexDirection: 'row', gap: 4 },
  likesCount:        { fontSize: 24, color: '#fff', fontWeight: '700' },
  likesText:         { fontSize: 14, color: '#fff', fontWeight: '500' },
  likesLabel:        { marginTop: 4, fontSize: 14, color: '#999', fontWeight: '600' },

  matchesBlock:      { flex: 1 },
  matchScroll:       { flexDirection: 'row', alignItems: 'center' },
  matchCard:         { width: 110, alignItems: 'center', marginRight: 12 },
  matchImage:        { width: 110, height: 170, borderRadius: 8, resizeMode: 'cover' },
  matchOverlay:      { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 6, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, alignItems: 'center' },
  matchOverlayText:  { color: '#fff', fontSize: 14, fontWeight: '600' },

  /* conversations */
  messageRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  avatar:            { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#ccc' },
  messageTextContainer:{ flex: 1 },
  messageName:       { fontSize: 14, fontWeight: '600', color: '#333', marginRight: 4 },
  messageText:       { fontSize: 13, color: '#666' },
  noConversations:   { fontSize: 14, color: '#999', marginTop: 8 },

  /* tag */
  tagBox:            { width: 20, height: 20, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  tagIcon:           { width: 12, height: 12, resizeMode: 'contain' },
});
