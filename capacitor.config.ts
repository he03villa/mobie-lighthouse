import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lighthouse.education',
  appName: 'Lighthouse',
  webDir: 'www',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1d4d8f',
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#1d4d8f',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      // Descomentar después de convertir splash.svg a splash.png:
      imageUrl: 'assets/icon/splash.png',
      width: 1024,
      height: 1024,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
    },
  },
};

export default config;
