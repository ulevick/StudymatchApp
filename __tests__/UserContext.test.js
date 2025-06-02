import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, Alert } from 'react-native';

import { UserProvider, UserContext } from '../contexts/UserContext';
import { authInstance } from '../services/firebase';
import {
  onSnapshot as mockOnSnapshot,
  doc as mockDoc,
} from '@react-native-firebase/firestore';

jest.mock('../services/firebase', () => ({
  authInstance: { onAuthStateChanged: jest.fn(), currentUser: null },
  db: {},
}));
jest.mock('@react-native-firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}));

const Printer = () => (
  <UserContext.Consumer>
    {({ userData, loading }) => (
      <Text testID="out">
        {loading ? 'loading' : JSON.stringify(userData)}
      </Text>
    )}
  </UserContext.Consumer>
);

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authInstance.currentUser = null;
  });

  it('shows null when no user is logged in', async () => {
    const unsubAuth = jest.fn();
    authInstance.onAuthStateChanged.mockImplementation(cb => {
      cb(null);
      return unsubAuth;
    });
    const { getByTestId, unmount } = render(
      <UserProvider>
        <Printer />
      </UserProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('out').props.children).toBe('null'),
    );
    unmount();
    expect(unsubAuth).toHaveBeenCalled();
  });

  it('stores Firestore data when UID matches', async () => {
    const fakeUser = { uid: 'uid123' };
    const unsubAuth = jest.fn();
    const unsubDoc  = jest.fn();

    authInstance.onAuthStateChanged.mockImplementation(cb => {
      authInstance.currentUser = fakeUser;
      cb(fakeUser);
      return unsubAuth;
    });

    mockDoc.mockReturnValue('docRef');
    mockOnSnapshot.mockImplementation((ref, cb) => {
      cb({
        exists: true,
        id    : 'uid123',
        data  : () => ({ name: 'Alice' }),
      });
      return unsubDoc;
    });

    const { getByTestId, unmount } = render(
      <UserProvider>
        <Printer />
      </UserProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('out').props.children).toContain('"name":"Alice"'),
    );

    unmount();
    expect(unsubAuth).toHaveBeenCalled();
    expect(unsubDoc).toHaveBeenCalled();
  });

  it('ignores snapshot when UID differs', async () => {
    const fakeUser = { uid: 'uidX' };
    authInstance.onAuthStateChanged.mockImplementation(cb => {
      authInstance.currentUser = fakeUser;
      cb(fakeUser);
      return jest.fn();
    });

    mockDoc.mockReturnValue('docRef');
    mockOnSnapshot.mockImplementation((ref, cb) => {
      cb({
        exists: true,
        id    : 'otherUid',
        data  : () => ({ name: 'Bob' }),
      });
      return jest.fn();
    });

    const { getByTestId } = render(
      <UserProvider>
        <Printer />
      </UserProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('out').props.children).toBe('null'),
    );
  });

  it('handles non-existent doc gracefully', async () => {
    const fakeUser = { uid: 'uidY' };
    authInstance.onAuthStateChanged.mockImplementation(cb => {
      authInstance.currentUser = fakeUser;
      cb(fakeUser);
      return jest.fn();
    });

    mockDoc.mockReturnValue('docRef');
    mockOnSnapshot.mockImplementation((ref, cb) => {
      cb({ exists: false });
      return jest.fn();
    });

    const { getByTestId } = render(
      <UserProvider>
        <Printer />
      </UserProvider>,
    );

    await waitFor(() =>
      expect(getByTestId('out').props.children).toBe('null'),
    );
  });
});
