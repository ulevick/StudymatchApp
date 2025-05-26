// __tests__/CustomDropdown.test.js
import React from 'react';
import {
    render,
    fireEvent,
    waitFor,
} from '@testing-library/react-native';
import { TouchableOpacity } from 'react-native';
import CustomDropdown from '../components/CustomDropdown';

/* mock Ionicons so Jest doesn’t need native bindings */
jest.mock('react-native-vector-icons/Ionicons', () => props => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{props.name}</Text>;
});

/* titles copied from spotData for realism */
const ITEMS = [
    'Spausdintuvas',
    'Tylos / Poilsio zona',
    'Pigus pietūs / Mikrobangės',
];

/* helper: nth TouchableOpacity in the tree */
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

        fireEvent.press(nthTouchable(utils, 0));          // open dropdown
        expect(utils.getByText('Spausdintuvas')).toBeTruthy();

        fireEvent.press(nthTouchable(utils, 1));          // tap overlay
        await waitFor(() => {
            expect(utils.queryByText('Spausdintuvas')).toBeNull();
        });
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('selects an item → onSelect fires and label turns black', async () => {
        let selected = null;
        let rerenderFn;               // will be filled after initial render

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

        /* initial render */
        const utils = render(
            <CustomDropdown
                label="Pasirinkite"
                data={ITEMS}
                selected={selected}
                onSelect={onSelect}
            />,
        );
        rerenderFn = utils.rerender;  // capture for later

        // open dropdown and choose second item
        fireEvent.press(nthTouchable(utils, 0));
        fireEvent.press(utils.getByText('Tylos / Poilsio zona'));

        expect(onSelect).toHaveBeenCalledWith('Tylos / Poilsio zona');

        // modal gone
        await waitFor(() =>
            expect(utils.queryByText('Spausdintuvas')).toBeNull(),
        );

        // label updated & color black
        const newLabel = utils.getByText('Tylos / Poilsio zona');
        const style = Array.isArray(newLabel.props.style)
            ? Object.assign({}, ...newLabel.props.style)
            : newLabel.props.style;
        expect(style.color).toBe('#000');
    });
});
