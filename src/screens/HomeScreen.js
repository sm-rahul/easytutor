import React, { useContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, FlatList, StatusBar, Animated, Easing, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AIContext } from '../contexts/AIContext';
import { AuthContext } from '../contexts/AuthContext';
import HistoryCard from '../components/HistoryCard';
import { IconBadge, CircleIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

const QUOTES = [
  'Building a brighter future, one photo at a time.',
  'Every new word learned is a step forward.',
  'Learning never stops when you have the right tools.',
  'Small lessons today, big achievements tomorrow.',
];

export default function HomeScreen({ navigation }) {
  const { history, stats, goals, refreshHistory, refreshGoals } = useContext(AIContext);
  const { user } = useContext(AuthContext);
  const recent = history.slice(0, 5);

  const heroOp = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(30)).current;
  const statsOp = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(40)).current;
  const ctaOp = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(0.9)).current;
  const restOp = useRef(new Animated.Value(0)).current;
  const restY = useRef(new Animated.Value(30)).current;
  const orbPulse = useRef(new Animated.Value(0.3)).current;

  const [qi, setQi] = useState(0);
  const quoteOp = useRef(new Animated.Value(1)).current;

  useFocusEffect(useCallback(() => { refreshHistory(); refreshGoals(); }, [refreshHistory, refreshGoals]));

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(heroOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(heroY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(statsOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(statsY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(ctaScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(ctaOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(restOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(restY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(orbPulse, { toValue: 0.7, duration: 3000, useNativeDriver: true }),
      Animated.timing(orbPulse, { toValue: 0.3, duration: 3000, useNativeDriver: true }),
    ])).start();

    const iv = setInterval(() => {
      Animated.timing(quoteOp, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setQi(p => (p + 1) % QUOTES.length);
        Animated.timing(quoteOp, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View style={{ opacity: heroOp, transform: [{ translateY: heroY }] }}>
          <LinearGradient colors={GRADIENTS.hero} style={st.hero}>
            <Animated.View style={[st.orb, st.orb1, { opacity: orbPulse }]} />
            <Animated.View style={[st.orb, st.orb2, { opacity: orbPulse }]} />
            <View style={st.heroTop}>
              <View>
                <Text style={st.welcome}>Welcome back!</Text>
                <Text style={st.greeting}>Hello, {user?.childName || 'Learner'}</Text>
                <Text style={st.heroSub}>Ready to learn something new?</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
                <LinearGradient colors={GRADIENTS.accent} style={st.avatarSmall}>
                  {user?.avatar ? (
                    <Text style={st.avatarText}>{user.avatar}</Text>
                  ) : (
                    <Ionicons name="school" size={ms(22)} color={COLORS.white} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[st.statsRow, { opacity: statsOp, transform: [{ translateY: statsY }] }]}>
          <TouchableOpacity style={st.statCard} activeOpacity={0.7} onPress={() => navigation.getParent()?.navigate('CameraTab')}>
            <IconBadge name="camera-outline" size={18} gradient={GRADIENTS.accent} bgSize={36} radius={12} />
            <Text style={st.statNum}>{stats.totalScans || 0}</Text>
            <Text style={st.statLabel}>Scanned</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.statCard} activeOpacity={0.7} onPress={() => navigation.getParent()?.navigate('HistoryTab')}>
            <IconBadge name="bookmark-outline" size={18} gradient={GRADIENTS.purple} bgSize={36} radius={12} />
            <Text style={st.statNum}>{stats.totalSaved || 0}</Text>
            <Text style={st.statLabel}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.statCard} activeOpacity={0.7} onPress={() => navigation.getParent()?.navigate('GoalsTab')}>
            <IconBadge name="flame-outline" size={18} gradient={GRADIENTS.blue} bgSize={36} radius={12} />
            <Text style={st.statNum}>{stats.todayScans || 0}</Text>
            <Text style={st.statLabel}>Today</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Daily Progress — based on real goals */}
        {(() => {
          const lessonProg = goals.dailyLessons > 0 ? Math.min(goals.todayLessons / goals.dailyLessons, 1) : 0;
          const timeProg = goals.dailyMinutes > 0 ? Math.min(goals.todayReadingMinutes / goals.dailyMinutes, 1) : 0;
          const overallProg = Math.round(((lessonProg + timeProg) / 2) * 100);
          const allDone = overallProg >= 100;

          return (
            <Animated.View style={[st.dailyWrap, { opacity: statsOp, transform: [{ translateY: statsY }] }]}>
              <TouchableOpacity style={st.dailyCard} activeOpacity={0.8} onPress={() => navigation.getParent()?.navigate('GoalsTab')}>
                <View style={st.dailyTop}>
                  <View style={st.dailyInfo}>
                    <Ionicons name="today-outline" size={18} color={COLORS.accent} />
                    <Text style={st.dailyTitle}>Today's Progress</Text>
                  </View>
                  <Text style={[st.dailyPercent, allDone && { color: COLORS.success }]}>{overallProg}%</Text>
                </View>
                <View style={st.progressBarBg}>
                  <LinearGradient
                    colors={allDone ? ['#34D399', '#22D3EE'] : GRADIENTS.accent}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[st.progressBarFill, { width: `${Math.max(overallProg, 2)}%` }]}
                  />
                </View>
                <View style={st.dailyBottom}>
                  <Text style={st.dailyGoalText}>
                    {allDone
                      ? 'All goals complete! Great job!'
                      : `${goals.todayLessons}/${goals.dailyLessons} lessons · ${goals.todayReadingMinutes}/${goals.dailyMinutes}m reading`}
                  </Text>
                  {allDone && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })()}

        {/* CTA */}
        <Animated.View style={[st.ctaWrap, { opacity: ctaOp, transform: [{ scale: ctaScale }] }]}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('CameraTab')}>
            <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.ctaBtn}>
              <Ionicons name="scan-outline" size={20} color={COLORS.white} />
              <Text style={st.ctaText}>Scan Text Now</Text>
              <View style={st.ctaArrow}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: restOp, transform: [{ translateY: restY }] }}>
          {/* How it works */}
          <View style={st.section}>
            <Text style={st.secTitle}>How It Works</Text>
            <View style={st.stepsRow}>
              {[
                { icon: 'camera-outline', label: 'Capture', color: COLORS.accent },
                { icon: 'bulb-outline', label: 'Analyze', color: COLORS.accentPink },
                { icon: 'book-outline', label: 'Learn', color: COLORS.cyan },
              ].map((item, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <View style={st.stepConnector}>
                      <View style={st.stepConnectorLine} />
                    </View>
                  )}
                  <View style={st.step}>
                    <CircleIcon name={item.icon} color={item.color} size={22} bgSize={50} />
                    <Text style={st.stepLabel}>{item.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* About EasyTutor — compact link */}
          <View style={st.section}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('About')} style={st.aboutLinkCard}>
              <LinearGradient colors={GRADIENTS.cardAccent} style={st.aboutLinkGradient}>
                <View style={st.aboutLinkLeft}>
                  <IconBadge name="school" size={18} gradient={GRADIENTS.accent} bgSize={38} radius={13} />
                  <View style={{ flex: 1, marginLeft: rs(12) }}>
                    <Text style={st.aboutLinkTitle}>About EasyTutor</Text>
                    <Text style={st.aboutLinkSub}>Features, quiz practice & more</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Motivation */}
          <View style={st.section}>
            <Text style={st.secTitle}>Daily Motivation</Text>
            <View style={st.quoteCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.accent} />
              <Animated.Text style={[st.quoteText, { opacity: quoteOp }]}>{QUOTES[qi]}</Animated.Text>
              <View style={st.dots}>
                {QUOTES.map((_, i) => <View key={i} style={[st.dot, i === qi && st.dotActive]} />)}
              </View>
            </View>
          </View>

          {/* Recent */}
          {recent.length > 0 && (
            <View style={st.section}>
              <View style={st.secHeader}>
                <Text style={st.secTitle}>Recent Lessons</Text>
                <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
                  <Text style={st.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recent} horizontal showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <HistoryCard item={item} compact onPress={() => navigation.navigate('HomeDetail', { item })} />
                )}
              />
            </View>
          )}

          {/* Footer */}
          <View style={[st.section, { marginBottom: 20 }]}>
            <LinearGradient colors={GRADIENTS.accentSoft} style={st.footerCard}>
              <Ionicons name="heart-outline" size={22} color={COLORS.accentLight} />
              <Text style={st.footerText}>Everyone deserves to learn.{'\n'}<Text style={{ color: COLORS.accentLight, fontWeight: '700' }}>Keep going, you are doing great!</Text></Text>
            </LinearGradient>
            <View style={st.creditWrap}>
              <Ionicons name="code-slash-outline" size={14} color={COLORS.textMuted} />
              <Text style={st.creditText}>Developed by <Text style={st.creditName}>Rahul Namdeo</Text></Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const st = {
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  hero: { paddingTop: rs(36), paddingBottom: rs(36), paddingHorizontal: SPACING.md, borderBottomLeftRadius: rs(24), borderBottomRightRadius: rs(24), overflow: 'hidden' },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: rs(200), height: rs(200), backgroundColor: COLORS.accentGlow, top: rs(-60), right: rs(-60) },
  orb2: { width: rs(160), height: rs(160), backgroundColor: COLORS.cyanGlow, bottom: rs(-40), left: rs(-40) },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 },
  welcome: { ...FONTS.caption, color: COLORS.accentLight, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 },
  greeting: { ...FONTS.h1, color: COLORS.textPrimary },
  heroSub: { ...FONTS.body, color: COLORS.textSecondary, marginTop: 2 },
  avatarSmall: { width: rs(44), height: rs(44), borderRadius: rs(15), justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: ms(18), fontWeight: '800', color: COLORS.white },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginTop: rs(-16), gap: SPACING.sm, zIndex: 5 },
  statCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(16), alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  statNum: { fontSize: ms(22), fontWeight: '800', color: COLORS.textPrimary, marginTop: rs(6) },
  statLabel: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 2 },
  dailyWrap: { paddingHorizontal: SPACING.md, marginTop: rs(28) },
  dailyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(14), borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  dailyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(10) },
  dailyInfo: { flexDirection: 'row', alignItems: 'center', gap: rs(8) },
  dailyTitle: { ...FONTS.bodySmall, color: COLORS.textPrimary, fontWeight: '700' },
  dailyPercent: { fontSize: ms(20), fontWeight: '800', color: COLORS.accent },
  progressBarBg: { height: rs(10), backgroundColor: COLORS.bgSecondary, borderRadius: rs(5), overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: rs(5), minWidth: 4 },
  dailyBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rs(8) },
  dailyGoalText: { ...FONTS.caption, color: COLORS.textMuted },
  ctaWrap: { paddingHorizontal: SPACING.md, marginTop: rs(28) },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(10), paddingVertical: rs(16), borderRadius: RADIUS.xxl, ...SHADOWS.accentGlow },
  ctaText: { ...FONTS.buttonLarge, color: COLORS.white },
  ctaArrow: { width: rs(28), height: rs(28), borderRadius: rs(14), backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  section: { marginTop: rs(28), paddingHorizontal: SPACING.md },
  secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(10) },
  secTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: rs(10) },
  seeAll: { ...FONTS.bodySmall, color: COLORS.accent, fontWeight: '600' },
  quoteCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(16), alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: rs(10) },
  quoteText: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', fontStyle: 'italic', lineHeight: ms(22) },
  dots: { flexDirection: 'row', gap: rs(5) },
  dot: { width: rs(6), height: rs(6), borderRadius: rs(3), backgroundColor: COLORS.textMuted },
  dotActive: { width: rs(18), backgroundColor: COLORS.accent },
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  step: { alignItems: 'center', flex: 1 },
  stepLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: rs(8), fontWeight: '600' },
  stepConnector: { width: rs(30), alignItems: 'center', paddingBottom: SPACING.lg },
  stepConnectorLine: { width: rs(24), height: 1.5, backgroundColor: COLORS.border },
  footerCard: { borderRadius: RADIUS.xl, padding: rs(16), alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderAccent, gap: rs(8) },
  footerText: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: ms(22) },
  creditWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(6), marginTop: rs(16), paddingVertical: rs(8) },
  creditText: { ...FONTS.caption, color: COLORS.textMuted },
  creditName: { color: COLORS.accentLight, fontWeight: '700' },
  // About link card
  aboutLinkCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.borderAccent, ...SHADOWS.card },
  aboutLinkGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: rs(16) },
  aboutLinkLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aboutLinkTitle: { ...FONTS.bodySmall, color: COLORS.textPrimary, fontWeight: '700' },
  aboutLinkSub: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 1 },
};
