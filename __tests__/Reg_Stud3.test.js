import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Reg_Stud3 from '../screens/register/Reg_Stud3';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

const createComponent = (email = 'test@studentai.lt') =>
  render(
    <Reg_Stud3
      route={{ params: { email } }}
      navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
    />
  );

describe('Reg_Stud3', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders inputs and buttons', () => {
    const { getByPlaceholderText, getByText } = createComponent();
    expect(getByPlaceholderText('Slaptažodis')).toBeTruthy();
    expect(getByPlaceholderText('Pakartok slaptažodį')).toBeTruthy();
    expect(getByText('Atgal')).toBeTruthy();
    expect(getByText('Toliau')).toBeTruthy();
  });

  it('disables "Toliau" button if passwords are too short', () => {
    const { getByTestId } = createComponent();
    const nextButton = getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('shows error if password is less than 6 characters', async () => {
    const { getByPlaceholderText, getByTestId, findByTestId } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Slaptažodis'), '123');
    fireEvent.changeText(getByPlaceholderText('Pakartok slaptažodį'), '123');
    fireEvent.press(getByTestId('next-button'));

    const error = await findByTestId('password-error');
    expect(error).toBeTruthy();
    expect(error.props.children).toBe('Slaptažodis turi būti bent 6 simbolių.');
  });


  it('shows error if passwords do not match', () => {
    const { getByPlaceholderText, getByTestId, queryByText } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Slaptažodis'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Pakartok slaptažodį'), 'password321');
    fireEvent.press(getByTestId('next-button'));

    expect(queryByText('Slaptažodžiai nesutampa.')).toBeTruthy();
  });

  it('navigates to next screen if passwords are valid and match', async () => {
    const { getByPlaceholderText, getByTestId } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Slaptažodis'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Pakartok slaptažodį'), 'password123');
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud4', {
        email: 'test@studentai.lt',
        password: 'password123',
      });
    });
  });

  it('navigates back when "Atgal" is pressed', () => {
    const { getByText } = createComponent();
    fireEvent.press(getByText('Atgal'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('clears error when user starts correcting password input', async () => {
    const { getByPlaceholderText, getByTestId, findByTestId, queryByTestId } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Slaptažodis'), '123');
    fireEvent.changeText(getByPlaceholderText('Pakartok slaptažodį'), '123');
    fireEvent.press(getByTestId('next-button'));

    const error = await findByTestId('password-error');
    expect(error).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Slaptažodis'), '123456');

    await waitFor(() => {
      expect(queryByTestId('password-error')).toBeNull();
    });
  });


  it('clears confirm password error when user corrects it', () => {
    const { getByPlaceholderText, getByTestId, queryByText } = createComponent();

    fireEvent.changeText(getByPlaceholderText('Slaptažodis'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Pakartok slaptažodį'), 'wrongpass');
    fireEvent.press(getByTestId('next-button'));

    expect(queryByText('Slaptažodžiai nesutampa.')).toBeTruthy();

    fireEvent.changeText(getByPlaceholderText('Pakartok slaptažodį'), 'password123');
    expect(queryByText('Slaptažodžiai nesutampa.')).toBeNull();
  });
});
