// components/BackgroundReg1_2.js
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BackgroundReg1_2 = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/bg-path.png')}
        style={styles.backgroundImage}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default BackgroundReg1_2;
