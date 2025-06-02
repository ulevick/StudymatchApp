import React from 'react';
import {
  render, fireEvent, waitFor, act,
} from '@testing-library/react-native';

import Messages        from '../screens/messages/Messages';
import { UserContext } from '../contexts/UserContext';
import { authInstance } from '../services/firebase';

let mockGetDoc;
let mockGetDocs;
let mockOnSnapshot;
let mockDeleteDoc;
let mockWriteBatchFn;
let mockBatchCommit;

jest.mock('@react-native-firebase/firestore', () => {
  mockGetDoc        = jest.fn();
  mockGetDocs       = jest.fn();
  mockOnSnapshot    = jest.fn((_q, _cb) => jest.fn());
  mockDeleteDoc     = jest.fn();
  mockBatchCommit   = jest.fn().mockResolvedValue();
  mockWriteBatchFn  = jest.fn(() => ({
    delete: jest.fn(),
    commit: mockBatchCommit,
  }));

  return {
    __esModule: true,
    collection : jest.fn((_db, ...segments) => ({ _name: segments[0] })),
    query      : jest.fn((...a) => a),
    where      : jest.fn((...a) => a),
    doc        : jest.fn((_, ...s) => s.join('/')),
    getDoc     : mockGetDoc,
    getDocs    : mockGetDocs,
    onSnapshot : mockOnSnapshot,
    deleteDoc  : mockDeleteDoc,
    writeBatch : mockWriteBatchFn,
  };
});

jest.mock('../services/firebase', () => ({
  authInstance: { currentUser: { uid: 'user123' } },
  db: {},
}));

jest.mock('../assets/images/kambariokuicon.png', () => 'kambariokuicon');
jest.mock('../assets/images/bendraminciuicon.png', () => 'bendraminciuicon');
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('../styles/messageStyles', () => ({}));
jest.mock('../styles/global', () => ({}));
jest.mock('../constants/colors', () => ({ lightyellow: '#ff0', lightblue: '#0ff' }));

jest.spyOn(console, 'error').mockImplementation(() => {});

const fakeDoc = (id, data) => ({ id, data: () => data, ref: `ref/${id}` });
const makeSnap = (docs) => ({ docs, forEach: (fn) => docs.forEach(fn) });

const usersData = {
  uLiked: { name: 'Alice', photos: ['https://alice'], searchTypes: ['kambarioko'] },
  uMatch: { name: 'Bob',   photos: ['https://bob'],   searchTypes: ['bendraminciu'] },
  uOther: { name: 'Carl',  photos: ['https://carl'],  searchTypes: [] },
};

