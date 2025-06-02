import React from 'react';
import DiscoveryScreen from './DiscoveryScreen';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SearchStudents(props) {
    const renderTabs = (active) => (
        <View style={styles.tabs}>
            <TouchableOpacity testID="tab-studentai" onPress={() => props.navigation.navigate('SearchStudents')}>
                <Text style={[styles.tab, active==='SearchStudents' && styles.active]}>Studentai</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => props.navigation.navigate('Roommates')}>
                <Text style={styles.tab}>Kambariokai</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="tab-zemelapis" onPress={() => props.navigation.navigate('Map')}>
                <Text style={styles.tab}>Žemėlapis</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <DiscoveryScreen
            {...props}
            searchType="bendraminciu"
            renderTabs={renderTabs}
            activeTabKey="SearchStudents"
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
