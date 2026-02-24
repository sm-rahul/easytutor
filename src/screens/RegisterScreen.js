import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { AppLogo, GlowIcon } from '../components/AppIcon';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
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

  const goNext = () => {
    setError('');
    if (!name.trim()) return setError('Enter your name');
    if (name.includes('@')) return setError('That looks like an email. Please enter your name here.');
    if (!email.trim()) return setError('Enter your email');
    if (!email.includes('@') || !email.includes('.')) return setError('Please enter a valid email address');
    if (password.length < 4) return setError('Password must be 4+ characters');
    setStep(2);
  };

  const handleRegister = async () => {
    setError('');
    if (!childName.trim()) return setError("Enter your child's name");
    if (!childAge.trim()) return setError("Enter your child's age");
    setLoading(true);
    const res = await register({ name: name.trim(), email: email.trim(), password, childName: childName.trim(), childAge: childAge.trim() });
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const isFocused = (field) => focusedField === field;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.back} onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
            <Ionicons name="chevron-back" size={rs(20)} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <Animated.View style={[s.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            {/* Header */}
            <View style={s.header}>
              <AppLogo size={rs(68)} />
              <Text style={s.title}>Create Account</Text>
              <Text style={s.sub}>Start your learning journey</Text>
            </View>

            {/* Step indicator */}
            <View style={s.steps}>
              <View style={[s.stepDot, step >= 1 && s.stepActive]}>
                <Text style={[s.stepNum, step >= 1 && s.stepNumActive]}>1</Text>
              </View>
              <View style={[s.stepLine, step >= 2 && s.stepLineActive]} />
              <View style={[s.stepDot, step >= 2 && s.stepActive]}>
                <Text style={[s.stepNum, step >= 2 && s.stepNumActive]}>2</Text>
              </View>
            </View>
            <View style={s.stepLabels}>
              <Text style={[s.stepLabel, step === 1 && s.stepLabelActive]}>Your details</Text>
              <Text style={[s.stepLabel, step === 2 && s.stepLabelActive]}>Child info</Text>
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
              {step === 1 ? (
                <>
                  <View style={s.fieldGroup}>
                    <Text style={s.label}>Full name</Text>
                    <View style={[s.inputBox, isFocused('name') && s.inputFocused]}>
                      <Ionicons name="person-outline" size={rs(18)} color={isFocused('name') ? COLORS.accent : COLORS.textMuted} />
                      <TextInput
                        style={s.input} value={name} onChangeText={setName}
                        placeholder="Your full name" placeholderTextColor={COLORS.textMuted + '80'}
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

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

                  <View style={s.fieldGroup}>
                    <Text style={s.label}>Password</Text>
                    <View style={[s.inputBox, isFocused('password') && s.inputFocused]}>
                      <Ionicons name="lock-closed-outline" size={rs(18)} color={isFocused('password') ? COLORS.accent : COLORS.textMuted} />
                      <TextInput
                        style={s.input} value={password} onChangeText={setPassword}
                        placeholder="Min 4 characters" placeholderTextColor={COLORS.textMuted + '80'}
                        secureTextEntry={!showPw}
                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={rs(18)} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity activeOpacity={0.85} onPress={goNext} style={s.btnWrap}>
                    <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>
                      <Text style={s.btnText}>Continue</Text>
                      <View style={s.btnArrow}>
                        <Ionicons name="arrow-forward" size={rs(16)} color={COLORS.white} />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={s.fieldGroup}>
                    <Text style={s.label}>Child's name</Text>
                    <View style={[s.inputBox, isFocused('childName') && s.inputFocused]}>
                      <Ionicons name="happy-outline" size={rs(18)} color={isFocused('childName') ? COLORS.accent : COLORS.textMuted} />
                      <TextInput
                        style={s.input} value={childName} onChangeText={setChildName}
                        placeholder="Your child's first name" placeholderTextColor={COLORS.textMuted + '80'}
                        onFocus={() => setFocusedField('childName')} onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

                  <View style={s.fieldGroup}>
                    <Text style={s.label}>Child's age</Text>
                    <View style={[s.inputBox, isFocused('childAge') && s.inputFocused]}>
                      <Ionicons name="calendar-outline" size={rs(18)} color={isFocused('childAge') ? COLORS.accent : COLORS.textMuted} />
                      <TextInput
                        style={s.input} value={childAge} onChangeText={setChildAge}
                        placeholder="e.g. 8" placeholderTextColor={COLORS.textMuted + '80'}
                        keyboardType="number-pad"
                        onFocus={() => setFocusedField('childAge')} onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>

                  <View style={s.infoCard}>
                    <GlowIcon name="information-circle-outline" size={rs(18)} color={COLORS.accent} bgSize={rs(34)} />
                    <Text style={s.infoText}>We personalize explanations based on your child's age for better understanding.</Text>
                  </View>

                  <TouchableOpacity activeOpacity={0.85} onPress={handleRegister} disabled={loading} style={s.btnWrap}>
                    <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>
                      {loading ? (
                        <Text style={s.btnText}>Creating...</Text>
                      ) : (
                        <>
                          <Text style={s.btnText}>Create Account</Text>
                          <View style={s.btnArrow}>
                            <Ionicons name="checkmark" size={rs(16)} color={COLORS.white} />
                          </View>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity style={s.loginRow} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
              <Text style={s.loginText}>Already have an account? <Text style={s.loginLink}>Sign In</Text></Text>
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
    paddingTop: rs(50),
    paddingBottom: rs(32),
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
  content: {},
  header: { alignItems: 'center', marginBottom: rs(24) },
  title: { ...FONTS.h1, color: COLORS.textPrimary, marginTop: rs(16) },
  sub: { ...FONTS.body, color: COLORS.textMuted, marginTop: rs(4) },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: rs(6) },
  stepDot: {
    width: rs(32), height: rs(32), borderRadius: rs(16), justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.bgCard, borderWidth: 1.5, borderColor: COLORS.border,
  },
  stepActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  stepNum: { fontSize: ms(12), fontWeight: '700', color: COLORS.textMuted },
  stepNumActive: { color: COLORS.white },
  stepLine: { width: rs(50), height: 1.5, backgroundColor: COLORS.border, marginHorizontal: rs(6) },
  stepLineActive: { backgroundColor: COLORS.accent },
  stepLabels: { flexDirection: 'row', justifyContent: 'center', gap: rs(40), marginBottom: rs(20) },
  stepLabel: { ...FONTS.caption, color: COLORS.textMuted },
  stepLabelActive: { color: COLORS.accent, fontWeight: '700' },
  errBox: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8), padding: rs(12),
    backgroundColor: COLORS.danger + '10', borderRadius: RADIUS.lg, marginBottom: rs(12),
    borderWidth: 1, borderColor: COLORS.danger + '20',
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
  input: { flex: 1, ...FONTS.body, color: COLORS.textPrimary, height: '100%' },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: rs(12), padding: rs(14),
    backgroundColor: COLORS.accentGlow, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.borderAccent,
  },
  infoText: { ...FONTS.bodySmall, color: COLORS.textSecondary, flex: 1, lineHeight: ms(19) },
  btnWrap: {
    marginTop: rs(4),
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    height: rs(52),
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
  loginRow: { alignItems: 'center', marginTop: rs(24), marginBottom: rs(40), paddingVertical: rs(8) },
  loginText: { ...FONTS.body, color: COLORS.textMuted },
  loginLink: { color: COLORS.accentLight, fontWeight: '700' },
});
