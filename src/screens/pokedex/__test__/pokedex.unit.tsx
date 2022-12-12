import React from 'react';
import {PokedexScreen as Pokedex} from '../index';
import {customRender} from '../../../testUtils/custom-render';
import mockPokedex from '../../../data/en/pokedex.json';
import {useSelector} from 'react-redux';
import {ErrorWithStack} from '@testing-library/react-native/build/helpers/errors';

const mockState = {
  pokedex: mockPokedex,
};

describe('<Pokedex />', () => {
  (useSelector as jest.Mock).mockImplementation(callback => {
    return callback(mockState);
  });

  afterAll(() => {
    (useSelector as jest.Mock).mockClear();
  });

  test('should render some pokedex listItems', async () => {
    const {getAllByTestId} = customRender(() => <Pokedex />);
    const listItems = getAllByTestId('listItem');
    expect(listItems.length).toBeGreaterThan(1);
  });

  test('should not render pokedex listItems', async () => {
    try {
      (useSelector as jest.Mock).mockImplementation(callback => {
        return callback({pokedex: []});
      });
      const {getAllByTestId} = customRender(() => <Pokedex />);
      getAllByTestId('listItem');
    } catch (e: unknown) {
      const error = e as ErrorWithStack;
      expect(error.message).toContain(
        'Unable to find an element with testID: listItem',
      );
    }
  });
});
