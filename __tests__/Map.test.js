// __tests__/MapScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MapScreen from '../screens/map/Map';
import { spotData } from '../constants/spotData';
import { Linking } from 'react-native';

// --- Mock react-native-maps ---
const mockAnimate = jest.fn();
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View, TouchableOpacity } = require('react-native');
  const PROVIDER_GOOGLE = 'google';
  const MapView = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ animateToRegion: mockAnimate }));
    return <View testID="map-view">{props.children}</View>;
  });
  const Marker = ({ onPress, children }) => (
    <TouchableOpacity testID="marker" onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
  return { __esModule: true, default: MapView, Marker, PROVIDER_GOOGLE };
});

// --- Mock GooglePlacesAutocomplete ---
jest.mock('react-native-google-places-autocomplete', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    GooglePlacesAutocomplete: ({ placeholder, onPress }) => (
      <View>
        <Text testID="gpa-placeholder">{placeholder}</Text>
        <TouchableOpacity
          testID="gpa-press"
          onPress={() =>
            onPress(
              { description: 'Foo' },
              { geometry: { location: { lat: 10, lng: 20 } } }
            )
          }
        >
          <Text>Go</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// --- Mock @gorhom/bottom-sheet ---
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View } = require('react-native');
  const BottomSheetModal = React.forwardRef(({ children }, ref) => {
    React.useImperativeHandle(ref, () => ({ present: jest.fn() }));
    return <View testID="bottom-sheet">{children}</View>;
  });
  const BottomSheetView = ({ children }) => (
    <View testID="bottom-sheet-view">{children}</View>
  );
  const BottomSheetBackdrop = (props) => <View testID="backdrop" {...props} />;
  return { BottomSheetModal, BottomSheetView, BottomSheetBackdrop };
});

// --- Mock icons & custom components ---
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const { Text } = require('react-native');
  return () => <Text>icon</Text>;
});
jest.mock('../components/Header', () => (props) => {
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity testID="header" onPress={props.onFilterPress}>
      <Text>H</Text>
    </TouchableOpacity>
  );
});
jest.mock('../components/Footer', () => () => {
  const { View } = require('react-native');
  return <View testID="footer" />;
});

// --- Spy on Linking.openURL ---
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());

describe('MapScreen', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all markers and toggles category filter on/off', () => {
    const { getAllByTestId, getByText } = render(
      <MapScreen navigation={navigation} />
    );
    expect(getAllByTestId('marker')).toHaveLength(spotData.length);

    const firstCat = getByText('Tylos / poilsio zonos');
    fireEvent.press(firstCat);
    const quietCount = spotData.filter(s => s.category === 'quiet').length;
    expect(getAllByTestId('marker')).toHaveLength(quietCount);

    fireEvent.press(firstCat);
    expect(getAllByTestId('marker')).toHaveLength(spotData.length);
  });

  it('navigates correctly via header and tabs', () => {
    const { getByTestId, getByText } = render(
      <MapScreen navigation={navigation} />
    );
    fireEvent.press(getByTestId('header'));
    expect(navigation.navigate).toHaveBeenCalledWith('Filter');

    fireEvent.press(getByText('Studentai'));
    expect(navigation.navigate).toHaveBeenCalledWith('SearchStudents');

    fireEvent.press(getByText('Kambariokai'));
    expect(navigation.navigate).toHaveBeenCalledWith('Roommates');

    fireEvent.press(getByText('Žemėlapis'));
    expect(navigation.navigate).toHaveBeenCalledWith('Map');
  });

  it('calls animateToRegion when a place is selected', () => {
    const { getByTestId } = render(<MapScreen navigation={navigation} />);
    expect(mockAnimate).not.toHaveBeenCalled();

    fireEvent.press(getByTestId('gpa-press'));
    expect(mockAnimate).toHaveBeenCalledWith(
      { latitude: 10, longitude: 20, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      400
    );
  });

  it('presents bottom sheet on marker press and opens URL on CTA', () => {
    const { getAllByTestId, getByText } = render(
      <MapScreen navigation={navigation} />
    );
    fireEvent.press(getAllByTestId('marker')[0]);

    const cta = getByText('Pradėti');
    fireEvent.press(cta);

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringMatching(
        /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/
      )
    );
  });
});
