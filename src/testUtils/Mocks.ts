// @ts-ignore
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock.js';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

export const mockRestaurants = {
  data: {
    restaurant: {
      items: [
        {
          name: 'Aberdeen - Belmont Street',
          url: 'https://www.nandos.co.uk/eat/restaurants/aberdeen-belmont-street',
          geo: {
            address: {
              streetAddress: 'Unit 10, The Academy, Belmont St',
              addressLocality: 'Aberdeen, Aberdeen City',
              postalCode: 'AB10 1LB',
            },
          },
        },
      ],
    },
  },
};
