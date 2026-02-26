import React, { useEffect, useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  StatusBar, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../contexts/QuizContext';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

export default function QuizResultScreen({ navigation, route }) {
  const { result, quizTitle, historyId, analysisResult, quizNavigatePrefix = '' } = route.params || {};
  const { clearCurrentQuiz } = useContext(QuizContext);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    (result?.answers || []).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Score animation
    Animated.sequence([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scoreScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
    ]).start();

    // Stagger answer cards
    cardAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 600 + i * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  if (!result) return null;

  const { score, total, percentage, timeTakenSeconds, answers } = result;

  const getScoreColor = () => {
    if (percentage >= 80) return COLORS.success;
    if (percentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  const getScoreIcon = () => {
    if (percentage >= 80) return 'trophy';
    if (percentage >= 50) return 'thumbs-up';
    return 'fitness';
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Keep Practicing!';
    return 'Don\'t Give Up!';
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    return `${m}m ${sec}s`;
  };

  const handleTryAgain = () => {
    clearCurrentQuiz();
    const quizScreenName = quizNavigatePrefix ? `${quizNavigatePrefix}Quiz` : 'Quiz';
    navigation.replace(quizScreenName, {
      historyId,
      analysisResult,
      quizNavigatePrefix,
    });
  };

  const handleGoBack = () => {
    clearCurrentQuiz();
    navigation.pop(2); // Go back past QuizScreen to the lesson
  };

  const scoreColor = getScoreColor();
  const correctCount = answers.filter(a => a.isCorrect).length;
  const incorrectCount = answers.filter(a => !a.isCorrect).length;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Score Header */}
        <Animated.View style={[s.scoreHeader, { opacity: fadeIn }]}>
          <LinearGradient colors={GRADIENTS.accent} style={s.scoreIconWrap}>
            <Ionicons name={getScoreIcon()} size={rs(36)} color={COLORS.white} />
          </LinearGradient>
          <Text style={s.completeText}>Quiz Complete!</Text>
          <Text style={s.quizTitle}>{quizTitle}</Text>
        </Animated.View>

        {/* Score Card */}
        <Animated.View style={[s.scoreCard, { transform: [{ scale: scoreScale }] }]}>
          <Text style={[s.scorePercent, { color: scoreColor }]}>{Math.round(percentage)}%</Text>
          <Text style={s.scoreLabel}>{getScoreMessage()}</Text>
          <View style={s.scoreDivider} />
          <View style={s.scoreRow}>
            <View style={s.scoreStat}>
              <Ionicons name="checkmark-circle" size={rs(20)} color={COLORS.success} />
              <Text style={s.scoreStatNum}>{correctCount}</Text>
              <Text style={s.scoreStatLabel}>Correct</Text>
            </View>
            <View style={s.scoreStatDivider} />
            <View style={s.scoreStat}>
              <Ionicons name="close-circle" size={rs(20)} color={COLORS.danger} />
              <Text style={s.scoreStatNum}>{incorrectCount}</Text>
              <Text style={s.scoreStatLabel}>Incorrect</Text>
            </View>
            <View style={s.scoreStatDivider} />
            <View style={s.scoreStat}>
              <Ionicons name="time-outline" size={rs(20)} color={COLORS.accent} />
              <Text style={s.scoreStatNum}>{formatTime(timeTakenSeconds)}</Text>
              <Text style={s.scoreStatLabel}>Time</Text>
            </View>
          </View>
        </Animated.View>

        {/* Review Section */}
        <View style={s.sectionHeader}>
          <Ionicons name="document-text-outline" size={rs(18)} color={COLORS.accent} />
          <Text style={s.sectionTitle}>Review Answers</Text>
        </View>

        {answers.map((answer, idx) => (
          <Animated.View
            key={answer.questionId}
            style={{
              opacity: cardAnims[idx] || 1,
              transform: [{ translateY: (cardAnims[idx] || new Animated.Value(1)).interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}
          >
            <View style={[s.answerCard, { borderLeftColor: answer.isCorrect ? COLORS.success : COLORS.danger }]}>
              <View style={s.answerHeader}>
                <View style={[s.answerBadge, { backgroundColor: (answer.isCorrect ? COLORS.success : COLORS.danger) + '20' }]}>
                  <Ionicons
                    name={answer.isCorrect ? 'checkmark' : 'close'}
                    size={rs(14)}
                    color={answer.isCorrect ? COLORS.success : COLORS.danger}
                  />
                </View>
                <Text style={s.answerNum}>Question {idx + 1}</Text>
                {answer.isCorrect && <Text style={s.correctTag}>Correct</Text>}
                {!answer.isCorrect && <Text style={s.incorrectTag}>Incorrect</Text>}
              </View>

              <Text style={s.answerQuestion}>{answer.question}</Text>

              {/* Options review */}
              <View style={s.optionsReview}>
                {answer.options.map((opt, optIdx) => {
                  const isCorrectOption = optIdx === answer.correct;
                  const isUserSelected = optIdx === answer.selected;
                  const showGreen = isCorrectOption;
                  const showRed = isUserSelected && !answer.isCorrect;

                  return (
                    <View
                      key={optIdx}
                      style={[
                        s.reviewOption,
                        showGreen && s.reviewOptionCorrect,
                        showRed && s.reviewOptionWrong,
                      ]}
                    >
                      <Text style={[
                        s.reviewOptionLabel,
                        showGreen && { color: COLORS.success },
                        showRed && { color: COLORS.danger },
                      ]}>
                        {['A', 'B', 'C', 'D'][optIdx]}
                      </Text>
                      <Text style={[
                        s.reviewOptionText,
                        showGreen && { color: COLORS.success, fontWeight: '600' },
                        showRed && { color: COLORS.danger },
                      ]}>
                        {opt}
                      </Text>
                      {showGreen && <Ionicons name="checkmark-circle" size={rs(16)} color={COLORS.success} />}
                      {showRed && <Ionicons name="close-circle" size={rs(16)} color={COLORS.danger} />}
                    </View>
                  );
                })}
              </View>

              {/* Explanation */}
              {answer.explanation && (
                <View style={s.explanationBox}>
                  <Ionicons name="bulb-outline" size={rs(14)} color={COLORS.warning} />
                  <Text style={s.explanationText}>{answer.explanation}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        ))}

        {/* Action Buttons */}
        <View style={s.actions}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleTryAgain} style={{ flex: 1 }}>
            <LinearGradient
              colors={GRADIENTS.accent}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.actionBtn}
            >
              <Ionicons name="refresh" size={rs(18)} color={COLORS.white} />
              <Text style={s.actionBtnText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={s.secondaryBtn} onPress={handleGoBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={rs(18)} color={COLORS.textSecondary} />
            <Text style={s.secondaryBtnText}>Back to Lesson</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  scroll: { paddingHorizontal: SPACING.md, paddingTop: rs(36), paddingBottom: rs(36) },

  // Score Header
  scoreHeader: { alignItems: 'center', marginBottom: rs(16) },
  scoreIconWrap: {
    width: rs(72), height: rs(72), borderRadius: rs(24),
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.accentGlow,
  },
  completeText: { ...FONTS.h1, color: COLORS.textPrimary, marginTop: rs(12) },
  quizTitle: { ...FONTS.bodySmall, color: COLORS.textMuted, marginTop: rs(4) },

  // Score Card
  scoreCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(20),
    borderWidth: 1, borderColor: COLORS.border, marginBottom: rs(20),
    alignItems: 'center', ...SHADOWS.card,
  },
  scorePercent: { fontSize: ms(44), fontWeight: '800' },
  scoreLabel: { ...FONTS.h3, color: COLORS.textSecondary, marginTop: rs(4) },
  scoreDivider: { height: 1, backgroundColor: COLORS.border, width: '100%', marginVertical: rs(14) },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' },
  scoreStat: { alignItems: 'center', gap: rs(3) },
  scoreStatNum: { ...FONTS.h3, color: COLORS.textPrimary },
  scoreStatLabel: { ...FONTS.caption, color: COLORS.textMuted },
  scoreStatDivider: { width: 1, height: rs(36), backgroundColor: COLORS.border },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(12) },
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary },

  // Answer Card
  answerCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: rs(14),
    borderWidth: 1, borderColor: COLORS.border, marginBottom: rs(10),
    borderLeftWidth: 3,
  },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(8) },
  answerBadge: {
    width: rs(28), height: rs(28), borderRadius: rs(14),
    justifyContent: 'center', alignItems: 'center',
  },
  answerNum: { ...FONTS.caption, color: COLORS.textMuted, flex: 1 },
  correctTag: { ...FONTS.caption, color: COLORS.success, fontWeight: '700' },
  incorrectTag: { ...FONTS.caption, color: COLORS.danger, fontWeight: '700' },
  answerQuestion: { ...FONTS.body, color: COLORS.textPrimary, marginBottom: rs(10) },

  // Options Review
  optionsReview: { gap: rs(6), marginBottom: rs(10) },
  reviewOption: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    paddingVertical: rs(8), paddingHorizontal: rs(10),
    borderRadius: RADIUS.sm, backgroundColor: COLORS.bgSecondary,
  },
  reviewOptionCorrect: { backgroundColor: COLORS.success + '12', borderWidth: 1, borderColor: COLORS.success + '30' },
  reviewOptionWrong: { backgroundColor: COLORS.danger + '12', borderWidth: 1, borderColor: COLORS.danger + '30' },
  reviewOptionLabel: { ...FONTS.caption, color: COLORS.textMuted, fontWeight: '700', width: rs(16) },
  reviewOptionText: { ...FONTS.bodySmall, color: COLORS.textSecondary, flex: 1 },

  // Explanation
  explanationBox: {
    flexDirection: 'row', gap: rs(8), padding: rs(12),
    backgroundColor: COLORS.warning + '10', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.warning + '20',
  },
  explanationText: { ...FONTS.bodySmall, color: COLORS.textSecondary, flex: 1, lineHeight: ms(19) },

  // Actions
  actions: { gap: rs(10), marginTop: rs(8) },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8),
    height: rs(50), width: '100%', borderRadius: RADIUS.xl, ...SHADOWS.accentGlow,
  },
  actionBtnText: { ...FONTS.buttonLarge, color: COLORS.white },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8),
    height: rs(48), width: '100%', borderRadius: RADIUS.xl,
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border,
  },
  secondaryBtnText: { ...FONTS.button, color: COLORS.textSecondary },
});
