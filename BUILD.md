# بناء التطبيق

## Windows (.exe)
```bash
npm run pack:win
```
النتيجة: `dist\قلم-win32-x64\قلم.exe`

## Android (.apk)
اتبع التعليمات في `ANDROID_BUILD.md`:
```bash
npm run build:www
npx cap sync android
# ثم افتح android/ في Android Studio وابني APK
```

## Web (PWA)
التطبيق متاح مباشرة عبر:
```
https://qalam-app.pages.dev/app.html
```

## النشر على Cloudflare Pages
1. ارفع مجلد المشروع إلى GitHub
2. اربطه بـ Cloudflare Pages
3. إعدادات البناء:
   - Build command: (فارغ)
   - Build output directory: `.`
