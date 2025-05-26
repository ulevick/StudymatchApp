import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Reg_Stud4 from '../screens/register/Reg_Stud4';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const defaultRouteParams = {
  email: 'test@studentai.lt',
  password: 'password123',
};

const createComponent = (params = defaultRouteParams) =>
  render(
    <Reg_Stud4
      route={{ params }}
      navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
    />
  );

describe('Reg_Stud4', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders instruction, input, notes, and buttons', () => {
    const { getByText, getByPlaceholderText } = createComponent();

    expect(getByText('Koks tavo vardas?')).toBeTruthy();
    expect(getByPlaceholderText('Įrašyk savo vardą')).toBeTruthy();
    expect(getByText('Vėliau jo pakeisti nebus galima.')).toBeTruthy();
    expect(getByText('Atgal')).toBeTruthy();
    expect(getByText('Toliau')).toBeTruthy();
  });

  it('disables "Toliau" button when name is empty or only whitespace', () => {
    const { getByTestId, getByPlaceholderText } = createComponent();
    const nextButton = getByTestId('next-button');

    // Initially disabled
    expect(nextButton).toBeDisabled();

    // Enter only whitespace
    fireEvent.changeText(getByPlaceholderText('Įrašyk savo vardą'), '   ');
    expect(nextButton).toBeDisabled();
  });

  it('enables "Toliau" button when a valid name is entered', () => {
    const { getByTestId, getByPlaceholderText } = createComponent();
    const nextButton = getByTestId('next-button');

    fireEvent.changeText(getByPlaceholderText('Įrašyk savo vardą'), 'Jonas');
    expect(nextButton).not.toBeDisabled();

    // Leading/trailing whitespace should be trimmed
    fireEvent.changeText(getByPlaceholderText('Įrašyk savo vardą'), '  Ona  ');
    expect(nextButton).not.toBeDisabled();
  });

  it('navigates to Reg_Stud5 with trimmed name when pressing "Toliau"', async () => {
    const { getByTestId, getByPlaceholderText } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Įrašyk savo vardą'), '  Vytautas  ');
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud5', {
        email: defaultRouteParams.email,
        password: defaultRouteParams.password,
        name: 'Vytautas',
      });
    });
  });

  it('does not navigate when name is empty after trimming', async () => {
    const { getByTestId, getByPlaceholderText } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Įrašyk savo vardą'), '   ');
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('calls goBack when pressing "Atgal"', () => {
    const { getByText } = createComponent();
    fireEvent.press(getByText('Atgal'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
