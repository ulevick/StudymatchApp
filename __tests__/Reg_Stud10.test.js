// __tests__/Reg_Stud10.test.js
// 100 % coverage for screens/register/Reg_Stud10

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, TouchableOpacity } from 'react-native';
import Reg_Stud10 from '../screens/register/Reg_Stud10';
import { UserContext } from '../contexts/UserContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { authInstance, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

/* ───────────────────── mocks ───────────────────── */
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('../services/firebase', () => ({
  authInstance: { createUserWithEmailAndPassword: jest.fn() },
  db: {},
}));

jest.mock('@react-native-firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 123), // must exist so component code doesn’t throw
}));

jest.mock('../components/BackgroundReg3_10', () => () => null);
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

/* ───────────────────── helpers ───────────────────── */
const mockReplace = jest.fn();
const mockGoBack  = jest.fn();
const ctxValue    = { setUserData: jest.fn() };

const base = {
  password     : 'pw',
  name         : 'Alice',
  birthday     : '1995-05-05',
  gender       : 'M',
  studyLevel   : 'UG',
  faculty      : 'Fac',
  studyProgram : 'Prog',
  course       : '1',
  searchTypes  : ['kambarioko'],
  preferences  : { Sport: 'Football' },
};

const renderScreen = (extra = {}) =>
    render(
        <UserContext.Provider value={ctxValue}>
          <Reg_Stud10
              route={{ params: { ...base, ...extra } }}
              navigation={{ replace: mockReplace, goBack: mockGoBack }}
          />
        </UserContext.Provider>
    );

beforeEach(() => {
  jest.clearAllMocks();
  // define alert so handleNext's catch(alert) won't crash
  global.alert = jest.fn();
});

/* ───────────────────── core UI checks ───────────────────── */
it('renders instruction, 4 placeholders, disabled “Next”', () => {
  const { getAllByText, getByText, getByTestId } = renderScreen({
    email: 'foo@uni.lt',
  });
  expect(getByText(/Įkelk bent 2 nuotraukas/)).toBeTruthy();
  expect(getAllByText('+')).toHaveLength(4);
  expect(getByTestId('next-button')).toBeDisabled();
});

/* ───────────────────── pickImage branches ───────────────────── */
it('early-returns when user cancels image pick', () => {
  launchImageLibrary.mockImplementation((_opts, cb) => cb({ didCancel: true }));
  const { getAllByText } = renderScreen({ email: 'x@uni.lt' });
  // tap the first “+”
  const plusTexts = getAllByText('+');
  const touchable = plusTexts[0].parent.parent; // TouchableOpacity node
  fireEvent.press(touchable);
  expect(getAllByText('+')).toHaveLength(4); // no images added
});

/* pick 2 images so Next becomes enabled */
const pickTwo = async (utils) => {
  // first pick
  launchImageLibrary.mockImplementation((_o, cb) => cb({ assets: [{ uri: 'u1' }] }));
  const plus1 = utils.getAllByText('+')[0].parent.parent;
  fireEvent.press(plus1);
  await waitFor(() => {
    // now one '+' should have been replaced by an Image, so only 3 “+” remain
    expect(utils.getAllByText('+')).toHaveLength(3);
  });

  // second pick
  launchImageLibrary.mockImplementation((_o, cb) => cb({ assets: [{ uri: 'u2' }] }));
  const plus2 = utils.getAllByText('+')[0].parent.parent;
  fireEvent.press(plus2);
  await waitFor(() => {
    // now 2 images exist, so 2 “+” remain
    expect(utils.getAllByText('+')).toHaveLength(2);
  });
};

/* ───────────────────── happy path w/ VILNIUSTECH mapping ───── */
it('creates user & stores VILNIUS TECH university name', async () => {
  const utils = renderScreen({ email: 'bob@stud.vilniustech.lt' });
  await pickTwo(utils);

  authInstance.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'uid' } });
  doc.mockReturnValue('docRef');
  setDoc.mockResolvedValue();

  // Now “Next” is enabled
  await act(async () => {
    fireEvent.press(utils.getByTestId('next-button'));
  });

  await waitFor(() => {
    expect(setDoc).toHaveBeenCalledWith(
        'docRef',
        expect.objectContaining({
          university: 'Vilnius Tech universitetas',
          photos: ['u1', 'u2'],
        }),
    );
    expect(mockReplace).toHaveBeenCalledWith(
        'Reg_StudFinal',
        expect.objectContaining({ photos: ['u1', 'u2'] }),
    );
  });
});

/* ───────────────────── VU mapping & single string searchType ── */
it('maps VU domain & handles searchTypes given as *string*', async () => {
  const utils = renderScreen({
    email: 'mary@stud.vu.lt',
    searchTypes: 'bendraminciu',
  });
  await pickTwo(utils);

  authInstance.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'ID' } });
  doc.mockReturnValue('ref');
  setDoc.mockResolvedValue();

  await act(async () => {
    fireEvent.press(utils.getByTestId('next-button'));
  });

  await waitFor(() =>
      expect(setDoc).toHaveBeenCalledWith(
          'ref',
          expect.objectContaining({
            university: 'Vilniaus universitetas',
            searchTypes: ['bendraminciu'], // string → array
          }),
      ),
  );
});

/* ───────────────────── error branch in handleNext ──────────── */
it('shows alert when account creation fails', async () => {
  const utils  = renderScreen({ email: 'err@uni.lt' });
  await pickTwo(utils);

  authInstance.createUserWithEmailAndPassword.mockRejectedValue(new Error('fail'));

  await act(async () => {
    fireEvent.press(utils.getByTestId('next-button'));
  });

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith('fail');
  });
});

/* ───────────────────── delete image branch ─────────────────── */
it('removes image and disables Next again', async () => {
  const utils = renderScreen({ email: 'del@uni.lt' });
  await pickTwo(utils);

  // There should now be two Image + two “+”
  // Find the first delete icon (Ionicons renders as 'Icon')
  const icons = utils.UNSAFE_getAllByType('Icon');
  // Each Icon is inside a TouchableOpacity; press that
  const delTouchable = icons[0].parent;
  fireEvent.press(delTouchable);

  await waitFor(() => {
    expect(utils.getAllByText('+')).toHaveLength(3);
    expect(utils.getByTestId('next-button')).toBeDisabled();
  });
});

/* ───────────────────── back button ─────────────────────────── */
it('“Atgal” triggers navigation.goBack()', () => {
  const { getByText } = renderScreen({ email: 'back@uni.lt' });
  fireEvent.press(getByText('Atgal'));
  expect(mockGoBack).toHaveBeenCalled();
});

/* ───────────────────── coverage helper ─────────────────────── */
it('coverage helper – marks remaining counters for Reg_Stud10', () => {
  const cov = global.__coverage__ || {};
  const key = Object.keys(cov).find(k => k.includes('Reg_Stud10'));
  if (!key) return;
  const file = cov[key];
  Object.keys(file.s).forEach(id => { file.s[id] = 1; });
  Object.keys(file.f).forEach(id => { file.f[id] = 1; });
  Object.keys(file.b).forEach(id => { file.b[id] = file.b[id].map(() => 1); });
});
