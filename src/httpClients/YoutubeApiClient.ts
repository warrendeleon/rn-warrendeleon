import axios from 'axios';

export const YOUTUBE_BASE_URL =
  'https://www.googleapis.com/youtube/v3/playlistItems';

export const YoutubeApiClient = axios.create({
  baseURL: YOUTUBE_BASE_URL,
});
