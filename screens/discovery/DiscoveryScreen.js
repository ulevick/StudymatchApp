// screens/DiscoveryScreen.js

import React, {
    useState,
    useCallback,
    useEffect,
    useRef,
    useContext,
} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import FastImage from 'react-native-fast-image';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    doc,
    setDoc,
    getDoc,
    addDoc,
    serverTimestamp,
} from '@react-native-firebase/firestore';

import { db, authInstance } from '../../services/firebase';
import { UserContext } from '../../contexts/UserContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SwipeableCard from '../../components/SwipeableCard';
import MatchModal from '../../components/MatchModal';
import { getDistanceKm } from '../../utils/getDistanceKm';
import { computeScore, calculateAge } from '../../utils/compatibility';
import applyUserFilter from '../../utils/applyUserFilter';

const PAGE = 20;
const PREFETCH = 2;
const HEADER_H = 60;
const TABS_H = 48;
const FOOTER_H = 60;

export default function DiscoveryScreen({
                                            navigation,
                                            searchType,
                                            renderTabs,
                                            extraFilter = () => true,   // papildomas filtras (naudojamas tik Roommates)
                                            activeTabKey,
                                        }) {
    const { userData } = useContext(UserContext);
    const userId = authInstance.currentUser?.uid;

    const [items, setItems] = useState([]);
    const [lastDoc, setLastDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [cardIndex, setCardIndex] = useState(0);

    const [matchedUser, setMatchedUser] = useState(null);
    const [showMatch, setShowMatch] = useState(false);

    const swiperRef = useRef(null);

    const makeQuery = useCallback(() => {
        let q = query(
            collection(db, 'users'),
            where('searchTypes', 'array-contains', searchType),
            orderBy('createdAt', 'desc'),
            limit(PAGE),
        );
        if (lastDoc) q = query(q, startAfter(lastDoc));
        return q;
    }, [searchType, lastDoc]);

    const preload = useCallback((from) => {
        FastImage.preload(
            items.slice(from, from + PREFETCH).map(s => ({ uri: s.photos?.[0] })),
        );
    }, [items]);

    const fetchPage = useCallback(async (initial = false) => {
        if (initial) {
            setLoading(true);
            setLastDoc(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const snap = await getDocs(makeQuery());
            if (snap.empty) return;

            const meLoc = userData?.location;
            const filters = userData?.filter;
            const list = [];

            snap.forEach(d => {
                if (d.id === userId) return;
                const data = { id: d.id, ...d.data() };

                // Apskaičiuojam atstumą
                if (meLoc && data.location) {
                    data.distanceKm = getDistanceKm(
                        meLoc.latitude,
                        meLoc.longitude,
                        data.location.latitude,
                        data.location.longitude
                    );
                }

                // Suderinamumo balas
                data.score = computeScore(data, userData, filters);

                // Taikomi filtrai
                if (
                    applyUserFilter(data, filters, meLoc) &&
                    extraFilter(data, filters, meLoc)
                ) {
                    list.push(data);
                }
            });

            // Jei filtras nenaudojamas – rikiuoti pagal suderinamumą
            if (
                !filters?.filterPreferences?.length &&
                !filters?.filterAge &&
                !filters?.filterDistance
            ) {
                list.sort((a, b) => b.score - a.score); // didėjimo tvarka pagal score
            }

            setItems(prev => (initial ? list : [...prev, ...list]));
            setLastDoc(snap.docs[snap.docs.length - 1]);
            preload(initial ? 0 : items.length);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [makeQuery, userData, userId, extraFilter, preload, items.length]);


    // Pirmas fetch
    useEffect(() => {
        if (userId) fetchPage(true);
    }, [userId]);

    // Kai pasikeičia filtras – perpildom
    useEffect(() => {
        if (userId) {
            setCardIndex(0);
            fetchPage(true);
        }
    }, [userData.filter]);

    const writeSwipe = (uid, status) =>
        setDoc(doc(db, 'swipes', `${userId}_${uid}`), {
            from: userId, to: uid, status, createdAt: serverTimestamp(),
        });

    const like = async (stu) => {
        writeSwipe(stu.id, 'like');
        const rev = await getDoc(doc(db, 'swipes', `${stu.id}_${userId}`));
        if (rev.exists && rev.data()?.status === 'like') {
            await addDoc(collection(db, 'matches'), {
                user1: userId, user2: stu.id, matchedAt: serverTimestamp(),
            });
            setMatchedUser({ id: stu.id, name: stu.name, photoURL: stu.photos?.[0] });
            setShowMatch(true);
        }
    };
    const pass = (stu) => writeSwipe(stu.id, 'pass');

    const onSwiped = () => {
        const next = cardIndex + 1;
        setCardIndex(next);
        preload(next);
        if (items.length - next < 5 && !loadingMore) fetchPage();
    };

    const renderCard = (stu, i) => (
        <SwipeableCard
            testID={`swipe_card_${i}`}
            key={stu.id}
            student={stu}
            calculateAge={calculateAge}
            FastImage={FastImage}
            onReject={() => pass(stu)}
            onLike={() => like(stu)}
            onMessage={() => Alert.alert('Pradėti pokalbį', `Chat su ${stu.name}`)}
        />
    );

    return (
        <View style={styles.container}>
            <Header onFilterPress={() => navigation.navigate('Filter')} />

            {renderTabs(activeTabKey)}

            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} size="large" color="#1da1f2" />
            ) : items.length === 0 || cardIndex >= items.length ? (
                <View style={styles.noMoreContainer}>
                    <Text style={styles.noMoreTitle}>Nėra daugiau studentų</Text>
                    <Text style={styles.noMoreDescription}>
                        {items.length === 0
                            ? (userData?.filter?.filterPreferences?.length ||
                                userData?.filter?.filterAge ||
                                userData?.filter?.filterDistance)
                                ? 'Pagal pasirinktus filtrus nerasta atitinkančių studentų.'
                                : 'Šiuo metu nėra studentų, kuriuos galėtumėte peržiūrėti.'
                            : 'Peržiūrėjote visus studentus. Patikrinkite vėliau arba pakoreguokite filtrus, kad rastumėte daugiau.'}
                    </Text>
                </View>
            ) : (

                <View style={styles.swiperArea}>
                    <Swiper
                        testID="deck-swiper"
                        ref={swiperRef}
                        cards={items}
                        renderCard={renderCard}
                        onSwiped={onSwiped}
                        onSwipedLeft ={i => pass(items[i])}
                        onSwipedRight={i => like(items[i])}
                        stackSize={2}
                        backgroundColor="transparent"
                        containerStyle={styles.swiperContainer}
                        cardStyle={styles.swiperCard}
                        cardHorizontalMargin={0}
                        cardVerticalMargin={0}
                        disableBottomSwipe
                        disableTopSwipe
                        verticalSwipe={false}
                        cardIndex={cardIndex}
                    />
                </View>
            )}

            {loadingMore && (
                <ActivityIndicator
                    style={{position:'absolute',bottom:FOOTER_H+20,alignSelf:'center'}}
                />
            )}

            <Footer activeTab={activeTabKey} onTabPress={r => navigation.navigate(r)} />

            <MatchModal
                visible={showMatch}
                onClose={() => setShowMatch(false)}
                matchedUser={matchedUser}
                currentUser={{ name:userData?.name, photoURL:userData?.photos?.[0] }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container:{ flex:1, backgroundColor:'transparent' },
    noMore:{
        flex:1, textAlign:'center', textAlignVertical:'center',
        fontFamily:'Poppins-Regular', color:'#888',
    },
    swiperArea:{
        flex:1, paddingTop:HEADER_H + TABS_H, paddingBottom:FOOTER_H,
    },
    swiperContainer:{ flex:1, backgroundColor:'transparent' },
    swiperCard:{ width:'100%', height:'100%', backgroundColor:'transparent' },
    noMoreContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    noMoreTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#555',
        marginBottom: 8,
        textAlign: 'center',
    },
    noMoreDescription: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
    },

});
