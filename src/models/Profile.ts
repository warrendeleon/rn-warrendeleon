import {LatLng} from 'react-native-maps';

export interface Profile {
  name: string;
  lastName: string;
  headline: string;
  namePronunciation: string;
  namePronunciationAudioTrack: string;
  profilePicture: string;
  birthday: string;
  email: string;
  phone: string;
  location: {
    cityTown: string;
    county: string;
    country: string;
    coordinates: LatLng;
  };
  carousel: string[];
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedIn: string;
  };
}
