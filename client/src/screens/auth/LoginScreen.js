import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { login, loginAsDemo, isLoading } = useAuth();

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email with domain (e.g. student@anand.edu).');
      return;
    }

    setErrorMsg('');
    const res = await login(cleanEmail.toLowerCase(), cleanPassword);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleInstantDemo = async (role) => {
    setErrorMsg('');
    await loginAsDemo(role);
  };



  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setErrorMsg('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="school" size={42} color={colors.primary} />
          </View>
          <Text style={styles.appTitle}>EduAssess</Text>
          <Text style={styles.tagline}>Smart Examination & Auto-Grading Portal</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="name@anand.edu"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerHighlight}>Register here</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instant College Presentation Mode */}
        <View style={styles.demoSection}>
          <View style={styles.demoTitleRow}>
            <Ionicons name="flash" size={16} color="#d97706" />
            <Text style={styles.demoTitle}>College Demo Mode (Zero-Server Offline):</Text>
          </View>
          <Text style={styles.demoSubtitle}>Tap to present live without needing a backend running:</Text>
          <View style={styles.demoBtnRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleInstantDemo('STUDENT')}
            >
              <Ionicons name="person" size={16} color={colors.primary} />
              <Text style={styles.demoBtnText}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleInstantDemo('TEACHER')}
            >
              <Ionicons name="easel" size={16} color={colors.primary} />
              <Text style={styles.demoBtnText}>Teacher</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleInstantDemo('ADMIN')}
            >
              <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.demoBtnText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Fill credentials for live server demo */}
        <View style={styles.quickFillSection}>
          <Text style={styles.quickFillText}>Or auto-fill credentials for live server:</Text>
          <View style={styles.quickFillRow}>
            <TouchableOpacity onPress={() => handleQuickFill('student@anand.edu')}>
              <Text style={styles.quickFillLink}>Student</Text>
            </TouchableOpacity>
            <Text style={styles.quickFillDivider}>•</Text>
            <TouchableOpacity onPress={() => handleQuickFill('teacher@anand.edu')}>
              <Text style={styles.quickFillLink}>Teacher</Text>
            </TouchableOpacity>
            <Text style={styles.quickFillDivider}>•</Text>
            <TouchableOpacity onPress={() => handleQuickFill('admin@anand.edu')}>
              <Text style={styles.quickFillLink}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  registerHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  serverSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  serverSettingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  demoSection: {
    marginTop: 20,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#b45309',
    marginBottom: 12,
  },
  demoBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fcd34d',
    gap: 5,
  },
  demoBtnText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  quickFillSection: {
    marginTop: 14,
    alignItems: 'center',
  },
  quickFillText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickFillLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  quickFillDivider: {
    color: colors.textMuted,
    fontSize: 12,
  },
});

