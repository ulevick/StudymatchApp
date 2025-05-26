import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Colors = {
  darkOverlay: 'rgba(0,0,0,0.5)',
  lightyellow: '#FFF3C4',
  lightblue: '#DAF0FF',
};
const { width, height } = Dimensions.get('window');
const FULL_SNAP = 0;
const PARTIAL_SNAP = 200;

const SwipeableCard = ({
                         student,
                         calculateAge,
                         onReturn,
                         onReject,
                         onLike,
                         onMessage,
                       }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const nextPhoto = useCallback(() => {
    if (!student.photos || student.photos.length < 2) return;
    setCurrentIdx((i) => (i + 1 < student.photos.length ? i + 1 : 0));
  }, [student.photos]);

  const sheetY = useRef(new Animated.Value(PARTIAL_SNAP)).current;
  const [expanded, setExpanded] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  const vPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !scrolling,
      onMoveShouldSetPanResponder: (_, g) => !scrolling && Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => {
        let y = (expanded ? FULL_SNAP : PARTIAL_SNAP) + g.dy;
        y = Math.max(FULL_SNAP, Math.min(y, height));
        sheetY.setValue(y);
      },
      onPanResponderRelease: (_, g) => {
        const half = (PARTIAL_SNAP - FULL_SNAP) / 2;
        const moved = (expanded ? FULL_SNAP : PARTIAL_SNAP) + g.dy;
        const end =
          expanded
            ? moved > half
              ? PARTIAL_SNAP
              : FULL_SNAP
            : moved < PARTIAL_SNAP - half
              ? FULL_SNAP
              : PARTIAL_SNAP;
        setExpanded(end === FULL_SNAP);
        Animated.spring(sheetY, { toValue: end, useNativeDriver: false }).start();
      },
    }),
  ).current;

  const swipeX = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [removing, setRemoving] = useState(false);

  const scaleClose = swipeX.interpolate({
    inputRange: [-width / 2, 0],
    outputRange: [1.7, 1.2],
    extrapolate: 'clamp',
  });
  const scaleHeart = swipeX.interpolate({
    inputRange: [0, width / 2],
    outputRange: [1.2, 1.7],
    extrapolate: 'clamp',
  });

  const hPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !removing,
      onMoveShouldSetPanResponder: () => !removing,
      onPanResponderMove: (_, g) => swipeX.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 120) removeCard('right');
        else if (g.dx < -120) removeCard('left');
        else Animated.spring(swipeX, { toValue: 0, useNativeDriver: false }).start();
      },
    }),
  ).current;

  const removeCard = (dir) => {
    setRemoving(true);
    Animated.parallel([
      Animated.timing(swipeX, {
        toValue: dir === 'left' ? -width * 1.3 : width * 1.3,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: false }),
    ]).start(() => (dir === 'left' ? onReject() : onLike()));
  };
  const photoUri = student.photos?.[currentIdx];

  return (
    <Animated.View style={[styles.card, { opacity: fade, transform: [{ translateX: swipeX }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={nextPhoto} style={styles.photoTap}>
        <Image source={{ uri: photoUri }} style={styles.photo} />
      </TouchableOpacity>

      {student.photos?.length > 1 && (
        <View style={styles.dotsRow}>
          {student.photos.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIdx && styles.dotActive]} />
          ))}
        </View>
      )}

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}
        {...vPan.panHandlers}>
        <View style={styles.handle} />
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => setScrolling(true)}
          onScrollEndDrag={() => setScrolling(false)}
          onMomentumScrollEnd={() => setScrolling(false)}>
          <View style={{ marginBottom: 10 }}>
            <View style={styles.headRow}>
              <Text style={styles.name}>
                {student.name}, {calculateAge(student.birthday)}
              </Text>

              {student.searchTypes?.includes('kambarioko') && (
                <View style={[styles.tagBox, { backgroundColor: Colors.lightyellow }]}>
                  <Image
                    source={require('../assets/images/kambariokuicon.png')}
                    style={styles.tagIcon}
                  />
                </View>
              )}
              {student.searchTypes?.includes('bendraminciu') && (
                <View style={[styles.tagBox, { backgroundColor: Colors.lightblue }]}>
                  <Image
                    source={require('../assets/images/bendraminciuicon.png')}
                    style={styles.tagIcon}
                  />
                </View>
              )}
            </View>

            <Text style={styles.subInfo}>
              {student.university}
              {student.distanceKm != null && ` • ${student.distanceKm.toFixed(1)} km`}
              {'\n'}
              {student.studyProgram} — {student.studyLevel}, {student.course} k.
            </Text>
          </View>

          {student.aboutMe?.trim() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Apie Mane</Text>
              <Text style={styles.sectionText}>{student.aboutMe}</Text>
            </View>
          )}

          {student.preferences && Object.values(student.preferences).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pomėgiai</Text>
              <View style={styles.chipsRow}>
                {Object.values(student.preferences).map((p, i) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipTxt}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* swipe buttons */}
      <View style={styles.btnRow} {...hPan.panHandlers}>
        <TouchableOpacity style={[styles.circle, { transform: [{ scale: 0.8 }] }]} onPress={onReturn}>
          <Ionicons name="arrow-undo" size={28} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circle} onPress={() => removeCard('left')}>
          <Animated.View style={{ transform: [{ scale: scaleClose }] }}>
            <Ionicons name="close" size={28} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.circle} onPress={() => removeCard('right')}>
          <Animated.View style={{ transform: [{ scale: scaleHeart }] }}>
            <Ionicons name="heart" size={28} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.circle, { transform: [{ scale: 0.8 }] }]} onPress={onMessage}>
          <Ionicons name="paper-plane" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default SwipeableCard;

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: 'transparent' },

  photoTap: { flex: 1 },
  photo: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },

  dotsRow: {
    position: 'absolute',
    top: 10,
    left: '5%',
    right: '5%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  dot: { flex: 1, height: 3, marginHorizontal: 2, borderRadius: 2, backgroundColor: '#ffffff50' },
  dotActive: { backgroundColor: '#fff' },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 10 },

  headRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  name: { fontSize: 24, color: '#fff', fontFamily: 'Poppins-Bold', marginRight: 6 },

  tagBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  tagIcon: { width: 16, height: 16, resizeMode: 'contain' },

  subInfo: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
    lineHeight: 20,
  },

  section: { backgroundColor: Colors.darkOverlay, borderRadius: 20, padding: 12, marginBottom: 12 },
  sectionTitle: { fontSize: 16, color: '#fff', fontFamily: 'Poppins-SemiBold', marginBottom: 6 },
  sectionText: { fontSize: 13, color: '#fff', fontFamily: 'Poppins-Regular', lineHeight: 18 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipTxt: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Regular' },

  btnRow: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    zIndex: 9999,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
