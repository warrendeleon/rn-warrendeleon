import mockClinics from '../../../data/en/clinics.json';
import {RootState} from '../../../redux/configureStore';
import {clinicsSelector} from '../selectors';

describe('Clinics selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      clinics: mockClinics,
    } as RootState;
  });

  test('Clinics selector', () => {
    expect(clinicsSelector(state)).toStrictEqual(mockClinics);
  });
});
