import React, { useContext, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar, Animated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { AIContext } from '../contexts/AIContext';
import { IconBadge, GlowIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { stats } = useContext(AIContext);

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

  // Auto-detect if name/email were swapped during registration
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
});
