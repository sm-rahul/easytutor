import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AIContext } from '../contexts/AIContext';
import GradientButton from '../components/GradientButton';
import { COLORS, GRADIENTS, SPACING, rs, ms } from '../constants/theme';
import { downloadPdf } from '../utils/downloadPdf';
import { common, header as headerStyles, summary as summaryStyles, detail as styles, solution as solutionStyles } from '../styles/styles';

// Badge config for each content type
const TYPE_CONFIG = {
  math: { icon: 'calculator', label: 'Math Problem', color: COLORS.cyan, badgeStyle: 'typeBadgeMath', solutionStyle: 'solutionCard', stepGradient: GRADIENTS.blue },
  aptitude: { icon: 'bulb', label: 'Aptitude Problem', color: COLORS.gold, badgeStyle: 'typeBadgeAptitude', solutionStyle: 'solutionCardAptitude', stepGradient: ['#F59E0B', '#FBBF24'] },
  text: { icon: 'document-text', label: 'Text Content', color: COLORS.accent, badgeStyle: 'typeBadgeText' },
};

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;
  const { removeHistoryItem, simplifyResult, logReadingTime } = useContext(AIContext);
  const [simplifying, setSimplifying] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentResult, setCurrentResult] = useState(item.result || {});
  const readingStartTime = useRef(Date.now());

  // Track reading time when leaving screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      const seconds = Math.round((Date.now() - readingStartTime.current) / 1000);
      if (seconds >= 3) logReadingTime(seconds);
    });
    return unsubscribe;
  }, [navigation, logReadingTime]);

  const { summary, visualExplanation, realWorldExamples, keyWords, type, solutionSteps, finalAnswer } = currentResult;
  const isSolvable = type === 'math' || type === 'aptitude';
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.text;

  const date = new Date(item.createdAt);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Staggered card animations (8 slots for math steps + answer)
  const anims = useRef([...Array(8)].map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(30),
  }))).current;

  useEffect(() => {
    const animations = anims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 400, delay: i * 100, useNativeDriver: true }),
        Animated.timing(a.translateY, { toValue: 0, duration: 450, delay: i * 100, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ])
    );
    Animated.stagger(60, animations).start();
  }, []);

  const handleSimplify = async () => {
    setSimplifying(true);
    const result = await simplifyResult(currentResult);
    if (result) {
      setCurrentResult(result);
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
    await downloadPdf(currentResult);
    setDownloading(false);
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this lesson?')) {
        removeHistoryItem(item.id).then(() => navigation.goBack());
      }
    } else {
      Alert.alert('Delete Lesson', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeHistoryItem(item.id);
            navigation.goBack();
          },
        },
      ]);
    }
  };

  // Dynamic card indices based on content type
  let nextIndex = 1; // 0 is image
  const summaryIndex = nextIndex++;
  const visualIndex = nextIndex++;
  const stepsIndex = isSolvable ? nextIndex++ : null;
  const answerIndex = isSolvable ? nextIndex++ : null;
  const examplesIndex = !isSolvable ? nextIndex++ : null;
  const keyWordsIndex = nextIndex++;
  const actionsIndex = nextIndex++;

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
      <LinearGradient colors={GRADIENTS.hero} style={headerStyles.container}>
        <Ionicons name={cfg.icon} size={rs(32)} color={cfg.color} style={{ marginBottom: rs(6) }} />
        <Text style={headerStyles.title}>Saved Lesson</Text>
        <Text style={headerStyles.subtitle}>{dateStr}</Text>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={common.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image */}
        {item.imageUri && (
          <Animated.View style={{ opacity: anims[0].opacity, transform: [{ translateY: anims[0].translateY }] }}>
            <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
          </Animated.View>
        )}

        {/* Type badge */}
        <Animated.View style={{ opacity: anims[0].opacity }}>
          <View style={[
            solutionStyles.typeBadge,
            solutionStyles[cfg.badgeStyle],
          ]}>
            <Ionicons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[solutionStyles.typeBadgeLabel, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </Animated.View>

        {/* Summary */}
        {summary && (
          <AnimCard index={summaryIndex} style={summaryStyles.summaryCard}>
            <View style={common.cardTitleRow}>
              <Ionicons name="book" size={20} color={COLORS.accent} />
              <Text style={common.cardTitle}>Simple Summary</Text>
            </View>
            <FormattedText text={summary} style={summaryStyles.summaryText} />
          </AnimCard>
        )}

        {/* Visual Explanation */}
        {visualExplanation && (
          <AnimCard index={visualIndex} style={summaryStyles.visualCard}>
            <View style={common.cardTitleRow}>
              <Ionicons name="color-palette" size={20} color={COLORS.accentPink} />
              <Text style={common.cardTitle}>Visual Explanation</Text>
            </View>
            <FormattedText text={visualExplanation} style={summaryStyles.bodyText} />
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
              <View key={index} style={summaryStyles.exampleRow}>
                <LinearGradient colors={GRADIENTS.accent} style={summaryStyles.exampleBullet}>
                  <Text style={summaryStyles.exampleNumber}>{index + 1}</Text>
                </LinearGradient>
                <Text style={summaryStyles.exampleText}>{example}</Text>
              </View>
            ))}
          </AnimCard>
        )}

        {/* Key Words */}
        {keyWords && keyWords.length > 0 && (
          <AnimCard index={keyWordsIndex}>
            <View style={common.cardTitleRow}>
              <Ionicons name="key" size={20} color={COLORS.accent} />
              <Text style={common.cardTitle}>Key Words</Text>
            </View>
            <View style={summaryStyles.keyWordsContainer}>
              {keyWords.map((word, i) => (
                <View key={i} style={summaryStyles.keyWordChip}>
                  <Text style={summaryStyles.keyWordText}>{word}</Text>
                </View>
              ))}
            </View>
          </AnimCard>
        )}

        {/* Make it Easier */}
        {!simplified && (
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
        )}

        {simplified && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(8), paddingVertical: rs(8) }}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={{ fontSize: ms(13), color: COLORS.success, fontWeight: '600' }}>Simplified!</Text>
          </View>
        )}

        {/* Download PDF */}
        <View style={{ marginBottom: rs(4) }}>
          <GradientButton
            title={downloading ? 'Generating PDF...' : 'Download PDF'}
            onPress={handleDownloadPdf}
            loading={downloading}
            gradient={GRADIENTS.blue}
            icon={<Ionicons name="download-outline" size={18} color={COLORS.white} />}
          />
        </View>

        {/* Actions */}
        <View style={summaryStyles.actions}>
          <GradientButton
            title="Scan Another"
            onPress={() => navigation.navigate('CameraTab')}
            icon={<Ionicons name="camera" size={18} color={COLORS.white} />}
            style={summaryStyles.actionBtn}
          />
          <GradientButton
            title="Delete Lesson"
            onPress={handleDelete}
            gradient={GRADIENTS.danger}
            icon={<Ionicons name="trash" size={18} color={COLORS.white} />}
            style={summaryStyles.actionBtn}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}
