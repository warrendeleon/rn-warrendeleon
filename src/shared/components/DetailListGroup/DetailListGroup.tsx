import React from 'react';
import { StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Box, Pressable, Spinner, Text } from '@gluestack-ui/themed';
import { ChevronRight } from 'lucide-react-native';

import { useAppColorScheme } from '@app/shared/hooks';

export interface DetailListGroupItem {
  id: string;
  label: string;
  subtitle?: string;
  logoUri?: string; // URI for remote SVGs (e.g., GitHub raw URLs)
  onPress?: () => void;
  testID?: string;
  showChevron?: boolean;
  badge?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export interface DetailListGroupProps {
  items: DetailListGroupItem[];
  loading?: boolean;
  error?: string;
}

export const DetailListGroup = React.memo<DetailListGroupProps>(({ items, loading, error }) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <Box style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <Spinner testID="activity-indicator" size="large" color={isDark ? '$white' : '$black'} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
      </Box>
    );
  }

  return (
    <Box style={[styles.buttonGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Pressable
            testID={item.testID}
            style={styles.button}
            onPress={item.onPress}
            disabled={!item.onPress}
            accessibilityRole={item.onPress ? 'button' : undefined}
            accessibilityLabel={item.accessibilityLabel || item.label}
            accessibilityHint={item.accessibilityHint}
          >
            <Box
              style={[styles.logoContainer, { backgroundColor: isDark ? '#FFFFFF' : '#F2F2F7' }]}
            >
              {item.logoUri && <SvgUri uri={item.logoUri} width={40} height={40} />}
            </Box>

            <Box style={styles.contentContainer}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {item.label}
              </Text>
              {item.subtitle && (
                <Text style={[styles.subtitle, { color: '#8E8E93' }]}>{item.subtitle}</Text>
              )}
            </Box>

            <Box style={styles.trailingAccessories}>
              {item.badge && (
                <Box style={[styles.badge, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                  <Text style={[styles.badgeText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {item.badge}
                  </Text>
                </Box>
              )}

              {(item.showChevron ?? true) && item.onPress && (
                <ChevronRight size={20} color="#8E8E93" />
              )}
            </Box>
          </Pressable>

          {index < items.length - 1 && (
            <Box style={[styles.divider, { backgroundColor: isDark ? '#3A3A3C' : '#C6C6C8' }]} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
  },
  buttonGroup: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  logoContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trailingAccessories: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 78, // Align with text, not logo
    marginRight: 16, // iOS-style right inset to stop before chevron
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  badge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// StyleSheet.create used for platform-specific hairlineWidth dividers (line 149)
// Justification: StyleSheet.hairlineWidth provides optimal 1px divider across platforms
