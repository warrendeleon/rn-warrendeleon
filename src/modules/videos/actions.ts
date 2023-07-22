import {createAsyncThunk} from '@reduxjs/toolkit';

import {YoutubeApiResponse} from '@app/models/Video';
import {getVideosService} from '@app/modules';
import {RootState} from '@app/redux';

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
