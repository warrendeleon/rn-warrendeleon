import {getRestaurants} from '../actions';
import {nandosReducer} from '../reducer';
import {mockRestaurants} from '../../../testUtils/Mocks';
import {Restaurants} from '../../../models/nandosRestaurants';
import {EmptyObject} from 'redux';

describe('Nandos reducer', () => {
  test(`should put restaurants in the state after dispatch ${getRestaurants.fulfilled}`, () => {
    const state: Restaurants[] | EmptyObject = [];

    const action = {
      meta: {
        requestId: 'Hbqt3tV91Pod8AtkqXgYk',
        requestStatus: 'fulfilled',
      },
      payload: mockRestaurants,
      type: getRestaurants.fulfilled,
    };

    expect(nandosReducer(state, action)).toStrictEqual(mockRestaurants);
  });
});
