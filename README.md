# EasyTutor

EasyTutor is an AI-powered learning app designed for children. Kids can take a photo of any text, and the app will summarize it, provide visual explanations, and deliver easy-to-understand explanations with real-world examples. Parents are empowered to guide their children's learning at home, even if they lack extensive formal education.

## Architecture Overview
- **React Native + Expo** for cross-platform mobile development.
- **React Navigation** handles screen navigation.
- **AIContext** stores the image and handles AI API communication.
- **CameraScreen** uses `expo-camera`/`expo-image-picker` for capturing or selecting text images.
- **SummaryScreen** displays the summary and additional material returned from the AI.

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run start
   ```
3. Use Expo Go on your phone or an emulator to run the app.

## Future Work
- Integrate with a real AI backend (API details to be provided).
- Enhance `SummaryScreen` with visuals and examples returned by the AI.
- Add user authentication, history, and parent dashboards.
- Improve accessibility and localization for young readers.

## Folder Structure
```
/ (project root)
  App.js
  package.json
  README.md
  /src
    /components
      CameraScreen.js
      SummaryScreen.js
    /contexts
      AIContext.js
```