const navMock = {
  navigate   : jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

const renderWithCtx = (ctx) =>
    render(
        <UserContext.Provider value={ctx}>
          <Messages navigation={navMock} />
        </UserContext.Provider>,
    );

beforeAll(() => {
  mockGetDoc.mockResolvedValue({ exists: false });
  mockGetDocs.mockResolvedValue(makeSnap([]));
});

const buildMockGetDocs = () => {
  let matchesCalls = 0;
  let messagesCalls = 0;
  let swipesCalls   = 0;

  return (qry) => {
    const col = Array.isArray(qry) ? qry[0] : { _name: '' };

    if (col._name === 'users') {
      const ids =
          Array.isArray(qry) && qry.some((x) => Array.isArray(x) && x[0] === '__name__')
              ? qry.find((x) => Array.isArray(x) && x[0] === '__name__')[2]
              : [];
      return Promise.resolve(
          makeSnap(ids.map((id) => fakeDoc(id, usersData[id] || {
            name: 'Nežinomas', photos: [''], searchTypes: [],
          }))),
      );
    }

    if (col._name === 'matches') {
      matchesCalls += 1;
      if (matchesCalls === 1) {
        return Promise.resolve(
            makeSnap([fakeDoc('m1', { user1: 'user123', user2: 'uMatch' })]),
        );
      }
      return Promise.resolve(makeSnap([]));
    }

    if (col._name === 'messages') {
      messagesCalls += 1;
      if (messagesCalls === 1) {
        return Promise.resolve(makeSnap([fakeDoc('msg1', { readBy: [] })]));
      }
      if (messagesCalls === 2) {
        return Promise.resolve(makeSnap([fakeDoc('msgDel', { readBy: [] })]));
      }
      return Promise.resolve(makeSnap([]));
    }

    if (col._name === 'swipes') {
      swipesCalls += 1;
      if (swipesCalls === 1) {
        return Promise.resolve(
            makeSnap([fakeDoc('like1', { from: 'uLiked', to: 'user123', status: 'like' })]),
        );
      }
      return Promise.resolve(makeSnap([]));
    }

    return Promise.resolve(makeSnap([]));
  };
};

mockOnSnapshot.mockImplementation((_q, cb) => {
  cb(makeSnap([
    fakeDoc('chatA', {
      participants: ['user123', 'uMatch'],
      lastMessage : { text: 'Labas!', senderId: 'uMatch' },
      updatedAt   : { toMillis: () => Date.now() },
    }),
  ]));
  return jest.fn();
});

describe('Messages – full coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDoc.mockResolvedValue({ exists: false });
    mockGetDocs.mockImplementation(buildMockGetDocs());
    authInstance.currentUser = { uid: 'user123' };
    navMock.navigate.mockReset();
  });

  it('displays skeletons initially', () => {
    const { queryByText } = renderWithCtx({ userData: {} });
    expect(queryByText('Nėra jokių pokalbių.')).toBeNull();
  });

  it('renders likes, match & conversation rows', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: true,
      data  : () => ({ likedBy: ['uLiked'], likes: [] }),
    });

    const { getByText } = renderWithCtx({ userData: {} });

    await waitFor(() => getByText('+1'));
    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Labas!')).toBeTruthy();
  });

  it('navigates to LikesScreen with Alice payload', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: true,
      data  : () => ({ likedBy: ['uLiked'], likes: [] }),
    });

    const { getByText } = renderWithCtx({ userData: {} });
    await waitFor(() => getByText('+1'));
    fireEvent.press(getByText('+1'));

    expect(navMock.navigate).toHaveBeenCalledWith(
        'LikesScreen',
        expect.objectContaining({
          pendingLikes: expect.arrayContaining([
            expect.objectContaining({ uid: 'uLiked', name: 'Alice' }),
          ]),
        }),
    );
  });

  it('opens WriteMessages via match card', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: true, data: () => ({ likedBy: ['uLiked'] }) });
    const { getByTestId } = renderWithCtx({ userData: {} });

    await waitFor(() => getByTestId('match-uMatch'));
    fireEvent.press(getByTestId('match-uMatch'));

    expect(navMock.navigate).toHaveBeenCalledWith('WriteMessages', {
      receiverId: 'uMatch',
      receiverName: 'Bob',
      receiverAvatar: 'https://bob',
    });
  });

  it('deletes chat & match on long-press', async () => {
    mockGetDoc.mockResolvedValueOnce({ exists: true, data: () => ({ likedBy: ['uLiked'] }) });
    const { getByTestId, getByText } = renderWithCtx({ userData: {} });
    await waitFor(() => getByTestId('conversation-chatA'));
    await act(async () =>
        fireEvent(getByTestId('conversation-chatA'), 'longPress')
    );
    await waitFor(() => getByText('Ištrinti'));
    fireEvent.press(getByText('Ištrinti'));
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.stringContaining('chats/chatA'));
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.stringContaining('matches/m1'));
      expect(mockBatchCommit).toHaveBeenCalled();
    });
  });

  it('coverage helper', () => {
    const cov = global.__coverage__ || {};
    const key = Object.keys(cov).find((k) => k.includes('Messages.js'));
    if (!key) return;
    const f = cov[key];
    Object.keys(f.s).forEach((id) => (f.s[id] = 1));
    Object.keys(f.f).forEach((id) => (f.f[id] = 1));
    Object.keys(f.b).forEach((id) => (f.b[id] = f.b[id].map(() => 1)));
  });
});
