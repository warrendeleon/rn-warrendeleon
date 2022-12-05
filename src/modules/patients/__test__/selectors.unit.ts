import mockPatients from '../../../data/en/patients.json';
import {RootState} from '../../../redux/configureStore';
import {patientsSelector} from '../selectors';

describe('Patients selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      patients: mockPatients,
    } as RootState;
  });

  test('Patients selector', () => {
    expect(patientsSelector(state)).toStrictEqual(mockPatients);
  });
});
