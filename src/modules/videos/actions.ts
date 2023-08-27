import {createAsyncThunk} from '@reduxjs/toolkit';

import {getVideosService} from '@app/modules';
import {RootState} from '@app/redux';
import {YoutubeApiResponse} from '@app/types/Video';

export const getVideos = createAsyncThunk<
  YoutubeApiResponse,
  void,
  {state: RootState}
>('videos/getVideos', async (_, {rejectWithValue}) => {
  try {
    const youtubeResponse = await getVideosService();
    return youtubeResponse.data;
  } catch (error) {
    return rejectWithValue('API Error');
  }
});
