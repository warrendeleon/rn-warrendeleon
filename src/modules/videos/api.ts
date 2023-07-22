import {AxiosResponse} from 'axios';

import {YoutubeApiClient} from '@app/httpClients';
import {YoutubeApiResponse} from '@app/models/Video';

export const getVideosService = async (): Promise<
  AxiosResponse<YoutubeApiResponse>
> => {
  const GOOGLE_API_KEY = '';
  return YoutubeApiClient.get('', {
    params: {
      key: GOOGLE_API_KEY,
      maxResults: 50,
      part: 'snippet',
      playlistId: 'PLKcwUOTleOhUQ-x6n2G3ewduGaC6XIOvI',
    },
  });
};
