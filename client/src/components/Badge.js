import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Badge({ label, variant = 'primary' }) {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'secondary':
        return { bg: colors.borderLight, text: colors.textMuted };
      default:
        return { bg: colors.primaryLight, text: colors.primaryDark };
    }
  };

  const style = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
