import {EmptyObject} from 'redux';

import {educationReducer, getEducation} from '@app/modules';
import {Education} from '@app/types';

import mockEducation from '../../../data/en/education.json';

describe('Education reducer', () => {
  test(`should put Education in the state after dispatch ${getEducation.fulfilled}`, () => {
    const state: Education[] | EmptyObject = [];

    const action = {
      meta: {
        requestId: 'BM_7omwZ-dB20XGcVfMHP',
        requestStatus: 'fulfilled',
      },
      payload: mockEducation,
      type: getEducation.fulfilled,
    };

    expect(educationReducer(state, action)).toStrictEqual(mockEducation);
  });
});
