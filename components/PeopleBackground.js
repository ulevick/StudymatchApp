// components/PeopleBackground.js
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const PeopleBackground = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/people.png')}
        style={styles.bgPeople}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  bgPeople: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

export default PeopleBackground;
