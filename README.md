# MANARATAK

نسخة المشروع المرفقة، مرتبة ومرفوعة إلى:
https://github.com/wegdangamil2022-oss/MANARATAK22

## هيكل الملفات

- `apps/web/`: الواجهة العامة الحالية وصورها.
- `apps/admin/`: لوحة الإدارة.
- `apps/api/`: ملفات الواجهة الخلفية الموجودة في النسخة المرفقة.
- `apps/frontend-security/`: إعدادات أمان تطبيقات الواجهة.
- `packages/`: الحزم المشتركة.
- `config/testing/`: إعدادات الاختبارات وفحص الأنواع، مجمعة من الجذر.
- `config/`: بقية إعدادات المشروع.
- `docs/`: الوثائق، ومنها دليل الطالب في `docs/guides/`.
- `vendor/`: الاعتماد المحلي المرفق.
- `workspace/archive/ai-studio/`: ملفات جلسات AI Studio الأصلية محفوظة للأرشفة.
- `workspace/archive/design-reference-assets/`: الصور المرجعية للتصميم المحذوف، محفوظة خارج أصول التطبيق.

حُذفت صفحة «قسم التصميمات والواجهات» الإضافية وزر فتحها فقط. لم يتغير تصميم الواجهة الرئيسية، أو صور المنح، أو بياناتها، أو طريقة تشغيل المشروع.

## التشغيل كما في النسخة الأصلية

```sh
npm install
npm run dev
```

```sh
npm run build
npm run dev:admin
```

إعدادات الاختبارات المنقولة تُستدعى من جذر المشروع، مثل:

```sh
npx vitest run --config config/testing/home-catalog-vitest.config.ts
```

احتُفظ بملف `bun.lock` الأصلي. النسخة المرفقة لا تحتوي على `package-lock.json`، لذلك لم يُستخدم `npm ci` في التحقق المحلي. قد تشير بعض الوثائق والاختبارات التاريخية إلى ملفات غير موجودة أصلًا في الملف المضغوط؛ لم تُضف وظائف بديلة لها ضمن مهمة الترتيب.

انظر `docs/maintenance/ORGANIZATION_REPORT.md` لنتيجة التحقق و`docs/maintenance/file-mapping.json` لخريطة الملفات. الملف التعريفي الأصلي محفوظ دون تعديل في `docs/archive/README.original.md`.
