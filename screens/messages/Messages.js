// screens/Messages.js
import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    getDocs,
    deleteDoc,
    writeBatch,
} from '@react-native-firebase/firestore';

import { db, authInstance } from '../../services/firebase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Colors from '../../constants/colors';
import { UserContext } from '../../contexts/UserContext';
import styles from '../../styles/messageStyles';
import CustomAlert from '../../components/CustomAlert';

/* ---------- Pagalbiniai ---------- */
const SkeletonBox = ({ width, height, borderRadius = 8, style }) => (
    <View
        style={[
            {
                width,
                height,
                borderRadius,
                backgroundColor: '#E0E0E0',
                marginBottom: 8,
            },
            style,
        ]}
    />
);
const hasType = (obj, t) =>
    Array.isArray(obj?.searchTypes) && obj.searchTypes.includes(t);

const Tag = ({ type }) => (
    <View
        style={[
            styles.tagBox,
            {
                backgroundColor:
                    type === 'kambarioko'
                        ? Colors.lightyellow || '#FFF3C4'
                        : Colors.lightblue || '#DAF0FF',
            },
        ]}>
        <Image
            source={
                type === 'kambarioko'
                    ? require('../../assets/images/kambariokuicon.png')
                    : require('../../assets/images/bendraminciuicon.png')
            }
            style={styles.tagIcon}
        />
    </View>
);

