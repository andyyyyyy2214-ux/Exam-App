import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getDemoStats = () => ({
    totalUsers: 3,
    totalExams: 1,
    totalSubmissions: 12,
    cheatingIncidents: 1,
  });

  const getDemoUsers = () => [
    {
      id: 'admin-1',
      name: 'System Administrator',
      email: 'admin@anand.edu',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2026-09-01T00:00:00.000Z',
    },
    {
      id: 'teacher-1',
      name: 'Dr. Anand Sharma',
      email: 'teacher@anand.edu',
      role: 'TEACHER',
      isActive: true,
      createdAt: '2026-09-02T00:00:00.000Z',
    },
    {
      id: 'student-1',
      name: 'Rahul Verma',
      email: 'student@anand.edu',
      role: 'STUDENT',
      isActive: true,
      createdAt: '2026-09-03T00:00:00.000Z',
    },
  ];

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data || getDemoStats());
      setUsers(usersRes.data && usersRes.data.length > 0 ? usersRes.data : getDemoUsers());
    } catch (error) {
      console.log('Using fallback admin data:', error.message);
      setStats(getDemoStats());
      setUsers(getDemoUsers());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleUser = async (user) => {
    const updatedStatus = !user.isActive;
    try {
      await api.patch(`/admin/users/${user.id}/status`, { isActive: updatedStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: updatedStatus } : u))
      );
      Alert.alert('Status Updated', `User ${user.name} is now ${updatedStatus ? 'Active' : 'Deactivated'}.`);
    } catch (error) {
      console.log('API toggle failed, applying locally in demo mode:', error.message);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: updatedStatus } : u))
      );
      Alert.alert('Status Updated (Demo Mode)', `User ${user.name} is now ${updatedStatus ? 'Active' : 'Deactivated'}.`);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Administrator Dashboard" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading system statistics...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAdminData();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              {/* System KPIs */}
              <Text style={styles.sectionTitle}>System Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>
                    {stats?.totalExams || 0}
                  </Text>
                  <Text style={styles.statLabel}>Exams</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: colors.success }]}>
                    {stats?.totalSubmissions || 0}
                  </Text>
                  <Text style={styles.statLabel}>Submissions</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statNumber, { color: colors.danger }]}>
                    {stats?.cheatingIncidents || 0}
                  </Text>
                  <Text style={styles.statLabel}>Cheating Flags</Text>
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                User Management ({users.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.badgeRow}>
                  <Badge label={item.role} variant="primary" />
                  <Badge
                    label={item.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                    variant={item.isActive ? 'success' : 'danger'}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  item.isActive ? styles.deactivateBtn : styles.activateBtn,
                ]}
                onPress={() => toggleUser(item)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    item.isActive ? styles.deactivateText : styles.activateText,
                  ]}
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  deactivateBtn: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  activateBtn: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deactivateText: {
    color: colors.danger,
  },
  activateText: {
    color: colors.success,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textMuted,
  },
});
