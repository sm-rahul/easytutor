import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import { AIProvider } from './src/contexts/AIContext';
import { QuizProvider } from './src/contexts/QuizContext';

// Auth screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Main screens
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DetailScreen from './src/screens/DetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import QuizScreen from './src/screens/QuizScreen';
import QuizResultScreen from './src/screens/QuizResultScreen';
import QuizHistoryScreen from './src/screens/QuizHistoryScreen';
import QuizAttemptDetailScreen from './src/screens/QuizAttemptDetailScreen';
import AboutScreen from './src/screens/AboutScreen';

import { COLORS, GRADIENTS, SHADOWS } from './src/constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const detailHeader = {
  headerShown: true,
  headerTitle: 'Lesson Details',
  headerTintColor: COLORS.accent,
  headerStyle: { backgroundColor: COLORS.bgSecondary, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
  headerTitleStyle: { color: COLORS.textPrimary, fontWeight: '600' },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HomeDetail" component={DetailScreen} options={detailHeader} />
      <Stack.Screen name="HomeQuiz" component={QuizScreen} />
      <Stack.Screen name="HomeQuizResult" component={QuizResultScreen} />
      <Stack.Screen name="About" component={AboutScreen} options={{ ...detailHeader, headerTitle: 'About EasyTutor' }} />
    </Stack.Navigator>
  );
}

function CameraStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResult" component={QuizResultScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="HistoryDetail" component={DetailScreen} options={detailHeader} />
      <Stack.Screen name="HistoryQuiz" component={QuizScreen} />
      <Stack.Screen name="HistoryQuizResult" component={QuizResultScreen} />
    </Stack.Navigator>
  );
}

function GoalsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="QuizHistory" component={QuizHistoryScreen} />
      <Stack.Screen name="QuizAttemptDetail" component={QuizAttemptDetailScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, focused }) {
  if (focused) {
    return (
      <LinearGradient colors={GRADIENTS.accent} style={s.iconGradient}>
        <Ionicons name={name} size={20} color={COLORS.white} />
      </LinearGradient>
    );
  }
  return <Ionicons name={name + '-outline'} size={20} color={COLORS.textMuted} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: s.tabBar,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: s.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CameraTab"
        component={CameraStack}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ focused }) => <TabIcon name="camera" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => <TabIcon name="time" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="GoalsTab"
        component={GoalsStack}
        options={{
          tabBarLabel: 'Goals',
          tabBarIcon: ({ focused }) => <TabIcon name="flag" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationTypeForReplace: 'push' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function SplashScreen() {
  return (
    <View style={s.splash}>
      <LinearGradient colors={GRADIENTS.accent} style={s.splashIcon}>
        <Ionicons name="school" size={44} color={COLORS.white} />
      </LinearGradient>
      <Text style={s.splashTitle}>Easy<Text style={{ color: COLORS.accent }}>Tutor</Text></Text>
      <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 24 }} />
    </View>
  );
}

function RootNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

function FontLoadingScreen() {
  return (
    <View style={s.splash}>
      <Text style={s.splashTitle}>Easy<Text style={{ color: COLORS.accent }}>Tutor</Text></Text>
      <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 24 }} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn('Font load error:', e);
      }
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) return <FontLoadingScreen />;

  return (
    <AuthProvider>
      <AIProvider>
        <QuizProvider>
          <RootNavigator />
        </QuizProvider>
      </AIProvider>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 0,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  iconGradient: {
    width: 34,
    height: 34,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  splash: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    width: 96,
    height: 96,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.accentGlow,
  },
  splashEmoji: {
    fontSize: 48,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
});
