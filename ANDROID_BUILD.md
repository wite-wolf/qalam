# بناء نسخة Android APK

## المتطلبات
1. Node.js (مثبت مسبقاً)
2. Java JDK 17+
3. Android Studio + Android SDK

## الخطوات

### 1. تثبيت Java JDK
- حمّل من: https://adoptium.net/
- شغل المثبت وتأكد من إضافة Java إلى PATH
- تحقق: `java -version`

### 2. تثبيت Android Studio
- حمّل من: https://developer.android.com/studio
- شغل المثبت
- افتح Android Studio → More Actions → SDK Manager
- تأكد من تثبيت:
  - Android SDK Platform 34
  - Android SDK Build-Tools 34

### 3. إعداد متغيرات البيئة
```bash
# أضف هذه المسارات إلى PATH (غيّر المسار حسب جهازك)
ANDROID_HOME = C:\Users\USERNAME\AppData\Local\Android\Sdk
# أضف إلى PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\cmdline-tools\latest\bin
```

### 4. بناء التطبيق
```bash
# 1. نسخ ملفات الويب إلى www
npm run build:www

# 2. مزامنة مع Android
npx cap sync android

# 3. فتح Android Studio (مرة واحدة)
npx cap open android

# 4. من Android Studio:
#    - Build → Build Bundle(s) / APK(s) → Build APK(s)
#    - أو: Build → Generate Signed Bundle / APK
```

### 5. APK النهائي
بعد البناء، ستجد الـ APK في:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

انسخه إلى:
```
downloads\qalam-android.apk
```
