# OPEN WORLD 3D — Android APK-ready starter

এটি HTML + CSS + JavaScript + Three.js দিয়ে তৈরি একটি playable 3D open-world prototype।
Android APK বানানোর জন্য Capacitor project structure দেওয়া আছে।

## এই build-এ যা আছে
- বড় island-style map, চারপাশে ocean
- City buildings, village houses, forest, mountain, beach, river, bridge
- Third-person player movement, jump
- Touch joystick, right-side drag camera control
- Simple drivable car (গাড়ির কাছে গেলে ENTER CAR)
- Wandering NPC figures
- চারটি exploration marker / simple mission loop
- Vite production build এবং Capacitor Android setup

## প্রয়োজন
- Node.js LTS
- Android Studio
- Android SDK
- প্রথম install/build-এর সময় internet

## কম্পিউটারে চালানো
1. ZIP extract করো।
2. Project folder-এ terminal খোলো।
3. চালাও:

```bash
npm install
npm run dev
```

Vite যে local URL দেখাবে, browser-এ খুলবে।

## Android APK বানানো
Android Studio-সহ computer ব্যবহার করাই সবচেয়ে সহজ।

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio খুললে:
1. Gradle sync শেষ হওয়া পর্যন্ত অপেক্ষা করো।
2. Build > Build Bundle(s) / APK(s) > Build APK(s) নির্বাচন করো।
3. Build শেষ হলে APK path Android Studio দেখাবে।

পরের বার code পরিবর্তন করলে:

```bash
npm run build
npx cap sync android
```

তারপর Android Studio থেকে আবার Build APK করো।

## গুরুত্বপূর্ণ
- এই ZIP হলো প্রথম playable prototype, GTA-ধরনের সম্পূর্ণ production game নয়।
- Map বর্তমানে একটি বড় fixed island; infinite procedural world/chunk streaming এখনো যোগ করা হয়নি।
- গাড়ি, NPC ও mission হলো basic prototype implementation।
- Player এখনো building/trees-এর সঙ্গে full collision করে না।
- Graphics ও object count কম রাখা হয়েছে যাতে mid-range Android-এ পরীক্ষা করা যায়।
- Three.js npm package দিয়ে bundle হয়, তাই APK-তে game assets bundle হবে; runtime CDN dependency নেই।
- Android APK build করার জন্য Android Studio/SDK দরকার। শুধু ZIP-এ ক্লিক করে APK তৈরি হবে না।
