import React, { useContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AIContext } from '../contexts/AIContext';
import HistoryCard from '../components/HistoryCard';
import GradientButton from '../components/GradientButton';
import { COLORS, GRADIENTS, SPACING, rs } from '../constants/theme';
import { common, header as headerStyles, history as styles } from '../styles/styles';

const PAGE_SIZE = 5;

export default function HistoryScreen({ navigation }) {
  const { history, removeHistoryItem, refreshHistory } = useContext(AIContext);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useFocusEffect(
    useCallback(() => {
      refreshHistory();
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    }, [refreshHistory])
  );

  const handleDelete = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this lesson?')) {
        removeHistoryItem(id);
      }
    } else {
      Alert.alert(
        'Delete Lesson',
        'Are you sure you want to remove this lesson?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => removeHistoryItem(id) },
        ]
      );
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="library-outline" size={64} color={COLORS.textMuted} style={{ marginBottom: SPACING.lg }} />
      <Text style={styles.emptyTitle}>No Lessons Yet!</Text>
      <Text style={styles.emptyText}>
        Take your first photo to start learning.{'\n'}Your saved lessons will appear here.
      </Text>
      <GradientButton
        title="Scan Your First Text"
        onPress={() => navigation.navigate('CameraTab')}
        icon={<Ionicons name="camera" size={18} color={COLORS.white} />}
        style={{ marginTop: SPACING.lg }}
      />
    </View>
  );

  return (
    <View style={common.screen}>
      {/* Header */}
      <LinearGradient colors={GRADIENTS.hero} style={headerStyles.container}>
        <Ionicons name="time" size={rs(32)} color={COLORS.accent} style={{ marginBottom: rs(6) }} />
        <Text style={headerStyles.title}>My Learning History</Text>
        <Text style={headerStyles.subtitle}>
          {history.length} {history.length === 1 ? 'lesson' : 'lessons'} saved
        </Text>
      </LinearGradient>

      {/* List */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <FlatList
          data={history.slice(0, visibleCount)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onPress={() => navigation.navigate('HistoryDetail', { item })}
              onDelete={handleDelete}
            />
          )}
          ListFooterComponent={visibleCount < history.length ? (
            <TouchableOpacity
              style={pgStyles.loadMoreBtn}
              activeOpacity={0.7}
              onPress={() => setVisibleCount(prev => prev + PAGE_SIZE)}
            >
              <Ionicons name="chevron-down-outline" size={rs(16)} color={COLORS.accent} />
              <Text style={pgStyles.loadMoreText}>Load More ({history.length - visibleCount} remaining)</Text>
            </TouchableOpacity>
          ) : null}
        />
      </Animated.View>
    </View>
  );
}

const pgStyles = StyleSheet.create({
  loadMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8),
    paddingVertical: rs(14), marginTop: rs(4), marginBottom: rs(8),
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.accent + '30',
    backgroundColor: COLORS.accent + '08',
  },
  loadMoreText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
});
