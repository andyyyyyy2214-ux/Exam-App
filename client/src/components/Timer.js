import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Timer({ initialMinutes, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const formatTime = () => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = secondsLeft < 120; // Under 2 minutes

  return (
    <View style={[styles.container, isUrgent ? styles.urgentBg : styles.normalBg]}>
      <Ionicons
        name="timer-outline"
        size={18}
        color={isUrgent ? colors.danger : colors.primary}
        style={{ marginRight: 6 }}
      />
      <Text style={[styles.timerText, isUrgent ? styles.urgentText : styles.normalText]}>
        {formatTime()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  normalBg: {
    backgroundColor: colors.primaryLight,
  },
  urgentBg: {
    backgroundColor: colors.dangerLight,
  },
  timerText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  normalText: {
    color: colors.primaryDark,
  },
  urgentText: {
    color: colors.danger,
  },
});
