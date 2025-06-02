import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Reg_Stud8 from '../screens/register/Reg_Stud8';

jest.mock('../components/BackgroundReg3_10', () => () => null);
describe('Reg_Stud8', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const baseParams = {
    email: 'foo@uni.lt',
    password: 'secret',
    name: 'Alice',
    birthday: '2000-01-01',
    gender: 'F',
    studyLevel: 'UG',
    faculty: 'FacultyA',
    studyProgram: 'Program1',
    course: '1',
  };

  const renderScreen = () =>
    render(
      <Reg_Stud8
        route={{ params: baseParams }}
        navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, instruction, both options, and buttons', () => {
    const { getByText, getByTestId } = renderScreen();
    expect(getByText(/Study.*match/)).toBeTruthy();
    expect(getByText('Ko ieškai?')).toBeTruthy();
    expect(getByText('Kambarioko')).toBeTruthy();
    expect(getByText('Bendraminčių')).toBeTruthy();
    expect(getByText('Atgal')).toBeTruthy();
    const nextBtn = getByTestId('next-button');
    expect(nextBtn).toBeTruthy();
    expect(nextBtn).toBeDisabled();
  });

  it('enables Next button when at least one option is selected', () => {
    const { getByText, getByTestId } = renderScreen();
    const nextBtn = getByTestId('next-button');
    expect(nextBtn).toBeDisabled();
    fireEvent.press(getByText('Kambarioko'));
    expect(nextBtn).not.toBeDisabled();
    fireEvent.press(getByText('Kambarioko'));
    expect(nextBtn).toBeDisabled();
    fireEvent.press(getByText('Kambarioko'));
    fireEvent.press(getByText('Bendraminčių'));
    expect(nextBtn).not.toBeDisabled();
  });

  it('navigates to Reg_Stud9 with correct params when Next is pressed', () => {
    const { getByText, getByTestId } = renderScreen();
    fireEvent.press(getByText('Kambarioko'));
    fireEvent.press(getByText('Bendraminčių'));
    fireEvent.press(getByTestId('next-button'));
    expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud9', {
      ...baseParams,
      searchTypes: ['kambarioko', 'bendraminciu'],
    });
  });

  it('calls goBack when Back button is pressed', () => {
    const { getByText } = renderScreen();
    fireEvent.press(getByText('Atgal'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
