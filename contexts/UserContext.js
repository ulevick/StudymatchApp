import React, { createContext, useState, useEffect } from 'react';
import { authInstance, db } from '../services/firebase';
import { doc, onSnapshot } from '@react-native-firebase/firestore';

export const UserContext = createContext();

/**
 * Provides `{ userData, setUserData, loading }` anywhere in the tree.
 * – subscribes to Firebase Auth for login/logout
 * – when logged in, listens to `/users/{uid}` in Firestore
 */
export const UserProvider = ({ children }) => {
  /** ───────────── state ───────────── */
  const [currentUser, setCurrentUser] = useState(null);   // <- FIXED typo
  const [userData,    setUserData   ] = useState(null);
  const [loading,     setLoading    ] = useState(true);

  /** ───────────── side-effects ───────────── */
  useEffect(() => {
    let unsubscribeDoc = null;

    const unsubscribeAuth = authInstance.onAuthStateChanged(async user => {
      if (user) {
        setCurrentUser(user);

        const ref = doc(db, 'users', user.uid);
        unsubscribeDoc = onSnapshot(ref, snap => {
          if (snap.exists) {
            /* only accept data meant for the logged-in user */
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

    /* cleanup on unmount */
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
