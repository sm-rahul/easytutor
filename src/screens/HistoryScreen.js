import React, { useContext, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AIContext } from '../contexts/AIContext';
import HistoryCard from '../components/HistoryCard';
import GradientButton from '../components/GradientButton';
import { COLORS, GRADIENTS, SPACING, rs } from '../constants/theme';
import { common, header as headerStyles, history as styles } from '../styles/styles';

export default function HistoryScreen({ navigation }) {
  const { history, removeHistoryItem, refreshHistory } = useContext(AIContext);

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
          data={history}
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
        />
      </Animated.View>
    </View>
  );
}
