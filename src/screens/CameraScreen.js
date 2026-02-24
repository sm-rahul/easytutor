import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AIContext } from '../contexts/AIContext';
import LoadingOverlay from '../components/LoadingOverlay';
import { COLORS, GRADIENTS } from '../constants/theme';
import { common, camera as styles } from '../styles/styles';

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const [flashMode, setFlashMode] = useState(Camera.Constants?.FlashMode?.off ?? 'off');
  const cameraRef = useRef(null);
  const { setImage, processImage, loading } = useContext(AIContext);

  // Corner animation (scanning pulse)
  const scanPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanPulse, { toValue: 1.05, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanPulse, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Check if permission was already granted
        const current = await Camera.getCameraPermissionsAsync().catch(() => null);
        if (current?.status === 'granted') {
          setHasPermission(true);
          return;
        }
        // Request permission
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (err) {
        console.warn('Camera permission error:', err);
        setHasPermission(false);
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setPhotoUri(result.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const usePhoto = async () => {
    if (photoUri) {
      setImage(photoUri);
      const analysisResult = await processImage(photoUri);
      if (analysisResult) {
        navigation.navigate('Summary');
      } else {
        if (Platform.OS === 'web') {
          window.alert('We could not analyze this image. Please try again with a clearer photo.');
        } else {
          Alert.alert(
            'Oops!',
            'We could not analyze this image. Please try again with a clearer photo.',
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  const retake = () => setPhotoUri(null);

  const toggleFlash = () => {
    setFlashMode((prev) =>
      prev === Camera.Constants?.FlashMode?.off
        ? Camera.Constants?.FlashMode?.on
        : Camera.Constants?.FlashMode?.off
    );
  };

  if (loading) return <LoadingOverlay />;

  if (hasPermission === null) {
    return (
      <View style={common.center}>
        <Text style={styles.permissionText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={common.center}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          Please allow camera access in your phone settings to scan text
        </Text>
      </View>
    );
  }

  // Photo preview mode
  if (photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="contain" />
        <View style={styles.previewControls}>
          <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
            <Ionicons name="refresh" size={20} color={COLORS.textSecondary} />
            <Text style={styles.retakeBtnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.usePhotoBtn} onPress={usePhoto}>
            <LinearGradient colors={GRADIENTS.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.usePhotoBtnGradient}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <Text style={styles.usePhotoBtnText}>Use This Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Camera mode
  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants?.Type?.back ?? 'back'} flashMode={flashMode}>
        {/* Top bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity onPress={toggleFlash} style={styles.topBtn}>
            <Ionicons
              name={flashMode === Camera.Constants?.FlashMode?.on ? 'flash' : 'flash-off'}
              size={22}
              color={COLORS.accent}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Instruction */}
        <View style={styles.instructionContainer}>
          <View style={styles.instructionBadge}>
            <Text style={styles.instructionText}>Point at any text</Text>
          </View>
        </View>

        {/* Scan frame */}
        <View style={styles.frameOverlay}>
          <Animated.View style={[styles.frame, { transform: [{ scale: scanPulse }] }]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </Animated.View>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={pickImage} style={styles.sideBtn}>
            <Ionicons name="images" size={26} color={COLORS.textSecondary} />
            <Text style={styles.sideBtnText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
            <View style={styles.captureBtnInner} />
          </TouchableOpacity>

          <View style={styles.sideBtn}>
            <Ionicons name="scan" size={26} color="transparent" />
          </View>
        </View>
      </Camera>
    </View>
  );
}
