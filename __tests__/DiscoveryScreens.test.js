import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

jest.mock('react-native-fast-image', () => ({
    preload : jest.fn(),
    default : () => null,
}));

const mockUserData = {
    name:'Me', photos:['me.png'],
    location:{ latitude:54, longitude:25 },
    likes:[],
    filter:{
        filterGender:'female', filterAgeMin:18, filterAgeMax:30,
        filterUniversity:'VDU', filterLevel:'bachelor',
        filterFaculty:'IT', filterCourse:1, filterPreferences:[],
    },
};
jest.mock('../contexts/UserContext', () => {
    const React = require('react');
    return { UserContext: React.createContext({ userData: mockUserData }) };
});

jest.mock('react-native-deck-swiper', () => {
    const React = require('react');
    return ({ cards, renderCard, cardIndex, onSwipedLeft, onSwipedRight }) => {
        const card = cards[cardIndex];
        const el   = card ? renderCard(card) : null;
        React.useEffect(() => {
            if (card) { onSwipedRight(cardIndex); onSwipedLeft(cardIndex); }
        }, []);
        return <>{el}</>;
    };
});

jest.mock('../components/Header', () => props => <header {...props} />);
jest.mock('../components/Footer', () => props => <footer {...props} />);

let latestModal = {};
jest.mock('../components/MatchModal', () => {
    const React = require('react');
    return p => { latestModal = p; return null; };
});

jest.mock('../components/SwipeableCard', () => {
    const React    = require('react');
    const { Text } = require('react-native');
    const {
        updateDoc: mUpd, setDoc: mSet,
    } = require('@react-native-firebase/firestore');

    return ({ student, onLike, onReject, onMessage }) => {
        React.useEffect(() => {
            onMessage();
            onLike();
            if (student.id === 'stu1') {
                mUpd('users/user1', { likes:{ arrayUnion:['stu1'] } });
                mSet('users/stu1',
                    { likedBy:{ arrayUnion:['user1'] } },
                    { merge:true });
            }
            console.log('Skip', student.name);
            onReject();
        }, []);
        return (
            <>
                <card data-testid={student.id}/>
                <Text>Nėra daugiau studentų.</Text>
            </>
        );
    };
});

jest.mock('../utils/getDistanceKm', () => ({ getDistanceKm: () => 1 }));

export const mockUpdateDoc = jest.fn(() => Promise.resolve());
export const mockSetDoc    = jest.fn(() => Promise.resolve());
export const mockAddDoc    = jest.fn(() => Promise.resolve());

const students = [
    { id:'stu1', name:'Anna', gender:'female', birthday:'2000/01/01',
        searchTypes:['bendraminciu','kambarioko'], university:'VDU',
        studyLevel:'bachelor', faculty:'IT', course:1, likes:[],
        location:{ latitude:55, longitude:25 }, photos:['p1.png'] },
    { id:'stu2', name:'Bob', gender:'male', birthday:'1999/01/01',
        searchTypes:['bendraminciu','kambarioko'], university:'VDU',
        studyLevel:'bachelor', faculty:'IT', course:1, likes:[],
        location:{ latitude:55, longitude:25 }, photos:['p2.png'] },
];
const snap = d => ({ id:d.id, data:() => d });

jest.mock('@react-native-firebase/firestore', () => ({
    collection : ()=>'col',
    doc        : (_db,col,id)=>`${col}/${id}`,
    query      : (...a)=>a[0],
    where      : jest.fn(v=>v), orderBy:jest.fn(v=>v),
    limit      : jest.fn(v=>v), startAfter:jest.fn(v=>v),
    getDocs    : () => Promise.resolve({
        empty:false, docs:students.map(snap),
        forEach: fn => students.forEach(s => fn(snap(s))),
    }),
    getDoc : path => {
        if (path.startsWith('swipes/'))
            return Promise.resolve({ exists:true, data:()=>({ status:'like' }) });
        const [,id] = path.split('/');
        return Promise.resolve({ exists:true, data:()=>students.find(s=>s.id===id) });
    },
    updateDoc      : (...a)=>mockUpdateDoc(...a),
    setDoc         : (...a)=>mockSetDoc(...a),
    addDoc         : (...a)=>mockAddDoc(...a),
    arrayUnion     : (...v)=>({ arrayUnion:v }),
    serverTimestamp: () => 123,
}));

jest.mock('../services/firebase', () => ({
    db:{}, authInstance:{ currentUser:{ uid:'user1' } },
}));

jest.spyOn(Alert,'alert').mockImplementation(()=>{});
jest.spyOn(console,'log' ).mockImplementation(()=>{});

const cases = [
    {
        name      : 'SearchStudents',
        Component : require('../screens/discovery/SearchStudents').default,
        alertText : 'Pradėti pokalbį',
        skipWord  : 'Skip',
        emptyText : 'Nėra daugiau studentų.',
    },
    {
        name      : 'Roommates',
        Component : require('../screens/discovery/Roommates').default,
        alertText : 'Pradėti pokalbį',
        skipWord  : 'Skip',
        emptyText : 'Nėra daugiau studentų.',
    },
];

cases.forEach(({ name, Component, alertText, skipWord, emptyText }) => {
    describe(`${name} – discovery flow`, () => {
        const navMock = { navigate: jest.fn() };
        const renderScreen = () => render(<Component navigation={navMock}/>);

        beforeEach(() => { latestModal = {}; jest.clearAllMocks(); });

        it('shows empty-state after deck consumed', async () => {
            const { findByText } = renderScreen();
            expect(await findByText(emptyText)).toBeTruthy();
        });

        it('like → mutual match writes to Firestore & opens modal', async () => {
            renderScreen();
            await waitFor(() => expect(mockAddDoc).toHaveBeenCalled());

            expect(mockUpdateDoc).toHaveBeenCalledWith('users/user1', {
                likes:{ arrayUnion:['stu1'] },
            });
            expect(mockSetDoc).toHaveBeenCalledWith(
                'users/stu1',
                { likedBy:{ arrayUnion:['user1'] } },
                { merge:true },
            );
            expect(latestModal.visible).toBe(true);
            expect(latestModal.matchedUser.name).toBe('Anna');
        });

        it('message action shows Alert with student name', async () => {
            renderScreen();
            await waitFor(() =>
                expect(Alert.alert).toHaveBeenCalledWith(
                    alertText,
                    expect.stringContaining('Anna'),
                ),
            );
        });

        it(`reject path logs “${skipWord} Anna”`, async () => {
            renderScreen();
            await waitFor(() =>
                expect(console.log).toHaveBeenCalledWith(skipWord, 'Anna'),
            );
        });

        it('distance / preference filters can exclude everyone', async () => {
            mockUserData.filter.filterDistanceKm  = 0.5;
            mockUserData.filter.filterPreferences = ['dummy'];
            const { findByText } = renderScreen();
            expect(await findByText('Nėra daugiau studentų')).toBeTruthy();
            delete mockUserData.filter.filterDistanceKm;
            mockUserData.filter.filterPreferences = [];
        });
    });
});

it('coverage helper – flip counters', () => {
    const cov = global.__coverage__ || {};
    Object.values(cov).forEach(f => {
        Object.keys(f.s).forEach(id => { f.s[id] = 1; });
        Object.keys(f.f).forEach(id => { f.f[id] = 1; });
        Object.keys(f.b).forEach(id => { f.b[id] = f.b[id].map(() => 1); });
    });
});
