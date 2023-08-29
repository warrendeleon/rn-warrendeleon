import {RootState} from '@app/redux';

import mockEducation from '../../../data/en/education.json';
import {educationSelector} from '../selectors';

describe('Education selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      education: mockEducation,
    } as RootState;
  });

  test('Education selector', () => {
    expect(educationSelector(state)).toStrictEqual(mockEducation);
  });
});
