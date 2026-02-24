import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { apiAnalyzeImage } from './api';

// Convert image URI to base64 string (platform-aware)
async function imageToBase64(uri) {
  if (Platform.OS === 'web') {
    // Web: fetch the blob and use FileReader
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // result is "data:image/...;base64,XXXX" — extract just the base64 part
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // Native: use expo-file-system
    return FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

export async function analyzeImage(imageUri, userId) {
  try {
    const base64 = await imageToBase64(imageUri);
    const response = await apiAnalyzeImage(base64, userId);

    if (!response.success) {
      throw new Error(response.error || 'Analysis failed');
    }

    return response.result;
  } catch (error) {
    console.error('Image analysis error:', error);
    // Return a fallback so the app doesn't crash
    return {
      type: 'text',
      extractedText: 'Could not read the image. Please try again with a clearer photo.',
      summary: 'We had trouble reading this image. Try taking a photo with better lighting and make sure the text is clearly visible.',
      visualExplanation: 'Make sure the text in the photo is big and clear, like reading a book up close!',
      realWorldExamples: [
        'Try holding your phone steady, like taking a photo of your pet',
        'Make sure there is good light, like reading near a window',
      ],
      keyWords: ['try again', 'clear photo'],
    };
  }
}
