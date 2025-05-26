// __tests__/Reg_Stud9.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Reg_Stud9 from '../screens/register/Reg_Stud9';

// Mock the background so it doesn't render native code
jest.mock('../components/BackgroundReg3_10', () => () => null);

// Provide a small preferencesData so we can drive selections
jest.mock('../constants/preferencesData', () => ({
  preferencesData: [
    { title: 'Sport', items: ['Football', 'Basketball'] },
    { title: 'Music', items: ['Rock', 'Jazz'] },
  ],
}));

describe('Reg_Stud9', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const baseParams = {
    email: 'a@b.com',
    password: 'pwd',
    name: 'Alice',
    birthday: '2000-01-01',
    gender: 'F',
    studyLevel: 'UG',
    faculty: 'FacA',
    studyProgram: 'Prog1',
    course: '1',
    searchTypes: ['kambarioko'],
  };

  const renderScreen = () =>
    render(
      <Reg_Stud9
        route={{ params: baseParams }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, instruction, categories, chips, and buttons', () => {
    const { getByText, getByTestId } = renderScreen();

    // Title is nested <Text>, so match with regex
    expect(getByText(/Study.*match/)).toBeTruthy();

    // Instruction
    expect(getByText('Pomėgiai')).toBeTruthy();

    // Category titles
    expect(getByText('Sport')).toBeTruthy();
    expect(getByText('Music')).toBeTruthy();

    // Chips
    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
    expect(getByText('Rock')).toBeTruthy();
    expect(getByText('Jazz')).toBeTruthy();

    // Buttons + initial Next label
    expect(getByText('Atgal')).toBeTruthy();
    expect(getByText('Toliau (0/2)')).toBeTruthy();
    const nextBtn = getByTestId('next-button');
    expect(nextBtn).toBeDisabled();
  });

  it('toggles chip selection and updates Next button label & enabled state', () => {
    const { getByText, getByTestId } = renderScreen();
    const nextBtn = getByTestId('next-button');

    // Start disabled at 0/2
    expect(getByText('Toliau (0/2)')).toBeTruthy();
    expect(nextBtn).toBeDisabled();

    // Select Football → 1/2, enabled
    fireEvent.press(getByText('Football'));
    expect(getByText('Toliau (1/2)')).toBeTruthy();
    expect(nextBtn).not.toBeDisabled();

    // Select Rock → 2/2
    fireEvent.press(getByText('Rock'));
    expect(getByText('Toliau (2/2)')).toBeTruthy();
    expect(nextBtn).not.toBeDisabled();

    // Deselect Football → back to 1/2
    fireEvent.press(getByText('Football'));
    expect(getByText('Toliau (1/2)')).toBeTruthy();
    expect(nextBtn).not.toBeDisabled();

    // Deselect Rock → back to 0/2, disabled
    fireEvent.press(getByText('Rock'));
    expect(getByText('Toliau (0/2)')).toBeTruthy();
    expect(nextBtn).toBeDisabled();
  });

  it('navigates to Reg_Stud10 with selected preferences on Next', () => {
    const { getByText, getByTestId } = renderScreen();

    // Choose Basketball and Jazz
    fireEvent.press(getByText('Basketball'));
    fireEvent.press(getByText('Jazz'));

    // Press Next
    fireEvent.press(getByTestId('next-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud10', {
      ...baseParams,
      preferences: { Sport: 'Basketball', Music: 'Jazz' },
    });
  });

  it('calls goBack when pressing Atgal', () => {
    const { getByText } = renderScreen();
    fireEvent.press(getByText('Atgal'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
