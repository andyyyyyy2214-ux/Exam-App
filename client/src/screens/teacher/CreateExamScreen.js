import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import { colors } from '../../theme/colors';

export default function CreateExamScreen({ navigation }) {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [passMarks, setPassMarks] = useState('40.0');
  const [negativeMarking, setNegativeMarking] = useState('0.25');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const getDemoSubjects = () => [
    { id: 'demo-sub-1', name: 'Computer Networks', code: 'CS401' },
    { id: 'demo-sub-2', name: 'Operating Systems', code: 'CS301' },
  ];

  const getDemoQuestions = () => [
    { id: 'demo-qb-1', text: 'Which protocol maps IP to MAC address?', marks: 2 },
    { id: 'demo-qb-2', text: 'Which OSI layer provides reliability and flow control?', marks: 2 },
    { id: 'demo-qb-3', text: 'Which scheduling algorithm gives minimum average wait time?', marks: 2 },
    { id: 'demo-qb-4', text: 'What data structure is used for BFS traversal in networks?', marks: 2 },
  ];

  const fetchPrerequisites = async () => {
    try {
      const [sRes, qRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/questions'),
      ]);
      const fetchedS = sRes.data && sRes.data.length > 0 ? sRes.data : getDemoSubjects();
      const fetchedQ = qRes.data && qRes.data.length > 0 ? qRes.data : getDemoQuestions();
      setSubjects(fetchedS);
      setQuestions(fetchedQ);
      if (fetchedS.length > 0) {
        setSelectedSubjectId(fetchedS[0].id);
      }
      if (fetchedQ.length > 0) {
        setSelectedQuestionIds(fetchedQ.map((q) => q.id));
      }
    } catch (error) {
      console.log('Using fallback exam requirements:', error.message);
      const demoS = getDemoSubjects();
      const demoQ = getDemoQuestions();
      setSubjects(demoS);
      setQuestions(demoQ);
      setSelectedSubjectId(demoS[0].id);
      setSelectedQuestionIds(demoQ.map((q) => q.id));
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelection = (id) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const calculateTotalMarks = () => {
    const selected = questions.filter((q) => selectedQuestionIds.includes(q.id));
    return selected.reduce((sum, q) => sum + (q.marks || 1), 0);
  };

  const handleCreate = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      const msg = 'Please provide an exam title.';
      setErrorMsg(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation', msg);
      return;
    }
    if (!selectedSubjectId) {
      const msg = 'Please select a subject.';
      setErrorMsg(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation', msg);
      return;
    }
    if (selectedQuestionIds.length === 0) {
      const msg = 'Please select at least one question below.';
      setErrorMsg(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation', msg);
      return;
    }

    setCreating(true);
    try {
      await api.post('/exams', {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: selectedSubjectId,
        durationMinutes: parseInt(durationMinutes, 10) || 30,
        totalMarks: calculateTotalMarks(),
        passMarks: parseFloat(passMarks) || 40.0,
        negativeMarking: parseFloat(negativeMarking) || 0.0,
        questionIds: selectedQuestionIds,
      });

      const succ = '✅ Exam created and scheduled successfully!';
      setSuccessMsg(succ);
      if (Platform.OS === 'web') window.alert(succ);
      else Alert.alert('Success', succ);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (error) {
      console.log('Error creating exam:', error.message);
      const err = error.message || 'Failed to create exam.';
      setErrorMsg(err);
      if (Platform.OS === 'web') window.alert(err);
      else Alert.alert('Error', err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.screenTitle}>Schedule New Exam</Text>

      {errorMsg ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {successMsg ? (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      ) : null}

      {/* General Information */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Basic Settings</Text>

        <Text style={styles.label}>Exam Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. CS101 Final Assessment"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Subject / Department</Text>
        <View style={styles.subjectRow}>
          {subjects.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.subChip,
                selectedSubjectId === sub.id && styles.subChipActive,
              ]}
              onPress={() => setSelectedSubjectId(sub.id)}
            >
              <Text
                style={[
                  styles.subChipText,
                  selectedSubjectId === sub.id && styles.subChipTextActive,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description / Guidelines</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Instructions for students..."
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Scoring & Timing Parameters */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Grading Parameters</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration (Mins)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Pass Mark (Pts)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={passMarks}
              onChangeText={setPassMarks}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Negative Mark</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={negativeMarking}
              onChangeText={setNegativeMarking}
            />
          </View>
        </View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>
            Computed Total Marks: <Text style={{ fontWeight: 'bold' }}>{calculateTotalMarks()} pts</Text>
          </Text>
        </View>
      </View>

      {/* Question Selection Grid */}
      <View style={styles.card}>
        <View style={styles.qHeaderRow}>
          <Text style={styles.sectionHeading}>Assemble Questions</Text>
          <Text style={styles.qSelectedCount}>
            {selectedQuestionIds.length} / {questions.length} selected
          </Text>
        </View>

        {questions.map((q) => {
          const isSelected = selectedQuestionIds.includes(q.id);

          return (
            <TouchableOpacity
              key={q.id}
              style={[styles.questionSelectCard, isSelected && styles.qSelected]}
              onPress={() => toggleQuestionSelection(q.id)}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSelected ? colors.primary : colors.textMuted}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.questionText} numberOfLines={2}>
                  {q.text}
                </Text>
                <Text style={styles.questionMeta}>
                  {q.subject?.code} • {q.marks} marks • {q.type}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleCreate}
        disabled={creating}
      >
        {creating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Publish & Schedule Exam</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  subChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  subChipText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  subChipTextActive: {
    color: colors.primaryDark,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  totalBadge: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 8,
    marginTop: 14,
    alignItems: 'center',
  },
  totalBadgeText: {
    fontSize: 13,
    color: colors.primaryDark,
  },
  qHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qSelectedCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  questionSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  qSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  questionMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  successText: {
    color: colors.success,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
});
