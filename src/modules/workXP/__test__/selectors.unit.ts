import mockWorkXP from '../../../data/en/workxp.json';
import {RootState} from '../../../redux/configureStore';
import {workXPSelector} from '../selectors';

describe('WorkXP selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      workXP: mockWorkXP,
    } as RootState;
  });

  test('WorkXP selector', () => {
    expect(workXPSelector(state)).toStrictEqual(mockWorkXP);
  });
});
