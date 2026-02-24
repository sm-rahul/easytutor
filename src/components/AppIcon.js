import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, RADIUS, SHADOWS } from '../constants/theme';

// Clean icon badge with gradient background — used instead of emojis
export function IconBadge({ name, size = 22, gradient = GRADIENTS.accent, bgSize = 48, radius, style }) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: bgSize,
          height: bgSize,
          borderRadius: radius || bgSize * 0.32,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={COLORS.white} />
    </LinearGradient>
  );
}

// Soft glow icon — transparent bg with glow border
export function GlowIcon({ name, size = 20, color = COLORS.accent, bgSize = 42, style }) {
  return (
    <View
      style={[
        {
          width: bgSize,
          height: bgSize,
          borderRadius: bgSize * 0.32,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: color + '12',
          borderWidth: 1,
          borderColor: color + '30',
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

// Outlined circle icon for steps / features
export function CircleIcon({ name, size = 20, color = COLORS.accent, bgSize = 50, style }) {
  return (
    <View
      style={[
        {
          width: bgSize,
          height: bgSize,
          borderRadius: bgSize / 2,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: color + '40',
          backgroundColor: color + '08',
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

// App Logo component
export function AppLogo({ size = 80 }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <LinearGradient
        colors={GRADIENTS.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            justifyContent: 'center',
            alignItems: 'center',
          },
          SHADOWS.accentGlow,
        ]}
      >
        <Ionicons name="sparkles" size={size * 0.45} color={COLORS.white} />
      </LinearGradient>
    </View>
  );
}
