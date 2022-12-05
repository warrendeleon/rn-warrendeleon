jest.mock('../api', () => ({
  getPatientsService: jest.fn().mockResolvedValue([]),
}));

import {getPatients} from '../actions';
import {getPatientsService} from '../api';

describe('getPatients', () => {
  const dispatch = jest.fn();
  const getState = jest.fn().mockReturnValue([]);

  test('Should execute getPatients', async () => {
    await getPatients(1)(dispatch, getState, {});
    expect(getPatientsService).toHaveBeenCalledTimes(1);
  });
});
