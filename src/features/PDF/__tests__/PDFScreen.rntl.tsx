import * as ReactNavigation from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { PDFScreen } from '../PDFScreen';

// Mock dependencies
jest.mock('react-native-pdf', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => <View testID="mock-pdf" {...props} />,
  };
});

jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
  useNavigation: jest.fn(() => ({
    setOptions: jest.fn(),
  })),
}));

jest.mock('@app/hooks', () => ({
  useAppColorScheme: jest.fn(() => 'light'),
}));

describe('PDFScreen', () => {
  const mockRoute = {
    params: {
      uri: 'https://example.com/document.pdf',
      title: 'Test PDF',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ReactNavigation.useRoute as jest.Mock).mockReturnValue(mockRoute);
    (ReactNavigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: jest.fn(),
    });
  });

  it('renders PDF component with correct URI', () => {
    render(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf).toBeTruthy();
    expect(pdf.props.source).toEqual({
      uri: 'https://example.com/document.pdf',
      cache: true,
    });
  });

  it('enables caching for offline viewing', () => {
    render(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf.props.source.cache).toBe(true);
  });

  it('disables trust all certs for security', () => {
    render(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf.props.trustAllCerts).toBe(false);
  });

  it('applies full screen styles', () => {
    render(<PDFScreen />);

    const pdf = screen.getByTestId('mock-pdf');
    expect(pdf.props.style).toMatchObject({
      flex: 1,
      width: '100%',
      height: '100%',
    });
  });

  it('sets up share button in header', () => {
    const mockSetOptions = jest.fn();
    (ReactNavigation.useNavigation as jest.Mock).mockReturnValue({
      setOptions: mockSetOptions,
    });

    render(<PDFScreen />);

    expect(mockSetOptions).toHaveBeenCalled();
    const options = mockSetOptions.mock.calls[0][0];
    expect(options.headerRight).toBeDefined();
  });
});
