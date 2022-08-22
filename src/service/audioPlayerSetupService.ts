import TrackPlayer, {
  Capability,
  IOSCategory,
  IOSCategoryMode,
} from 'react-native-track-player';
import {PlaybackService} from './playbackService';

export const AudioPlayerSetupService = () => {
  TrackPlayer.registerPlaybackService(() => PlaybackService);
  TrackPlayer.setupPlayer({
    iosCategory: IOSCategory.Playback,
    iosCategoryMode: IOSCategoryMode.SpokenAudio,
  });
  TrackPlayer.updateOptions({
    capabilities: [Capability.Play],
  });
};
