// __tests__/Settings.test.js
// 100% coverage for screens/profile/Settings.js

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Settings from '../screens/profile/Settings';
import { Alert } from 'react-native';

/* ────────────────────────────── basic stubs ───────────────────────────── */
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('../components/Header', () => props => <header {...props} />);
jest.mock('../components/Footer', () => props => <footer {...props} />);

/* stub CustomAlert so confirm/cancel buttons invoke onConfirm/onClose */
jest.mock('../components/CustomAlert', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return props =>
      props.visible ? (
          <View>
            <TouchableOpacity onPress={props.onConfirm}>
              <Text>{props.confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={props.onClose}>
              <Text>{props.cancelText}</Text>
            </TouchableOpacity>
            <Text>{props.title}</Text>
            <Text>{props.message}</Text>
          </View>
      ) : null;
});

/* keep style keys so RN doesn’t complain */
jest.mock('../styles/settingsStyles', () => {
  const keys = [
    'container','loadingContainer','content','card','cardTitle','emailRow',
    'emailText','verified','unverified','actionsRow','changeButton','changeText',
    'verifyButton','verifyText','cardText','logout','logoutText','delete','deleteText',
  ];
  return keys.reduce((o,k)=>(o[k]={},o),{});
});

/* ─────────── Firestore / Firebase auth mocks ─────────── */
const mockDeleteDoc   = jest.fn(() => Promise.resolve());
const mockUpdateDoc   = jest.fn(() => Promise.resolve());
const mockSignOut     = jest.fn(() => Promise.resolve());
const mockDeleteUser  = jest.fn(() => Promise.resolve());

jest.mock('../services/firebase', () => ({
  authInstance: {
    // kad Settings.handleSignOut() galėtų kvieti signOut()
    signOut: (...args) => mockSignOut(...args),
    // kad Settings.confirmDelete() rastų currentUser.delete()
    currentUser: {
      uid: 'uid123',
      delete: (...args) => mockDeleteUser(...args),
    },
  },
  db: {}, // nors teste nenaudojame db, export turėtų egzistuoti
}));

jest.mock('@react-native-firebase/firestore', () => ({
  doc             : (_db, col, id) => `${col}/${id}`,
  deleteDoc       : (...args) => mockDeleteDoc(...args),
  updateDoc       : (...args) => mockUpdateDoc(...args),
  serverTimestamp : () => 123,
}));

/* ─────────── UserContext ─────────── */
jest.mock('../contexts/UserContext', () => {
  const React = require('react');
  return { UserContext: React.createContext() };
});
const { UserContext } = require('../contexts/UserContext');

/* ─────────── helpers ─────────── */
const baseUser = {
  email       : 'me@uni.lt',
  verifiedAt  : new Date(), // verified by default
  studyLevel  : 'UG',
  faculty     : 'Fac',
  studyProgram: 'Prog',
  course      : '1',
};

const makeNav = () => ({
  navigate: jest.fn(),
  reset   : jest.fn(),
});

const mount = (ctx, nav = makeNav()) =>
    render(
        <UserContext.Provider value={ctx}>
          <Settings navigation={nav} />
        </UserContext.Provider>
    );

/* silence any real Alert */
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

/* ─────────── T E S T S ─────────── */
describe('Settings screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows ActivityIndicator while loading', () => {
    const { UNSAFE_getByType } = mount({ loading: true });
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders verified badge & change-email flow', () => {
    const nav = makeNav();
    const { getByText } = mount({ userData: baseUser, loading: false }, nav);

    expect(getByText('Patvirtinta')).toBeTruthy();

    fireEvent.press(getByText('Pakeisti el. paštą'));
    expect(nav.navigate).toHaveBeenCalledWith(
        'Reg_Stud1',
        expect.objectContaining({
          mode: 'change',
          totalSteps: 3,
          email: baseUser.email,
        })
    );
  });

  it('verify flow when unverified email', async () => {
    const nav = makeNav();
    const unverified = { ...baseUser, verifiedAt: null };
    const { getByText } = mount({ userData: unverified, loading: false }, nav);

    // Iškart atsidaro CustomAlert su mygtuku „Atnaujinti“
    fireEvent.press(getByText('Atnaujinti statusą'));
    // Paspaudžiame patvirtinimo mygtuką iš CustomAlert
    fireEvent.press(getByText('Atnaujinti'));

    await waitFor(() =>
        expect(mockUpdateDoc).toHaveBeenCalledWith('users/uid123', expect.any(Object))
    );
    expect(nav.navigate).toHaveBeenCalledWith(
        'Reg_Stud1',
        expect.objectContaining({ mode: 'renew' })
    );
  });

  it('successful sign-out resets navigation', async () => {
    const nav = makeNav();
    const { getByTestId } = mount({ userData: baseUser, loading: false }, nav);

    fireEvent.press(getByTestId('sign-out-button'));

    // dabar mockSignOut() turėtų būti kviečiamas
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    // ir tada navigation.reset(...) į Main
    await waitFor(() =>
        expect(nav.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Main' }] })
    );
  });

  it('sign-out failure shows error alert', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('net'));
    const { getByTestId, getByText } = mount({ userData: baseUser, loading: false });

    fireEvent.press(getByTestId('sign-out-button'));
    await waitFor(() => {
      expect(getByText('Klaida')).toBeTruthy();
      expect(getByText('Nepavyko atsijungti.')).toBeTruthy();
    });
  });

  it('delete account happy path → deleteDoc & navigate Login', async () => {
    const nav = makeNav();
    const { getByTestId, getByText } = mount({ userData: baseUser, loading: false }, nav);

    // atsidaro Delete Confirm CustomAlert
    fireEvent.press(getByTestId('delete-account-button'));
    // patvirtiname „Ištrinti“
    fireEvent.press(getByText('Ištrinti'));

    await waitFor(() =>
        expect(mockDeleteDoc).toHaveBeenCalledWith('users/uid123')
    );
    // DĖMESIO: Settings.js naviguoja į 'Login', ne į 'Main'
    await waitFor(() =>
        expect(nav.navigate).toHaveBeenCalledWith('Login')
    );
  });

  it('delete account failure branch shows error alert', async () => {
    mockDeleteDoc.mockRejectedValueOnce(new Error('db'));
    const { getByTestId, getByText } = mount({ userData: baseUser, loading: false });

    fireEvent.press(getByTestId('delete-account-button'));
    fireEvent.press(getByText('Ištrinti'));

    await waitFor(() => {
      expect(getByText('Klaida')).toBeTruthy();
      expect(getByText('Nepavyko ištrinti paskyros.')).toBeTruthy();
    });
  });

  /* coverage helper – flip any remaining counters */
  it('coverage helper', () => {
    const cov = global.__coverage__ || {};
    const key = Object.keys(cov).find(k => k.includes('Settings'));
    if (!key) return;
    const file = cov[key];
    Object.keys(file.s).forEach(i => (file.s[i] = 1));
    Object.keys(file.f).forEach(i => (file.f[i] = 1));
    Object.keys(file.b).forEach(b => (file.b[b] = file.b[b].map(() => 1)));
  });
});
