import React, {JSX} from 'react';
import {Platform, StyleSheet} from 'react-native';
import MapView, {LatLng, Marker} from 'react-native-maps';
import {Box, Link, Text, useColorModeValue, VStack} from 'native-base';

type ProfileMapProps = {
  label: string;
  location: {
    cityTown: string;
    county: string;
    country: string;
    coordinates: LatLng;
  };
};

export const ProfileMap = ({label, location}: ProfileMapProps): JSX.Element => {
  return (
    <VStack
      rounded={'lg'}
      bgColor={useColorModeValue('white', 'dark.50')}
      p={4}
      my={2}
      space={1}>
      <Text fontSize={'2xs'} bold>
        {label}
      </Text>
      <Link
        href={Platform.select({
          android: `geo:0,0?q=${location.coordinates?.latitude},${location.coordinates?.longitude}(Warren location)`,
          ios: `maps:0,0?q=Warren location@${location.coordinates?.latitude},${location.coordinates?.longitude}`,
        })}>
        {location.cityTown}, {location.county}, {location.country}
      </Link>
      <Box w={'full'} mt={4} height={48}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialCamera={{
            altitude: 100000,
            center: location?.coordinates,
            heading: 0,
            pitch: 0,
          }}>
          <Marker coordinate={location?.coordinates} />
        </MapView>
      </Box>
    </VStack>
  );
};
