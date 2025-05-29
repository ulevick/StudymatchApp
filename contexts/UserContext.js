import React, { createContext, useState, useEffect } from 'react';
import { authInstance, db } from '../services/firebase';
import { doc, onSnapshot } from '@react-native-firebase/firestore';

export const UserContext = createContext();
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData,    setUserData   ] = useState(null);
  const [loading,     setLoading    ] = useState(true);
  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = authInstance.onAuthStateChanged(async user => {
      if (user) {
        setCurrentUser(user);

        const ref = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(ref, snap => {
          if (snap.exists) {
            if (snap.id === authInstance.currentUser?.uid) {
              setUserData(snap.data());
            }
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
      }
    });
    return () => {
      if (unsubscribeDoc) unsubscribeDoc();
      unsubscribeAuth();
    };
  }, []);
  return (
    <UserContext.Provider value={{ userData, setUserData, loading, currentUser }}>
      {children}
    </UserContext.Provider>
  );
};
