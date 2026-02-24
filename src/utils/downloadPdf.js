import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { generatePdfHtml } from './generatePdfHtml';

export async function downloadPdf(result) {
  try {
    const html = generatePdfHtml(result);

    if (Platform.OS === 'web') {
      // Open full-page window so nothing gets clipped
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
      } else {
        // Popup blocked — fall back to expo-print
        await Print.printAsync({ html });
      }
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Your Lesson',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Sharing not available', 'Your device does not support sharing files.');
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    if (Platform.OS === 'web') {
      window.alert('Could not generate PDF. Please try again.');
    } else {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    }
  }
}
