import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Image } from 'react-native';
import MainScreen from '../screens/MainScreen';

// Mock out PeopleBackground so we can detect its render
jest.mock('../components/PeopleBackground', () => jest.fn(() => null));
// Stub the hat image require
jest.mock('../assets/images/hat.png', () => 123);

describe('MainScreen', () => {
  const mockNavigate = jest.fn();
  const navigation = { navigate: mockNavigate };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title including both "Study" and styled "match"', () => {
    const { getByText } = render(<MainScreen navigation={navigation} />);
    expect(getByText(/Study/)).toBeTruthy();
    expect(getByText('match')).toBeTruthy();
  });

  it('renders the subtitle copy', () => {
    const { getByText } = render(<MainScreen navigation={navigation} />);
    expect(
      getByText(
        'Pradėk studijas su naujomis pažintimis – rask draugų, kambariokų ir bendrystę nuo pirmos dienos!'
      )
    ).toBeTruthy();
  });

  it('renders the hat image with the correct stubbed source', () => {
    const { getByTestId } = render(<MainScreen navigation={navigation} />);
    const img = getByTestId('hat-image');
    expect(img.props.source).toEqual(123);
    expect(img.props.style).toBeDefined();
  });

  it('renders and calls PeopleBackground exactly once', () => {
    const PeopleBackground = require('../components/PeopleBackground');
    render(<MainScreen navigation={navigation} />);
    expect(PeopleBackground).toHaveBeenCalledTimes(1);
  });

  it('navigates to "SignIn" when the "Prisijungti" button is pressed', () => {
    const { getByText } = render(<MainScreen navigation={navigation} />);
    fireEvent.press(getByText('Prisijungti'));
    expect(mockNavigate).toHaveBeenCalledWith('SignIn');
  });

  it('navigates to "Reg_Stud1" when the "Registruotis" button is pressed', () => {
    const { getByText } = render(<MainScreen navigation={navigation} />);
    fireEvent.press(getByText('Registruotis'));
    expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud1');
  });
});
