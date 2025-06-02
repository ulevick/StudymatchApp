import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PeopleBackground from '../../components/PeopleBackground';
import registration from '../../styles/registration';

const Reg_EmailSuccess = ({ route, navigation }) => {
  const { mode } = route.params;

  const message = mode === 'change'
    ? 'Tavo el. paštas buvo sėkmingai pakeistas!'
    : 'Tavo el. paštas buvo sėkmingai patvirtintas!';

  return (
    <View style={registration.containerStu10}>
      <PeopleBackground />
      <View style={registration.inner}>
        <Text style={registration.bigTitle}>{message}</Text>

        <TouchableOpacity
          style={registration.loginButtonStud10}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={registration.loginButtonText}>Grįžti į nustatymus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Reg_EmailSuccess;
