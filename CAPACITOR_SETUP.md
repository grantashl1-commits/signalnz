# Capacitor Setup — Signal NZ

## 1. Install packages (run once in terminal)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/push-notifications
```

## 2. Add Android platform (run once)

```bash
npx cap add android
```

## 3. Sync web assets to Android

Run this every time you build or want to push changes to Android Studio:

```bash
npm run build && npx cap sync android
```

## 4. Open in Android Studio

```bash
npx cap open android
```

Then in Android Studio: Build → Generate Signed Bundle/APK → Android App Bundle (.aab for Play Store)

---

## PWABuilder (fast track to Play Store)

Before the Capacitor build is ready, you can submit to Play Store via PWABuilder:
1. Go to https://www.pwabuilder.com
2. Enter: https://signal.mindcast.co.nz
3. Download the Android package
4. Upload the .aab to Play Console

---

## App IDs and identifiers

- App ID: `nz.co.mindcast.signal`
- App name: `Signal NZ`
- Live URL: `https://signal.mindcast.co.nz`

---

## Notes

- `capacitor.config.ts` is set to serve from the live URL during development
  (so you see live changes without rebuilding). For production APK, comment out
  the `server.url` block and run `npm run build && npx cap sync` first.
- Status bar and splash are set to brand purple (`#1a0a2e`)
- Push notifications plugin is included — wire up FCM keys in Firebase Console
  and add `google-services.json` to `android/app/` when ready
