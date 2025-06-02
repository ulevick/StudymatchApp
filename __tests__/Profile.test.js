import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Profile from '../screens/profile/Profile';
import { UserContext } from '../contexts/UserContext';

jest.mock('../services/firebase', () => ({
  authInstance: { currentUser: null },
  db: {},
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('react-native-vector-icons/Ionicons', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock('../components/Header', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock('../components/Footer', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

describe('Profile', () => {
  const navigation = { navigate: jest.fn(), replace: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to SignIn if not authenticated', () => {
    render(
      <UserContext.Provider value={{ userData: {}, loading: false }}>
        <Profile navigation={navigation} />
      </UserContext.Provider>
    );
    expect(navigation.replace).toHaveBeenCalledWith('SignIn');
  });

  it('shows a loader when loading is true', () => {
    const { authInstance } = require('../services/firebase');
    authInstance.currentUser = { uid: 'u1' };

    const { getByTestId } = render(
      <UserContext.Provider value={{ userData: null, loading: true }}>
        <Profile navigation={navigation} />
      </UserContext.Provider>
    );
    expect(getByTestId('loading-spinner')).toBeTruthy();
    expect(getByTestId('loading-text').props.children).toBe('Kraunama...');
  });

  it('shows error text when not loading and no data', () => {
    const { authInstance } = require('../services/firebase');
    authInstance.currentUser = { uid: 'u1' };

    const { queryByTestId, getByTestId } = render(
      <UserContext.Provider value={{ userData: null, loading: false }}>
        <Profile navigation={navigation} />
      </UserContext.Provider>
    );
    expect(queryByTestId('loading-spinner')).toBeNull();
    expect(getByTestId('error-text').props.children).toBe(
      'Vartotojo duomenų nerasta.'
    );
  });

  it('renders placeholder icon when no photos', () => {
    const { authInstance } = require('../services/firebase');
    authInstance.currentUser = { uid: 'u1' };

    const userData = {
      name: 'X',
      birthday: null,
      photos: [],
      university: '',
      studyProgram: '',
      studyLevel: '',
      course: '',
      aboutMe: '',
      searchTypes: [],
      preferences: null,
    };
    const { queryByTestId, getByTestId } = render(
      <UserContext.Provider value={{ userData, loading: false }}>
        <Profile navigation={navigation} />
      </UserContext.Provider>
    );
    expect(queryByTestId('user-photo')).toBeNull();
    expect(getByTestId('photo-placeholder')).toBeTruthy();
  });

  it('renders single photo & edit button works', () => {
    const { authInstance } = require('../services/firebase');
    authInstance.currentUser = { uid: 'u1' };

    const userData = {
      name: 'Y',
      birthday: null,
      photos: ['one-uri'],
      university: '',
      studyProgram: '',
      studyLevel: '',
      course: '',
      aboutMe: '',
      searchTypes: [],
      preferences: {},
    };
    const { queryByTestId, getByTestId } = render(
      <UserContext.Provider value={{ userData, loading: false }}>
        <Profile navigation={navigation} />
      </UserContext.Provider>
    );

    expect(getByTestId('user-photo').props.source).toEqual({
      uri: 'one-uri',
    });
    expect(queryByTestId('progress-bar')).toBeNull();

    fireEvent.press(getByTestId('edit-button'));
    expect(navigation.navigate).toHaveBeenCalledWith('EditProfile');
  });

  it('renders multiple photos, shows age, cycles photos, and header/footer callbacks', () => {
    const { authInstance } = require('../services/firebase');
    authInstance.currentUser = { uid: 'u1' };
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date(2001, 1, 2).getTime());

    const userData = {
      name: 'Z',
      birthday: '2000/02/01',
      photos: ['p1', 'p2', 'p3'],
      university: '',
      studyProgram: '',
      studyLevel: '',
      course: '',
      aboutMe: '',
      searchTypes: [],
      preferences: {},
    };
    const { getByTestId, getAllByTestId, getByText } = render(
      <UserContext.Provider value={{ userData, loading: false }}>
        <Profile navigation={navigation} />
      </UserContext.Provider>
    );

    expect(getByText('Z, 1')).toBeTruthy();

    const dots = getAllByTestId('progress-dot');
    expect(dots).toHaveLength(3);

    expect(getByTestId('user-photo').props.source).toEqual({ uri: 'p1' });
    fireEvent.press(getByTestId('photo-button'));
    expect(getByTestId('user-photo').props.source).toEqual({ uri: 'p2' });

    const HeaderMock = require('../components/Header').default;
    const { onFilterPress } = HeaderMock.mock.calls[0][0];
    onFilterPress();
    expect(navigation.navigate).toHaveBeenCalledWith('Filter');

    const FooterMock = require('../components/Footer').default;
    const { onTabPress } = FooterMock.mock.calls[0][0];
    onTabPress('home');
    expect(navigation.navigate).toHaveBeenCalledWith('home');

    Date.now.mockRestore();
  });
});
