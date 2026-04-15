import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.signalnz',
  appName: 'Signal',
  webDir: 'dist',
  server: {
    url: 'https://9c072836-f23c-44b6-b233-7c8a036b1620.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#F5F0EC',
  },
  android: {
    backgroundColor: '#F5F0EC',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#F5F0EC',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
=======
  appId: 'nz.co.mindcast.signal',
  appName: 'Signal NZ',
  webDir: 'dist',
  // During development: serve from live URL so you don't need to rebuild on every change
  // Comment this out for production builds
  server: {
    url: 'https://signal.mindcast.co.nz',
    cleartext: false,
  },
  android: {
    backgroundColor: '#1a0a2e', // Match your brand purple splash
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1a0a2e',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1a0a2e',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
>>>>>>> Stashed changes
  },
};

export default config;
