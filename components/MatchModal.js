import React from 'react';
import { View, Text, Modal, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from '../constants/colors';

const MatchModal = ({ visible, onClose, matchedUser, currentUser }) => {
  const navigation = useNavigation();

  const handleWritePress = () => {
    onClose();
    navigation.navigate('WriteMessages', {
      receiverId: matchedUser.id,
      receiverName: matchedUser.name,
      receiverAvatar: matchedUser.photoURL,
    });
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <LinearGradient colors={['#1B1A1A', '#28292E']} style={styles.modalContainer}>
            <View style={styles.imagesContainer}>
              <View style={styles.imageWrapperLeft}>
                <Image source={{ uri: currentUser?.photoURL }} style={styles.avatar} />
              </View>
              <View style={styles.imageWrapperRight}>
                <Image source={{ uri: matchedUser?.photoURL }} style={styles.avatar} />
              </View>
            </View>
            <Text style={styles.matchTitle}>Match! 🎉</Text>
            <Text style={styles.matchText}>
              Tu ir {matchedUser?.name} susidomėjote vienas kitu. Parašyk žinutę!
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleWritePress}>
              <Text style={styles.buttonText}>Parašyti!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default MatchModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'center',
  },
  imageWrapperLeft: {
    marginRight: -20,
    zIndex: 2,
  },
  imageWrapperRight: {
    marginLeft: -20,
    zIndex: 1,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: Colors.bgtext,
    marginTop: -70,
  },
  matchTitle: {
    fontSize: 30,
    color: Colors.white,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  matchText: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    lineHeight: 26,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.bgtext,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.white,
    fontWeight: 'bold',
  },
});
