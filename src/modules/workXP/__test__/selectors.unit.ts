import mockWorkXP from '../../../data/en/workxp.json';
import {RootState} from '../../../redux/configureStore';
import {clientsSelector, workXPSelector} from '../selectors';

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

  test('Clients selector', () => {
    expect(clientsSelector(state, mockWorkXP[1].id)).toStrictEqual(
      mockWorkXP[1].clients,
    );
  });
});
