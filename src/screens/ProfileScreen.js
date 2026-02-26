import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar,
  Animated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { AIContext } from '../contexts/AIContext';
import { IconBadge, GlowIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { stats, goals } = useContext(AIContext);

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

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <Animated.View style={[s.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
          <LinearGradient colors={GRADIENTS.accent} style={s.avatar}>
            {user?.avatar ? (
              <Text style={s.avatarLetter}>{user.avatar}</Text>
            ) : (
              <Ionicons name="school" size={ms(34)} color={COLORS.white} />
            )}
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
            {(() => {
              const lessonProg = goals.dailyLessons > 0 ? Math.min(goals.todayLessons / goals.dailyLessons, 1) : 0;
              const timeProg = goals.dailyMinutes > 0 ? Math.min(goals.todayReadingMinutes / goals.dailyMinutes, 1) : 0;
              const overallProg = Math.round(((lessonProg + timeProg) / 2) * 100);

              return [
                { icon: 'camera-outline', num: stats.totalScans || 0, label: 'Scanned', gradient: GRADIENTS.accent, tab: 'CameraTab' },
                { icon: 'bookmark-outline', num: stats.totalSaved || 0, label: 'Saved', gradient: GRADIENTS.purple, tab: 'HistoryTab' },
                { icon: 'star-outline', num: `${overallProg}%`, label: 'Progress', gradient: GRADIENTS.blue, tab: 'GoalsTab' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={s.statCard} activeOpacity={0.7} onPress={() => navigation.navigate(item.tab)}>
                  <IconBadge name={item.icon} size={16} gradient={item.gradient} bgSize={32} radius={10} />
                  <Text style={s.statNum}>{item.num}</Text>
                  <Text style={s.statLabel}>{item.label}</Text>
                </TouchableOpacity>
              ));
            })()}
          </View>

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
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  scroll: { paddingHorizontal: rs(16), paddingTop: rs(36), paddingBottom: rs(36) },
  avatarWrap: { alignItems: 'center', marginBottom: rs(14) },
  avatar: { width: rs(80), height: rs(80), borderRadius: rs(28), justifyContent: 'center', alignItems: 'center', ...SHADOWS.accentGlow },
  avatarLetter: { fontSize: ms(34), fontWeight: '800', color: COLORS.white },
  nameBlock: { alignItems: 'center', marginBottom: rs(20) },
  name: { ...FONTS.h1, color: COLORS.textPrimary },
  email: { ...FONTS.bodySmall, color: COLORS.textSecondary, marginTop: 2 },
  joined: { ...FONTS.caption, color: COLORS.textMuted, marginTop: rs(4) },
  statsRow: { flexDirection: 'row', gap: rs(8), marginBottom: rs(20) },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(16), alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: ms(18), fontWeight: '800', color: COLORS.textPrimary, marginTop: rs(6) },
  statLabel: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 2 },
  secTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: rs(10) },

  // Account details
  detailRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, padding: rs(16), marginBottom: rs(8), borderWidth: 1, borderColor: COLORS.border,
  },
  detailText: { marginLeft: rs(12), flex: 1 },
  detailLabel: { ...FONTS.caption, color: COLORS.textMuted },
  detailValue: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600', marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(10),
    paddingVertical: rs(14), borderRadius: RADIUS.xxl, marginTop: rs(20),
    borderWidth: 1.5, borderColor: COLORS.danger + '30', backgroundColor: COLORS.danger + '08',
  },
  logoutText: { ...FONTS.button, color: COLORS.danger },
  version: { ...FONTS.caption, color: COLORS.textMuted, textAlign: 'center', marginTop: rs(16) },
  creditWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(5), marginTop: rs(8) },
  creditText: { ...FONTS.caption, color: COLORS.textMuted },
  creditName: { color: COLORS.accentLight, fontWeight: '700' },
});
