import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Pdf from 'react-native-pdf';
import Share from 'react-native-share';
import { type RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';

import { Box } from '@app/components/ui/box';
import { Pressable } from '@app/components/ui/pressable';
import { Spinner } from '@app/components/ui/spinner';
import { Text } from '@app/components/ui/text';
import { ALLOWED_PDF_DOMAINS } from '@app/config/constants';
import type { RootStackParamList } from '@app/navigation';
import { useAppColorScheme } from '@app/shared/hooks';
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
        <Pressable
          testID="pdf-share-button"
          onPress={handleShare}
          className="ml-1 h-6 w-6 items-center justify-center"
          disabled={isSharing}
          accessibilityRole="button"
          accessibilityLabel="Share PDF"
          accessibilityHint="Opens share dialog to share the PDF document"
          accessibilityState={{ disabled: isSharing }}
        >
          {isSharing ? (
            <Spinner size="small" color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
          ) : (
            <Share2 size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
          )}
        </Pressable>
      ),
    });
  }, [navigation, handleShare, colorScheme, isSharing]);

  // Show loading state while validating
  if (!isValidUrl && !error) {
    return (
      <Box
        className="flex-1 items-center justify-center p-5"
        testID="pdf-loading"
        accessibilityRole="progressbar"
        accessibilityLabel="Validating PDF URL"
      >
        <Spinner size="large" color={isDark ? '#FFFFFF' : '#000000'} />
        <Text
          className="mt-4 text-center text-base"
          style={{ color: isDark ? '#FFFFFF' : '#000000' }}
        >
          Validating PDF URL...
        </Text>
      </Box>
    );
  }

  // Show error state if URL is not allowed
  if (error) {
    return (
      <Box
        className="flex-1 items-center justify-center p-5"
        testID="pdf-error"
        accessibilityRole="alert"
        accessibilityLabel={error}
      >
        <Text
          className="mb-3 text-center text-lg font-semibold"
          style={{ color: isDark ? '#EF4444' : '#DC2626' }}
        >
          {error}
        </Text>
        <Text
          className="text-center text-sm italic"
          style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
        >
          {url}
        </Text>
      </Box>
    );
  }

  // Render PDF only if URL is valid
  return (
    <Pdf
      source={{ uri: url, cache: true }}
      style={{ flex: 1, width: '100%', height: '100%' }}
      trustAllCerts={false}
    />
  );
};
