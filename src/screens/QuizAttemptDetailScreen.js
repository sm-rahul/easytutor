import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList,
  StatusBar, Animated, Easing, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiGetAttemptDetail } from '../services/api';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

const formatTime = (s) => {
  if (!s) return '0s';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getScoreColor = (pct) => {
  if (pct >= 80) return COLORS.success;
  if (pct >= 50) return COLORS.warning;
  return COLORS.danger;
};

const getScoreGradient = (pct) => {
  if (pct >= 80) return ['#34D399', '#10B981'];
  if (pct >= 50) return [COLORS.warning, '#F59E0B'];
  return GRADIENTS.danger;
};

const getScoreIcon = (pct) => {
  if (pct >= 80) return 'trophy';
  if (pct >= 50) return 'thumbs-up';
  return 'fitness';
};

const getScoreMessage = (pct) => {
  if (pct >= 80) return 'Excellent Work!';
  if (pct >= 60) return 'Good Job!';
  if (pct >= 40) return 'Keep Practicing!';
  return "Don't Give Up!";
};

function AnswerCard({ answer, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, delay: index * 100,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={[s.answerCard, { borderLeftColor: answer.isCorrect ? COLORS.success : COLORS.danger }]}>
        {/* Header */}
        <View style={s.answerHeader}>
          <View style={[s.answerBadge, { backgroundColor: (answer.isCorrect ? COLORS.success : COLORS.danger) + '20' }]}>
            <Ionicons
              name={answer.isCorrect ? 'checkmark' : 'close'}
              size={rs(14)}
              color={answer.isCorrect ? COLORS.success : COLORS.danger}
            />
          </View>
          <Text style={s.answerNum}>Question {index + 1}</Text>
          <Text style={[s.answerTag, { color: answer.isCorrect ? COLORS.success : COLORS.danger }]}>
            {answer.isCorrect ? 'Correct' : 'Incorrect'}
          </Text>
        </View>

        {/* Question */}
        <Text style={s.answerQuestion}>{answer.question}</Text>

        {/* Options */}
        <View style={s.optionsWrap}>
          {answer.options.map((opt, optIdx) => {
            const isCorrectOption = optIdx === answer.correct;
            const isUserSelected = optIdx === answer.selected;
            const showGreen = isCorrectOption;
            const showRed = isUserSelected && !answer.isCorrect;

            return (
              <View
                key={optIdx}
                style={[
                  s.optionRow,
                  showGreen && s.optionCorrect,
                  showRed && s.optionWrong,
                ]}
              >
                <Text style={[
                  s.optionLabel,
                  showGreen && { color: COLORS.success },
                  showRed && { color: COLORS.danger },
                ]}>
                  {['A', 'B', 'C', 'D'][optIdx]}
                </Text>
                <Text style={[
                  s.optionText,
                  showGreen && { color: COLORS.success, fontWeight: '600' },
                  showRed && { color: COLORS.danger },
                ]} numberOfLines={3}>
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
  );
}

export default function QuizAttemptDetailScreen({ navigation, route }) {
  const { attemptId, title: passedTitle, percentage: passedPct } = route.params || {};
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const headerFade = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAttempt();
  }, []);

  const loadAttempt = async () => {
    try {
      console.log('Loading attempt detail for ID:', attemptId);
      const res = await apiGetAttemptDetail(attemptId);
      console.log('Attempt detail response:', JSON.stringify(res).substring(0, 300));
      if (res.success && res.attempt) {
        setAttempt(res.attempt);
        // Animate header
        Animated.sequence([
          Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.spring(scoreScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        ]).start();
      } else {
        setErrorMsg(res.error || 'Unknown error from server');
      }
    } catch (e) {
      console.error('Load attempt error:', e);
      setErrorMsg(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={s.loadingWrap}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={s.loadingText}>Loading quiz details...</Text>
      </View>
    );
  }

  if (!attempt) {
    return (
      <View style={s.loadingWrap}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="alert-circle-outline" size={rs(48)} color={COLORS.danger} />
        <Text style={s.loadingText}>Could not load attempt</Text>
        {errorMsg ? <Text style={[s.loadingText, { fontSize: ms(11), marginTop: rs(4) }]}>{errorMsg}</Text> : null}
        <TouchableOpacity style={s.retryBtn} onPress={loadAttempt}>
          <Text style={s.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.retryBtn, { marginTop: rs(8) }]} onPress={() => navigation.goBack()}>
          <Text style={s.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { score, totalQuestions, percentage, timeTakenSeconds, answers, title, contentType, topicKeywords, createdAt } = attempt;
  const pct = Math.round(percentage);
  const scoreColor = getScoreColor(pct);
  const correctCount = answers.filter(a => a.isCorrect).length;
  const incorrectCount = answers.filter(a => !a.isCorrect).length;

  const renderHeader = () => (
    <>
      {/* Back button */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={rs(20)} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={s.topTitle} numberOfLines={1}>Quiz Detail</Text>
        <View style={{ width: rs(40) }} />
      </View>

      {/* Score Header */}
      <Animated.View style={[s.scoreSection, { opacity: headerFade }]}>
        <LinearGradient colors={getScoreGradient(pct)} style={s.scoreIconWrap}>
          <Ionicons name={getScoreIcon(pct)} size={rs(32)} color={COLORS.white} />
        </LinearGradient>
        <Text style={s.scoreMessage}>{getScoreMessage(pct)}</Text>
        <Text style={s.quizTitleText} numberOfLines={2}>{title}</Text>

        {/* Meta chips */}
        <View style={s.metaRow}>
          <View style={s.metaChip}>
            <Ionicons name="calendar-outline" size={rs(12)} color={COLORS.textMuted} />
            <Text style={s.metaText}>{formatDate(createdAt)}</Text>
          </View>
          {contentType && (
            <View style={[s.typeChip, { borderColor: scoreColor + '40', backgroundColor: scoreColor + '15' }]}>
              <Text style={[s.typeText, { color: scoreColor }]}>{contentType.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Score Card */}
      <Animated.View style={[s.scoreCard, { transform: [{ scale: scoreScale }] }]}>
        <Text style={[s.scorePct, { color: scoreColor }]}>{pct}%</Text>
        <View style={s.scoreBarBg}>
          <LinearGradient
            colors={getScoreGradient(pct)}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.scoreBarFill, { width: `${Math.max(pct, 3)}%` }]}
          />
        </View>
        <View style={s.scoreStatsRow}>
          <View style={s.scoreStat}>
            <Ionicons name="checkmark-circle" size={rs(18)} color={COLORS.success} />
            <Text style={s.scoreStatNum}>{correctCount}</Text>
            <Text style={s.scoreStatLabel}>Correct</Text>
          </View>
          <View style={s.scoreStatDivider} />
          <View style={s.scoreStat}>
            <Ionicons name="close-circle" size={rs(18)} color={COLORS.danger} />
            <Text style={s.scoreStatNum}>{incorrectCount}</Text>
            <Text style={s.scoreStatLabel}>Wrong</Text>
          </View>
          <View style={s.scoreStatDivider} />
          <View style={s.scoreStat}>
            <Ionicons name="help-circle" size={rs(18)} color={COLORS.accent} />
            <Text style={s.scoreStatNum}>{totalQuestions}</Text>
            <Text style={s.scoreStatLabel}>Total</Text>
          </View>
          <View style={s.scoreStatDivider} />
          <View style={s.scoreStat}>
            <Ionicons name="time-outline" size={rs(18)} color={COLORS.cyan || COLORS.accentLight} />
            <Text style={s.scoreStatNum}>{formatTime(timeTakenSeconds)}</Text>
            <Text style={s.scoreStatLabel}>Time</Text>
          </View>
        </View>
      </Animated.View>

      {/* Topic Keywords */}
      {topicKeywords && topicKeywords.length > 0 && (
        <View style={s.keywordsRow}>
          {topicKeywords.map((kw, i) => (
            <View key={i} style={s.keywordChip}>
              <Text style={s.keywordText}>{kw}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Review Section Header */}
      <View style={s.sectionHeader}>
        <Ionicons name="document-text-outline" size={rs(16)} color={COLORS.accent} />
        <Text style={s.sectionTitle}>Question Review</Text>
        <Text style={s.sectionCount}>{answers.length}</Text>
      </View>
    </>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={answers}
        keyExtractor={(item, idx) => String(item.questionId || idx)}
        renderItem={({ item, index }) => <AnswerCard answer={item} index={index} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  list: { paddingHorizontal: SPACING.md, paddingTop: rs(36), paddingBottom: rs(36) },

  // Loading
  loadingWrap: { flex: 1, backgroundColor: COLORS.bgDeep, justifyContent: 'center', alignItems: 'center', gap: rs(12) },
  loadingText: { ...FONTS.body, color: COLORS.textMuted },
  retryBtn: { marginTop: rs(12), paddingHorizontal: rs(20), paddingVertical: rs(10), borderRadius: RADIUS.lg, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  retryText: { ...FONTS.button, color: COLORS.textSecondary },

  // Top Bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: rs(16),
  },
  backBtn: {
    width: rs(38), height: rs(38), borderRadius: rs(12),
    backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  topTitle: { ...FONTS.h2, color: COLORS.textPrimary },

  // Score Section
  scoreSection: { alignItems: 'center', marginBottom: rs(16) },
  scoreIconWrap: {
    width: rs(64), height: rs(64), borderRadius: rs(22),
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.accentGlow,
  },
  scoreMessage: { ...FONTS.h1, color: COLORS.textPrimary, marginTop: rs(12) },
  quizTitleText: { ...FONTS.bodySmall, color: COLORS.textMuted, marginTop: rs(4), textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: rs(10), marginTop: rs(8) },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: rs(4) },
  metaText: { ...FONTS.caption, color: COLORS.textMuted },
  typeChip: { paddingHorizontal: rs(8), paddingVertical: rs(3), borderRadius: RADIUS.sm, borderWidth: 1 },
  typeText: { fontSize: ms(9), fontWeight: '700' },

  // Score Card
  scoreCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(18),
    borderWidth: 1, borderColor: COLORS.border, marginBottom: rs(14),
    alignItems: 'center', ...SHADOWS.card,
  },
  scorePct: { fontSize: ms(40), fontWeight: '800' },
  scoreBarBg: {
    height: rs(6), width: '100%', backgroundColor: COLORS.bgSecondary,
    borderRadius: rs(3), overflow: 'hidden', marginTop: rs(8), marginBottom: rs(14),
  },
  scoreBarFill: { height: '100%', borderRadius: rs(3) },
  scoreStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%' },
  scoreStat: { alignItems: 'center', gap: rs(3) },
  scoreStatNum: { fontSize: ms(15), fontWeight: '800', color: COLORS.textPrimary },
  scoreStatLabel: { ...FONTS.caption, color: COLORS.textMuted, fontSize: ms(9) },
  scoreStatDivider: { width: 1, height: rs(32), backgroundColor: COLORS.border },

  // Keywords
  keywordsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(6), marginBottom: rs(14) },
  keywordChip: {
    paddingHorizontal: rs(10), paddingVertical: rs(4),
    borderRadius: RADIUS.full, backgroundColor: COLORS.accent + '15',
    borderWidth: 1, borderColor: COLORS.accent + '30',
  },
  keywordText: { ...FONTS.caption, color: COLORS.accent, fontWeight: '600' },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(12),
  },
  sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, flex: 1 },
  sectionCount: {
    ...FONTS.caption, color: COLORS.accent, fontWeight: '700',
    backgroundColor: COLORS.accentGlow, paddingHorizontal: rs(10), paddingVertical: rs(4),
    borderRadius: RADIUS.full, overflow: 'hidden',
  },

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
  answerTag: { ...FONTS.caption, fontWeight: '700' },
  answerQuestion: { ...FONTS.body, color: COLORS.textPrimary, marginBottom: rs(10), lineHeight: ms(22) },

  // Options
  optionsWrap: { gap: rs(6), marginBottom: rs(10) },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8),
    paddingVertical: rs(8), paddingHorizontal: rs(10),
    borderRadius: RADIUS.sm, backgroundColor: COLORS.bgSecondary,
  },
  optionCorrect: { backgroundColor: COLORS.success + '12', borderWidth: 1, borderColor: COLORS.success + '30' },
  optionWrong: { backgroundColor: COLORS.danger + '12', borderWidth: 1, borderColor: COLORS.danger + '30' },
  optionLabel: { ...FONTS.caption, color: COLORS.textMuted, fontWeight: '700', width: rs(16) },
  optionText: { ...FONTS.bodySmall, color: COLORS.textSecondary, flex: 1 },

  // Explanation
  explanationBox: {
    flexDirection: 'row', gap: rs(8), padding: rs(12),
    backgroundColor: COLORS.warning + '10', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.warning + '20',
  },
  explanationText: { ...FONTS.bodySmall, color: COLORS.textSecondary, flex: 1, lineHeight: ms(19) },
});
