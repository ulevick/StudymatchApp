// __tests__/Filter.test.js
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Filter from '../screens/discovery/Filter';
import { UserContext } from '../contexts/UserContext';
import { authInstance, db } from '../services/firebase';
import { doc, setDoc } from '@react-native-firebase/firestore';

// --- Mock out all native/3rd‑party deps ---
jest.mock('@ptomasroos/react-native-multi-slider', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ values, onValuesChange, testID }) => (
    <TouchableOpacity
      testID={testID || `multi-slider-${values.join('-')}`}
      onPress={() => {
        onValuesChange(values.map(v => v + 1)); // bump every value by 1
      }}
    >
      <Text>Slider</Text>
    </TouchableOpacity>
  );
});

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('../components/CustomDropdown', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return ({ data, selected, label, onSelect, disabled }) => (
    <TouchableOpacity
      testID={`dropdown-${label || 'Rodyti tik'}-${selected}`}
      disabled={disabled}
      onPress={() => {
        if (!disabled && data && data.length > 1) {
          onSelect(data[1]);
        }
      }}
    >
      <Text>{selected}</Text>
    </TouchableOpacity>
  );
});

// --- Fixed named‐export mocks ---
jest.mock('../constants/preferencesData', () => ({
  preferencesData: [
    { title: 'Group1', items: ['Item1', 'Item2'] },
  ],
}));

jest.mock('../constants/studyPrograms', () => ({
  __esModule: true,
  default: {
    Uni1: { Level1: { Faculty1: ['Program1', 'Program2'] } },
  },
}));

jest.mock('../constants/levels', () => ({
  LEVELS: [
    { value: 'Level1' },
  ],
}));

jest.mock('../constants/courses', () => ({
  COURSES_BY_LEVEL: {
    Level1: [{ value: 'Course1', label: 'Courselbl1' }],
  },
}));

jest.mock('../constants/gender', () => ({
  GENDER_FEMALE: 'Female',
  GENDER_MALE: 'Male',
}));

jest.mock('../constants/colors', () => ({}));

jest.mock('../services/firebase', () => ({
  authInstance: { currentUser: null },
  db: 'mockDb',
}));

