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

    if (!base64 || base64.length < 100) {
      throw new Error('Could not read the image file. Please try taking a new photo.');
    }

    const response = await apiAnalyzeImage(base64, userId);

    if (!response.success) {
      throw new Error(response.error || 'Analysis failed');
    }

    return response.result;
  } catch (error) {
    console.error('Image analysis error:', error);
    const errorMsg = error.message || 'Unknown error';

    // Return a result with the actual error so the user knows what went wrong
    return {
      type: 'text',
      extractedText: '',
      summary: `Something went wrong: ${errorMsg}\n\nPlease check your internet connection and try again. If the problem continues, the AI service may be temporarily unavailable.`,
      visualExplanation: 'Make sure the text in the photo is big and clear, like reading a book up close!',
      realWorldExamples: [
        'Try holding your phone steady, like taking a photo of your pet',
        'Make sure there is good light, like reading near a window',
      ],
      keyWords: ['try again'],
    };
  }
}
