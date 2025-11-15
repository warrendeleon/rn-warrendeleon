import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { ChevronRight } from 'lucide-react-native';

import { useAppColorScheme } from '@app/hooks';

export interface MenuButtonGroupSvgItem {
  id: string;
  label: string;
  subtitle?: string;
  logoUri?: string; // URI for remote SVGs (e.g., GitHub raw URLs)
  onPress?: () => void;
  testID?: string;
  showChevron?: boolean;
}

export interface MenuButtonGroupSvgProps {
  items: MenuButtonGroupSvgItem[];
  loading?: boolean;
  error?: string;
}

export const MenuButtonGroupSvg: React.FC<MenuButtonGroupSvgProps> = ({
  items,
  loading,
  error,
}) => {
  const colorScheme = useAppColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <ActivityIndicator
          testID="activity-indicator"
          size="large"
          color={isDark ? '#FFFFFF' : '#000000'}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <Text style={[styles.errorText, { color: '#FF3B30' }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.buttonGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity
            testID={item.testID}
            style={styles.button}
            onPress={item.onPress}
            activeOpacity={item.onPress ? 0.7 : 1}
            disabled={!item.onPress}
          >
            <View
              style={[styles.logoContainer, { backgroundColor: isDark ? '#FFFFFF' : '#F2F2F7' }]}
            >
              {item.logoUri && <SvgUri uri={item.logoUri} width={40} height={40} />}
            </View>

            <View style={styles.contentContainer}>
              <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {item.label}
              </Text>
              {item.subtitle && (
                <Text style={[styles.subtitle, { color: '#8E8E93' }]}>{item.subtitle}</Text>
              )}
            </View>

            {(item.showChevron ?? true) && item.onPress && (
              <ChevronRight size={20} color="#8E8E93" />
            )}
          </TouchableOpacity>

          {index < items.length - 1 && (
            <View style={[styles.divider, { backgroundColor: isDark ? '#38383A' : '#C6C6C8' }]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

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
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