jest.mock('@react-native-firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

describe('Filter screen', () => {
  let navigation;

  beforeEach(() => {
    navigation = { goBack: jest.fn() };
    doc.mockClear();
    setDoc.mockClear();
    authInstance.currentUser = null;
  });

  it('renders default UI correctly', () => {
    const { getByText, queryByTestId, getAllByText } = render(
      <UserContext.Provider value={{ userData: {} }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    // Header
    getByText('Filtro nustatymai');
    // Default age labels
    getByText('18 m.');
    getByText('50 m.');

    // Distance default (there are two "Neriboti" texts; at least one must exist)
    const neribotiLabels = getAllByText('Neriboti');
    expect(neribotiLabels.length).toBeGreaterThanOrEqual(1);

    // No modal visible
    expect(queryByTestId('modal-back-button')).toBeNull();
  });

  it('goes back without saving if no userId', async () => {
    const { getByTestId } = render(
      <UserContext.Provider value={{ userData: {} }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    fireEvent.press(getByTestId('back-button'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('saves filter when userId exists and then goes back', async () => {
    authInstance.currentUser = { uid: 'u123' };

    const { getByTestId } = render(
      <UserContext.Provider value={{ userData: {} }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    fireEvent.press(getByTestId('back-button'));

    await waitFor(() => {
      expect(doc).toHaveBeenCalledWith('mockDb', 'users', 'u123');
      expect(setDoc).toHaveBeenCalledWith(
        undefined, // our mock doc() returns undefined
        {
          filter: {
            filterGender: null,
            filterAgeMin: 18,
            filterAgeMax: 50,
            filterDistanceKm: null,
            filterUniversity: null,
            filterLevel: null,
            filterFaculty: null,
            filterStudyProgram: null,
            filterCourse: null,
            filterPreferences: [],
          },
        },
        { merge: true }
      );
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });

  it('updates age and distance sliders and can reset distance', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <UserContext.Provider value={{ userData: {} }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    // Age slider 18-50 → press → values become [19,51]
    fireEvent.press(getByTestId('multi-slider-18-50'));
    getByText('19 m.');
    getByText('51 m.');

    // Distance slider 100(default) → press → becomes 101 km
    fireEvent.press(getByTestId('multi-slider-100'));
    getByText('101 km');

    // Reset distance → should show "Neriboti" again
    fireEvent.press(getByTestId('reset-distance-button'));
    const neribotiAfterReset = getAllByText('Neriboti');
    expect(neribotiAfterReset.length).toBeGreaterThanOrEqual(1);
  });

  it('cascades through all dropdowns', () => {
    const { getByTestId } = render(
      <UserContext.Provider value={{ userData: {} }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    // University
    fireEvent.press(getByTestId('dropdown-Universitetas-Visų universitetų'));
    getByTestId('dropdown-Universitetas-Uni1');

    // Level
    fireEvent.press(getByTestId('dropdown-Studijų lygis-Visų lygių'));
    getByTestId('dropdown-Studijų lygis-Level1');

    // Faculty
    fireEvent.press(getByTestId('dropdown-Fakultetas-Visų fakultetų'));
    getByTestId('dropdown-Fakultetas-Faculty1');

    // Study Program
    fireEvent.press(getByTestId('dropdown-Studijų kryptis-Visų krypčių'));
    getByTestId('dropdown-Studijų kryptis-Program1');

    // Course
    fireEvent.press(getByTestId('dropdown-Kursas-Visų kursų'));
    getByTestId('dropdown-Kursas-Courselbl1');
  });

  it('opens preferences modal, toggles an item, and closes it', async () => {
    authInstance.currentUser = { uid: 'u123' };
    const { getByTestId, getByText, queryByText } = render(
      <UserContext.Provider value={{ userData: {} }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    // Open modal
    fireEvent.press(getByTestId('open-modal-button'));
    getByTestId('modal-back-button');
    getByText('Pasirinkite pomėgius');

    // Toggle one preference
    fireEvent.press(getByText('Item1'));

    // Close modal
    fireEvent.press(getByTestId('modal-back-button'));
    await waitFor(() => {
      // main screen should now show the selected chip
      getByText('Item1');
      // modal gone
      expect(queryByText('Pasirinkite pomėgius')).toBeNull();
    });
  });

  it('pre-populates all fields from userData.filter', () => {
    const preset = {
      filterGender: 'Female',
      filterAgeMin: 20,
      filterAgeMax: 30,
      filterDistanceKm: 10,
      filterUniversity: 'Uni1',
      filterLevel: 'Level1',
      filterFaculty: 'Faculty1',
      filterStudyProgram: 'Program1',
      filterCourse: 'Course1',
      filterPreferences: ['Item2'],
    };
    const { getByText, getByTestId, queryByTestId } = render(
      <UserContext.Provider value={{ userData: { filter: preset } }}>
        <Filter navigation={navigation} />
      </UserContext.Provider>
    );

    // Gender
    getByTestId('dropdown-Rodyti tik-Female');
    // Age
    getByText('20 m.');
    getByText('30 m.');
    // Distance
    getByText('10 km');
    // University & friends
    getByTestId('dropdown-Universitetas-Uni1');
    getByTestId('dropdown-Studijų lygis-Level1');
    getByTestId('dropdown-Fakultetas-Faculty1');
    getByTestId('dropdown-Studijų kryptis-Program1');
    getByTestId('dropdown-Kursas-Courselbl1');
    // Prefs chip
    getByText('Item2');
    // Modal still closed
    expect(queryByTestId('modal-back-button')).toBeNull();
  });
});
