import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Reg_StudFinal from '../screens/register/Reg_StudFinal';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  GeoPoint,
} from '@react-native-firebase/firestore';
import { getCurrentLocation } from '../utils/getCurrentLocation';

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'MOCK_TS'),
  GeoPoint: jest.fn((lat, lng) => ({ latitude: lat, longitude: lng })),
}));

jest.mock('../utils/getCurrentLocation', () => ({
  getCurrentLocation: jest.fn(),
}));

jest.mock('../components/PeopleBackground', () => () => null);

describe('Reg_StudFinal', () => {
  const mockReplace = jest.fn();

  const baseParams = {
    uid: 'uid123',
    email: 'user@stud.vilniustech.lt',
    name: 'Charlie',
    birthday: '1998-08-08',
    gender: 'F',
    studyLevel: 'G',
    faculty: 'FacB',
    studyProgram: 'Prog2',
    course: '2',
    searchTypes: ['bendraminciu'],
    preferences: { Music: 'Rock' },
    photos: ['uri1', 'uri2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    doc.mockReturnValue('docRef');
  });

  it('saves Vilnius Tech user with coords', async () => {
    getCurrentLocation.mockResolvedValue({ latitude: 10, longitude: 20 });

    const { getByText } = render(
      <Reg_StudFinal
        route={{ params: baseParams }}
        navigation={{ replace: mockReplace }}
      />
    );
    fireEvent.press(getByText('Pradėti'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'docRef',
        expect.objectContaining({
          uid: baseParams.uid,
          email: baseParams.email,
          name: baseParams.name,
          birthday: baseParams.birthday,
          gender: baseParams.gender,
          studyLevel: baseParams.studyLevel,
          faculty: baseParams.faculty,
          studyProgram: baseParams.studyProgram,
          course: baseParams.course,
          searchTypes: baseParams.searchTypes,
          preferences: baseParams.preferences,
          photos: baseParams.photos,
          university: 'Vilnius Tech universitetas',
          aboutMe: '',
          location: { latitude: 10, longitude: 20 },
          locationUpdatedAt: 'MOCK_TS',
          createdAt: 'MOCK_TS',
        })
      );
      expect(GeoPoint).toHaveBeenCalledWith(10, 20);
      expect(mockReplace).toHaveBeenCalledWith('Profile', { uid: baseParams.uid });
    });
  });

  it('saves Vilnius University user when email matches VU domains', async () => {
    getCurrentLocation.mockResolvedValue({ latitude: 0, longitude: 0 });
    const params = { ...baseParams, email: 'me@studentas.vu.lt' };

    const { getByText } = render(
      <Reg_StudFinal
        route={{ params }}
        navigation={{ replace: mockReplace }}
      />
    );
    fireEvent.press(getByText('Pradėti'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'docRef',
        expect.objectContaining({ university: 'Vilniaus universitetas' })
      );
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it('uses empty university for unrecognized domain and null coords', async () => {
    getCurrentLocation.mockResolvedValue(null);
    const params = { ...baseParams, email: 'foo@example.com' };

    const { getByText } = render(
      <Reg_StudFinal
        route={{ params }}
        navigation={{ replace: mockReplace }}
      />
    );
    fireEvent.press(getByText('Pradėti'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'docRef',
        expect.objectContaining({
          university: '',
          location: null,
        })
      );
      expect(mockReplace).toHaveBeenCalledWith('Profile', { uid: params.uid });
    });
  });

  it('defaults photos to empty array when none provided', async () => {
    getCurrentLocation.mockResolvedValue({ latitude: 5, longitude: 5 });
    const { photos, ...rest } = baseParams;
    const params = { ...rest };

    const { getByText } = render(
      <Reg_StudFinal
        route={{ params }}
        navigation={{ replace: mockReplace }}
      />
    );
    fireEvent.press(getByText('Pradėti'));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'docRef',
        expect.objectContaining({
          photos: [],
        })
      );
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it('logs an error and does not navigate when setDoc throws', async () => {
    const error = new Error('boom');
    setDoc.mockRejectedValue(error);
    getCurrentLocation.mockResolvedValue({ latitude: 1, longitude: 1 });
    const consoleErr = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { getByText } = render(
      <Reg_StudFinal
        route={{ params: baseParams }}
        navigation={{ replace: mockReplace }}
      />
    );
    fireEvent.press(getByText('Pradėti'));

    await waitFor(() => {
      expect(consoleErr).toHaveBeenCalledWith(
        'Klaida išsaugant naudotoją:',
        error
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
