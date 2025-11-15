import React, { useCallback } from 'react';
import { Alert, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';

import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';

type PDFScreenRouteProp = RouteProp<RootStackParamList, 'PDF'>;

export const PDFScreen = () => {
  const route = useRoute<PDFScreenRouteProp>();
  const navigation = useNavigation();
  const colorScheme = useAppColorScheme();

  const handleShare = useCallback(async () => {
    try {
      await Share.open({
        url: route.params.uri,
        type: 'application/pdf',
        title: 'Share CV',
      });
    } catch (error) {
      if ((error as Error).message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share CV');
      }
    }
  }, [route.params.uri]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Share2
          testID="pdf-share-button"
          size={24}
          color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
          onPress={handleShare}
          style={{ marginRight: 16 }}
        />
      ),
    });
  }, [navigation, handleShare, colorScheme]);

  return (
    <Pdf source={{ uri: route.params.uri, cache: true }} style={styles.pdf} trustAllCerts={false} />
  );
};

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
