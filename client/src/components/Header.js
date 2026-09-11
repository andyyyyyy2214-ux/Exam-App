import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.leftContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.userRow}>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role}</Text>
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} accessibilityLabel="Logout">
        <Ionicons name="log-out-outline" size={22} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userName: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 8,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.dangerLight,
  },
});
