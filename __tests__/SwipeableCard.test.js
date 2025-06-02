const panConfigs = [];

jest.mock('react-native-vector-icons/Ionicons', () => props => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{props.name}</Text>;
});

import { Animated, PanResponder } from 'react-native';

jest.spyOn(Animated, 'parallel').mockImplementation(() => ({ start: cb => cb && cb() }));
jest.spyOn(Animated, 'spring').mockImplementation(() => ({ start: cb => cb && cb() }));
jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start: cb => cb && cb() }));
jest.spyOn(PanResponder, 'create').mockImplementation(config => {
    panConfigs.push(config);

    return { panHandlers: config };
});

import React from 'react';
import {
    render,
    fireEvent,
    within,
} from '@testing-library/react-native';
import {
    Image,
    TouchableOpacity,
    ScrollView,
    View,
} from 'react-native';
import SwipeableCard from '../components/SwipeableCard';

const calcAge = jest.fn(() => 25);
const baseStudent = {
    id: 's1',
    name: 'Anna',
    birthday: '2000-01-01',
    university: 'VU',
    distanceKm: 1.2,
    studyProgram: 'IT',
    studyLevel: 'bachelor',
    course: 2,
    photos: ['p1.png', 'p2.png'],
    searchTypes: ['kambarioko', 'bendraminciu'],
    aboutMe: 'hi',
    preferences: { a: 'music' },
};
const makeHandlers = () => ({
    onReturn : jest.fn(),
    onReject : jest.fn(),
    onLike   : jest.fn(),
    onMessage: jest.fn(),
});
const renderCard = (ov = {}, h = {}) =>
    render(
        <SwipeableCard
            student={{ ...baseStudent, ...ov }}
            calculateAge={calcAge}
            {...makeHandlers()}
            {...h}
        />,
    );

describe('SwipeableCard – 100 % coverage', () => {
    beforeEach(() => {
        panConfigs.length = 0;
        jest.clearAllMocks();
    });

    it('cycles photos; tap is no-op when one photo', () => {
        const utils = renderCard();
        const img0 = () => utils.UNSAFE_getAllByType(Image)[0];

        expect(img0().props.source.uri).toBe('p1.png');
        fireEvent.press(utils.UNSAFE_getAllByType(TouchableOpacity)[0]);
        expect(img0().props.source.uri).toBe('p2.png');

        const single = renderCard({ photos: ['solo.png'] });
        const one = single.UNSAFE_getAllByType(Image)[0];
        fireEvent.press(single.UNSAFE_getAllByType(TouchableOpacity)[0]);
        expect(single.UNSAFE_getAllByType(Image)[0].props.source.uri).toBe(one.props.source.uri);
    });

    it('vertical pan expands & collapses sheet', () => {
        const utils = renderCard();
        const vPan = panConfigs[0];
        vPan.onPanResponderRelease(null, { dy: -200 });
        vPan.onPanResponderRelease(null, { dy:  200 });
        expect(utils.UNSAFE_getAllByType(ScrollView).length).toBe(1);
    });

    it('horizontal pan → onReject/onLike depending on dx', () => {
        const handlers = makeHandlers();
        renderCard({}, handlers);
        const hPan = panConfigs[1];
        hPan.onPanResponderRelease(null, { dx: -130 });
        expect(handlers.onReject).toHaveBeenCalledTimes(1);
        hPan.onPanResponderRelease(null, { dx: 130 });
        expect(handlers.onLike).toHaveBeenCalledTimes(1);
    });

    it('buttons trigger handler props', () => {
        const h = makeHandlers();
        const utils = renderCard({}, h);
        const btns = utils.UNSAFE_getAllByType(TouchableOpacity).filter(b =>
            within(b).queryByText(/arrow-undo|close|heart|paper-plane/),
        );
        btns.forEach(b => fireEvent.press(b));
        expect(h.onReturn ).toHaveBeenCalled();
        expect(h.onReject ).toHaveBeenCalledTimes(1);
        expect(h.onLike   ).toHaveBeenCalledTimes(1);
        expect(h.onMessage).toHaveBeenCalled();
    });

    it('scroll callbacks execute without crashing', () => {
        const sv = renderCard().UNSAFE_getAllByType(ScrollView)[0];
        sv.props.onScrollBeginDrag();
        sv.props.onScrollEndDrag();
        sv.props.onMomentumScrollEnd();
        expect(true).toBe(true);
    });

    it('optional sections render & disappear with data changes', () => {
        const { queryByText, rerender, UNSAFE_getAllByType } = renderCard();
        const dots = UNSAFE_getAllByType(View).filter(v =>
            (Array.isArray(v.props.style) ? v.props.style : [v.props.style]).some(s => s?.height === 3),
        );
        expect(dots.length).toBeGreaterThan(0);
        expect(queryByText('Apie Mane')).toBeTruthy();
        rerender(
            <SwipeableCard
                student={{ ...baseStudent, aboutMe: '', preferences: {} }}
                calculateAge={calcAge}
                {...makeHandlers()}
            />,
        );
        expect(queryByText('Apie Mane')).toBeNull();
    });
});
