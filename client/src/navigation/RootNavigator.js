import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Student Screens
import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import ExamRunnerScreen from '../screens/student/ExamRunnerScreen';
import ResultScreen from '../screens/student/ResultScreen';
import StudentHistoryScreen from '../screens/student/StudentHistoryScreen';

// Teacher Screens
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import QuestionBankScreen from '../screens/teacher/QuestionBankScreen';
import CreateExamScreen from '../screens/teacher/CreateExamScreen';
import ExamAnalyticsScreen from '../screens/teacher/ExamAnalyticsScreen';

// Admin Screen
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

// Common Screens
import NotificationsScreen from '../screens/common/NotificationsScreen';
import HelpSupportScreen from '../screens/common/HelpSupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- STUDENT STACK & TABS ---
function StudentExamStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <Stack.Screen name="ExamRunnerScreen" component={ExamRunnerScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
    </Stack.Navigator>
  );
}

function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'book';
          if (route.name === 'ExamsTab') iconName = 'school';
          if (route.name === 'HistoryTab') iconName = 'time';
          if (route.name === 'AlertsTab') iconName = 'notifications';
          if (route.name === 'HelpTab') iconName = 'help-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ExamsTab" component={StudentExamStack} options={{ title: 'Exams' }} />
      <Tab.Screen name="HistoryTab" component={StudentHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="AlertsTab" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="HelpTab" component={HelpSupportScreen} options={{ title: 'Help' }} />
    </Tab.Navigator>
  );
}

// --- TEACHER STACK & TABS ---
function TeacherExamStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
      <Stack.Screen name="CreateExamScreen" component={CreateExamScreen} />
      <Stack.Screen name="QuestionBankScreen" component={QuestionBankScreen} />
      <Stack.Screen name="ExamAnalyticsScreen" component={ExamAnalyticsScreen} />
      <Stack.Screen name="ResultScreen" component={ResultScreen} />
    </Stack.Navigator>
  );
}

function TeacherNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'briefcase';
          if (route.name === 'ManageTab') iconName = 'clipboard';
          if (route.name === 'BankTab') iconName = 'library';
          if (route.name === 'AlertsTab') iconName = 'notifications';
          if (route.name === 'HelpTab') iconName = 'help-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ManageTab" component={TeacherExamStack} options={{ title: 'Exams' }} />
      <Tab.Screen name="BankTab" component={QuestionBankScreen} options={{ title: 'Bank' }} />
      <Tab.Screen name="AlertsTab" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="HelpTab" component={HelpSupportScreen} options={{ title: 'Help' }} />
    </Tab.Navigator>
  );
}

// --- ADMIN TABS ---
function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'settings';
          if (route.name === 'AdminTab') iconName = 'speedometer';
          if (route.name === 'AlertsTab') iconName = 'notifications';
          if (route.name === 'HelpTab') iconName = 'help-circle';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminTab" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="AlertsTab" component={NotificationsScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="HelpTab" component={HelpSupportScreen} options={{ title: 'Help' }} />
    </Tab.Navigator>
  );
}

// --- ROOT NAVIGATOR ---
export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : user.role === 'ADMIN' ? (
        <AdminNavigator />
      ) : user.role === 'TEACHER' ? (
        <TeacherNavigator />
      ) : (
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
}
