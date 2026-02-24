import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS, GRADIENTS, rs, ms } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================
// SHARED / COMMON STYLES
// ============================================================
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDeep,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: 100,
  },
  // Glass Card
  glassCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: rs(18),
    marginBottom: rs(12),
    ...SHADOWS.card,
  },
  glassCardAccent: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    padding: rs(18),
    marginBottom: rs(12),
    ...SHADOWS.card,
  },
  // Section
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  // Card title row with icon
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
  },
  // Accent text
  accentText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  mutedText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
});

// ============================================================
// GRADIENT HEADER (reused across screens)
// ============================================================
export const header = StyleSheet.create({
  container: {
    paddingTop: rs(56),
    paddingBottom: rs(24),
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: rs(24),
    borderBottomRightRadius: rs(24),
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderAccent,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

// ============================================================
// HOME SCREEN
// ============================================================
export const home = StyleSheet.create({
  // Hero
  hero: {
    paddingTop: rs(60),
    paddingBottom: rs(50),
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: rs(32),
    borderBottomRightRadius: rs(32),
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  heroGlowCircle: {
    position: 'absolute',
    width: rs(200),
    height: rs(200),
    borderRadius: rs(100),
    backgroundColor: COLORS.accentGlow,
    top: rs(-40),
    right: rs(-40),
  },
  heroGlowCircle2: {
    position: 'absolute',
    width: rs(150),
    height: rs(150),
    borderRadius: rs(75),
    backgroundColor: 'rgba(0, 217, 245, 0.08)',
    bottom: rs(-30),
    left: rs(-30),
  },
  heroTitle: {
    ...FONTS.hero,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  heroAccent: {
    ...FONTS.hero,
    color: COLORS.accent,
  },
  heroSubtitle: {
    ...FONTS.h3,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  heroDescription: {
    ...FONTS.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: rs(-24),
    gap: SPACING.sm,
    zIndex: 5,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  statIconWrapper: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rs(6),
  },
  statNumber: {
    fontSize: ms(30),
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // CTA
  ctaSection: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  // Section
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  seeAll: {
    ...FONTS.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },
  // Steps
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rs(10),
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  stepTitle: {
    ...FONTS.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stepDesc: {
    ...FONTS.caption,
    color: COLORS.textMuted,
  },
  stepArrow: {
    paddingBottom: rs(40),
  },
  // Motivational footer
  footerCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  footerText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: ms(24),
  },
  // Daily motivation
  motivationCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  motivationQuote: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: ms(24),
  },
  motivationDots: {
    flexDirection: 'row',
    gap: rs(6),
    marginTop: SPACING.sm,
  },
  dot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    width: rs(18),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: COLORS.accent,
  },
});

// ============================================================
// CAMERA SCREEN
// ============================================================
export const camera = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  topBtn: {
    width: rs(46),
    height: rs(46),
    borderRadius: rs(23),
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: rs(100),
    left: 0,
    right: 0,
  },
  instructionBadge: {
    backgroundColor: 'rgba(10, 10, 15, 0.7)',
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  instructionText: {
    color: COLORS.accent,
    ...FONTS.bodySmall,
    fontWeight: '600',
  },
  // Scan frame
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '75%',
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: rs(32),
    height: rs(32),
    borderColor: COLORS.accent,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: rs(10) },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: rs(10) },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: rs(10) },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: rs(10) },
  // Bottom controls
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: rs(44),
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
    paddingTop: SPACING.lg,
  },
  sideBtn: {
    alignItems: 'center',
    width: rs(60),
  },
  sideBtnText: {
    color: COLORS.textSecondary,
    ...FONTS.caption,
    marginTop: 4,
  },
  captureBtn: {
    width: rs(78),
    height: rs(78),
    borderRadius: rs(39),
    borderWidth: 3,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
  captureBtnInner: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    backgroundColor: COLORS.accent,
  },
  // Preview mode
  preview: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  previewControls: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(15),
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    gap: rs(8),
  },
  retakeBtnText: {
    ...FONTS.button,
    color: COLORS.textSecondary,
  },
  usePhotoBtn: {
    flex: 2,
  },
  usePhotoBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(15),
    borderRadius: RADIUS.xl,
    gap: rs(8),
  },
  usePhotoBtnText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  // Permission states
  permissionTitle: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  permissionText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

// ============================================================
// SUMMARY SCREEN
// ============================================================
export const summary = StyleSheet.create({
  // Photo row
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  thumbnail: {
    width: rs(54),
    height: rs(54),
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  imageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    gap: rs(6),
  },
  imageLabelText: {
    ...FONTS.bodySmall,
    color: COLORS.accent,
  },
  // Summary card accent stripe
  summaryCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  visualCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentPink,
  },
  summaryText: {
    fontSize: ms(18),
    lineHeight: ms(30),
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  bodyText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: ms(26),
  },
  extractedText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: ms(24),
    marginTop: SPACING.sm,
  },
  // Collapsible header
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Examples
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  exampleBullet: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  exampleNumber: {
    color: COLORS.white,
    fontSize: ms(12),
    fontWeight: '800',
  },
  exampleText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  // Key Words
  keyWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keyWordChip: {
    paddingHorizontal: rs(14),
    paddingVertical: rs(7),
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  keyWordText: {
    ...FONTS.bodySmall,
    color: COLORS.accent,
    fontWeight: '600',
  },
  // Actions
  actions: {
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  actionBtn: {
    width: '100%',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    paddingVertical: rs(14),
  },
  savedText: {
    ...FONTS.button,
    color: COLORS.accent,
  },
});

