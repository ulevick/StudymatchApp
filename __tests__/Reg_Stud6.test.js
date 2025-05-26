import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Reg_Stud6 from '../screens/register/Reg_Stud6';
import { GENDER_FEMALE, GENDER_MALE } from '../constants/gender';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const defaultRouteParams = {
  email: 'test@studentai.lt',
  password: 'password123',
  name: 'Jonas',
  birthday: '1990/01/01',
};

const createComponent = (params = defaultRouteParams) =>
  render(
    <Reg_Stud6
      route={{ params }}
      navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
    />
  );

describe('Reg_Stud6', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders instruction, gender options, and buttons', () => {
    const { getByText, getByPlaceholderText } = createComponent();

    // Instruction
    expect(getByText('Kokia tavo lytis?')).toBeTruthy();
    // Options
    expect(getByText('Moteris')).toBeTruthy();
    expect(getByText('Vyras')).toBeTruthy();
    // Buttons
    expect(getByText('Atgal')).toBeTruthy();
    expect(getByText('Toliau')).toBeTruthy();
  });

  it('disables "Toliau" button before selecting gender', () => {
    const { getByTestId } = createComponent();
    const nextButton = getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('enables "Toliau" button when a gender is selected', () => {
    const { getByText, getByTestId } = createComponent();
    const femaleOption = getByText('Moteris');
    const nextButton = getByTestId('next-button');

    fireEvent.press(femaleOption);
    expect(nextButton).not.toBeDisabled();

    // Selecting male also enables
    fireEvent.press(getByText('Vyras'));
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates to Reg_Stud7 with selected gender on next press', () => {
    const { getByText, getByTestId } = createComponent();
    const maleOption = getByText('Vyras');

    fireEvent.press(maleOption);
    fireEvent.press(getByTestId('next-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud7', {
      email: defaultRouteParams.email,
      password: defaultRouteParams.password,
      name: defaultRouteParams.name,
      birthday: defaultRouteParams.birthday,
      gender: GENDER_MALE,
    });
  });

  it('calls goBack when pressing "Atgal"', () => {
    const { getByText } = createComponent();
    fireEvent.press(getByText('Atgal'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
