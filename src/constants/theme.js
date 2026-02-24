// Premium Dark Theme — Cinematic & Clean
// Deep purple-black with vibrant pink-purple accents

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Responsive scaling — baseline is 375px (iPhone SE / standard phone)
const BASE_WIDTH = 375;
const scaleRatio = SCREEN_W / BASE_WIDTH;

// Scale function: scales linearly with screen width, clamped for extremes
export const rs = (size) => Math.round(size * Math.min(Math.max(scaleRatio, 0.8), 1.4));

// Moderate scale: for fonts (less aggressive scaling)
export const ms = (size, factor = 0.4) => Math.round(size + (rs(size) - size) * factor);

export const COLORS = {
  // Backgrounds (layered depth)
  bgDeep: '#08080F',
  bgPrimary: '#0E0E18',
  bgSecondary: '#151520',
  bgCard: '#1C1C2E',
  bgCardHover: '#242440',
  bgInput: '#181828',
  bgGlass: 'rgba(28, 28, 46, 0.65)',

  // Accent — Vibrant Pink-Purple
  accent: '#A855F7',
  accentLight: '#C084FC',
  accentDark: '#7C3AED',
  accentPink: '#EC4899',
  accentBlue: '#3B82F6',
  accentGlow: 'rgba(168, 85, 247, 0.15)',
  accentGlowStrong: 'rgba(168, 85, 247, 0.35)',

  // Cyan for secondary highlights
  cyan: '#22D3EE',
  cyanGlow: 'rgba(34, 211, 238, 0.12)',

  // Text
  textPrimary: '#F1F1F7',
  textSecondary: '#A8A8BF',
  textMuted: '#8585A0',
  textAccent: '#C084FC',

  // Status
  success: '#34D399',
  danger: '#F43F5E',
  warning: '#FBBF24',
  gold: '#F59E0B',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(8, 8, 15, 0.75)',
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderAccent: 'rgba(168, 85, 247, 0.25)',
};

export const GRADIENTS = {
  accent: ['#A855F7', '#EC4899'],
  accentSoft: ['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.1)'],
  accentVertical: ['#EC4899', '#A855F7'],
  purple: ['#7C3AED', '#A855F7'],
  blue: ['#3B82F6', '#22D3EE'],
  dark: ['#0E0E18', '#08080F'],
  card: ['#1C1C2E', '#151520'],
  cardAccent: ['rgba(168,85,247,0.06)', 'rgba(236,72,153,0.03)'],
  hero: ['#12101F', '#0E0E18', '#08080F'],
  glass: ['rgba(28,28,46,0.5)', 'rgba(21,21,32,0.8)'],
  danger: ['#F43F5E', '#E11D48'],
  input: ['#181828', '#1C1C2E'],
};

export const SPACING = {
  xs: rs(4),
  sm: rs(8),
  md: rs(16),
  lg: rs(24),
  xl: rs(32),
  xxl: rs(48),
};

export const RADIUS = {
  sm: rs(8),
  md: rs(12),
  lg: rs(16),
  xl: rs(20),
  xxl: rs(28),
  full: 999,
};

export const FONTS = {
  hero: { fontSize: ms(38), fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: ms(28), fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontSize: ms(22), fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: ms(18), fontWeight: '600' },
  body: { fontSize: ms(15), fontWeight: '400', lineHeight: ms(23) },
  bodySmall: { fontSize: ms(13), fontWeight: '400', lineHeight: ms(19) },
  caption: { fontSize: ms(11), fontWeight: '500' },
  button: { fontSize: ms(15), fontWeight: '700', letterSpacing: 0.3 },
  buttonLarge: { fontSize: ms(17), fontWeight: '800', letterSpacing: 0.3 },
  label: { fontSize: ms(11), fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' },
};

export const SHADOWS = {
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 14,
  },
  accentGlow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  pinkGlow: {
    shadowColor: COLORS.accentPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};
