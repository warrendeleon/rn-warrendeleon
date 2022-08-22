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
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.SeekTo,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.Stop,
      Capability.JumpBackward,
      Capability.JumpForward,
      Capability.SeekTo,
    ],
  });
};
