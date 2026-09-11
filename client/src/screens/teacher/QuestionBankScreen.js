import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

export default function QuestionBankScreen({ navigation }) {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState('2.0');
  const [negativeMarks, setNegativeMarks] = useState('0.5');
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const getDemoSubjects = () => [
    { id: 'demo-sub-1', name: 'Computer Networks', code: 'CS401' },
    { id: 'demo-sub-2', name: 'Operating Systems', code: 'CS301' },
  ];

  const getDemoQuestions = () => [
    {
      id: 'demo-qb-1',
      text: 'Which protocol is used to map an IP address to a physical MAC address?',
      marks: '2.0',
      subject: { name: 'Computer Networks', code: 'CS401' },
      options: [
        { id: 'demo-opt-1', text: 'ARP (Address Resolution Protocol)', isCorrect: true },
        { id: 'demo-opt-2', text: 'DHCP (Dynamic Host Configuration Protocol)', isCorrect: false },
        { id: 'demo-opt-3', text: 'DNS (Domain Name System)', isCorrect: false },
        { id: 'demo-opt-4', text: 'ICMP (Internet Control Message Protocol)', isCorrect: false },
      ],
    },
    {
      id: 'demo-qb-2',
      text: 'Which layer of the OSI model provides end-to-end communication control and reliability?',
      marks: '2.0',
      subject: { name: 'Computer Networks', code: 'CS401' },
      options: [
        { id: 'demo-opt-5', text: 'Data Link Layer', isCorrect: false },
        { id: 'demo-opt-6', text: 'Network Layer', isCorrect: false },
        { id: 'demo-opt-7', text: 'Transport Layer', isCorrect: true },
        { id: 'demo-opt-8', text: 'Session Layer', isCorrect: false },
      ],
    },
    {
      id: 'demo-qb-3',
      text: 'Which CPU scheduling algorithm gives minimum average waiting time for a given set of processes?',
      marks: '2.0',
      subject: { name: 'Operating Systems', code: 'CS301' },
      options: [
        { id: 'demo-opt-9', text: 'FCFS (First Come First Serve)', isCorrect: false },
        { id: 'demo-opt-10', text: 'SJF (Shortest Job First)', isCorrect: true },
        { id: 'demo-opt-11', text: 'Round Robin', isCorrect: false },
        { id: 'demo-opt-12', text: 'Priority Scheduling', isCorrect: false },
      ],
    },
  ];

  const loadData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        api.get('/questions'),
        api.get('/subjects'),
      ]);
      const fetchedQ = qRes.data && qRes.data.length > 0 ? qRes.data : getDemoQuestions();
      const fetchedS = sRes.data && sRes.data.length > 0 ? sRes.data : getDemoSubjects();
      setQuestions(fetchedQ);
      setSubjects(fetchedS);
      if (fetchedS.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(fetchedS[0].id);
      }
    } catch (error) {
      console.log('Using fallback question bank data:', error.message);
      const demoQ = getDemoQuestions();
      const demoS = getDemoSubjects();
      setQuestions(demoQ);
      setSubjects(demoS);
      if (!selectedSubjectId) {
        setSelectedSubjectId(demoS[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (text, index) => {
    const updated = [...options];
    updated[index].text = text;
    setOptions(updated);
  };

  const handleSelectCorrect = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const handleCreateQuestion = async () => {
    setErrorMsg('');
    if (!questionText.trim()) {
      const msg = 'Please enter question text.';
      setErrorMsg(msg);
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Validation', msg);
      return;
    }
    const emptyOption = options.some((opt) => !opt.text.trim());
    if (emptyOption) {
      const msg = 'Please fill in text for all 4 options.';
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

    setSaving(true);
    try {
      const res = await api.post('/questions', {
        subjectId: selectedSubjectId,
        text: questionText.trim(),
        explanation: explanation.trim() || undefined,
        marks: parseFloat(marks) || 1.0,
        negativeMarks: parseFloat(negativeMarks) || 0.0,
        options: options.map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
      });

      if (res.data) {
        setQuestions((prev) => [res.data, ...prev]);
      }
      const succ = '✅ Question added to question bank!';
      if (Platform.OS === 'web') window.alert(succ);
      else Alert.alert('Success', succ);

      setModalVisible(false);
      setQuestionText('');
      setExplanation('');
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      loadData();
    } catch (error) {
      console.log('Error creating question:', error.message);
      const err = error.message || 'Failed to create question.';
      setErrorMsg(err);
      if (Platform.OS === 'web') window.alert(err);
      else Alert.alert('Error', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation?.canGoBack && navigation.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : null}
          <View>
            <Text style={styles.headerTitle}>Question Repository</Text>
            <Text style={styles.headerSub}>{questions.length} total questions available</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Add Question</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={styles.qCard}>
              <View style={styles.cardHeader}>
                <Badge label={item.subject?.code || 'GEN'} variant="primary" />
                <Badge label={`${item.marks} pts`} variant="secondary" />
              </View>

              <Text style={styles.qTitle}>
                {index + 1}. {item.text}
              </Text>

              <View style={styles.optionsPreview}>
                {item.options?.map((opt) => (
                  <View
                    key={opt.id}
                    style={[styles.optPill, opt.isCorrect && styles.optPillCorrect]}
                  >
                    {opt.isCorrect ? (
                      <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={14} color={colors.textMuted} />
                    )}
                    <Text
                      style={[styles.optText, opt.isCorrect && styles.optTextCorrect]}
                    >
                      {opt.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        />
      )}

      {/* Add Question Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Question</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Subject</Text>
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
                      {sub.code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Question Prompt</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Enter question text here..."
                multiline
                value={questionText}
                onChangeText={setQuestionText}
              />

              <Text style={styles.label}>Options (Tap checkmark to set answer key)</Text>
              {options.map((opt, idx) => (
                <View key={idx} style={styles.optionInputRow}>
                  <TouchableOpacity
                    style={[styles.checkBtn, opt.isCorrect && styles.checkBtnActive]}
                    onPress={() => handleSelectCorrect(idx)}
                  >
                    <Ionicons
                      name={opt.isCorrect ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={opt.isCorrect ? colors.success : colors.textMuted}
                    />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    value={opt.text}
                    onChangeText={(t) => handleOptionChange(t, idx)}
                  />
                </View>
              ))}

              <View style={styles.marksRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Points (Marks)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={marks}
                    onChangeText={setMarks}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Penalty (Neg.)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={negativeMarks}
                    onChangeText={setNegativeMarks}
                  />
                </View>
              </View>

              <Text style={styles.label}>Explanation / Solution Rationale</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Why is this option correct?"
                multiline
                value={explanation}
                onChangeText={setExplanation}
              />

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateQuestion}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save to Question Bank</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  qCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionsPreview: {
    gap: 6,
  },
  optPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.borderLight,
    gap: 8,
  },
  optPillCorrect: {
    backgroundColor: colors.successLight,
  },
  optText: {
    fontSize: 13,
    color: colors.text,
  },
  optTextCorrect: {
    fontWeight: 'bold',
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  checkBtn: {
    padding: 4,
  },
  checkBtnActive: {},
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  marksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
    flex: 1,
  },
});
