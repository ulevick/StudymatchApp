// screens/WriteMessages.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc,
  getDocs,
  where,
  writeBatch,
  getDoc,
} from '@react-native-firebase/firestore';

import { db, authInstance } from '../../services/firebase';
import Colors from '../../constants/colors';
import styles from '../../styles/writemessageStyles';
export default function WriteMessages({ route }) {
  const { receiverId, receiverName, receiverAvatar } = route.params;
  const senderId = authInstance.currentUser?.uid;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [receiverTypes, setReceiverTypes] = useState([]);   /* NEW */

  const flatListRef = useRef(null);
  const chatId =
    senderId < receiverId
      ? `${senderId}_${receiverId}`
      : `${receiverId}_${senderId}`;

  useEffect(() => {
    const fetchReceiver = async () => {
      const snap = await getDoc(doc(db, 'users', receiverId));
      if (snap.exists) {
        const data = snap.data();
        if (Array.isArray(data.searchTypes)) setReceiverTypes(data.searchTypes);
      }
    };
    fetchReceiver();
  }, [receiverId]);

  useEffect(() => {
    const q = query(
      collection(db, 'messages', chatId, 'chat'),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    const markRead = async () => {
      const msgsRef = collection(db, 'messages', chatId, 'chat');
      const unreadSnap = await getDocs(
        query(msgsRef, where('receiverId', '==', senderId)),
      );
      if (unreadSnap.empty) return;

      const batch = writeBatch(db);
      unreadSnap.forEach((d) => {
        const data = d.data();
        if (!(data.readBy || []).includes(senderId)) {
          batch.update(d.ref, { readBy: [...(data.readBy || []), senderId] });
        }
      });
      await batch.commit();
    };
    markRead();
  }, [chatId, senderId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, 'messages', chatId, 'chat'), {
      text: message,
      senderId,
      receiverId,
      readBy: [senderId],
      createdAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, 'chats', chatId),
      {
        participants: [senderId, receiverId],
        lastMessage: { text: message, senderId, createdAt: new Date() },
        updatedAt: new Date(),
      },
      { merge: true },
    );

    setMessage('');
  };

  const renderItem = ({ item }) => {
    const own = item.senderId === senderId;
    return (
      <View
        style={[
          styles.bubble,
          own ? styles.bubbleOwn : styles.bubbleTheir,
        ]}
      >
        <Text style={styles.bubbleTxt}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding' })}
      keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Image source={{ uri: receiverAvatar }} style={styles.avatar} />

        <View style={styles.nameRow}>
          <Text style={styles.name}>{receiverName}</Text>

          {receiverTypes.includes('kambarioko') && (
            <View style={[styles.tagBox, { backgroundColor: Colors.lightyellow || '#FFF3C4' }]}>
              <Image
                source={require('../../assets/images/kambariokuicon.png')}
                style={styles.tagIcon} />
            </View>
          )}
          {receiverTypes.includes('bendraminciu') && (
            <View style={[styles.tagBox, { backgroundColor: Colors.lightblue || '#DAF0FF' }]}>
              <Image
                source={require('../../assets/images/bendraminciuicon.png')}
                style={styles.tagIcon} />
            </View>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.chatContainer} />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Rašyti žinutę..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
          returnKeyType="send" />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendTxt}>Siųsti</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

