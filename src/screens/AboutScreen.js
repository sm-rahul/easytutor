import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StatusBar, Animated, Easing, TouchableOpacity, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { IconBadge, GlowIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

export default function AboutScreen({ navigation }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>

          {/* App Header */}
          <LinearGradient colors={GRADIENTS.hero} style={s.heroBg}>
            <View style={s.heroGlow} />
            <View style={s.imgWrap}>
              <LinearGradient colors={GRADIENTS.accent} style={s.imgBorder}>
                <Image source={require('../img/about-us.jpg')} style={s.headerImg} />
              </LinearGradient>
            </View>
            <Text style={s.appName}>Easy<Text style={{ color: COLORS.accent }}>Tutor</Text></Text>
            <View style={s.taglineBadge}>
              <Ionicons name="school" size={12} color={COLORS.accent} />
              <Text style={s.tagline}>AI-Powered Learning for Everyone</Text>
            </View>
            <Text style={s.desc}>
              Simply take a photo of any text — from textbooks, notes, or problems — and our AI instantly explains it in simple, easy-to-understand language.
            </Text>
          </LinearGradient>

          {/* Why EasyTutor */}
          <View style={s.section}>
            <Text style={s.secTitle}>Why EasyTutor?</Text>
            <View style={s.card}>
              <LinearGradient colors={GRADIENTS.cardAccent} style={s.whyGradientBg}>
                <Text style={s.whyHeadline}>
                  Makes your books{'\n'}
                  <Text style={{ color: COLORS.accent }}>very simple</Text> to understand
                </Text>
                <Text style={s.whySubtext}>
                  Your learning speed increases when complex topics become easy and fun.
                </Text>
              </LinearGradient>

              <View style={s.benefitRow}>
                <View style={[s.benefitCard, { borderColor: COLORS.accent + '30' }]}>
                  <LinearGradient colors={GRADIENTS.accent} style={s.benefitIconWrap}>
                    <Ionicons name="book-outline" size={20} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={s.benefitTitle}>Simple Summaries</Text>
                  <Text style={s.benefitDesc}>Hard textbook chapters become 2-3 easy sentences anyone can understand</Text>
                </View>
                <View style={[s.benefitCard, { borderColor: COLORS.accentPink + '30' }]}>
                  <LinearGradient colors={['#EC4899', '#F472B6']} style={s.benefitIconWrap}>
                    <Ionicons name="rocket-outline" size={20} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={s.benefitTitle}>Faster Learning</Text>
                  <Text style={s.benefitDesc}>Visual explanations help you learn 3x faster than reading alone</Text>
                </View>
              </View>

              <View style={s.benefitRow}>
                <View style={[s.benefitCard, { borderColor: COLORS.cyan + '30' }]}>
                  <LinearGradient colors={GRADIENTS.blue} style={s.benefitIconWrap}>
                    <Ionicons name="globe-outline" size={20} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={s.benefitTitle}>Real World Examples</Text>
                  <Text style={s.benefitDesc}>Connect lessons to everyday life with relatable examples</Text>
                </View>
                <View style={[s.benefitCard, { borderColor: COLORS.success + '30' }]}>
                  <LinearGradient colors={['#34D399', '#22D3EE']} style={s.benefitIconWrap}>
                    <Ionicons name="key-outline" size={20} color={COLORS.white} />
                  </LinearGradient>
                  <Text style={s.benefitTitle}>Key Words</Text>
                  <Text style={s.benefitDesc}>Important vocabulary highlighted to build a strong word bank</Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.getParent()?.navigate('CameraTab')}>
                <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.banner}>
                  <Ionicons name="school" size={18} color={COLORS.white} />
                  <Text style={s.bannerText}>Snap a photo. Learn in seconds.</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quiz & Practice */}
          <View style={s.section}>
            <Text style={s.secTitle}>Quiz & Practice</Text>
            <View style={s.featureCard}>
              <Text style={s.featureIntro}>Test your understanding with AI-generated quizzes after every lesson.</Text>
              <View style={s.featureList}>
                {[
                  { icon: 'help-circle-outline', label: 'Auto-Generated Quizzes', desc: 'AI creates questions from your scanned text', color: COLORS.accent },
                  { icon: 'bar-chart-outline', label: 'Difficulty Levels', desc: 'Easy, Medium & Hard questions adapt to you', color: COLORS.warning },
                  { icon: 'trophy-outline', label: 'Performance Tracking', desc: 'Track scores, accuracy & improvement over time', color: COLORS.gold },
                  { icon: 'refresh-outline', label: 'Retry & Improve', desc: 'Retake quizzes to boost your understanding', color: COLORS.cyan },
                ].map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <GlowIcon name={f.icon} color={f.color} size={18} bgSize={36} />
                    <View style={s.featureText}>
                      <Text style={s.featureLabel}>{f.label}</Text>
                      <Text style={s.featureDesc}>{f.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* App Features */}
          <View style={s.section}>
            <Text style={s.secTitle}>App Features</Text>
            <View style={s.featureCard}>
              <View style={s.featureList}>
                {[
                  { icon: 'flash-outline', label: 'Instant AI Analysis', desc: 'Powered by advanced AI', color: COLORS.accent },
                  { icon: 'shield-checkmark-outline', label: 'Safe & Private', desc: 'Data stays on your device', color: COLORS.success },
                  { icon: 'school-outline', label: 'Class 1st–12th+', desc: 'For every grade level', color: COLORS.accentPink },
                  { icon: 'wallet-outline', label: '100% Free', desc: 'No hidden charges ever', color: COLORS.cyan },
                ].map((f, i) => (
                  <View key={i} style={s.featureRow}>
                    <GlowIcon name={f.icon} color={f.color} size={18} bgSize={36} />
                    <View style={s.featureText}>
                      <Text style={s.featureLabel}>{f.label}</Text>
                      <Text style={s.featureDesc}>{f.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={[s.section, { marginBottom: 20 }]}>
            <View style={s.creditWrap}>
              <Ionicons name="code-slash-outline" size={14} color={COLORS.textMuted} />
              <Text style={s.creditText}>Developed by <Text style={s.creditName}>Rahul Namdeo</Text></Text>
            </View>
            <Text style={s.version}>EasyTutor v1.0.0</Text>
          </View>

        </Animated.View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = {
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  scroll: {},
  // Header
  heroBg: { alignItems: 'center', paddingTop: rs(24), paddingBottom: rs(28), paddingHorizontal: SPACING.lg, borderBottomLeftRadius: rs(28), borderBottomRightRadius: rs(28), overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: rs(250), height: rs(250), borderRadius: 999, backgroundColor: COLORS.accentGlow, top: rs(-40), opacity: 0.5 },
  imgWrap: { marginBottom: rs(16) },
  imgBorder: { padding: 3, borderRadius: rs(24), ...SHADOWS.accentGlow },
  headerImg: { width: rs(160), height: rs(160), borderRadius: rs(22) },
  appName: { fontSize: ms(30), fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 0.5 },
  taglineBadge: { flexDirection: 'row', alignItems: 'center', gap: rs(6), backgroundColor: COLORS.accent + '15', paddingHorizontal: rs(12), paddingVertical: rs(5), borderRadius: RADIUS.full, marginTop: rs(8), borderWidth: 1, borderColor: COLORS.accent + '30' },
  tagline: { ...FONTS.caption, color: COLORS.accent, fontWeight: '600' },
  desc: { ...FONTS.body, color: COLORS.textSecondary, textAlign: 'center', lineHeight: ms(22), marginTop: rs(14) },
  // Sections
  section: { marginTop: rs(20), paddingHorizontal: SPACING.md },
  secTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: rs(10) },
  // Why card
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  whyGradientBg: { padding: rs(20), paddingBottom: rs(16) },
  whyHeadline: { ...FONTS.h2, color: COLORS.textPrimary, lineHeight: ms(30), marginBottom: rs(8) },
  whySubtext: { ...FONTS.body, color: COLORS.textSecondary, lineHeight: ms(22) },
  benefitRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: rs(10), marginTop: SPACING.sm },
  benefitCard: { flex: 1, backgroundColor: COLORS.bgSecondary, borderRadius: RADIUS.lg, padding: rs(14), borderWidth: 1, alignItems: 'center' },
  benefitIconWrap: { width: rs(40), height: rs(40), borderRadius: rs(13), justifyContent: 'center', alignItems: 'center', marginBottom: rs(10) },
  benefitTitle: { ...FONTS.bodySmall, color: COLORS.textPrimary, fontWeight: '700', textAlign: 'center', marginBottom: rs(4) },
  benefitDesc: { ...FONTS.caption, color: COLORS.textMuted, textAlign: 'center', lineHeight: ms(16) },
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), paddingVertical: rs(14), margin: rs(10), marginTop: rs(12), borderRadius: RADIUS.lg },
  bannerText: { ...FONTS.button, color: COLORS.white },
  // Feature cards
  featureCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(16), borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.card },
  featureIntro: { ...FONTS.body, color: COLORS.textSecondary, lineHeight: ms(22), marginBottom: rs(14) },
  featureList: { gap: rs(10) },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureText: { marginLeft: rs(12), flex: 1 },
  featureLabel: { ...FONTS.bodySmall, color: COLORS.textPrimary, fontWeight: '600' },
  featureDesc: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 1 },
  // Footer
  creditWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(6), paddingVertical: rs(8) },
  creditText: { ...FONTS.caption, color: COLORS.textMuted },
  creditName: { color: COLORS.accentLight, fontWeight: '700' },
  version: { ...FONTS.caption, color: COLORS.textMuted, textAlign: 'center', marginTop: rs(4) },
};
