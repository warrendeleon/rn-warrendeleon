jest.mock('../api', () => ({
  getEducationService: jest.fn().mockResolvedValue([]),
}));

import {getEducation} from '../actions';
import {getEducationService} from '../api';

describe('getEducation', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getEducation', async () => {
    await getEducation()(dispatch, getState, {});
    expect(getEducationService).toHaveBeenCalledTimes(1);
  });
});
