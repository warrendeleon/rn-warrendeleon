import {mockRestaurants} from '../../../testUtils/Mocks';
import {RootState} from '../../../redux/configureStore';
import {nandosSelector} from '../selectors';

describe('Products selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      nandos: mockRestaurants.data.restaurant.items,
    } as RootState;
  });

  test('Restaurants Nandos selector', () => {
    expect(nandosSelector(state)).toStrictEqual(
      mockRestaurants.data.restaurant.items,
    );
  });
});
