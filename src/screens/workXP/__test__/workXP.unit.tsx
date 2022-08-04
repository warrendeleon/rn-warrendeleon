import React from 'react';
import {WorkXP} from '../index';
import {customRender} from '../../../testUtils/custom-render';
import mockWorkXP from '../../../data/en/workxp.json';
import {useSelector} from 'react-redux';
import {ErrorWithStack} from '@testing-library/react-native/build/helpers/errors';

const mockState = {
  workXP: mockWorkXP,
};

describe('<WorkXP />', () => {
  (useSelector as jest.Mock).mockImplementation(callback => {
    return callback(mockState);
  });

  afterAll(() => {
    (useSelector as jest.Mock).mockClear();
  });

  test('should render the App Logo', async () => {
    const {getByTestId} = customRender(() => <WorkXP />);
    const appSVGLogo = getByTestId('appLogo');
    expect(appSVGLogo).toBeDefined();
  });

  test('should render some workXP listItems', async () => {
    const {getAllByTestId} = customRender(() => <WorkXP />);
    const listItems = getAllByTestId('listItem');
    expect(listItems.length).toBeGreaterThan(1);
  });

  test('should not render workXP listItems', async () => {
    try {
      (useSelector as jest.Mock).mockImplementation(callback => {
        return callback({workXP: []});
      });
      const {getAllByTestId} = customRender(() => <WorkXP />);
      getAllByTestId('listItem');
    } catch (e: unknown) {
      const error = e as ErrorWithStack;
      expect(error.message).toContain(
        'Unable to find an element with testID: listItem',
      );
    }
  });
});
