import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
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
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      setIsSharing(true);

      // Download PDF to temporary location
      const filename = 'CV_WarrenDeLeon_2025.pdf';
      const downloadDest = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${filename}`;

      const response = await ReactNativeBlobUtil.config({
        path: downloadDest,
        fileCache: true,
      }).fetch('GET', route.params.uri);

      const filePath = response.path();

      // Share the local file
      const shareOptions = {
        url: `file://${filePath}`,
        type: 'application/pdf',
        subject: 'Warren de Leon - CV',
        filename,
        message: 'Please find my CV attached.',
      };

      await Share.open(shareOptions);

      // Clean up the temporary file after sharing
      await ReactNativeBlobUtil.fs.unlink(filePath);
    } catch (error) {
      if ((error as Error).message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share CV');
      }
    } finally {
      setIsSharing(false);
    }
  }, [route.params.uri]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          testID="pdf-share-button"
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator
              size="small"
              color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
            />
          ) : (
            <Share2 size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleShare, colorScheme, isSharing]);

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
  shareButton: {
    marginLeft: 5,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
