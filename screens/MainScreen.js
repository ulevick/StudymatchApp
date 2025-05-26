import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import global from '../styles/global';
import authStyles from '../styles/authStyles';
import PeopleBackground from '../components/PeopleBackground';

const MainScreen = ({ navigation }) => {
  return (
    <View style={authStyles.container}>
      <PeopleBackground />
      <Image
        testID="hat-image"
        source={require('../assets/images/hat.png')}
        style={authStyles.hatIcon} />

      <Text style={authStyles.title}>
        Study
        <Text style={global.titleMatch}>match</Text>
      </Text>

      <Text style={authStyles.subtitle}>
        Pradėk studijas su naujomis pažintimis – rask draugų, kambariokų ir bendrystę nuo pirmos dienos!
      </Text>

      <TouchableOpacity
          testID="main-btn-login"
        style={global.loginButton}
        onPress={() => navigation.navigate('SignIn')}>
        <Text style={global.loginText}>Prisijungti</Text>
      </TouchableOpacity>

      <View style={authStyles.orContainer}>
        <View style={authStyles.line} />
        <Text style={authStyles.orText}>Arba</Text>
        <View style={authStyles.line} />
      </View>

      <TouchableOpacity
          testID="main-btn-register"
          style={global.registerButton}
        onPress={() => navigation.navigate('Reg_Stud1')}>
        <Text style={global.registerText}>Registruotis</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MainScreen;
