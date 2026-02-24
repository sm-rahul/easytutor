import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo, GlowIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOp = useRef(new Animated.Value(0)).current;
  const cardsOp = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(50)).current;
  const btnOp = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.85)).current;
  const orb1 = useRef(new Animated.Value(0.4)).current;
  const orb2 = useRef(new Animated.Value(0.2)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOp, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardsOp, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cardsY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(btnScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(btnOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Floating logo
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -10, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();

    // Breathing orbs
    Animated.loop(Animated.sequence([
      Animated.timing(orb1, { toValue: 0.8, duration: 3000, useNativeDriver: true }),
      Animated.timing(orb1, { toValue: 0.4, duration: 3000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(orb2, { toValue: 0.6, duration: 2500, useNativeDriver: true }),
      Animated.timing(orb2, { toValue: 0.2, duration: 2500, useNativeDriver: true }),
    ])).start();
  }, []);

  const features = [
    { icon: 'scan-outline', label: 'Scan any text', desc: 'Point camera at any text to learn', color: COLORS.accent },
    { icon: 'flash-outline', label: 'Instant AI summary', desc: 'Simple explanations in seconds', color: COLORS.accentPink },
    { icon: 'people-outline', label: 'Parent friendly', desc: 'Made for parents guiding kids', color: COLORS.cyan },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />

      {/* Ambient orbs */}
      <Animated.View style={[s.orb, s.orb1, { opacity: orb1 }]} />
      <Animated.View style={[s.orb, s.orb2, { opacity: orb2 }]} />

      {/* Logo */}
      <Animated.View style={[s.logoWrap, { transform: [{ scale: logoScale }, { translateY: float }] }]}>
        <AppLogo size={88} />
      </Animated.View>

      {/* Title */}
      <Animated.View style={[s.titleBlock, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
        <Text style={s.title}>Easy<Text style={s.titleAccent}>Tutor</Text></Text>
        <Text style={s.tagline}>AI-Powered Learning for Kids</Text>
      </Animated.View>

      {/* Feature cards */}
      <Animated.View style={[s.features, { opacity: cardsOp, transform: [{ translateY: cardsY }] }]}>
        {features.map((f, i) => (
          <View key={i} style={s.featureRow}>
            <GlowIcon name={f.icon} color={f.color} size={20} bgSize={40} />
            <View style={s.featureText}>
              <Text style={s.featureLabel}>{f.label}</Text>
              <Text style={s.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[s.ctaWrap, { opacity: btnOp, transform: [{ scale: btnScale }] }]}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Register')}>
          <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.ctaBtn}>
            <Text style={s.ctaText}>Get Started</Text>
            <View style={s.ctaArrow}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginText}>Already have an account? <Text style={s.loginLink}>Sign In</Text></Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep, justifyContent: 'center', alignItems: 'center', paddingHorizontal: rs(16) },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: rs(280), height: rs(280), backgroundColor: COLORS.accentGlow, top: rs(-80), right: rs(-100) },
  orb2: { width: rs(220), height: rs(220), backgroundColor: COLORS.cyanGlow, bottom: rs(40), left: rs(-80) },
  logoWrap: { marginBottom: rs(20) },
  titleBlock: { alignItems: 'center', marginBottom: rs(36) },
  title: { ...FONTS.hero, fontSize: ms(42), color: COLORS.textPrimary },
  titleAccent: { color: COLORS.accent },
  tagline: { ...FONTS.body, color: COLORS.textSecondary, marginTop: rs(6) },
  features: { width: '100%', gap: rs(12), marginBottom: rs(40) },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl, padding: rs(14), borderWidth: 1, borderColor: COLORS.border,
  },
  featureText: { marginLeft: rs(14), flex: 1 },
  featureLabel: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600' },
  featureDesc: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 1 },
  ctaWrap: { width: '100%', alignItems: 'center' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: rs(16), paddingHorizontal: rs(32), borderRadius: RADIUS.xxl,
    width: '100%', ...SHADOWS.accentGlow,
  },
  ctaText: { ...FONTS.buttonLarge, color: COLORS.white, marginRight: rs(10) },
  ctaArrow: {
    width: rs(30), height: rs(30), borderRadius: rs(15), backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  loginBtn: { marginTop: rs(20), paddingVertical: rs(8) },
  loginText: { ...FONTS.body, color: COLORS.textMuted },
  loginLink: { color: COLORS.accentLight, fontWeight: '700' },
});
