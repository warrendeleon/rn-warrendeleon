import {RootState} from '@app/redux';

import mockVideos from '../../../data/en/mockVideos.json';
import {videosSelector} from '../selectors';

describe('Videos selectors', () => {
  let state: RootState;

  beforeEach(() => {
    state = {
      videos: mockVideos.items,
    } as RootState;
  });

  test('Videos selector', () => {
    expect(videosSelector(state)).toStrictEqual(mockVideos.items);
  });
});
