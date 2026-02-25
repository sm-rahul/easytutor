import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Animated, Easing, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../contexts/QuizContext';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

const DIFFICULTY_COLORS = {
  easy: COLORS.success,
  medium: COLORS.warning,
  hard: COLORS.danger,
};

export default function QuizScreen({ navigation, route }) {
  const { historyId, analysisResult, quizNavigatePrefix = '' } = route.params || {};
  const { currentQuiz, currentQuestions, quizLoading, generateQuiz, submitQuiz } = useContext(QuizContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTime = useRef(null);
  const timerRef = useRef(null);
  const quizReady = !quizLoading && currentQuiz && currentQuestions.length > 0;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  // Generate quiz on mount
  useEffect(() => {
    if (analysisResult) {
      generateQuiz(historyId, analysisResult);
    }
  }, []);

  // Timer — only start when quiz is ready (loading complete)
  useEffect(() => {
    if (quizReady && !startTime.current) {
      startTime.current = Date.now();
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.round((Date.now() - startTime.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizReady]);

  // Animate question entry
  useEffect(() => {
    if (currentQuestions.length > 0) {
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      optionAnims.forEach(a => a.setValue(0));

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ]).start();

      optionAnims.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          delay: 200 + i * 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [currentIndex, currentQuestions.length]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = startTime.current ? Math.round((Date.now() - startTime.current) / 1000) : elapsedSeconds;
    const answers = currentQuestions.map(q => ({
      questionId: q.id,
      selected: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
    }));

    const result = await submitQuiz(currentQuiz.id, answers, timeTaken);
    setSubmitting(false);

    if (result) {
      const resultScreenName = quizNavigatePrefix ? `${quizNavigatePrefix}QuizResult` : 'QuizResult';
      navigation.replace(resultScreenName, {
        result,
        quizTitle: currentQuiz.title,
        historyId,
        analysisResult,
        quizNavigatePrefix,
      });
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQ = currentQuestions.length;
  const question = currentQuestions[currentIndex];
  const isLastQuestion = currentIndex === totalQ - 1;

  // Loading state
  if (quizLoading || !currentQuiz || totalQ === 0) {
    return (
      <View style={s.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={GRADIENTS.accent} style={s.loadingIcon}>
          <Ionicons name="school" size={rs(36)} color={COLORS.white} />
        </LinearGradient>
        <Text style={s.loadingTitle}>Preparing Your Quiz</Text>
        <Text style={s.loadingSubtitle}>Creating practice questions...</Text>
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: rs(24) }} />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={rs(20)} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle} numberOfLines={1}>{currentQuiz.title}</Text>
            <Text style={s.headerSub}>Question {currentIndex + 1} of {totalQ}</Text>
          </View>
          <View style={s.timerBadge}>
            <Ionicons name="time-outline" size={rs(14)} color={COLORS.accent} />
            <Text style={s.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={s.progressBg}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.progressFill, { width: `${((currentIndex + 1) / totalQ) * 100}%` }]}
          />
        </View>

        {/* Answered indicator */}
        <Text style={s.answeredText}>{answeredCount} of {totalQ} answered</Text>

        {/* Question Card */}
        <Animated.View style={[s.questionCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.questionHeader}>
            <View style={[s.diffBadge, { backgroundColor: (DIFFICULTY_COLORS[question.difficulty] || COLORS.warning) + '20' }]}>
              <Text style={[s.diffText, { color: DIFFICULTY_COLORS[question.difficulty] || COLORS.warning }]}>
                {(question.difficulty || 'medium').toUpperCase()}
              </Text>
            </View>
            <Text style={s.questionNum}>Q{currentIndex + 1}</Text>
          </View>
          <Text style={s.questionText}>{question.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={s.optionsContainer}>
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswers[question.id] === idx;
            const label = ['A', 'B', 'C', 'D'][idx];

            return (
              <Animated.View
                key={idx}
                style={{
                  opacity: optionAnims[idx],
                  transform: [{ translateY: optionAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                }}
              >
                <TouchableOpacity
                  style={[s.optionCard, isSelected && s.optionSelected]}
                  onPress={() => handleSelectOption(question.id, idx)}
                  activeOpacity={0.7}
                >
                  <View style={[s.optionLabel, isSelected && s.optionLabelSelected]}>
                    <Text style={[s.optionLabelText, isSelected && s.optionLabelTextSelected]}>{label}</Text>
                  </View>
                  <Text style={[s.optionText, isSelected && s.optionTextSelected]}>{option}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={rs(20)} color={COLORS.accent} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Navigation Buttons */}
        <View style={s.navRow}>
          {currentIndex > 0 ? (
            <TouchableOpacity style={s.navBtn} onPress={handlePrev} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={rs(18)} color={COLORS.textSecondary} />
              <Text style={s.navBtnText}>Previous</Text>
            </TouchableOpacity>
          ) : <View style={s.navBtn} />}

          {isLastQuestion ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={submitting}
              style={{ flex: 1, maxWidth: rs(180) }}
            >
              <LinearGradient
                colors={answeredCount === totalQ ? GRADIENTS.accent : [COLORS.bgCardHover, COLORS.bgCardHover]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.submitBtn}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={rs(18)} color={COLORS.white} />
                    <Text style={s.submitText}>Submit Quiz</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.nextBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={s.nextBtnText}>Next</Text>
              <Ionicons name="chevron-forward" size={rs(18)} color={COLORS.accent} />
            </TouchableOpacity>
          )}
        </View>

        {/* Question dots */}
        <View style={s.dotsRow}>
          {currentQuestions.map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentIndex(i)}
              style={[
                s.dot,
                i === currentIndex && s.dotActive,
                selectedAnswers[q.id] !== undefined && s.dotAnswered,
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: rs(50), paddingBottom: rs(40) },

  // Loading
  loadingContainer: {
    flex: 1, backgroundColor: COLORS.bgDeep, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
  },
  loadingIcon: {
    width: rs(80), height: rs(80), borderRadius: rs(28),
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.accentGlow,
  },
  loadingTitle: { ...FONTS.h2, color: COLORS.textPrimary, marginTop: rs(24) },
  loadingSubtitle: { ...FONTS.body, color: COLORS.textMuted, marginTop: rs(8) },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(16) },
  backBtn: {
    width: rs(40), height: rs(40), borderRadius: rs(14),
    backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerCenter: { flex: 1, marginLeft: rs(12), marginRight: rs(10) },
  headerTitle: { ...FONTS.h3, color: COLORS.textPrimary },
  headerSub: { ...FONTS.caption, color: COLORS.textMuted, marginTop: rs(2) },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: rs(4),
    backgroundColor: COLORS.accentGlow, paddingHorizontal: rs(10), paddingVertical: rs(6),
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderAccent,
  },
  timerText: { ...FONTS.caption, color: COLORS.accent, fontWeight: '700' },

  // Progress
  progressBg: {
    height: rs(6), backgroundColor: COLORS.bgSecondary, borderRadius: rs(3),
    overflow: 'hidden', marginBottom: rs(8),
  },
  progressFill: { height: '100%', borderRadius: rs(3) },
  answeredText: { ...FONTS.caption, color: COLORS.textMuted, marginBottom: rs(16), textAlign: 'right' },

  // Question
  questionCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(20),
    borderWidth: 1, borderColor: COLORS.border, marginBottom: rs(16), ...SHADOWS.card,
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rs(12) },
  diffBadge: { paddingHorizontal: rs(10), paddingVertical: rs(4), borderRadius: RADIUS.full },
  diffText: { ...FONTS.caption, fontWeight: '700' },
  questionNum: { ...FONTS.caption, color: COLORS.textMuted },
  questionText: { ...FONTS.body, color: COLORS.textPrimary, lineHeight: ms(24) },

  // Options
  optionsContainer: { gap: rs(10), marginBottom: rs(20) },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: rs(12),
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: rs(16),
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.borderAccent,
    backgroundColor: COLORS.accentGlow,
  },
  optionLabel: {
    width: rs(32), height: rs(32), borderRadius: rs(10),
    backgroundColor: COLORS.bgSecondary, justifyContent: 'center', alignItems: 'center',
  },
  optionLabelSelected: { backgroundColor: COLORS.accent },
  optionLabelText: { ...FONTS.caption, color: COLORS.textMuted, fontWeight: '700' },
  optionLabelTextSelected: { color: COLORS.white },
  optionText: { ...FONTS.body, color: COLORS.textSecondary, flex: 1 },
  optionTextSelected: { color: COLORS.textPrimary, fontWeight: '600' },

  // Navigation
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: rs(20),
  },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: rs(4),
    paddingVertical: rs(10), paddingHorizontal: rs(14),
    borderRadius: RADIUS.lg, backgroundColor: COLORS.bgCard,
    borderWidth: 1, borderColor: COLORS.border, minWidth: rs(100),
  },
  navBtnText: { ...FONTS.bodySmall, color: COLORS.textSecondary },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', gap: rs(4),
    paddingVertical: rs(10), paddingHorizontal: rs(14),
    borderRadius: RADIUS.lg, backgroundColor: COLORS.accentGlow,
    borderWidth: 1, borderColor: COLORS.borderAccent,
  },
  nextBtnText: { ...FONTS.bodySmall, color: COLORS.accent, fontWeight: '700' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8),
    height: rs(46), borderRadius: RADIUS.xl, ...SHADOWS.accentGlow,
  },
  submitText: { ...FONTS.button, color: COLORS.white },

  // Dots
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: rs(8), flexWrap: 'wrap',
  },
  dot: {
    width: rs(10), height: rs(10), borderRadius: rs(5),
    backgroundColor: COLORS.bgSecondary, borderWidth: 1, borderColor: COLORS.border,
  },
  dotActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent, transform: [{ scale: 1.3 }] },
  dotAnswered: { backgroundColor: COLORS.accentDark, borderColor: COLORS.accentDark },
});
