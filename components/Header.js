import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';
import global from '../styles/global';

const Header = ({ onFilterPress }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Study
        <Text style={global.titleMatch}>match</Text>
      </Text>
      <TouchableOpacity onPress={onFilterPress}>
        <Ionicons name="options-outline" size={22} color={Colors.bgtext} />
      </TouchableOpacity>
    </View>
  );
};


export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  titleMatch:{
    color: Colors.titleMatch,
  },
  logo: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: Colors.bgtext,
  },
});
