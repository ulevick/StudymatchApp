import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Linking,
    Dimensions,
    StyleSheet,
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
    { key: 'quiet',    label: 'Tylos / poilsio zonos', icon: 'library', color: '#6FCF97' },
    { key: 'printers', label: 'Spausdintuvai',         icon: 'printer', color: '#2F80ED' },
    { key: 'food',     label: 'Mikrobangės',            icon: 'microwave', color: '#F2994A' },
    { key: 'transport',label: 'Dviračių stovai',        icon: 'bike', color: '#9B51E0' },
];

const buildingLabels = [
    { label: 'S1', coords: { latitude: 54.722396902459174, longitude: 25.337882535789632 } },
    { label: 'S2', coords: { latitude: 54.722036702976446, longitude: 25.336715746434688 } },
    { label: 'S3', coords: { latitude: 54.72233258577234, longitude: 25.33591584031863 } },
    { label: 'S4', coords: { latitude: 54.72124219706608, longitude: 25.337247789750943 } },
    { label: 'S5', coords: { latitude: 54.721493319546596, longitude: 25.3375683827278} },
    { label: 'S6', coords: { latitude: 54.721363006315926, longitude: 25.336323309110583 } },
    { label: 'S7', coords: { latitude: 54.72117181783911, longitude: 25.335403309146834 } },
];

const { width } = Dimensions.get('window');
const ZOOM_THRESHOLD = 0.004; // adjust as needed

export default function MapScreen({ navigation }) {
    const [activeCat, setActiveCat]       = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [region, setRegion] = useState({
        latitude: 54.7226,
        longitude: 25.337,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
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
                                if (!loc) throw new Error('no geometry');
                            } catch { return; }
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
                    initialRegion={region}
                    onRegionChangeComplete={r => setRegion(r)}
                    customMapStyle={mapStyleClean}
                    showsPointsOfInterest={false}
                    showsBuildings={true}
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

                    {region.latitudeDelta <= ZOOM_THRESHOLD && buildingLabels.map(({ label, coords }, idx) => (
                        <Marker
                            key={`label-${label}-${idx}`}
                            coordinate={coords}
                            anchor={{ x: 0.5, y: 1 }}
                            tracksViewChanges={false}
                        >
                            <View style={localStyles.buildingLabel}>
                                <Text style={localStyles.buildingLabelText}>{label}</Text>
                                <View style={localStyles.buildingArrow} />
                            </View>
                        </Marker>
                    ))}

                </MapView>

                {!activeCat && spots.length > 0 && (
                    <View testID="map-loaded" style={{ width: 1, height: 1, opacity: 0 }} />
                )}
            </View>

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
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
                                    {selectedSpot.description && (
                                        <Text style={{
                                            marginTop: 6,
                                            fontSize: 13,
                                            color: '#666',
                                            flexShrink: 1,
                                            flexWrap: 'wrap',
                                            maxWidth: '100%',
                                        }}>
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

const localStyles = StyleSheet.create({
    buildingLabel: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buildingLabelText: {
        fontWeight: '600',
        fontSize: 15,
        color: '#333',
    },
    buildingArrow: {
        position: 'absolute',
        bottom: -6,
        left: '50%',
        marginLeft: -6,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(255,255,255,0.9)',
    },
});

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
        paddingLeft: 44,
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
