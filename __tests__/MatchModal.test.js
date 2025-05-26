// __tests__/MatchModal.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Image, TouchableOpacity } from 'react-native';
import MatchModal from '../components/MatchModal';

/* ─────────────────────────────────────────────
 *  M O C K S
 * ───────────────────────────────────────────── */
// 1️⃣  react-navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
}));

// 2️⃣  react-native-linear-gradient → plain View
jest.mock('react-native-linear-gradient', () => {
    const { View } = require('react-native');
    return View;
});


/* ─────────────────────────────────────────────
 *  T E S T  D A T A  &  R E N D E R  H E L P E R
 * ───────────────────────────────────────────── */
const matchedUser = {
    id: 'm-1',
    name: 'Jonas',
    photoURL: 'https://example.com/jonas.jpg',
};

const currentUser = {
    id: 'c-1',
    name: 'Aiste',
    photoURL: 'https://example.com/aiste.jpg',
};

const renderModal = (visible = true, onClose = jest.fn()) =>
    render(
        <MatchModal
            visible={visible}
            onClose={onClose}
            matchedUser={matchedUser}
            currentUser={currentUser}
        />,
    );

/* ─────────────────────────────────────────────
 *  T E S T S
 * ───────────────────────────────────────────── */
describe('MatchModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('is not rendered when `visible` is false', () => {
        const { queryByText } = renderModal(false);
        expect(queryByText(/match!/i)).toBeNull();
    });

    it('renders static text and both avatars when `visible`', () => {
        const { getByText, UNSAFE_getAllByType } = renderModal(true);

        // Static texts
        expect(getByText('Match! 🎉')).toBeTruthy();
        expect(
            getByText(`Tu ir ${matchedUser.name} susidomėjote vienas kitu. Parašyk žinutę!`),
        ).toBeTruthy();
        expect(getByText('Parašyti!')).toBeTruthy();

        // Avatar images
        const images = UNSAFE_getAllByType(Image);
        expect(images).toHaveLength(2);
        expect(images[0].props.source.uri).toBe(currentUser.photoURL);
        expect(images[1].props.source.uri).toBe(matchedUser.photoURL);
    });

    it('calls `onClose` when the overlay is pressed', () => {
        const onClose = jest.fn();
        const { UNSAFE_getAllByType } = renderModal(true, onClose);

        const touchables = UNSAFE_getAllByType(TouchableOpacity); // overlay + CTA
        fireEvent.press(touchables[0]); // overlay comes first
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('navigates correctly and closes the modal when CTA is pressed', async () => {
        const onClose = jest.fn();
        const { getByText } = renderModal(true, onClose);

        fireEvent.press(getByText('Parašyti!'));

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('WriteMessages', {
                receiverId: matchedUser.id,
                receiverName: matchedUser.name,
                receiverAvatar: matchedUser.photoURL,
            });
        });
    });
});
