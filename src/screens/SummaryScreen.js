import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AIContext } from '../contexts/AIContext';
import GradientButton from '../components/GradientButton';
import { COLORS, GRADIENTS, SPACING, rs, ms } from '../constants/theme';
import { downloadPdf } from '../utils/downloadPdf';
import { apiUpdateHistoryReadTime } from '../services/api';
import { common, header as headerStyles, summary as styles, solution as solutionStyles } from '../styles/styles';

// Badge config for each content type
const TYPE_CONFIG = {
  math: { icon: 'calculator', label: 'Math', color: COLORS.cyan, badgeStyle: 'typeBadgeMath', solutionStyle: 'solutionCard', stepGradient: GRADIENTS.blue },
  aptitude: { icon: 'bulb', label: 'Aptitude', color: COLORS.gold, badgeStyle: 'typeBadgeAptitude', solutionStyle: 'solutionCardAptitude', stepGradient: ['#F59E0B', '#FBBF24'] },
  text: { icon: 'document-text', label: 'Text', color: COLORS.accent, badgeStyle: 'typeBadgeText' },
};

export default function SummaryScreen({ navigation }) {
  const { analysisResult, setAnalysisResult, image, saveResult, simplifyResult, logReadingTime } = useContext(AIContext);
  const [saved, setSaved] = useState(false);
  const [savedItemId, setSavedItemId] = useState(null);
  const [simplifying, setSimplifying] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const readingStartTime = useRef(Date.now());

  // Track reading time when leaving screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const seconds = Math.round((Date.now() - readingStartTime.current) / 1000);
      if (seconds >= 3) {
        logReadingTime(seconds);
        // Also save per-item reading time if lesson was saved
        if (savedItemId) {
          apiUpdateHistoryReadTime(savedItemId, seconds).catch(() => {});
        }
      }
    });
    return unsubscribe;
  }, [navigation, logReadingTime, savedItemId]);

  // Staggered card animations (8 slots to cover steps + answer cards)
  const anims = useRef([...Array(8)].map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(40),
  }))).current;

  useEffect(() => {
    const animations = anims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 400, delay: i * 120, useNativeDriver: true }),
        Animated.timing(a.translateY, { toValue: 0, duration: 500, delay: i * 120, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ])
    );
    Animated.stagger(80, animations).start();
  }, []);

  const handleSave = async () => {
    const item = await saveResult();
    if (item) {
      setSaved(true);
      setSavedItemId(item.id);
      if (Platform.OS === 'web') {
        window.alert('This lesson has been saved to your history.');
      } else {
        Alert.alert('Saved!', 'This lesson has been saved to your history.');
      }
    }
    return item;
  };

  const handlePracticeQuiz = async () => {
    let historyId = savedItemId;
    // Auto-save first if not saved
    if (!saved) {
      const item = await handleSave();
      if (item) historyId = item.id;
    }
    if (analysisResult) {
      navigation.navigate('Quiz', { historyId, analysisResult });
    }
  };

  const handleSimplify = async () => {
    setSimplifying(true);
    const result = await simplifyResult(analysisResult);
    if (result) {
      setAnalysisResult(result);
      setSimplified(true);
      if (Platform.OS === 'web') {
        window.alert('Made it easier! Check the updated explanation.');
      } else {
        Alert.alert('Done!', 'The explanation is now even simpler.');
      }
    }
    setSimplifying(false);
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    await downloadPdf(analysisResult);
    setDownloading(false);
  };

  const handleScanAnother = () => {
    setSaved(false);
    navigation.goBack();
  };

  if (!analysisResult) {
    return (
      <View style={common.center}>
        <Text style={common.mutedText}>No results yet. Try scanning some text!</Text>
      </View>
    );
  }

  const { summary, visualExplanation, realWorldExamples, keyWords, type, solutionSteps, finalAnswer } = analysisResult;
  const isSolvable = type === 'math' || type === 'aptitude';
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.text;

  // Dynamic card indices based on content type
  let nextIndex = 1; // 0 is photo thumbnail
  const summaryIndex = nextIndex++;
  const visualIndex = nextIndex++;
  const stepsIndex = isSolvable ? nextIndex++ : null;
  const answerIndex = isSolvable ? nextIndex++ : null;
  const examplesIndex = !isSolvable ? nextIndex++ : null;
  const keyWordsIndex = nextIndex++;
  const actionsIndex = nextIndex++;

  // Renders text with bullet points and paragraphs nicely
  const FormattedText = ({ text, style: textStyle }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <View>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <View key={i} style={{ height: rs(8) }} />;
          const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+[\.\)]/.test(trimmed);
          if (isBullet) {
            return (
              <View key={i} style={{ flexDirection: 'row', paddingLeft: rs(4), marginBottom: rs(6) }}>
                <Text style={[textStyle, { color: COLORS.accent, marginRight: rs(6), fontWeight: '700' }]}>
                  {trimmed.match(/^[•\-]|\d+[\.\)]/)?.[0] || '•'}
                </Text>
                <Text style={[textStyle, { flex: 1 }]}>
                  {trimmed.replace(/^[•\-]\s*|\d+[\.\)]\s*/, '')}
                </Text>
              </View>
            );
          }
          const isHeading = trimmed.endsWith(':') && trimmed.length < 60;
          return (
            <Text key={i} style={[textStyle, isHeading && { fontWeight: '700', color: COLORS.textPrimary, marginTop: rs(8), marginBottom: rs(4) }]}>
              {trimmed}
            </Text>
          );
        })}
      </View>
    );
  };

  const AnimCard = ({ index, children, style }) => (
    <Animated.View style={[common.glassCard, style, { opacity: anims[index].opacity, transform: [{ translateY: anims[index].translateY }] }]}>
      {children}
    </Animated.View>
  );

  return (
    <View style={common.screen}>
      {/* Header */}
      <LinearGradient colors={GRADIENTS.hero} style={headerStyles.container}>
        <Ionicons name="school" size={rs(32)} color={COLORS.accent} style={{ marginBottom: rs(6) }} />
        <Text style={headerStyles.title}>Your Summary</Text>
        <Text style={headerStyles.subtitle}>Here's what we found!</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={common.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo thumbnail */}
        {image && (
          <Animated.View style={[styles.imageRow, { opacity: anims[0].opacity }]}>
            <Image source={{ uri: image }} style={styles.thumbnail} />
            <View style={styles.imageLabel}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.accent} />
              <Text style={styles.imageLabelText}>Photo analyzed</Text>
            </View>
            {/* Type badge */}
            <View style={[
              solutionStyles.typeBadge,
              solutionStyles[cfg.badgeStyle],
              { marginLeft: 'auto', marginBottom: 0 }
            ]}>
              <Ionicons name={cfg.icon} size={12} color={cfg.color} />
              <Text style={[solutionStyles.typeBadgeLabel, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Summary */}
        <AnimCard index={summaryIndex} style={styles.summaryCard}>
          <View style={common.cardTitleRow}>
            <Ionicons name="book" size={20} color={COLORS.accent} />
            <Text style={common.cardTitle}>Simple Summary</Text>
          </View>
          <FormattedText text={summary} style={styles.summaryText} />
        </AnimCard>

        {/* Visual Explanation */}
        {visualExplanation && (
          <AnimCard index={visualIndex} style={styles.visualCard}>
            <View style={common.cardTitleRow}>
              <Ionicons name="color-palette" size={20} color={COLORS.accentPink} />
              <Text style={common.cardTitle}>Visual Explanation</Text>
            </View>
            <FormattedText text={visualExplanation} style={styles.bodyText} />
          </AnimCard>
        )}

        {/* Solution Steps (Math / Aptitude) */}
        {isSolvable && solutionSteps && solutionSteps.length > 0 && (
          <AnimCard index={stepsIndex} style={solutionStyles[cfg.solutionStyle]}>
            <View style={common.cardTitleRow}>
              <Ionicons name="git-branch-outline" size={20} color={cfg.color} />
              <Text style={common.cardTitle}>Step-by-Step Solution</Text>
            </View>
            <View style={solutionStyles.stepsContainer}>
              {solutionSteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <View style={solutionStyles.stepCard}>
                    <View style={solutionStyles.stepHeader}>
                      <LinearGradient colors={cfg.stepGradient} style={solutionStyles.stepNumberBubble}>
                        <Text style={solutionStyles.stepNumberText}>{step.step}</Text>
                      </LinearGradient>
                      <Text style={solutionStyles.stepTitle}>{step.title}</Text>
                    </View>
                    <Text style={solutionStyles.stepExplanation}>{step.explanation}</Text>
                    {step.expression && (
                      <View style={solutionStyles.expressionBox}>
                        <Text style={[solutionStyles.expressionText, { color: cfg.color }]}>{step.expression}</Text>
                      </View>
                    )}
                  </View>
                  {idx < solutionSteps.length - 1 && (
                    <View style={solutionStyles.connector} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </AnimCard>
        )}

        {/* Final Answer (Math / Aptitude) */}
        {isSolvable && finalAnswer && (
          <AnimCard index={answerIndex} style={solutionStyles.finalAnswerCard}>
            <View style={common.cardTitleRow}>
              <Ionicons name="checkmark-done-circle" size={20} color={COLORS.success} />
              <Text style={common.cardTitle}>Final Answer</Text>
            </View>
            <Text style={solutionStyles.finalAnswerText}>{finalAnswer}</Text>
          </AnimCard>
        )}

        {/* Real-World Examples (Text only) */}
        {!isSolvable && realWorldExamples && realWorldExamples.length > 0 && (
          <AnimCard index={examplesIndex}>
            <View style={common.cardTitleRow}>
              <Ionicons name="globe" size={20} color={COLORS.cyan} />
              <Text style={common.cardTitle}>Real-World Examples</Text>
            </View>
            {realWorldExamples.map((example, index) => (
              <View key={index} style={styles.exampleRow}>
                <LinearGradient colors={GRADIENTS.accent} style={styles.exampleBullet}>
                  <Text style={styles.exampleNumber}>{index + 1}</Text>
                </LinearGradient>
                <Text style={styles.exampleText}>{example}</Text>
              </View>
            ))}
          </AnimCard>
        )}

        {/* Key Words */}
        {keyWords && keyWords.length > 0 && (
          <AnimCard index={keyWordsIndex}>
            <View style={common.cardTitleRow}>
              <Ionicons name="key" size={20} color={COLORS.accent} />
              <Text style={common.cardTitle}>Key Words to Remember</Text>
            </View>
            <View style={styles.keyWordsContainer}>
              {keyWords.map((word, i) => (
                <View key={i} style={styles.keyWordChip}>
                  <Text style={styles.keyWordText}>{word}</Text>
                </View>
              ))}
            </View>
          </AnimCard>
        )}

        {/* Make it Easier */}
        {!simplified && (
          <Animated.View style={{ opacity: anims[actionsIndex].opacity, transform: [{ translateY: anims[actionsIndex].translateY }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSimplify}
              disabled={simplifying}
              style={{ marginBottom: rs(4) }}
            >
              <LinearGradient colors={GRADIENTS.blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(10),
                paddingVertical: rs(14), borderRadius: rs(20),
              }}>
                <Ionicons name={simplifying ? 'hourglass-outline' : 'bulb-outline'} size={18} color={COLORS.white} />
                <Text style={{ fontSize: ms(15), fontWeight: '700', color: COLORS.white }}>
                  {simplifying ? 'Making it easier...' : 'Want even easier explanation?'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {simplified && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), paddingVertical: rs(8) }}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={{ fontSize: ms(13), color: COLORS.success, fontWeight: '600' }}>Simplified!</Text>
          </View>
        )}

        {/* Download PDF */}
        <Animated.View style={{ opacity: anims[actionsIndex].opacity, transform: [{ translateY: anims[actionsIndex].translateY }], marginBottom: rs(4) }}>
          <GradientButton
            title={downloading ? 'Generating PDF...' : 'Download PDF'}
            onPress={handleDownloadPdf}
            loading={downloading}
            gradient={GRADIENTS.blue}
            icon={<Ionicons name="download-outline" size={18} color={COLORS.white} />}
          />
        </Animated.View>

        {/* Practice Quiz */}
        <Animated.View style={{ opacity: anims[actionsIndex].opacity, transform: [{ translateY: anims[actionsIndex].translateY }], marginBottom: rs(4) }}>
          <GradientButton
            title="Practice Quiz"
            onPress={handlePracticeQuiz}
            gradient={GRADIENTS.purple}
            icon={<Ionicons name="school-outline" size={18} color={COLORS.white} />}
          />
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, { opacity: anims[actionsIndex].opacity, transform: [{ translateY: anims[actionsIndex].translateY }] }]}>
          {!saved ? (
            <GradientButton
              title="Save to History"
              onPress={handleSave}
              icon={<Ionicons name="bookmark" size={18} color={COLORS.white} />}
              style={styles.actionBtn}
            />
          ) : (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
              <Text style={styles.savedText}>Saved!</Text>
            </View>
          )}
          <GradientButton
            title="Scan Another"
            onPress={handleScanAnother}
            gradient={GRADIENTS.accent}
            icon={<Ionicons name="camera" size={18} color={COLORS.white} />}
            style={styles.actionBtn}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
