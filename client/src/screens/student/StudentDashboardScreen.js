import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import Header from '../../components/Header';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

export default function StudentDashboardScreen({ navigation }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/available');
      if (res.data && res.data.length > 0) {
        setExams(res.data);
      } else {
        setExams(getDemoExams());
      }
    } catch (error) {
      console.log('Using fallback demo exams:', error.message);
      setExams(getDemoExams());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDemoExams = () => [
    {
      id: 'demo-exam-cs401',
      title: 'Computer Networks - Midterm Exam',
      description: 'Protocols, OSI model, IP addressing, and routing algorithms.',
      durationMinutes: 45,
      totalMarks: 50,
      passPercentage: 40,
      subject: { name: 'Computer Networks', code: 'CS401' },
      hasAttempted: false,
    },
    {
      id: 'demo-exam-cs301',
      title: 'Operating Systems - Final Exam',
      description: 'Process scheduling, memory management, and file systems.',
      durationMinutes: 60,
      totalMarks: 100,
      passPercentage: 50,
      subject: { name: 'Operating Systems', code: 'CS301' },
      hasAttempted: false,
    },
  ];

  useEffect(() => {
    fetchExams();
  }, []);

  const renderExamCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Badge label={item.subject?.name || 'General'} variant="primary" />
            <Text style={styles.examTitle}>{item.title}</Text>
          </View>
          {item.hasAttempted ? (
            <Badge
              label={item.submission?.passed ? 'PASSED' : 'FAILED'}
              variant={item.submission?.passed ? 'success' : 'danger'}
            />
          ) : (
            <Badge label="AVAILABLE" variant="warning" />
          )}
        </View>

        {item.description ? (
          <Text style={styles.examDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {/* Exam Metadata Grid */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.durationMinutes} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="help-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{item.totalQuestions} Questions</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="ribbon-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>Pass: {item.passMarks}/{item.totalMarks}</Text>
          </View>
        </View>

        {/* Negative marking indicator */}
        {item.negativeMarking > 0 ? (
          <View style={styles.penaltyRow}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
            <Text style={styles.penaltyText}>
              Negative marking: -{item.negativeMarking} per wrong answer
            </Text>
          </View>
        ) : null}

        {/* Action Button */}
        {item.hasAttempted ? (
          <TouchableOpacity
            style={styles.viewResultBtn}
            onPress={() =>
              navigation.navigate('ResultScreen', {
                submissionId: item.submission.id,
              })
            }
          >
            <Ionicons name="checkmark-done" size={18} color={colors.primary} />
            <Text style={styles.viewResultText}>
              View Results ({item.submission.score} pts)
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() =>
              navigation.navigate('ExamRunnerScreen', {
                examId: item.id,
                examTitle: item.title,
                durationMinutes: item.durationMinutes,
              })
            }
          >
            <Ionicons name="play" size={16} color="#fff" />
            <Text style={styles.startBtnText}>Start Exam Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Student Portal" />
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Examinations</Text>
          <Text style={styles.sectionCount}>{exams.length} scheduled</Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading assigned exams...</Text>
          </View>
        ) : (
          <FlatList
            data={exams}
            keyExtractor={(item) => item.id}
            renderItem={renderExamCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchExams(); }} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Exams Available</Text>
                <Text style={styles.emptyText}>There are currently no active exams scheduled for your class.</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionCount: {
    fontSize: 13,
    color: colors.textMuted,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 6,
  },
  examDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.borderLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  penaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  penaltyText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewResultBtn: {
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewResultText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
});
