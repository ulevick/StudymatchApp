import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Reg_Stud5 from '../screens/register/Reg_Stud5';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const defaultRouteParams = {
  email: 'test@studentai.lt',
  password: 'password123',
  name: 'Jonas',
};
const createComponent = (params = defaultRouteParams) =>
  render(
    <Reg_Stud5
      route={{ params }}
      navigation={{ navigate: mockNavigate, goBack: mockGoBack }}
    />
  );

describe('Reg_Stud5', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders instruction, input, notes, and buttons', () => {
    const { getByText, getByPlaceholderText } = createComponent();
    expect(getByText('Tavo gimimo diena?')).toBeTruthy();
    expect(getByPlaceholderText('YYYY/MM/DD')).toBeTruthy();
    expect(
      getByText(
        'Tavo profilyje bus rodomas tik amžius. Vėliau jo pakeisti nebus galima.'
      )
    ).toBeTruthy();
    expect(getByText('Atgal')).toBeTruthy();
    expect(getByText('Toliau')).toBeTruthy();
  });

  it('disables "Toliau" button when birthdate is empty or whitespace', () => {
    const { getByTestId, getByPlaceholderText } = createComponent();
    const nextButton = getByTestId('next-button');
    expect(nextButton).toBeDisabled();
    fireEvent.changeText(getByPlaceholderText('YYYY/MM/DD'), '   ');
    expect(nextButton).toBeDisabled();
  });

  it('formats input as YYYY/MM/DD as user types', () => {
    const { getByPlaceholderText } = createComponent();
    const input = getByPlaceholderText('YYYY/MM/DD');

    fireEvent.changeText(input, '19901231');
    expect(input.props.value).toBe('1990/12/31');

    fireEvent.changeText(input, '198507');
    expect(input.props.value).toBe('1985/07');

    fireEvent.changeText(input, 'abcd');
    expect(input.props.value).toBe('');
  });

  it('shows error if date format invalid on next', async () => {
    const { getByTestId, getByPlaceholderText, getByText, queryByText } = createComponent();
    const input = getByPlaceholderText('YYYY/MM/DD');
    fireEvent.changeText(input, '20200230');
    fireEvent.press(getByTestId('next-button'));
    const error = await waitFor(() => getByText('Neteisingas datos formatas.'));
    expect(error).toBeTruthy();
    fireEvent.changeText(input, '20200229');
    await waitFor(() => {
      expect(queryByText('Neteisingas datos formatas.')).toBeNull();
    });
  });

  it('navigates to Reg_Stud6 with trimmed birthday when valid', async () => {
    const { getByTestId, getByPlaceholderText } = createComponent();
    const input = getByPlaceholderText('YYYY/MM/DD');
    fireEvent.changeText(input, '19901231');
    fireEvent.press(getByTestId('next-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Reg_Stud6', {
        email: defaultRouteParams.email,
        password: defaultRouteParams.password,
        name: defaultRouteParams.name,
        birthday: '1990/12/31',
      });
    });
  });

  it('calls goBack when pressing "Atgal"', () => {
    const { getByText } = createComponent();
    fireEvent.press(getByText('Atgal'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
