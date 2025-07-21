# دليل المساهمة - Contributing Guide

مرحباً بك في مشروع **أدوات كفاءة**! نحن نرحب بجميع المساهمات من المطورين والمصممين والمستخدمين.

## 🤝 كيفية المساهمة

### 1. الإبلاغ عن الأخطاء (Bug Reports)

إذا وجدت خطأ في التطبيق:

1. تأكد أن الخطأ لم يتم الإبلاغ عنه مسبقاً في [Issues](https://github.com/abdallhx2/kafaa-tools/issues)
2. إنشاء Issue جديد مع العنوان الواضح
3. تضمين تفاصيل كافية:
   - وصف الخطأ
   - خطوات إعادة الإنتاج
   - المتصفح ونظام التشغيل
   - لقطات شاشة إن أمكن

### 2. اقتراح ميزات جديدة (Feature Requests)

لاقتراح ميزة جديدة:

1. تحقق من القائمة الحالية للميزات المطلوبة
2. إنشاء Issue جديد مع label "enhancement"
3. وضح بالتفصيل:
   - وصف الميزة المطلوبة
   - لماذا ستكون مفيدة
   - كيف يجب أن تعمل

### 3. إضافة أداة جديدة

لإضافة أداة جديدة:

#### المتطلبات:
- معرفة بـ React و TypeScript
- فهم لـ Tailwind CSS
- خبرة مع مكونات Shadcn/ui

#### خطوات الإضافة:

1. **Fork المشروع**
   ```bash
   git clone https://github.com/yourusername/kafaa-tools.git
   cd kafaa-tools
   npm install
   ```

2. **إنشاء branch جديد**
   ```bash
   git checkout -b feature/new-tool-name
   ```

3. **إنشاء مكون الأداة**
   - إنشاء ملف جديد في `src/components/tools/`
   - استخدام التسمية: `NewToolName.tsx`
   - اتباع البنية الموجودة في الأدوات الأخرى

4. **إضافة الأداة للقائمة**
   - تحديث ملف `src/pages/Services.tsx`
   - إضافة الأداة لمصفوفة `allTools`

5. **إضافة بيانات SEO**
   - تحديث `src/utils/seo-metadata.ts`
   - إضافة metadata للأداة الجديدة

6. **إضافة Route**
   - تحديث التطبيق الرئيسي لإضافة المسار

7. **الاختبار**
   ```bash
   npm run dev
   ```

### 4. تحسين أداة موجودة

لتحسين أداة موجودة:

1. Fork المشروع
2. إنشاء branch للتحسين
3. إجراء التحسينات المطلوبة
4. اختبار التحسينات
5. إنشاء Pull Request

## 📝 إرشادات الكود

### البنية العامة للأدوات:

```tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NewTool = () => {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const handleProcess = () => {
    // منطق الأداة هنا
    try {
      // المعالجة
      setResult(processedResult);
      toast({
        title: "تم بنجاح",
        description: "تم تنفيذ العملية بنجاح"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء المعالجة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>عنوان الأداة</CardTitle>
          <CardDescription>وصف الأداة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* محتوى الأداة */}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTool;
```

### معايير الكود:

1. **استخدام TypeScript** لجميع الملفات
2. **اتباع ESLint rules** الموجودة
3. **استخدام Tailwind CSS** للتنسيق
4. **دعم RTL** للعربية
5. **إضافة Toast notifications** للتفاعل
6. **معالجة الأخطاء** بشكل مناسب
7. **استخدام React Hooks** الحديثة

### التسمية:
- **المكونات**: PascalCase (`NewTool.tsx`)
- **المتغيرات**: camelCase (`inputValue`)
- **الثوابت**: UPPER_SNAKE_CASE (`API_ENDPOINT`)

## 🎨 إرشادات التصميم

### الألوان:
- اتباع نظام الألوان الموجود في `tailwind.config.ts`
- استخدام CSS variables للألوان

### المكونات:
- استخدام مكونات Shadcn/ui الموجودة
- اتباع نمط التصميم الموحد
- دعم الوضع الليلي (قريباً)

### الاستجابة:
- تصميم متجاوب للجوال أولاً
- اختبار على أحجام شاشات مختلفة

## 🔍 معايير القبول

قبل إنشاء Pull Request، تأكد من:

- [ ] الكود يعمل بدون أخطاء
- [ ] اتباع إرشادات الكود
- [ ] إضافة التعليقات المناسبة
- [ ] اختبار الأداة في متصفحات مختلفة
- [ ] التأكد من دعم الأجهزة المحمولة
- [ ] إضافة بيانات SEO مناسبة

## 📚 الموارد المفيدة

### التقنيات المستخدمة:
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)

### مكتبات الأدوات:
- [PDF-lib](https://pdf-lib.js.org/) - معالجة PDF
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR
- [QRCode.js](https://davidshimjs.github.io/qrcodejs/) - أكواد QR
- [Date-fns](https://date-fns.org/) - معالجة التواريخ

## 🤝 Process للـ Pull Requests

1. **Fork المشروع**
2. **إنشاء branch للميزة**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **إجراء التغييرات**
4. **Commit التغييرات**
   ```bash
   git commit -m 'feat: Add amazing feature'
   ```
5. **Push للـ branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **فتح Pull Request**

### عنوان PR:
استخدم التنسيق التالي:
- `feat: إضافة أداة جديدة`
- `fix: إصلاح خطأ في الأداة`
- `docs: تحديث الوثائق`
- `style: تحسين التصميم`

### وصف PR:
```markdown
## التغييرات المُجراة
- إضافة أداة جديدة لـ...
- إصلاح خطأ في...
- تحسين أداء...

## نوع التغيير
- [ ] إصلاح خطأ
- [ ] ميزة جديدة
- [ ] تحسين أداء
- [ ] تحديث وثائق

## الاختبار
- [ ] تم اختبار الكود محلياً
- [ ] تم اختبار الاستجابة
- [ ] تم اختبار المتصفحات المختلفة

## لقطات الشاشة (إن وجدت)
```

## 📞 التواصل

إذا كان لديك أسئلة:

- إنشاء [GitHub Issue](https://github.com/abdallhx2/kafaa-tools/issues)
- التواصل عبر البريد الإلكتروني: `support@kafaa-tools.com`

## 🏆 المساهمون

شكراً لجميع المساهمين الذين يجعلون هذا المشروع أفضل! 

---

**شكراً لك على مساهمتك في جعل أدوات كفاءة أفضل للجميع! 🙏**
