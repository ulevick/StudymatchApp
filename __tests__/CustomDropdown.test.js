import React from 'react';
import {
    render,
    fireEvent,
    waitFor,
} from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import CustomDropdown from '../components/CustomDropdown';

jest.mock('react-native-vector-icons/Ionicons', () => props => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{props.name}</Text>;
});

const ITEMS = [
    'Spausdintuvas',
    'Tylos / Poilsio zona',
    'Pigus pietūs / Mikrobangės',
];

const nthTouchable = (utils, idx) =>
    utils.UNSAFE_getAllByType(TouchableOpacity)[idx];

describe('CustomDropdown – full domain-specific coverage', () => {
    it('shows placeholder in gray when unselected', () => {
        const { getByText } = render(
            <CustomDropdown
                label="Pasirinkite vietą"
                data={ITEMS}
                selected={null}
                onSelect={() => {}}
            />,
        );

        const label = getByText('Pasirinkite vietą');
        const style = Array.isArray(label.props.style)
            ? Object.assign({}, ...label.props.style)
            : label.props.style;
        expect(style.color).toBe('#aaa');
    });

    it('opens, then closes via overlay without triggering onSelect', async () => {
        const onSelect = jest.fn();
        const utils = render(
            <CustomDropdown
                label="Pasirinkite"
                data={ITEMS}
                selected={null}
                onSelect={onSelect}
            />,
        );

        fireEvent.press(nthTouchable(utils, 0));
        expect(utils.getByText('Spausdintuvas')).toBeTruthy();

        fireEvent.press(nthTouchable(utils, 1));
        await waitFor(() => {
            expect(utils.queryByText('Spausdintuvas')).toBeNull();
        });
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('selects an item → onSelect fires and label turns black', async () => {
        let selected = null;
        let rerenderFn;

        const onSelect = jest.fn(item => {
            selected = item;
            rerenderFn(
                <CustomDropdown
                    label="Pasirinkite"
                    data={ITEMS}
                    selected={selected}
                    onSelect={onSelect}
                />,
            );
        });

        const utils = render(
            <CustomDropdown
                label="Pasirinkite"
                data={ITEMS}
                selected={selected}
                onSelect={onSelect}
            />,
        );
        rerenderFn = utils.rerender;
        fireEvent.press(nthTouchable(utils, 0));
        fireEvent.press(utils.getByText('Tylos / Poilsio zona'));
        expect(onSelect).toHaveBeenCalledWith('Tylos / Poilsio zona');

        await waitFor(() =>
            expect(utils.queryByText('Spausdintuvas')).toBeNull(),
        );
        const newLabel = utils.getByText('Tylos / Poilsio zona');
        const style = Array.isArray(newLabel.props.style)
            ? Object.assign({}, ...newLabel.props.style)
            : newLabel.props.style;
        expect(style.color).toBe('#000');
    });
});
