import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';

import { ALLOWED_PDF_DOMAINS } from '@app/config/constants';
import { useAppColorScheme } from '@app/hooks';
import type { RootStackParamList } from '@app/navigation';
import { isUrlAllowed } from '@app/utils/urlValidator';

type PDFScreenRouteProp = RouteProp<RootStackParamList, 'PDF'>;

export const PDFScreen = () => {
  const route = useRoute<PDFScreenRouteProp>();
  const navigation = useNavigation();
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  const [isValidUrl, setIsValidUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const url = route.params.uri;

  useEffect(() => {
    if (isUrlAllowed(url, ALLOWED_PDF_DOMAINS)) {
      setIsValidUrl(true);
    } else {
      setError('This PDF URL is not allowed for security reasons');
    }
  }, [url]);

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

  // Show loading state while validating
  if (!isValidUrl && !error) {
    return (
      <View
        style={styles.centerContainer}
        testID="pdf-loading"
        accessibilityRole="progressbar"
        accessibilityLabel="Validating PDF URL"
      >
        <ActivityIndicator size="large" color={isDark ? '#FFFFFF' : '#000000'} />
        <Text style={[styles.messageText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Validating PDF URL...
        </Text>
      </View>
    );
  }

  // Show error state if URL is not allowed
  if (error) {
    return (
      <View
        style={styles.centerContainer}
        testID="pdf-error"
        accessibilityRole="alert"
        accessibilityLabel={error}
      >
        <Text style={[styles.errorText, { color: isDark ? '#FF6B6B' : '#D32F2F' }]}>{error}</Text>
        <Text style={[styles.urlText, { color: isDark ? '#C9D1D9' : '#555555' }]}>{url}</Text>
      </View>
    );
  }

  // Render PDF only if URL is valid
  return <Pdf source={{ uri: url, cache: true }} style={styles.pdf} trustAllCerts={false} />;
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  urlText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
