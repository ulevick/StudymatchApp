// components/Footer.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/colors';   // jei norite, galite visai nebenaudoti

/* ← ČIA nustatote bendrą spalvą visiems „užpildytiems“ (active) iconams */
const ACTIVE_ICON_COLOR = '#707F87';        // pvz. raudona

const Footer = ({ activeTab = 'Profile', onTabPress }) => {
  const tabs = [
    {
      keys: ['SearchStudents', 'Roommates', 'Map'],
      primary: 'SearchStudents',
      outlineIcon: 'heart-outline',
      filledIcon : 'heart',
    },
    {
      keys: ['Messages'],
      primary: 'Messages',
      outlineIcon: 'chatbubble-ellipses-outline',
      filledIcon : 'chatbubble-ellipses',
    },
    {
      keys: ['Profile'],
      primary: 'Profile',
      outlineIcon: 'person-outline',
      filledIcon : 'person',
    },
    {
      keys: ['Settings'],
      primary: 'Settings',
      outlineIcon: 'settings-outline',
      filledIcon : 'settings',
    },
  ];

  const lowerActive = activeTab.toLowerCase();

  return (
      <View style={styles.footer}>
        {tabs.map(({ keys, primary, outlineIcon, filledIcon }) => {
          const isActive  = keys.some((k) => k.toLowerCase() === lowerActive);
          const iconName  = isActive ? filledIcon : outlineIcon;
          const iconColor = isActive ? ACTIVE_ICON_COLOR : '#8E9498';

          return (
              <TouchableOpacity key={primary} testID={`footer-${primary.toLowerCase()}`} onPress={() => onTabPress(primary)}>
                <Ionicons name={iconName} size={26} color={iconColor} />
              </TouchableOpacity>
          );
        })}
      </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  footer: {
    zIndex: 999,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
