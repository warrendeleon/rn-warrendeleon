import mockWorkXP from '../../../data/en/workxp.json';
import {RootState} from '../../../redux/configureStore';
import {workXPSelector} from '../selectors';

describe('Products selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      workXP: mockWorkXP,
    } as RootState;
  });

  test('Restaurants Nandos selector', () => {
    expect(workXPSelector(state)).toStrictEqual(mockWorkXP);
  });
});
