import {LatLng} from 'react-native-maps';

export interface Profile {
  name: string;
  lastName: string;
  headline: string;
  namePronunciation: string;
  namePronunciationAudioTrack: string;
  profilePicture: string;
  location: {
    cityTown: string;
    county: string;
    country: string;
    coordinates: LatLng;
  };
}
