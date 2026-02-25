import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar,
  Animated, Easing, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { AIContext } from '../contexts/AIContext';
import { QuizContext } from '../contexts/QuizContext';
import { IconBadge, GlowIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

// Format minutes into readable string
const formatTime = (minutes) => {
  if (minutes < 1) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { stats, goals, updateDailyGoals, refreshGoals } = useContext(AIContext);
  const { performance, refreshPerformance } = useContext(QuizContext);

  const [editVisible, setEditVisible] = useState(false);
  const [editLessons, setEditLessons] = useState('');
  const [editMinutes, setEditMinutes] = useState('');

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(avatarScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Refresh goals and quiz performance when screen is focused
  useEffect(() => {
    refreshGoals();
    refreshPerformance();
  }, []);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const handleEditGoals = () => {
    setEditLessons(String(goals.dailyLessons || 3));
    setEditMinutes(String(goals.dailyMinutes || 15));
    setEditVisible(true);
  };

  const handleSaveGoals = async () => {
    const lessons = Math.max(1, Math.min(parseInt(editLessons) || 1, 50));
    const minutes = Math.max(1, Math.min(parseInt(editMinutes) || 5, 300));
    const success = await updateDailyGoals(lessons, minutes);
    if (success) {
      setEditVisible(false);
    } else {
      if (Platform.OS === 'web') {
        window.alert('Could not save goals. Please make sure the server is running.');
      } else {
        Alert.alert('Error', 'Could not save goals. Please make sure the server is running.');
      }
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const nameIsEmail = user?.name && user.name.includes('@');
  const displayName = nameIsEmail ? user.email : user.name;
  const displayEmail = nameIsEmail ? user.name : user.email;

  const details = [
    { icon: 'person-outline', label: 'Parent', value: displayName, color: COLORS.accent },
    { icon: 'mail-outline', label: 'Email', value: displayEmail, color: COLORS.accentPink },
    { icon: 'happy-outline', label: 'Child', value: user?.childName, color: COLORS.cyan },
    { icon: 'calendar-outline', label: 'Age', value: user?.childAge ? `${user.childAge} years` : '', color: COLORS.accentLight },
  ];

  // Goal progress calculations
  const lessonProgress = goals.dailyLessons > 0 ? Math.min(goals.todayLessons / goals.dailyLessons, 1) : 0;
  const timeProgress = goals.dailyMinutes > 0 ? Math.min(goals.todayReadingMinutes / goals.dailyMinutes, 1) : 0;
  const lessonGoalMet = lessonProgress >= 1;
  const timeGoalMet = timeProgress >= 1;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <Animated.View style={[s.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
          <LinearGradient colors={GRADIENTS.accent} style={s.avatar}>
            <Text style={s.avatarLetter}>{user?.avatar || '?'}</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <View style={s.nameBlock}>
            <Text style={s.name}>{displayName || 'User'}</Text>
            <Text style={s.email}>{displayEmail}</Text>
            {joinDate ? <Text style={s.joined}>Member since {joinDate}</Text> : null}
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {[
              { icon: 'camera-outline', num: stats.totalScans || 0, label: 'Scanned', gradient: GRADIENTS.accent },
              { icon: 'bookmark-outline', num: stats.totalSaved || 0, label: 'Saved', gradient: GRADIENTS.purple },
              { icon: 'star-outline', num: `${Math.min((stats.totalSaved || 0) * 10, 100)}%`, label: 'Progress', gradient: GRADIENTS.blue },
            ].map((st, i) => (
              <View key={i} style={s.statCard}>
                <IconBadge name={st.icon} size={16} gradient={st.gradient} bgSize={32} radius={10} />
                <Text style={s.statNum}>{st.num}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          {/* Daily Goals Section */}
          <View style={s.goalSection}>
            <View style={s.goalHeader}>
              <Text style={s.secTitle}>Daily Goals</Text>
              <TouchableOpacity onPress={handleEditGoals} style={s.editGoalBtn}>
                <Ionicons name="pencil-outline" size={14} color={COLORS.accent} />
                <Text style={s.editGoalText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* Lessons Goal */}
            <View style={s.goalCard}>
              <View style={s.goalCardHeader}>
                <View style={s.goalIconWrap}>
                  <LinearGradient colors={GRADIENTS.accent} style={s.goalIconBg}>
                    <Ionicons name="book-outline" size={16} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <View style={s.goalInfo}>
                  <Text style={s.goalLabel}>Lessons Today</Text>
                  <Text style={s.goalValue}>
                    {goals.todayLessons} <Text style={s.goalOf}>of</Text> {goals.dailyLessons}
                  </Text>
                </View>
                {lessonGoalMet && (
                  <View style={s.goalCheckWrap}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                  </View>
                )}
              </View>
              <View style={s.progressBarBg}>
                <LinearGradient
                  colors={lessonGoalMet ? ['#34D399', '#10B981'] : GRADIENTS.accent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.progressBarFill, { width: `${Math.max(lessonProgress * 100, 2)}%` }]}
                />
              </View>
            </View>

            {/* Reading Time Goal */}
            <View style={s.goalCard}>
              <View style={s.goalCardHeader}>
                <View style={s.goalIconWrap}>
                  <LinearGradient colors={GRADIENTS.blue} style={s.goalIconBg}>
                    <Ionicons name="time-outline" size={16} color={COLORS.white} />
                  </LinearGradient>
                </View>
                <View style={s.goalInfo}>
                  <Text style={s.goalLabel}>Reading Time</Text>
                  <Text style={s.goalValue}>
                    {formatTime(goals.todayReadingMinutes)} <Text style={s.goalOf}>of</Text> {formatTime(goals.dailyMinutes)}
                  </Text>
                </View>
                {timeGoalMet && (
                  <View style={s.goalCheckWrap}>
                    <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                  </View>
                )}
              </View>
              <View style={s.progressBarBg}>
                <LinearGradient
                  colors={timeGoalMet ? ['#34D399', '#10B981'] : GRADIENTS.blue}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.progressBarFill, { width: `${Math.max(timeProgress * 100, 2)}%` }]}
                />
              </View>
            </View>

            {/* Total Screen Time */}
            <View style={s.totalTimeCard}>
              <View style={s.goalIconWrap}>
                <LinearGradient colors={GRADIENTS.purple} style={s.goalIconBg}>
                  <Ionicons name="hourglass-outline" size={16} color={COLORS.white} />
                </LinearGradient>
              </View>
              <View style={s.goalInfo}>
                <Text style={s.goalLabel}>Total Reading Time</Text>
                <Text style={s.totalTimeValue}>{formatTime(goals.totalReadingMinutes)}</Text>
              </View>
            </View>
          </View>

          {/* Quiz Performance Section */}
          {performance && performance.overall.totalAttempts > 0 && (
            <View style={s.goalSection}>
              <Text style={s.secTitle}>Quiz Performance</Text>
              <View style={s.quizStatsRow}>
                <View style={s.quizStatCard}>
                  <IconBadge name="school" size={rs(16)} gradient={GRADIENTS.purple} bgSize={rs(32)} />
                  <Text style={s.quizStatNum}>{performance.overall.totalAttempts}</Text>
                  <Text style={s.quizStatLabel}>Quizzes</Text>
                </View>
                <View style={s.quizStatCard}>
                  <IconBadge name="trending-up" size={rs(16)} gradient={GRADIENTS.accent} bgSize={rs(32)} />
                  <Text style={s.quizStatNum}>{Math.round(performance.overall.avgScore)}%</Text>
                  <Text style={s.quizStatLabel}>Avg Score</Text>
                </View>
                <View style={s.quizStatCard}>
                  <IconBadge name="trophy" size={rs(16)} gradient={['#F59E0B', '#FBBF24']} bgSize={rs(32)} />
                  <Text style={s.quizStatNum}>{Math.round(performance.overall.bestScore)}%</Text>
                  <Text style={s.quizStatLabel}>Best</Text>
                </View>
              </View>

              {/* By content type */}
              {performance.byContentType.length > 0 && (
                <View style={s.quizTypeRow}>
                  {performance.byContentType.map((t, i) => (
                    <View key={i} style={s.quizTypeChip}>
                      <Text style={s.quizTypeLabel}>{t.contentType}</Text>
                      <Text style={s.quizTypeScore}>{Math.round(t.avgScore)}%</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Recent trend chart */}
              {performance.recentTrend.length > 1 && (
                <View style={s.trendContainer}>
                  <View style={s.trendHeader}>
                    <Ionicons name="analytics-outline" size={rs(16)} color={COLORS.accent} />
                    <Text style={s.trendLabel}>Recent Trend</Text>
                  </View>

                  {/* Grid lines */}
                  <View style={s.trendChart}>
                    <View style={s.trendGridLines}>
                      {[100, 75, 50, 25, 0].map((val) => (
                        <View key={val} style={s.trendGridRow}>
                          <Text style={s.trendGridText}>{val}</Text>
                          <View style={s.trendGridLine} />
                        </View>
                      ))}
                    </View>

                    {/* Bars area */}
                    <View style={s.trendBarsArea}>
                      <View style={s.trendBars}>
                        {performance.recentTrend.map((t, i) => {
                          const pct = Math.round(t.percentage);
                          const barColor = pct >= 80
                            ? [COLORS.success, '#10B981']
                            : pct >= 50
                              ? [COLORS.warning, '#F59E0B']
                              : GRADIENTS.danger;
                          const dotColor = pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.warning : COLORS.danger;

                          return (
                            <View key={i} style={s.trendBarCol}>
                              {/* Score label on top */}
                              <Text style={[s.trendScoreLabel, { color: dotColor }]}>{pct}%</Text>
                              <View style={s.trendBarWrap}>
                                <View style={[s.trendBar, { height: `${Math.max(pct, 4)}%` }]}>
                                  <LinearGradient
                                    colors={barColor}
                                    start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
                                    style={s.trendBarFill}
                                  />
                                  {/* Glowing dot on top */}
                                  <View style={[s.trendDot, { backgroundColor: dotColor, shadowColor: dotColor }]} />
                                </View>
                              </View>
                              {/* Quiz number label */}
                              <Text style={s.trendBarLabel}>#{i + 1}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* Avg line indicator */}
                  {(() => {
                    const avg = Math.round(performance.recentTrend.reduce((sum, t) => sum + t.percentage, 0) / performance.recentTrend.length);
                    return (
                      <View style={s.trendAvgRow}>
                        <View style={s.trendAvgDash} />
                        <Text style={s.trendAvgText}>Avg: {avg}%</Text>
                        <View style={s.trendAvgDash} />
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>
          )}

          {/* Account details */}
          <Text style={s.secTitle}>Account Details</Text>
          {details.map((d, i) => (
            <View key={i} style={s.detailRow}>
              <GlowIcon name={d.icon} color={d.color} size={18} bgSize={38} />
              <View style={s.detailText}>
                <Text style={s.detailLabel}>{d.label}</Text>
                <Text style={s.detailValue}>{d.value || '—'}</Text>
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={s.version}>EasyTutor v1.0.0</Text>
          <View style={s.creditWrap}>
            <Ionicons name="code-slash-outline" size={13} color={COLORS.textMuted} />
            <Text style={s.creditText}>Developed by <Text style={s.creditName}>Rahul Namdeo</Text></Text>
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Edit Goals Overlay */}
      {editVisible && (
        <View style={s.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditVisible(false)} />
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Set Daily Goals</Text>
            <Text style={s.modalSubtitle}>Choose your daily learning targets</Text>

            <View style={s.modalInputGroup}>
              <View style={s.modalInputRow}>
                <Ionicons name="book-outline" size={18} color={COLORS.accent} />
                <Text style={s.modalInputLabel}>Lessons per day</Text>
              </View>
              <TextInput
                style={s.modalInput}
                value={editLessons}
                onChangeText={setEditLessons}
                keyboardType="number-pad"
                placeholder="3"
                placeholderTextColor={COLORS.textMuted}
                maxLength={2}
              />
            </View>

            <View style={s.modalInputGroup}>
              <View style={s.modalInputRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.cyan} />
                <Text style={s.modalInputLabel}>Minutes per day</Text>
              </View>
              <TextInput
                style={s.modalInput}
                value={editMinutes}
                onChangeText={setEditMinutes}
                keyboardType="number-pad"
                placeholder="15"
                placeholderTextColor={COLORS.textMuted}
                maxLength={3}
              />
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1 }} onPress={handleSaveGoals}>
                <LinearGradient colors={GRADIENTS.accent} style={s.modalSaveBtn}>
                  <Ionicons name="checkmark" size={18} color={COLORS.white} />
                  <Text style={s.modalSaveText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  scroll: { paddingHorizontal: rs(16), paddingTop: rs(60), paddingBottom: rs(30) },
  avatarWrap: { alignItems: 'center', marginBottom: rs(16) },
  avatar: { width: rs(90), height: rs(90), borderRadius: rs(30), justifyContent: 'center', alignItems: 'center', ...SHADOWS.accentGlow },
  avatarLetter: { fontSize: ms(38), fontWeight: '800', color: COLORS.white },
  nameBlock: { alignItems: 'center', marginBottom: rs(24) },
  name: { ...FONTS.h1, color: COLORS.textPrimary },
  email: { ...FONTS.body, color: COLORS.textSecondary, marginTop: 2 },
  joined: { ...FONTS.caption, color: COLORS.textMuted, marginTop: rs(4) },
  statsRow: { flexDirection: 'row', gap: rs(8), marginBottom: rs(24) },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(18), alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: ms(20), fontWeight: '800', color: COLORS.textPrimary, marginTop: rs(6) },
  statLabel: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 2 },
  secTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: rs(12) },

  // Daily Goals
  goalSection: { marginBottom: rs(24) },
  goalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: rs(12) },
  editGoalBtn: { flexDirection: 'row', alignItems: 'center', gap: rs(4), paddingHorizontal: rs(12), paddingVertical: rs(6), borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderAccent, backgroundColor: COLORS.accentGlow },
  editGoalText: { ...FONTS.caption, color: COLORS.accent, fontWeight: '600' },
  goalCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(16),
    marginBottom: rs(10), borderWidth: 1, borderColor: COLORS.border,
  },
  goalCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(12) },
  goalIconWrap: { marginRight: rs(12) },
  goalIconBg: { width: rs(36), height: rs(36), borderRadius: rs(12), justifyContent: 'center', alignItems: 'center' },
  goalInfo: { flex: 1 },
  goalLabel: { ...FONTS.caption, color: COLORS.textMuted, marginBottom: rs(2) },
  goalValue: { fontSize: ms(16), fontWeight: '700', color: COLORS.textPrimary },
  goalOf: { fontSize: ms(12), fontWeight: '400', color: COLORS.textMuted },
  goalCheckWrap: { marginLeft: rs(8) },
  progressBarBg: {
    height: rs(8), backgroundColor: COLORS.bgSecondary, borderRadius: rs(4), overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: rs(4) },
  totalTimeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, padding: rs(16), borderWidth: 1, borderColor: COLORS.border,
  },
  totalTimeValue: { fontSize: ms(18), fontWeight: '800', color: COLORS.accentLight },

  // Quiz Performance
  quizStatsRow: { flexDirection: 'row', gap: rs(8), marginBottom: rs(12) },
  quizStatCard: {
    flex: 1, alignItems: 'center', gap: rs(6),
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(14),
    borderWidth: 1, borderColor: COLORS.border,
  },
  quizStatNum: { fontSize: ms(18), fontWeight: '800', color: COLORS.textPrimary },
  quizStatLabel: { ...FONTS.caption, color: COLORS.textMuted },
  quizTypeRow: { flexDirection: 'row', gap: rs(8), flexWrap: 'wrap', marginBottom: rs(12) },
  quizTypeChip: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full,
    paddingHorizontal: rs(14), paddingVertical: rs(8),
    borderWidth: 1, borderColor: COLORS.border,
  },
  quizTypeLabel: { ...FONTS.caption, color: COLORS.textMuted, textTransform: 'capitalize' },
  quizTypeScore: { ...FONTS.bodySmall, color: COLORS.accent, fontWeight: '700' },
  trendContainer: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(16),
    borderWidth: 1, borderColor: COLORS.border,
  },
  trendHeader: {
    flexDirection: 'row', alignItems: 'center', gap: rs(6), marginBottom: rs(14),
  },
  trendLabel: { ...FONTS.caption, color: COLORS.textMuted, fontWeight: '600' },
  trendChart: { flexDirection: 'row' },
  trendGridLines: { width: rs(28), justifyContent: 'space-between', marginRight: rs(4) },
  trendGridRow: { flexDirection: 'row', alignItems: 'center', height: 0 },
  trendGridText: { fontSize: ms(8), color: COLORS.textMuted + '80', width: rs(22), textAlign: 'right' },
  trendGridLine: {
    position: 'absolute', left: rs(26), right: -rs(500), height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  trendBarsArea: { flex: 1, height: rs(120), overflow: 'hidden' },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', height: '100%', gap: rs(4), paddingHorizontal: rs(2) },
  trendBarCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  trendScoreLabel: { fontSize: ms(9), fontWeight: '700', marginBottom: rs(3) },
  trendBarWrap: { width: '70%', maxWidth: rs(28), flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  trendBar: {
    width: '100%', borderRadius: rs(6), overflow: 'visible',
    minHeight: rs(4), alignItems: 'center',
  },
  trendBarFill: {
    ...StyleSheet.absoluteFillObject, borderRadius: rs(6),
  },
  trendDot: {
    position: 'absolute', top: -rs(3), width: rs(8), height: rs(8),
    borderRadius: rs(4), borderWidth: 1.5, borderColor: COLORS.bgCard,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4,
  },
  trendBarLabel: { fontSize: ms(8), color: COLORS.textMuted, marginTop: rs(4), fontWeight: '500' },
  trendAvgRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(8), marginTop: rs(12),
  },
  trendAvgDash: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: StyleSheet.hairlineWidth, borderColor: COLORS.accent + '40' },
  trendAvgText: { ...FONTS.caption, color: COLORS.accent, fontWeight: '700' },

  // Account details
  detailRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, padding: rs(18), marginBottom: rs(8), borderWidth: 1, borderColor: COLORS.border,
  },
  detailText: { marginLeft: rs(14), flex: 1 },
  detailLabel: { ...FONTS.caption, color: COLORS.textMuted },
  detailValue: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600', marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(10),
    paddingVertical: rs(15), borderRadius: RADIUS.xxl, marginTop: rs(24),
    borderWidth: 1.5, borderColor: COLORS.danger + '30', backgroundColor: COLORS.danger + '08',
  },
  logoutText: { ...FONTS.button, color: COLORS.danger },
  version: { ...FONTS.caption, color: COLORS.textMuted, textAlign: 'center', marginTop: rs(20) },
  creditWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(5), marginTop: rs(8) },
  creditText: { ...FONTS.caption, color: COLORS.textMuted },
  creditName: { color: COLORS.accentLight, fontWeight: '700' },

  // Edit Goals Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: rs(24),
  },
  modalCard: {
    width: '100%', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: rs(24), borderWidth: 1, borderColor: COLORS.borderLight,
  },
  modalTitle: { ...FONTS.h2, color: COLORS.textPrimary, textAlign: 'center', marginBottom: rs(4) },
  modalSubtitle: { ...FONTS.bodySmall, color: COLORS.textMuted, textAlign: 'center', marginBottom: rs(24) },
  modalInputGroup: { marginBottom: rs(18) },
  modalInputRow: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(8) },
  modalInputLabel: { ...FONTS.body, color: COLORS.textSecondary, fontWeight: '600' },
  modalInput: {
    backgroundColor: COLORS.bgInput, borderRadius: RADIUS.lg, paddingHorizontal: rs(16),
    paddingVertical: rs(14), fontSize: ms(18), fontWeight: '700', color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: rs(12), marginTop: rs(8) },
  modalCancelBtn: {
    flex: 1, paddingVertical: rs(14), borderRadius: RADIUS.xl, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bgSecondary,
  },
  modalCancelText: { ...FONTS.button, color: COLORS.textSecondary },
  modalSaveBtn: {
    flex: 1, flexDirection: 'row', gap: rs(6), paddingVertical: rs(14),
    borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center',
  },
  modalSaveText: { ...FONTS.button, color: COLORS.white },
});
