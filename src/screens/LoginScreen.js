import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { AppLogo } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const isFocused = (field) => focusedField === field;

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields'); return; }
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={rs(20)} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Animated.View style={[s.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            {/* Header */}
            <View style={s.header}>
              <AppLogo size={rs(68)} />
              <Text style={s.title}>Welcome back</Text>
              <Text style={s.sub}>Sign in to continue your journey</Text>
            </View>

            {/* Error */}
            {error ? (
              <View style={s.errBox}>
                <Ionicons name="alert-circle" size={rs(16)} color={COLORS.danger} />
                <Text style={s.errText}>{error}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={s.form}>
              {/* Email */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Email</Text>
                <View style={[s.inputBox, isFocused('email') && s.inputFocused]}>
                  <Ionicons name="mail-outline" size={rs(18)} color={isFocused('email') ? COLORS.accent : COLORS.textMuted} />
                  <TextInput
                    style={s.input} value={email} onChangeText={setEmail}
                    placeholder="you@example.com" placeholderTextColor={COLORS.textMuted + '80'}
                    keyboardType="email-address" autoCapitalize="none"
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={s.fieldGroup}>
                <Text style={s.label}>Password</Text>
                <View style={[s.inputBox, isFocused('password') && s.inputFocused]}>
                  <Ionicons name="lock-closed-outline" size={rs(18)} color={isFocused('password') ? COLORS.accent : COLORS.textMuted} />
                  <TextInput
                    style={s.input} value={password} onChangeText={setPassword}
                    placeholder="Enter your password" placeholderTextColor={COLORS.textMuted + '80'}
                    secureTextEntry={!showPw}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={rs(18)} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In */}
              <TouchableOpacity activeOpacity={0.85} onPress={handleLogin} disabled={loading} style={s.btnWrap}>
                <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>
                  {loading ? (
                    <Text style={s.btnText}>Signing in...</Text>
                  ) : (
                    <>
                      <Text style={s.btnText}>Sign In</Text>
                      <View style={s.btnArrow}>
                        <Ionicons name="arrow-forward" size={rs(16)} color={COLORS.white} />
                      </View>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={s.divText}>or</Text>
              <View style={s.divLine} />
            </View>

            {/* Register */}
            <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={rs(17)} color={COLORS.accentLight} />
              <Text style={s.outlineBtnText}>Create a new account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: rs(36),
    paddingBottom: rs(36),
  },
  back: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(14),
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: rs(16),
  },
  content: {
  },
  header: {
    alignItems: 'center',
    marginBottom: rs(32),
  },
  title: {
    ...FONTS.h1,
    color: COLORS.textPrimary,
    marginTop: rs(18),
  },
  sub: {
    ...FONTS.body,
    color: COLORS.textMuted,
    marginTop: rs(6),
  },
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    padding: rs(12),
    backgroundColor: COLORS.danger + '10',
    borderRadius: RADIUS.lg,
    marginBottom: rs(12),
    borderWidth: 1,
    borderColor: COLORS.danger + '20',
  },
  errText: { ...FONTS.bodySmall, color: COLORS.danger, flex: 1 },
  form: {
    gap: rs(16),
  },
  fieldGroup: {
    gap: rs(6),
  },
  label: {
    fontSize: ms(12),
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: rs(2),
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    height: rs(52),
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: rs(16),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.accent + '50',
    backgroundColor: COLORS.bgCard,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    color: COLORS.textPrimary,
    height: '100%',
  },
  btnWrap: {
    marginTop: rs(4),
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    height: rs(52),
    width: '100%',
    borderRadius: RADIUS.xl,
    ...SHADOWS.accentGlow,
  },
  btnText: { ...FONTS.buttonLarge, color: COLORS.white },
  btnArrow: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: rs(22),
  },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: COLORS.border },
  divText: { ...FONTS.caption, color: COLORS.textMuted, marginHorizontal: rs(16) },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    height: rs(52),
    width: '100%',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    backgroundColor: COLORS.accent + '06',
  },
  outlineBtnText: { ...FONTS.button, color: COLORS.accentLight },
});