/* ---------- Komponentas ---------- */
export default function Messages({ navigation }) {
    const { userData } = useContext(UserContext);
    const userId = authInstance.currentUser?.uid;

    const [loadingLikes, setLoadingLikes] = useState(true);
    const [loadingMatches, setLoadingMatches] = useState(true);
    const [loadingChats, setLoadingChats] = useState(true);

    const [likedByUsers, setLikedByUsers] = useState([]); // pending likes
    const [matches, setMatches] = useState([]); // nauji match’ai
    const [conversations, setConversations] = useState([]); // chat’ai

    /* --- būsena gražiam dialogui --- */
    const [alertVisible, setAlertVisible] = useState(false);
    const [pendingDelete, setPendingDelete] = useState({
        chatId: null,
        otherUid: null,
        otherName: '',
    });

    useEffect(() => {
        if (!userId) return;

        let unsubscribeChats = () => {};

        const fetchEverything = async () => {
            setLoadingLikes(true);
            setLoadingMatches(true);
            setLoadingChats(true);

            /* ---------- PENDING LIKES ---------- */
            const likesPromise = (async () => {
                try {
                    /* like'ai į mane + mano like'ai (tik status='like') */
                    const [toMeSnap, fromMeSnap] = await Promise.all([
                        getDocs(
                            query(
                                collection(db, 'swipes'),
                                where('to', '==', userId),
                                where('status', '==', 'like')
                            )
                        ),
                        getDocs(
                            query(
                                collection(db, 'swipes'),
                                where('from', '==', userId),
                                where('status', '==', 'like')
                            )
                        ),
                    ]);

                    const likedBy = toMeSnap.docs.map((d) => d.data().from);
                    const myLikes = new Set(
                        fromMeSnap.docs.map((d) => d.data().to)
                    );

                    /* atmetame jau esamus match’us */
                    const [m1, m2] = await Promise.all([
                        getDocs(
                            query(
                                collection(db, 'matches'),
                                where('user1', '==', userId)
                            )
                        ),
                        getDocs(
                            query(
                                collection(db, 'matches'),
                                where('user2', '==', userId)
                            )
                        ),
                    ]);
                    const matchedUIDs = new Set([
                        ...m1.docs.map((d) => d.data().user2),
                        ...m2.docs.map((d) => d.data().user1),
                    ]);

                    const pendingUIDs = likedBy.filter(
                        (u) => !myLikes.has(u) && !matchedUIDs.has(u)
                    );
                    if (!pendingUIDs.length) return [];

                    const usrSnap = await getDocs(
                        query(
                            collection(db, 'users'),
                            where('__name__', 'in', pendingUIDs.slice(0, 10))
                        )
                    );

                    return usrSnap.docs.map((d) => ({
                        uid: d.id,
                        name: d.data().name,
                        avatar: d.data().photos?.[0] || '',
                        searchTypes: d.data().searchTypes || [],
                        birthday: d.data().birthday || null,
                        university: d.data().university || '',
                        studyLevel: d.data().studyLevel || '',
                        faculty: d.data().faculty || '',
                        course: d.data().course || '',
                        location: d.data().location || null,
                    }));
                } catch (err) {
                    console.error('likes err:', err);
                    return [];
                }
            })();

            /* ---------- MATCH’AI ---------- */
            const matchesPromise = (async () => {
                try {
                    const q1 = query(
                        collection(db, 'matches'),
                        where('user1', '==', userId)
                    );
                    const q2 = query(
                        collection(db, 'matches'),
                        where('user2', '==', userId)
                    );

                    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
                    const docs = [...s1.docs, ...s2.docs];

                    const otherUIDs = docs.map((d) =>
                        d.data().user1 === userId
                            ? d.data().user2
                            : d.data().user1
                    );
                    if (!otherUIDs.length) return [];

                    const usrSnap = await getDocs(
                        query(
                            collection(db, 'users'),
                            where('__name__', 'in', otherUIDs.slice(0, 10))
                        )
                    );
                    const uMap = {};
                    usrSnap.forEach((d) => (uMap[d.id] = d.data()));

                    return docs.map((d) => {
                        const otherUid =
                            d.data().user1 === userId
                                ? d.data().user2
                                : d.data().user1;
                        const info = uMap[otherUid] || {};
                        return {
                            id: d.id,
                            otherUid,
                            otherName: info.name || 'Nežinomas',
                            otherAvatar: info.photos?.[0] || '',
                            searchTypes: info.searchTypes || [],
                        };
                    });
                } catch (err) {
                    console.error('match err:', err);
                    return [];
                }
            })();

            /* ---------- POKALBIAI ---------- */
            const listenChats = () => {
                const q = query(
                    collection(db, 'chats'),
                    where('participants', 'array-contains', userId)
                );

                unsubscribeChats = onSnapshot(
                    q,
                    async (snap) => {
                        try {
                            const docs = snap?.docs || [];
                            if (!docs.length) {
                                setConversations([]);
                                setLoadingChats(false);
                                return;
                            }

                            const meta = docs.map((d) => ({ id: d.id, ...d.data() }));
                            const otherUIDs = meta.map((c) =>
                                c.participants.find((p) => p !== userId)
                            );

                            const usrSnap = otherUIDs.length
                                ? await getDocs(
                                    query(
                                        collection(db, 'users'),
                                        where(
                                            '__name__',
                                            'in',
                                            otherUIDs.slice(0, 10)
                                        )
                                    )
                                )
                                : { docs: [] };

                            const uMap = {};
                            usrSnap.forEach((d) => (uMap[d.id] = d.data()));
                            meta.sort(
                                (a, b) =>
                                    (b.updatedAt?.toMillis?.() || 0) -
                                    (a.updatedAt?.toMillis?.() || 0)
                            );

                            const convs = await Promise.all(
                                meta.map(async (c) => {
                                    const oUid = c.participants.find(
                                        (p) => p !== userId
                                    );
                                    const info = uMap[oUid] || {};
                                    const unreadSnap = await getDocs(
                                        query(
                                            collection(db, 'messages', c.id, 'chat'),
                                            where('receiverId', '==', userId)
                                        )
                                    );
                                    const hasUnread = unreadSnap.docs.some(
                                        (d) =>
                                            !(d.data().readBy || []).includes(userId)
                                    );

                                    return {
                                        id: c.id,
                                        otherUid: oUid,
                                        otherName: info.name || 'Nežinomas',
                                        otherAvatar: info.photos?.[0] || '',
                                        searchTypes: info.searchTypes || [],
                                        lastMessage: c.lastMessage?.text
                                            ? c.lastMessage.senderId === userId
                                                ? `Tu: ${c.lastMessage.text}`
                                                : c.lastMessage.text
                                            : 'Nieko',
                                        hasUnread,
                                    };
                                })
                            );
                            setConversations(convs);
                        } catch (err) {
                            console.error('chat err:', err);
                        } finally {
                            setLoadingChats(false);
                        }
                    },
                    (err) => {
                        console.error('chat listener err:', err);
                        setLoadingChats(false);
                    }
                );
            };

            /* ---------- Rezultatai ---------- */
            const [likesRes, matchesRes] = await Promise.all([
                likesPromise,
                matchesPromise,
            ]);
            setLikedByUsers(likesRes);
            setLoadingLikes(false);
            setMatches(matchesRes);
            setLoadingMatches(false);

            listenChats();
        };

        fetchEverything();
        const unsubFocus = navigation.addListener('focus', fetchEverything);

        return () => {
            unsubscribeChats();
            unsubFocus();
        };
    }, [navigation, userId]);

    /* ---------- Pagalbinės ---------- */
    const findMatchId = (uid) => matches.find((m) => m.otherUid === uid)?.id;

    const deleteChatAndUnmatch = async (chatId, otherUid, matchId) => {
        try {
            await deleteDoc(doc(db, 'chats', chatId));
            const msgSnap = await getDocs(collection(db, 'messages', chatId, 'chat'));
            const batch = writeBatch(db);
            msgSnap.forEach((d) => batch.delete(d.ref));
            await batch.commit();

            if (matchId) await deleteDoc(doc(db, 'matches', matchId));

            setConversations((p) => p.filter((c) => c.id !== chatId));
            setMatches((p) => p.filter((m) => m.otherUid !== otherUid));
        } catch (err) {
            console.error('delete err:', err);
        }
    };

    const confirmDelete = (chatId, otherUid, otherName) => {
        setPendingDelete({ chatId, otherUid, otherName });
        setAlertVisible(true);
    };

    const totalPendingLikes = likedByUsers.length;

    /* ---------- JSX ---------- */
    return (
        <View style={styles.container}>
            <Header onFilterPress={() => navigation.navigate('Filter')} />
            <Text style={styles.titleScreen}>Naujos simpatijos</Text>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Likes + Match sekcija */}
                <View style={styles.sectionContainer}>
                    <View style={styles.matchLikeRow}>
                        {/* LIKES */}
                        <View style={styles.likesBlock}>
                            {loadingLikes ? (
                                <>
                                    <SkeletonBox width={110} height={170} />
                                    <SkeletonBox
                                        width={80}
                                        height={16}
                                        borderRadius={4}
                                    />
                                </>
                            ) : (
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('LikesScreen', {
                                            pendingLikes: likedByUsers,
                                            myLocation: userData?.location, // kad LikesScreen žinotų Jūsų koordinates
                                            myBirthday: userData?.birthday, // prireiks, jei skaičiuosite atstumą iki savęs
                                        })
                                    }>
                                    <View>
                                        <Image
                                            source={{
                                                uri:
                                                    likedByUsers[0]?.avatar ||
                                                    'https://via.placeholder.com/110x170?text=+Likes',
                                            }}
                                            style={styles.likesImage}
                                        />
                                        {likedByUsers[0] && (
                                            <View style={styles.iconsOverlay}>
                                                {hasType(
                                                    likedByUsers[0],
                                                    'kambarioko'
                                                ) && <Tag type="kambarioko" />}
                                                {hasType(
                                                    likedByUsers[0],
                                                    'bendraminciu'
                                                ) && <Tag type="bendraminciu" />}
                                            </View>
                                        )}
                                        <View style={styles.likesOverlay}>
                                            <Text style={styles.likesCount}>
                                                +{totalPendingLikes}
                                            </Text>
                                            <Text style={styles.likesText}>
                                                Likes
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.likesLabel}>Likes</Text>
                        </View>

                        {/* MATCH'ai */}
                        <View style={styles.matchesBlock}>
                            {loadingMatches ? (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}>
                                    {[...Array(3)].map((_, i) => (
                                        <SkeletonBox
                                            key={i}
                                            width={110}
                                            height={170}
                                            style={{ marginRight: 12 }}
                                        />
                                    ))}
                                </ScrollView>
                            ) : (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.matchScroll}>
                                    {matches.map((m) => (
                                        <View key={m.id} style={styles.matchCard}>
                                            <TouchableOpacity
                                                testID={`match-${m.otherUid}`}
                                                onPress={() =>
                                                    navigation.navigate(
                                                        'WriteMessages',
                                                        {
                                                            receiverId: m.otherUid,
                                                            receiverName:
                                                            m.otherName,
                                                            receiverAvatar:
                                                            m.otherAvatar,
                                                        }
                                                    )
                                                }>
                                                <Image
                                                    source={{
                                                        uri: m.otherAvatar,
                                                    }}
                                                    style={styles.matchImage}
                                                />
                                                <View style={styles.iconsOverlay}>
                                                    {hasType(
                                                        m,
                                                        'kambarioko'
                                                    ) && <Tag type="kambarioko" />}
                                                    {hasType(
                                                        m,
                                                        'bendraminciu'
                                                    ) && <Tag type="bendraminciu" />}
                                                </View>
                                                <View style={styles.matchOverlay}>
                                                    <Text
                                                        style={
                                                            styles.matchOverlayText
                                                        }
                                                        numberOfLines={1}>
                                                        {m.otherName}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                            <Text style={styles.likesLabel}>Nauji match’ai</Text>
                        </View>
                    </View>
                </View>

                {/* POKALBIAI */}
                <View
                    style={[
                        styles.sectionContainer,
                        { marginTop: 16 },
                    ]}>
                    <Text style={styles.sectionTitle}>Žinutės</Text>
                    {loadingChats ? (
                        [...Array(3)].map((_, idx) => (
                            <View
                                key={idx}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 12,
                                }}>
                                <SkeletonBox
                                    width={48}
                                    height={48}
                                    borderRadius={24}
                                />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <SkeletonBox
                                        width={'60%'}
                                        height={14}
                                        borderRadius={4}
                                    />
                                    <SkeletonBox
                                        width={'40%'}
                                        height={12}
                                        borderRadius={4}
                                        style={{ marginTop: 4 }}
                                    />
                                </View>
                            </View>
                        ))
                    ) : conversations.length === 0 ? (
                        <Text style={styles.noConversations}>
                            Nėra jokių pokalbių.
                        </Text>
                    ) : (
                        conversations.map((c) => (
                            <View key={c.id} style={styles.messageRow}>
                                <TouchableOpacity
                                    testID={`conversation-${c.id}`}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                    onPress={() =>
                                        navigation.navigate('WriteMessages', {
                                            receiverId: c.otherUid,
                                            receiverName: c.otherName,
                                            receiverAvatar: c.otherAvatar,
                                        })
                                    }
                                    onLongPress={() => confirmDelete(c.id, c.otherUid, c.otherName)}
                                    delayLongPress={500}>
                                    <Image
                                        source={{ uri: c.otherAvatar }}
                                        style={styles.avatar}
                                    />

                                    <View style={styles.messageTextContainer}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                            }}>
                                            <Text style={styles.messageName}>
                                                {c.otherName}
                                                {c.hasUnread && (
                                                    <Text
                                                        style={styles.unreadDot}>
                                                        {' '}
                                                        •
                                                    </Text>
                                                )}
                                            </Text>
                                            {hasType(c, 'kambarioko') && (
                                                <Tag type="kambarioko" />
                                            )}
                                            {hasType(c, 'bendraminciu') && (
                                                <Tag type="bendraminciu" />
                                            )}
                                        </View>
                                        <Text
                                            style={styles.messageText}
                                            numberOfLines={1}>
                                            {c.lastMessage}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <Footer
                activeTab="Messages"
                onTabPress={(tab) => navigation.navigate(tab)}
            />
            {!loadingLikes && !loadingMatches && !loadingChats && (
                <View
                    testID="messages-loaded"
                    style={{ width: 1, height: 1, opacity: 0 }}
                />
            )}

            {/* Gražus trynimo dialogas */}
            <CustomAlert
                visible={alertVisible}
                title="Pašalinti pokalbį"
                message={
                pendingDelete.otherName
                    ? `Ar tikrai nori ištrinti pokalbį su ${pendingDelete.otherName} ir panaikinti sutapimą?`
                    : 'Ar tikrai nori ištrinti pokalbį ir panaikinti sutapimą?'
            }
                cancelText="Atšaukti"
                confirmText="Ištrinti"
                iconType="delete"
                onClose={() => setAlertVisible(false)}
                onConfirm={() => {
                    const { chatId, otherUid } = pendingDelete;
                    deleteChatAndUnmatch(
                        chatId,
                        otherUid,
                        findMatchId(otherUid)
                    );
                    setAlertVisible(false);
                }}
            />
        </View>
    );
}
