// components/BackgroundReg3_10.js
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BackgroundPath = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/bg-path2.png')}
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

export default BackgroundPath;
