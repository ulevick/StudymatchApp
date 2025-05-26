import React from 'react';
import DiscoveryScreen from './DiscoveryScreen';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { preferencesData } from '../../constants/preferencesData';
import { calculateAge }    from '../../utils/compatibility';

const matchesExtra = (stu, filter/*, meLoc*/) => {
  if (!filter) return true;

  /* visi kambariokų-specifiniai apribojimai */
  if (filter.filterGender && stu.gender !== filter.filterGender) return false;
  const age = calculateAge(stu.birthday);
  if (filter.filterAgeMin && age < filter.filterAgeMin) return false;
  if (filter.filterAgeMax && age > filter.filterAgeMax) return false;
  if (filter.filterUniversity && stu.university !== filter.filterUniversity) return false;
  if (filter.filterLevel && stu.studyLevel !== filter.filterLevel) return false;
  if (filter.filterFaculty && stu.faculty !== filter.filterFaculty) return false;
  if (filter.filterCourse && stu.course !== filter.filterCourse) return false;

  /* preferences */
  if (filter.filterPreferences?.length) {
    const sel = filter.filterPreferences;
    const stuPrefs = stu.preferences || {};
    const grouped = preferencesData.reduce((acc,g)=>{
      const picks = g.items.filter(i=>sel.includes(i));
      if (picks.length) acc[g.title]=picks;
      return acc;
    },{});
    for (const [cat,need] of Object.entries(grouped)){
      if (!need.includes(stuPrefs[cat])) return false;
    }
  }
  /* distance patikrinamas jau bazinėje dalyje DiscoveryScreen */

  return true;
};

export default function Roommates(props) {
  const renderTabs = (active) => (
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => props.navigation.navigate('SearchStudents')}>
          <Text style={styles.tab}>Studentai</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.navigation.navigate('Roommates')}>
          <Text style={[styles.tab, active==='Roommates' && styles.active]}>Kambariokai</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => props.navigation.navigate('Map')}>
          <Text style={styles.tab}>Žemėlapis</Text>
        </TouchableOpacity>
      </View>
  );

  return (
      <DiscoveryScreen
          {...props}
          searchType="kambarioko"
          renderTabs={renderTabs}
          activeTabKey="Roommates"
          extraFilter={matchesExtra}
      />
  );
}

const styles = StyleSheet.create({
  tabs:{
    flexDirection:'row',justifyContent:'space-around',
    height:48,backgroundColor:'#fff',alignItems:'center',
  },
  tab:{ fontFamily:'Poppins-Regular',fontSize:14,color:'#aaa' },
  active:{ color:'#1da1f2',fontFamily:'Poppins-Bold' },
});
