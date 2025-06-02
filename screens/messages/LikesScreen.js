import React, { useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import filterStyles   from '../../styles/filterStyles';
import Colors         from '../../constants/colors';
import { calculateAge }  from '../../utils/compatibility';
import { getDistanceKm } from '../../utils/getDistanceKm';

const Tag = ({ type }) => (
    <View
        style={[
            likesStyles.tagBox,
            { backgroundColor: type === 'kambarioko'
                    ? Colors.lightyellow
                    : Colors.lightblue },
        ]}
    >
        <Image
            source={
                type === 'kambarioko'
                    ? require('../../assets/images/kambariokuicon.png')
                    : require('../../assets/images/bendraminciuicon.png')
            }
            style={likesStyles.tagIcon}
        />
    </View>
);

export default function LikesScreen({ route, navigation }) {
    const { pendingLikes = [], myLocation } = route.params || {};

    const enriched = useMemo(
        () =>
            pendingLikes.map((u) => {
                const age  = u.birthday && calculateAge(u.birthday);
                const dist =
                    myLocation && u.location
                        ? getDistanceKm(
                            myLocation.latitude,
                            myLocation.longitude,
                            u.location.latitude,
                            u.location.longitude,
                        ).toFixed(0)
                        : null;
                return { ...u, age, dist };
            }),
        [pendingLikes, myLocation],
    );

    const renderItem = ({ item }) => (
        <View style={likesStyles.card}>
            <Image source={{ uri: item.avatar }} style={likesStyles.photo} />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.78)']}
                style={likesStyles.overlay}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Text style={likesStyles.name}>
                        {item.name}
                        {item.age ? `, ${item.age}` : ''}
                    </Text>
                    {item.searchTypes?.includes('kambarioko')   && <Tag type="kambarioko" />}
                    {item.searchTypes?.includes('bendraminciu') && <Tag type="bendraminciu" />}
                </View>

                {(item.university || item.dist) && (
                    <Text style={likesStyles.sub}>
                        {item.university}
                        {item.university && item.dist ? ' · ' : ''}
                        {item.dist ? `${item.dist} km` : ''}
                    </Text>
                )}
            </LinearGradient>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <View style={filterStyles.topHeader}>
                <TouchableOpacity
                    testID="back-button"
                    onPress={() => navigation.goBack()}
                    style={filterStyles.backButton}
                >
                    <Ionicons name="arrow-back" size={28} color="#89A1B4" />
                </TouchableOpacity>
                <Text style={filterStyles.topHeaderTitle}>Likes</Text>
            </View>

            <FlatList
                data={enriched}
                keyExtractor={(u) => u.uid}
                numColumns={2}
                contentContainerStyle={likesStyles.list}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const { width } = Dimensions.get('window');
const GAP  = 16;
const CARD = (width - GAP * 3) / 2;

const likesStyles = StyleSheet.create({
    list: { padding: GAP },

    card: {
        width: CARD,
        height: CARD * 1.35,
        borderRadius: 14,
        marginBottom: GAP,
        overflow: 'hidden',
        backgroundColor: '#ccc',
    },

    photo: { width: '100%', height: '100%' },

    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'column',
    },

    name: {
        color: '#fff',
        fontFamily: 'Poppins-Bold',
        fontSize: 15,
    },
    sub: {
        color: '#fff',
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        marginTop: 1,
    },

    tagBox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    },
    tagIcon: { width: 15, height: 15, resizeMode: 'contain' },
});
