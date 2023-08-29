import {getVideos, videosReducer} from '@app/modules';
import {Video} from '@app/types';

import mockVideos from '../../../data/en/mockVideos.json';

describe('Videos reducer', () => {
  test(`should put Videos in the state after dispatch ${getVideos.fulfilled}`, () => {
    const state: Video[] = [];

    const action = {
      meta: {
        requestId: 'BM_7omwZ-dB20XGcVfMHP',
        requestStatus: 'fulfilled',
      },
      payload: mockVideos,
      type: getVideos.fulfilled,
    };

    expect(videosReducer(state, action)).toStrictEqual(mockVideos.items);
  });
});
