import { useState, useEffect, useRef } from 'react';
import { AppState, Alert, Platform } from 'react-native';
import api from '../api/client';

export const useAntiCheating = ({ submissionId, isExamActive }) => {
  const [warningCount, setWarningCount] = useState(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!isExamActive || !submissionId) return;

    const handleAppStateChange = async (nextAppState) => {
      // Check if user minimized or exited the app
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        setWarningCount((prev) => prev + 1);

        const alertMessage =
          'Integrity Warning: You minimized or navigated away from the exam app. This infraction has been logged for academic review.';

        if (Platform.OS === 'web') {
          window.alert(alertMessage);
        } else {
          Alert.alert('⚠️ Academic Integrity Violation', alertMessage);
        }

        // Send audit log to backend
        try {
          await api.post('/submissions/cheating-event', {
            submissionId,
            eventType: 'APP_BACKGROUND',
            details: `App state transitioned to ${nextAppState} at ${new Date().toLocaleTimeString()}`,
          });
        } catch (error) {
          console.warn('Failed to log cheating event:', error.message);
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isExamActive, submissionId]);

  return { warningCount };
};
