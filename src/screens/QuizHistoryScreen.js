import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
  Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { QuizContext } from '../contexts/QuizContext';
import { COLORS, GRADIENTS, SPACING, RADIUS, FONTS, SHADOWS, rs, ms } from '../constants/theme';

const formatTime = (seconds) => {
  if (!seconds) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

function QuizAttemptCard({ item, index, onPress }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, delay: index * 80,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pct = Math.round(item.percentage);
  const scoreColor = getScoreColor(pct);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => onPress(item)}>
        <View style={[s.card, { borderLeftColor: scoreColor }]}>
          <View style={s.cardTop}>
            {/* Score circle */}
            <LinearGradient colors={getScoreGradient(pct)} style={s.scoreCircle}>
              <Text style={s.scoreCircleText}>{pct}%</Text>
            </LinearGradient>

            {/* Quiz info */}
            <View style={s.cardInfo}>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <View style={s.cardMeta}>
                <View style={s.metaChip}>
                  <Ionicons name="help-circle-outline" size={rs(12)} color={COLORS.textMuted} />
                  <Text style={s.metaText}>{item.score}/{item.totalQuestions}</Text>
                </View>
                <View style={s.metaChip}>
                  <Ionicons name="time-outline" size={rs(12)} color={COLORS.textMuted} />
                  <Text style={s.metaText}>{formatTime(item.timeTakenSeconds)}</Text>
                </View>
                <View style={[s.typeChip, { backgroundColor: scoreColor + '15', borderColor: scoreColor + '30' }]}>
                  <Text style={[s.typeText, { color: scoreColor }]}>
                    {(item.contentType || 'text').toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrow icon */}
            <Ionicons name="chevron-forward" size={rs(18)} color={scoreColor} />
          </View>

          {/* Score bar */}
          <View style={s.cardBarBg}>
            <LinearGradient
              colors={getScoreGradient(pct)}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[s.cardBarFill, { width: `${Math.max(pct, 3)}%` }]}
            />
          </View>

          {/* Bottom row */}
          <View style={s.cardBottom}>
            <Text style={s.cardDate}>{formatDate(item.createdAt)}</Text>
            {item.topicKeywords && item.topicKeywords.length > 0 && (
              <Text style={s.cardKeywords} numberOfLines={1}>
                {item.topicKeywords.slice(0, 3).join(' · ')}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const PAGE_SIZE = 5;

export default function QuizHistoryScreen({ navigation }) {
  const { quizHistory, refreshQuizHistory } = useContext(QuizContext);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    refreshQuizHistory();
  }, []);

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const visibleData = quizHistory.slice(0, visibleCount);
  const hasMore = visibleCount < quizHistory.length;

  const handleCardPress = (item) => {
    navigation.navigate('QuizAttemptDetail', {
      attemptId: item.attemptId,
      title: item.title,
      percentage: item.percentage,
    });
  };

  const renderHeader = () => (
    <Animated.View style={{ opacity: headerFade }}>
      {/* Back + Title */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={rs(20)} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Quiz History</Text>
        <View style={{ width: rs(40) }} />
      </View>

      {/* List label */}
      <View style={s.listHeader}>
        <Ionicons name="list-outline" size={rs(16)} color={COLORS.accent} />
        <Text style={s.listHeaderText}>All Attempts</Text>
        <Text style={s.listCount}>{quizHistory.length}</Text>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={s.emptyWrap}>
      <Ionicons name="school-outline" size={rs(48)} color={COLORS.textMuted} />
      <Text style={s.emptyTitle}>No quizzes yet</Text>
      <Text style={s.emptySub}>Take a quiz from any lesson to see your history here</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        style={s.loadMoreBtn}
        activeOpacity={0.7}
        onPress={() => setVisibleCount(prev => prev + PAGE_SIZE)}
      >
        <Ionicons name="chevron-down-outline" size={rs(16)} color={COLORS.accent} />
        <Text style={s.loadMoreText}>Load More ({quizHistory.length - visibleCount} remaining)</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={visibleData}
        keyExtractor={(item) => String(item.attemptId)}
        renderItem={({ item, index }) => <QuizAttemptCard item={item} index={index} onPress={handleCardPress} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgDeep },
  list: { paddingHorizontal: SPACING.md, paddingTop: rs(36), paddingBottom: rs(36) },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: rs(16),
  },
  backBtn: {
    width: rs(38), height: rs(38), borderRadius: rs(12),
    backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { ...FONTS.h2, color: COLORS.textPrimary },

  // List Header
  listHeader: {
    flexDirection: 'row', alignItems: 'center', gap: rs(8), marginBottom: rs(12),
  },
  listHeaderText: { ...FONTS.h3, color: COLORS.textPrimary, flex: 1 },
  listCount: {
    ...FONTS.caption, color: COLORS.accent, fontWeight: '700',
    backgroundColor: COLORS.accentGlow, paddingHorizontal: rs(10), paddingVertical: rs(4),
    borderRadius: RADIUS.full, overflow: 'hidden',
  },

  // Card
  card: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: rs(14),
    borderWidth: 1, borderColor: COLORS.border, marginBottom: rs(10),
    borderLeftWidth: 3,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: rs(10), marginBottom: rs(10) },
  scoreCircle: {
    width: rs(46), height: rs(46), borderRadius: rs(15),
    justifyContent: 'center', alignItems: 'center',
  },
  scoreCircleText: { fontSize: ms(14), fontWeight: '800', color: COLORS.white },
  cardInfo: { flex: 1 },
  cardTitle: { ...FONTS.body, color: COLORS.textPrimary, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: rs(8), marginTop: rs(4) },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: rs(3) },
  metaText: { ...FONTS.caption, color: COLORS.textMuted },
  typeChip: {
    paddingHorizontal: rs(6), paddingVertical: rs(2), borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  typeText: { fontSize: ms(8), fontWeight: '700' },

  // Score bar
  cardBarBg: {
    height: rs(4), backgroundColor: COLORS.bgSecondary, borderRadius: rs(2),
    overflow: 'hidden', marginBottom: rs(8),
  },
  cardBarFill: { height: '100%', borderRadius: rs(2) },

  // Bottom
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { ...FONTS.caption, color: COLORS.textMuted },
  cardKeywords: { ...FONTS.caption, color: COLORS.accent + '80', flex: 1, textAlign: 'right', marginLeft: rs(8) },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: rs(48), gap: rs(8) },
  emptyTitle: { ...FONTS.h3, color: COLORS.textSecondary },
  emptySub: { ...FONTS.bodySmall, color: COLORS.textMuted, textAlign: 'center' },

  // Load More
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8),
    paddingVertical: rs(14), marginTop: rs(4), marginBottom: rs(8),
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.accent + '30',
    backgroundColor: COLORS.accent + '08',
  },
  loadMoreText: { ...FONTS.button, color: COLORS.accent },
});
