import TrackPlayer, {Event, State} from 'react-native-track-player';

let wasPausedByDuck = false;

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async () => {
    const currentPosition = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(currentPosition + 15);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async () => {
    const currentPosition = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(currentPosition - 15);
  });

  TrackPlayer.addEventListener(
    Event.RemoteSeek,
    async ({position}: {position: number}) => {
      await TrackPlayer.seekTo(position);
    },
  );

  TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
    if (e.permanent === true) {
      await TrackPlayer.stop();
    } else {
      if (e.paused === true) {
        const playerState = await TrackPlayer.getState();
        wasPausedByDuck = playerState !== State.Paused;
        await TrackPlayer.pause();
      } else {
        if (wasPausedByDuck) {
          await TrackPlayer.play();
          wasPausedByDuck = false;
        }
      }
    }
  });
}
