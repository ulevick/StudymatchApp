import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Reg_Stud9 from '../screens/register/Reg_Stud9';

jest.mock('../components/BackgroundReg3_10', () => () => null);
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
    expect(getByText(/Study.*match/)).toBeTruthy();
    expect(getByText('Pomėgiai')).toBeTruthy();
    expect(getByText('Sport')).toBeTruthy();
    expect(getByText('Music')).toBeTruthy();
    expect(getByText('Football')).toBeTruthy();
    expect(getByText('Basketball')).toBeTruthy();
    expect(getByText('Rock')).toBeTruthy();
    expect(getByText('Jazz')).toBeTruthy();
    expect(getByText('Atgal')).toBeTruthy();
    expect(getByText('Toliau (0/2)')).toBeTruthy();
    const nextBtn = getByTestId('next-button');
    expect(nextBtn).toBeDisabled();
  });

  it('toggles chip selection and updates Next button label & enabled state', () => {
    const { getByText, getByTestId } = renderScreen();
    const nextBtn = getByTestId('next-button');
    expect(getByText('Toliau (0/2)')).toBeTruthy();
    expect(nextBtn).toBeDisabled();
    fireEvent.press(getByText('Football'));
    expect(getByText('Toliau (1/2)')).toBeTruthy();
    expect(nextBtn).not.toBeDisabled();
    fireEvent.press(getByText('Rock'));
    expect(getByText('Toliau (2/2)')).toBeTruthy();
    expect(nextBtn).not.toBeDisabled();
    fireEvent.press(getByText('Football'));
    expect(getByText('Toliau (1/2)')).toBeTruthy();
    expect(nextBtn).not.toBeDisabled();
    fireEvent.press(getByText('Rock'));
    expect(getByText('Toliau (0/2)')).toBeTruthy();
    expect(nextBtn).toBeDisabled();
  });

  it('navigates to Reg_Stud10 with selected preferences on Next', () => {
    const { getByText, getByTestId } = renderScreen();
    fireEvent.press(getByText('Basketball'));
    fireEvent.press(getByText('Jazz'));
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
