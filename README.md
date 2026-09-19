This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## استخراج ترجمات يوتيوب

ميزة كاملة داخل الموقع على المسار `/youtube/captions`: تلصق رابط فيديو يوتيوب
فتحصل على نصّه كاملًا مع التوقيتات، مع إمكانية تبديل مسار الترجمة، أو طلب ترجمة
آلية إلى لغة أخرى، أو تنزيل الملف بصيغة SRT / VTT / JSON.

بنية الميزة:

| الملف | الدور |
| --- | --- |
| `lib/youtubeCaptions.mjs` | النواة المشتركة: قراءة مسارات الترجمة من مشغّل يوتيوب وتحويلها إلى صيغ |
| `app/api/youtube/captions/route.ts` | واجهة `GET /api/youtube/captions` مع حدّ للطلبات |
| `app/youtube/captions/` | الصفحة وواجهة المستخدم |
| `scripts/youtube-captions.mjs` | نفس الميزة من سطر الأوامر |

لا تحتاج الميزة مفتاح API ولا أي اعتماديات إضافية — تقرأ مسارات الترجمة من حمولة
المشغّل نفسه، وتعمل فقط مع الفيديوهات التي لها ترجمات منشورة أو تلقائية.

### واجهة البرمجة

```
GET /api/youtube/captions?url=<رابط أو معرّف>
    &lang=ar              لغة الترجمة المفضّلة (any لأول مسار متاح)
    &auto=prefer|skip     تفضيل الترجمة التلقائية أو تجاهلها
    &translate=en         ترجمة آلية من يوتيوب
    &list=1               إرجاع قائمة المسارات فقط
    &format=txt|srt|vtt   إرجاع ملف نصّي بدل JSON (مع download=1 كمرفق)
```

### من سطر الأوامر

```bash
# النص الكامل
npm run captions -- https://youtu.be/VIDEO_ID

# المسارات المتاحة
npm run captions -- VIDEO_ID --list

# ملف ترجمة عربي
npm run captions -- https://youtu.be/VIDEO_ID -l ar -f srt -o captions.srt

# ترجمة آلية إلى الإنجليزية مع توقيتات [mm:ss]
npm run captions -- VIDEO_ID --translate en --timestamps
```

| الخيار | المعنى |
| --- | --- |
| `-l, --lang <code>` | لغة الترجمة المفضّلة (`en` افتراضيًا، و`any` لأول مسار) |
| `-f, --format <fmt>` | `txt` أو `srt` أو `vtt` أو `json` (`txt` افتراضيًا) |
| `-o, --out <file>` | الكتابة إلى ملف بدل الطرفية |
| `--translate <code>` | ترجمة آلية عبر يوتيوب |
| `--list` | عرض المسارات المتاحة فقط |
| `--auto` / `--no-auto` | تفضيل الترجمة التلقائية أو تجاهلها |
| `--timestamps` | إضافة `[mm:ss]` قبل كل سطر في صيغة `txt` |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
