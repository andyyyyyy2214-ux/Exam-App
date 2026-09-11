import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

export default function TeacherDashboardScreen({ navigation }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getDemoTeacherExams = () => [
    {
      id: 'demo-exam-cs401',
      title: 'Computer Networks - Midterm Exam',
      durationMinutes: 45,
      status: 'PUBLISHED',
      subject: { name: 'Computer Networks', code: 'CS401' },
      _count: { examQuestions: 4, submissions: 12 },
    },
    {
      id: 'demo-exam-cs301',
      title: 'Operating Systems - Final Exam',
      durationMinutes: 60,
      status: 'DRAFT',
      subject: { name: 'Operating Systems', code: 'CS301' },
      _count: { examQuestions: 10, submissions: 0 },
    },
  ];

  const fetchTeacherExams = async () => {
    try {
      const res = await api.get('/exams/teacher');
      if (res.data && res.data.length > 0) {
        setExams(res.data);
      } else {
        setExams(getDemoTeacherExams());
      }
    } catch (error) {
      console.log('Using fallback demo exams for teacher:', error.message);
      setExams(getDemoTeacherExams());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeacherExams();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Header title="Instructor Portal" />

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateExamScreen')}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Create Exam</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('QuestionBankScreen')}
        >
          <Ionicons name="library" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Question Bank</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scheduled Examinations</Text>
          <Text style={styles.sectionSub}>{exams.length} exams managed</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading exams...</Text>
          </View>
        ) : (
          <FlatList
            data={exams}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchTeacherExams();
                }}
              />
            }
            renderItem={({ item }) => (
              <View style={styles.examCard}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Badge label={item.subject?.name || 'General'} variant="primary" />
                    <Text style={styles.examTitle}>{item.title}</Text>
                  </View>
                  <Badge label={item.status} variant="warning" />
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Duration: <Text style={styles.metaBold}>{item.durationMinutes}m</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Questions: <Text style={styles.metaBold}>{item._count?.examQuestions ?? 0}</Text>
                  </Text>
                  <Text style={styles.metaText}>
                    Submissions: <Text style={styles.metaBold}>{item._count?.submissions ?? 0}</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.analyticsBtn}
                  onPress={() =>
                    navigation.navigate('ExamAnalyticsScreen', {
                      examId: item.id,
                      examTitle: item.title,
                    })
                  }
                >
                  <Ionicons name="bar-chart" size={16} color={colors.primary} />
                  <Text style={styles.analyticsBtnText}>
                    View Analytics & Submissions ({item._count?.submissions ?? 0})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="clipboard-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No exams created yet.</Text>
                <TouchableOpacity
                  style={styles.createNowBtn}
                  onPress={() => navigation.navigate('CreateExamScreen')}
                >
                  <Text style={styles.createNowText}>Create Your First Exam</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  examCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.borderLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaBold: {
    color: colors.text,
    fontWeight: 'bold',
  },
  analyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  analyticsBtnText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: 'bold',
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
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 10,
    color: colors.textMuted,
  },
  createNowBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createNowText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
