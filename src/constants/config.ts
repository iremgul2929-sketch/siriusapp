export const config = {
  recognitionWindowSize: 30,
  confidenceThreshold: 0.85,
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
};
