import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { loading as styles } from '../styles/styles';

const MESSAGES = [
  'Reading the text...',
  'Understanding the words...',
  'Making it simple for you...',
  'Finding fun examples...',
  'Almost ready!',
];

export default function LoadingOverlay() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Spin
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Glow breathe
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, { toValue: 1.5, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 0.8, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [spinAnim, pulseAnim, glowScale]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.background}>
        {/* Glow circle */}
        <Animated.View
          style={[styles.glowCircle, { transform: [{ scale: glowScale }], opacity: 0.6 }]}
        />

        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="sparkles" size={64} color={COLORS.accent} />
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>EasyTutor is thinking...</Text>
        <Text style={styles.message}>{MESSAGES[messageIndex]}</Text>

        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: messageIndex % 3 === i ? 1 : 0.3,
                  transform: [{ scale: messageIndex % 3 === i ? pulseAnim : 1 }],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
