import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../screens/MainScreen';
import Reg_Stud1 from '../screens/register/Reg_Stud1';
import Reg_Stud2 from '../screens/register/Reg_Stud2';
import Reg_Stud3 from '../screens/register/Reg_Stud3';
import Reg_Stud4 from '../screens/register/Reg_Stud4';
import Reg_Stud5 from '../screens/register/Reg_Stud5';
import Reg_Stud6 from '../screens/register/Reg_Stud6';
import Reg_Stud7 from '../screens/register/Reg_Stud7';
import Reg_Stud8 from '../screens/register/Reg_Stud8';
import Reg_Stud9 from '../screens/register/Reg_Stud9';
import Reg_Stud10 from '../screens/register/Reg_Stud10';
import Reg_StudFinal from '../screens/register/Reg_StudFinal';
import Profile from '../screens/profile/Profile';
import Settings from '../screens/profile/Settings';
import SignIn from '../screens/register/SignIn';
import EditProfile from '../screens/profile/EditProfile';
import SearchStudents from '../screens/discovery/SearchStudents';
import Filter from '../screens/discovery/Filter';
import Messages from '../screens/messages/Messages';
import WriteMessages from '../screens/messages/WriteMessages';
import Map from '../screens/map/Map';
import Reg_EmailSuccess from '../screens/register/Reg_EmailSuccess';
import Roommates from '../screens/discovery/Roommates';
import LikesScreen from '../screens/messages/LikesScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}>
    <Stack.Screen name="Main" component={MainScreen} />
    <Stack.Screen name="Reg_Stud1" component={Reg_Stud1} />
    <Stack.Screen name="Reg_Stud2" component={Reg_Stud2} />
    <Stack.Screen name="Reg_Stud3" component={Reg_Stud3} />
    <Stack.Screen name="Reg_Stud4" component={Reg_Stud4} />
    <Stack.Screen name="Reg_Stud5" component={Reg_Stud5} />
    <Stack.Screen name="Reg_Stud6" component={Reg_Stud6} />
    <Stack.Screen name="Reg_Stud7" component={Reg_Stud7} />
    <Stack.Screen name="Reg_Stud8" component={Reg_Stud8} />
    <Stack.Screen name="Reg_Stud9" component={Reg_Stud9} />
    <Stack.Screen name="Reg_Stud10" component={Reg_Stud10} />
    <Stack.Screen name="Reg_StudFinal" component={Reg_StudFinal} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Settings" component={Settings} />
    <Stack.Screen name="SignIn" component={SignIn} />
    <Stack.Screen name="EditProfile" component={EditProfile} />
    <Stack.Screen name="SearchStudents" component={SearchStudents} />
    <Stack.Screen name="Filter" component={Filter} />
    <Stack.Screen name="Messages" component={Messages} />
    <Stack.Screen name="WriteMessages" component={WriteMessages} />
    <Stack.Screen name="Map" component={Map} />
    <Stack.Screen name="Reg_EmailSuccess" component={Reg_EmailSuccess} />
    <Stack.Screen name="Roommates" component={Roommates} />
      <Stack.Screen name="LikesScreen" component={LikesScreen} />
  </Stack.Navigator>
);

export default AppNavigator;