// ============================================================
// HISTORY SCREEN
// ============================================================
export const history = StyleSheet.create({
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: rs(80),
  },
  emptyTitle: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: ms(24),
  },
});

// ============================================================
// DETAIL SCREEN
// ============================================================
export const detail = StyleSheet.create({
  image: {
    width: '100%',
    height: rs(180),
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
  },
});

// ============================================================
// HISTORY CARD COMPONENT
// ============================================================
export const historyCard = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: rs(60),
    height: rs(60),
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  date: {
    ...FONTS.caption,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: COLORS.accentGlow,
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  tagText: {
    fontSize: ms(10),
    fontWeight: '600',
    color: COLORS.accent,
  },
  deleteBtn: {
    padding: SPACING.sm,
  },
  // Compact card (horizontal scroll)
  compactCard: {
    width: rs(170),
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    marginRight: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  compactImage: {
    width: '100%',
    height: rs(85),
  },
  compactContent: {
    padding: SPACING.sm,
  },
  compactTitle: {
    ...FONTS.caption,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  compactDate: {
    fontSize: ms(10),
    fontWeight: '500',
    color: COLORS.textMuted,
  },
});

// ============================================================
// GRADIENT BUTTON COMPONENT
// ============================================================
export const gradientButton = StyleSheet.create({
  wrapper: {
    borderRadius: RADIUS.xl,
    ...SHADOWS.accentGlow,
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rs(15),
    paddingHorizontal: rs(28),
    borderRadius: RADIUS.xl,
    gap: rs(10),
  },
  gradientLarge: {
    paddingVertical: rs(18),
    paddingHorizontal: rs(40),
  },
  text: {
    color: COLORS.white,
    ...FONTS.button,
  },
  textLarge: {
    color: COLORS.white,
    ...FONTS.buttonLarge,
  },
});

// ============================================================
// LOADING OVERLAY
// ============================================================
export const loading = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDeep,
  },
  glowCircle: {
    position: 'absolute',
    width: rs(200),
    height: rs(200),
    borderRadius: rs(100),
    backgroundColor: COLORS.accentGlow,
  },
  iconContainer: {
    marginBottom: rs(28),
  },
  title: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginBottom: rs(12),
  },
  message: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: rs(36),
  },
  dotsRow: {
    flexDirection: 'row',
    gap: rs(10),
  },
  dot: {
    width: rs(10),
    height: rs(10),
    borderRadius: rs(5),
    backgroundColor: COLORS.accent,
  },
});

// ============================================================
// APP / TAB BAR
// ============================================================
export const tabBar = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: rs(68),
    paddingBottom: rs(8),
    paddingTop: rs(8),
    elevation: 0,
  },
  label: {
    fontSize: ms(11),
    fontWeight: '600',
  },
  iconGradient: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(21),
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glow,
  },
});

// ============================================================
// SOLUTION STEPS (Math/Aptitude)
// ============================================================
export const solution = StyleSheet.create({
  // Type badge
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: rs(12),
    paddingVertical: rs(5),
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
    gap: rs(6),
  },
  typeBadgeMath: {
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  typeBadgeText: {
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  typeBadgeAptitude: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  typeBadgeLabel: {
    ...FONTS.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  // Container for all steps
  stepsContainer: {
    gap: SPACING.sm,
  },
  // Individual step card
  stepCard: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  // Step header with number bubble and title
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    marginBottom: SPACING.sm,
  },
  stepNumberBubble: {
    width: rs(30),
    height: rs(30),
    borderRadius: rs(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: ms(14),
    fontWeight: '800',
  },
  stepTitle: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    flex: 1,
  },
  // Step explanation text
  stepExplanation: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: ms(24),
    marginBottom: SPACING.sm,
  },
  // Math expression box
  expressionBox: {
    backgroundColor: COLORS.bgDeep,
    borderRadius: RADIUS.md,
    padding: rs(12),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  expressionText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: COLORS.cyan,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlign: 'center',
    lineHeight: ms(24),
  },
  // Connector line between steps
  connector: {
    width: 2,
    height: rs(12),
    backgroundColor: COLORS.border,
    marginLeft: rs(14),
  },
  // Solution section card
  solutionCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.cyan,
  },
  solutionCardAptitude: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  // Final answer card
  finalAnswerCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  finalAnswerText: {
    fontSize: ms(20),
    fontWeight: '700',
    color: COLORS.success,
    lineHeight: ms(30),
  },
});

// Export screen dimensions for use
export { SCREEN_WIDTH, SCREEN_HEIGHT };
