import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, rs, ms } from '../constants/theme';
import { historyCard as styles } from '../styles/styles';

const BADGE_CONFIG = {
  math: { icon: 'calculator', label: 'MATH', color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.15)' },
  aptitude: { icon: 'bulb', label: 'APTITUDE', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
};

const TypeBadge = ({ type }) => {
  const config = BADGE_CONFIG[type];
  if (!config) return null;
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: config.bg,
      paddingHorizontal: rs(6),
      paddingVertical: rs(2),
      borderRadius: rs(6),
      gap: rs(3),
    }}>
      <Ionicons name={config.icon} size={rs(10)} color={config.color} />
      <Text style={{ fontSize: ms(9), fontWeight: '700', color: config.color }}>{config.label}</Text>
    </View>
  );
};

export default function HistoryCard({ item, onPress, onDelete, compact }) {
  const date = new Date(item.createdAt);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const summary = item.result?.summary || 'No summary available';
  const title = summary.length > 60 ? summary.substring(0, 60) + '...' : summary;
  const contentType = item.result?.type;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.compactImage} />
        )}
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6) }}>
            <TypeBadge type={contentType} />
            <Text style={styles.compactDate}>{dateStr}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: rs(6), marginBottom: rs(4) }}>
            <TypeBadge type={contentType} />
            <Text style={styles.date}>{dateStr}</Text>
          </View>
          {item.result?.keyWords && (
            <View style={styles.tags}>
              {item.result.keyWords.slice(0, 3).map((word, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{word}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
