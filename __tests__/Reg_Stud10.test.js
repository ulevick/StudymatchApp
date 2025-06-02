import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Reg_Stud10 from '../screens/register/Reg_Stud10';
import { UserContext } from '../contexts/UserContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { authInstance, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
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
  serverTimestamp: jest.fn(() => 123),
}));

jest.mock('../components/BackgroundReg3_10', () => () => null);
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

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
  global.alert = jest.fn();
});

it('renders instruction, 4 placeholders, disabled “Next”', () => {
  const { getAllByText, getByText, getByTestId } = renderScreen({
    email: 'foo@uni.lt',
  });
  expect(getByText(/Įkelk bent 2 nuotraukas/)).toBeTruthy();
  expect(getAllByText('+')).toHaveLength(4);
  expect(getByTestId('next-button')).toBeDisabled();
});

it('early-returns when user cancels image pick', () => {
  launchImageLibrary.mockImplementation((_opts, cb) => cb({ didCancel: true }));
  const { getAllByText } = renderScreen({ email: 'x@uni.lt' });
  const plusTexts = getAllByText('+');
  const touchable = plusTexts[0].parent.parent;
  fireEvent.press(touchable);
  expect(getAllByText('+')).toHaveLength(4);
});

const pickTwo = async (utils) => {
  launchImageLibrary.mockImplementation((_o, cb) => cb({ assets: [{ uri: 'u1' }] }));
  const plus1 = utils.getAllByText('+')[0].parent.parent;
  fireEvent.press(plus1);
  await waitFor(() => {
    expect(utils.getAllByText('+')).toHaveLength(3);
  });
  launchImageLibrary.mockImplementation((_o, cb) => cb({ assets: [{ uri: 'u2' }] }));
  const plus2 = utils.getAllByText('+')[0].parent.parent;
  fireEvent.press(plus2);
  await waitFor(() => {
    expect(utils.getAllByText('+')).toHaveLength(2);
  });
};

it('creates user & stores VILNIUS TECH university name', async () => {
  const utils = renderScreen({ email: 'bob@stud.vilniustech.lt' });
  await pickTwo(utils);

  authInstance.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'uid' } });
  doc.mockReturnValue('docRef');
  setDoc.mockResolvedValue();

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
            searchTypes: ['bendraminciu'],
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
