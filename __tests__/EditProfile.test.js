import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EditProfile from '../screens/profile/EditProfile';
import { UserContext } from '../contexts/UserContext';
import { authInstance } from '../services/firebase';
import { doc, setDoc } from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

/* --------------------------------------------------------
   Global mocks (the same fakes used by the old test file)
--------------------------------------------------------- */
jest.mock('../services/firebase', () => ({
  authInstance: { currentUser: { uid: 'user123' } },
  db: {},
}));
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  doc: jest.fn(() => 'DOC_REF'),
  setDoc: jest.fn(),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-picker-select', () => 'RNPickerSelect');
jest.mock('../constants/studyPrograms', () => ({ '': {} }));
jest.mock('../styles/global', () => ({}));
jest.mock('../styles/editProfileStyles', () => ({}));
jest.mock('../constants/colors', () => ({
  lightyellow: '#ff0',
  lightblue: '#0ff',
  white: '#fff',
  fieldText: '#000',
  black: '#000',
}));

/* --------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const navMock = { goBack: jest.fn() };
const renderWithCtx = (ctx) =>
  render(
    <UserContext.Provider value={ctx}>
      <EditProfile navigation={navMock} />
    </UserContext.Provider>
  );

/* --------------------------------------------------------
   Tests
--------------------------------------------------------- */
describe('EditProfile – full coverage', () => {
  let setUserData;

  beforeEach(() => {
    jest.clearAllMocks();
    setUserData = jest.fn();
    authInstance.currentUser = { uid: 'user123' }; // reset
  });

  /* ----- 1.  loading state ----- */
  it('shows the spinner while loading', () => {
    const { getByTestId } = renderWithCtx({ userData: null, setUserData, loading: true });
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByTestId('loading-text').props.children).toBe('Kraunama...');
  });

  /* ----- 2.  “< 2 photos” validation branch ----- */
  it('alerts when saving with fewer than 2 photos', () => {
    jest.spyOn(Alert, 'alert');
    const ctx = { userData: { photos: [null, null, null, null], university: '' }, setUserData, loading: false };
    const { getByTestId } = renderWithCtx(ctx);
    fireEvent.press(getByTestId('save-button'));
    expect(Alert.alert).toHaveBeenCalledWith('Pridėkite nuotraukų', 'Įkelkite bent 2 nuotraukas.');
  });

  /* ----- 3.  “no UID” validation branch ----- */
  it('alerts when user is unauthenticated', () => {
    jest.spyOn(Alert, 'alert');
    authInstance.currentUser = null; // remove uid
    const ctx = { userData: { photos: ['a', 'b'], university: '' }, setUserData, loading: false };
    const { getByTestId } = renderWithCtx(ctx);
    fireEvent.press(getByTestId('save-button'));
    expect(Alert.alert).toHaveBeenCalledWith('Klaida', 'Nerastas vartotojo identifikatorius.');
  });

  /* ----- 4.  setDoc failure branch  ----- */
  it('shows error alert when Firestore write fails', async () => {
    jest.spyOn(Alert, 'alert');
    setDoc.mockRejectedValueOnce(new Error('boom'));
    const ctx = { userData: { photos: ['a', 'b'], university: '' }, setUserData, loading: false };
    const { getByTestId } = renderWithCtx(ctx);
    fireEvent.press(getByTestId('save-button'));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith('Klaida', 'Nepavyko išsaugoti duomenų.')
    );
  });

  /* ----- 5.  happy‑path save  ----- */
  it('writes to Firestore and navigates back on success', async () => {
    setDoc.mockResolvedValueOnce(); // happy
    const base = {
      photos: ['one', 'two'],
      studyLevel: 'L1',
      faculty: 'F',
      studyProgram: 'P',
      course: '1',
      aboutMe: 'hi',
      searchTypes: ['kambarioko'],
      preferences: ['pref'],
      university: '',
    };
    const ctx = { userData: base, setUserData, loading: false };
    const { getByTestId } = renderWithCtx(ctx);

    // toggle search cards so both are selected -> tests that branch
    fireEvent.press(getByTestId('slot-image-0')); // will pick image next (test 6)
    fireEvent.press(getByTestId('save-button'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'DOC_REF',
        expect.objectContaining({ photos: ['one', 'two'] }),
        { merge: true }
      );
      expect(setUserData).toHaveBeenCalled();
      expect(navMock.goBack).toHaveBeenCalled();
    });
  });

  /* ----- 6.  image‑picker “success” branch  ----- */
  it('sets a slot image when the picker returns a uri', async () => {
    launchImageLibrary.mockImplementationOnce((_o, cb) =>
      cb({ assets: [{ uri: 'newUri' }] })
    );
    const ctx = { userData: { photos: [null, null, null, null], university: '' }, setUserData, loading: false };
    const { getByTestId } = renderWithCtx(ctx);
    fireEvent.press(getByTestId('slot-placeholder-0'));
    await waitFor(() => expect(getByTestId('slot-image-0').props.source).toEqual({ uri: 'newUri' }));
  });

  /* ----- 7.  image‑picker “cancel” branch  ----- */
  it('does nothing when the picker is cancelled', () => {
    launchImageLibrary.mockImplementationOnce((_o, cb) => cb({ didCancel: true }));
    const ctx = { userData: { photos: [null, null, null, null], university: '' }, setUserData, loading: false };
    const { getByTestId, queryByTestId } = renderWithCtx(ctx);
    fireEvent.press(getByTestId('slot-placeholder-0'));
    expect(queryByTestId('slot-image-0')).toBeNull(); // still empty
  });

  /* ----- 8.  removeImage branch  ----- */
  it('clears a slot image when remove is pressed', () => {
    const ctx = { userData: { photos: ['x', 'y', null, null], university: '' }, setUserData, loading: false };
    const { getByTestId, queryByTestId } = renderWithCtx(ctx);
    expect(getByTestId('slot-image-1')).toBeTruthy(); // image present
    fireEvent.press(getByTestId('slot-remove-1'));
    expect(queryByTestId('slot-image-1')).toBeNull();
  });

  /* ----- 9.  “edit interests” button  ----- */
  it('fires the “edit interests” alert', () => {
    jest.spyOn(Alert, 'alert');
    const ctx = { userData: { photos: ['a', 'b'], university: '' }, setUserData, loading: false };
    const { getByTestId } = renderWithCtx(ctx);
    fireEvent.press(getByTestId('add-pref-button'));
    expect(Alert.alert).toHaveBeenCalledWith('Redaguoti pomėgius', 'Pomėgių redagavimas bus pridėtas vėliau.');
  });

  /* ----- 10.  char‑counter  ----- */
  it('updates the “Apie Mane” character counter', () => {
    const ctx = { userData: { photos: ['a', 'b'], university: '' }, setUserData, loading: false };
    const { getByPlaceholderText, getByText } = renderWithCtx(ctx);
    fireEvent.changeText(getByPlaceholderText('Parašykite apie save...'), 'hello');
    expect(getByText('5/500')).toBeTruthy();
  });

  /* ----- 11.  toggling search‑type cards  ----- */
  it('toggles search type selection on card press and saves both choices', async () => {
    setDoc.mockResolvedValueOnce();
    const ctx = { userData: { photos: ['p1', 'p2'], university: '' }, setUserData, loading: false };
    const { getByText, getByTestId } = renderWithCtx(ctx);

    // Kambarioko card
    fireEvent.press(getByText('Kambarioko'));
    // Bendraminčių card
    fireEvent.press(getByText('Bendraminčių'));

    fireEvent.press(getByTestId('save-button'));
    await waitFor(() =>
      expect(setDoc).toHaveBeenCalledWith(
        'DOC_REF',
        expect.objectContaining({ searchTypes: ['kambarioko', 'bendraminciu'] }),
        { merge: true }
      )
    );

    // Now toggle one off and verify it disappears from payload
    setDoc.mockClear();
    fireEvent.press(getByText('Kambarioko')); // toggles off
    fireEvent.press(getByTestId('save-button'));

    await waitFor(() =>
      expect(setDoc).toHaveBeenCalledWith(
        'DOC_REF',
        expect.objectContaining({ searchTypes: ['bendraminciu'] }),
        { merge: true }
      )
    );
  });
});
