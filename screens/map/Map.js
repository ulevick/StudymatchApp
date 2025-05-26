import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/mapStyles';
import { spotData } from '../../constants/spotData';
import mapStyleClean from '../../constants/mapStyleClean';
import { GOOGLE_PLACES_API_KEY } from '@env';

const categories = [
    { key: 'quiet',     label: 'Tylos / poilsio zonos',     icon: 'sofa',    color: '#6FCF97' },
    { key: 'printers',  label: 'Spausdintuvai',             icon: 'printer', color: '#2F80ED' },
    { key: 'food',      label: 'Pigūs pietūs / Mikrobangės', icon: 'food',    color: '#F2994A' },
    { key: 'transport', label: 'Dviračių stovai',           icon: 'bike',    color: '#9B51E0' },
];

const { width } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
    const [activeCat, setActiveCat]       = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const mapRef   = useRef(null);
    const sheetRef = useRef(null);
    const snapPoints = useMemo(() => ['44%'], []);
    const spots = useMemo(
        () => activeCat
            ? spotData.filter(s => s.category === activeCat)
            : spotData,
        [activeCat]
    );

    const handleMarkerPress = useCallback(spot => {
        setSelectedSpot(spot);
        requestAnimationFrame(() => sheetRef.current?.present());
    }, []);

    return (
        <View style={styles.container}>
            <Header onFilterPress={() => navigation.navigate('Filter')} />

            <View style={styles.topTabs}>
                <TouchableOpacity onPress={() => navigation.navigate('SearchStudents')}>
                    <Text style={styles.tabText}>Studentai</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Roommates')}>
                    <Text style={styles.tabText}>Kambariokai</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Map')}>
                    <Text style={[styles.tabText, styles.activeTab]}>Žemėlapis</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mapBlock}>
                {/* --- AUTOCOMPLETE --- */}
                <GooglePlacesAutocomplete
                    placeholder="Ieškoti adreso…"
                    fetchDetails
                    GooglePlacesDetailsQuery={{ fields: ['geometry'] }}
                    predefinedPlaces={[]}
                    enablePoweredByContainer={false}
                    keyboardShouldPersistTaps="always"

                    textInputProps={{
                        placeholderTextColor: '#666',
                        testID: 'gpa-input',
                    }}

                    onPress={async (data, details = null) => {
                        console.log('AUTOCOMPLETE PRESS ➞', { data, details });
                        let loc = details?.geometry?.location;
                        if (!loc) {
                            try {
                                const res = await fetch(
                                    `https://maps.googleapis.com/maps/api/place/details/json` +
                                    `?place_id=${data.place_id}` +
                                    `&fields=geometry` +
                                    `&key=${GOOGLE_PLACES_API_KEY}`
                                );
                                const json = await res.json();
                                loc = json.result?.geometry?.location;
                                if (!loc) throw new Error('no geometry in fallback');
                            } catch(err) {
                                console.warn('Fallback details error:', err);
                                return;
                            }
                        }
                        mapRef.current?.animateToRegion(
                            { latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
                            400
                        );
                    }}

                    query={{
                        key: GOOGLE_PLACES_API_KEY,
                        language: 'lt',
                    }}
                    timeout={20000}
                    minLength={1}
                    debounce={200}
                    onFail={err => console.warn('Places error:', err)}
                    onNotFound={() => console.warn('No results')}
                    styles={{
                        ...gpaStyles,
                        listView: {
                            position: 'absolute',
                            top: 44,
                            zIndex: 30,
                            backgroundColor: '#fff',
                        },
                    }}
                    renderLeftButton={() => (
                        <View style={gpaStyles.leftIconWrap} pointerEvents="none">
                            <Icon name="magnify" size={20} color="#666" />
                        </View>
                    )}
                />

                {/* --- FILTER CHIPS --- */}
                <View style={[styles.chipColumn, { pointerEvents: 'box-none' }]}>
                    {categories.map(c => (
                        <TouchableOpacity
                            key={c.key}
                            style={[
                                styles.chip,
                                {
                                    borderColor: c.color,
                                    backgroundColor: activeCat === c.key ? c.color : '#fff',
                                },
                            ]}
                            onPress={() => setActiveCat(activeCat === c.key ? null : c.key)}
                        >
                            <Icon name={c.icon} size={14} color={activeCat === c.key ? '#fff' : c.color} />
                            <Text style={[
                                styles.chipLabel,
                                { color: activeCat === c.key ? '#fff' : '#333' }
                            ]}>
                                {c.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- MAP --- */}
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                        latitude: 54.7226,
                        longitude: 25.337,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    customMapStyle={mapStyleClean}
                    showsPointsOfInterest={false}
                    showsBuildings={false}
                >
                    {spots.map((s, idx) => (
                        <Marker
                            key={`${s.category}-${idx}`}
                            coordinate={s.coords}
                            onPress={() => handleMarkerPress(s)}
                            tracksViewChanges={false}
                        >
                            <View style={styles.markerIconWrap}>
                                <Icon
                                    name={categories.find(c => c.key === s.category)?.icon}
                                    size={20}
                                    color={categories.find(c => c.key === s.category)?.color}
                                />
                            </View>
                        </Marker>
                    ))}
                </MapView>

                {!activeCat && spots.length > 0 && (
                    <View testID="map-loaded" style={{ width: 1, height: 1, opacity: 0 }} />
                )}
            </View>

            {/* --- BOTTOM SHEET --- */}
            <BottomSheetModal
                ref={sheetRef}
                snapPoints={snapPoints}
                backdropComponent={props => (
                    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
                )}
                android_keyboardInputMode="adjustResize"
            >
                <BottomSheetView style={styles.sheetContent}>
                    {selectedSpot && (
                        <>
                            <View style={styles.spotTopRow}>
                                <View style={styles.roundIcon}>
                                    <Icon
                                        name={categories.find(c => c.key === selectedSpot.category)?.icon}
                                        size={20}
                                        color={categories.find(c => c.key === selectedSpot.category)?.color}
                                    />
                                </View>
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
                                    {selectedSpot.description && (
                                        <Text style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
                                            {selectedSpot.description}
                                        </Text>
                                    )}
                                    <View style={styles.infoLine}>
                                        <Icon name="map-marker" color="#EB5757" size={14} />
                                        <Text style={{ marginLeft: 4 }}>{selectedSpot.address}</Text>
                                    </View>
                                    {selectedSpot.price && (
                                        <View style={styles.infoLine}>
                                            <Icon name="currency-eur" color="#F2C94C" size={14} />
                                            <Text style={{ marginLeft: 4 }}>{selectedSpot.price}</Text>
                                        </View>
                                    )}
                                    {selectedSpot.hours && (
                                        <View style={styles.infoLine}>
                                            <Icon name="clock" color="#2D9CDB" size={14} />
                                            <Text style={{ marginLeft: 4 }}>{selectedSpot.hours}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.ctaBtn}
                                onPress={() => {
                                    const { latitude, longitude } = selectedSpot.coords;
                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
                                    Linking.openURL(url);
                                }}
                            >
                                <Text style={styles.ctaTxt}>Pradėti</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </BottomSheetView>
            </BottomSheetModal>

            <Footer activeTab="Map" onTabPress={tab => navigation.navigate(tab)} />
        </View>
    );
}

const gpaStyles = {
    container: {
        position: 'absolute',
        top: 20,
        width: width - 40,
        alignSelf: 'center',
        zIndex: 20,
    },
    textInput: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        paddingLeft: 44, // vieta ikonai
        paddingRight: 12,
        fontSize: 14,
        color: '#333',
    },
    textInputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    leftIconWrap: {
        position: 'absolute',
        left: 14,
        top: -1,
        bottom: 0,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
};
