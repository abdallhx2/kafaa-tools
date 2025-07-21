export interface ToolMetadata {
  title: string;
  description: string;
  keywords: string;
}

export const toolsMetadata: Record<string, ToolMetadata> = {
  'ocr': {
    title: 'OCR قارئ النصوص من الصور - استخراج النصوص بدقة عالية مجاناً | أدوات كفاءة',
    description: 'استخراج النصوص من الصور والمستندات بدقة عالية باستخدام تقنية OCR المتقدمة مجاناً. أداة مجانية لتحويل الصور إلى نصوص قابلة للتحرير اونلاين.',
    keywords: 'OCR, OCR online, text extraction, استخراج النصوص, تحويل الصور إلى نصوص, قارئ النصوص, image to text, تحويل المستندات, OCR عربي, free OCR tool'
  },
  'pdf-editor': {
    title: 'PDF Editor محرر PDF المتقدم - تحرير وتعديل ملفات PDF مجاناً | أدوات كفاءة',
    description: 'محرر PDF متقدم لتحرير وتعديل ملفات PDF بإضافة النصوص والتعليقات والتوقيعات مجاناً اونلاين. أداة مجانية وسهلة الاستخدام.',
    keywords: 'PDF editor, PDF محرر, edit PDF online, تحرير PDF, تعديل PDF, إضافة نصوص PDF, توقيع PDF, free PDF editor, محرر PDF مجاني, PDF تحرير اونلاين'
  },
  'pdf-converter': {
    title: 'Images to PDF Converter محول الصور إلى PDF - تحويل الصور لملف PDF مجاناً | أدوات كفاءة',
    description: 'تحويل الصور إلى ملف PDF واحد بسهولة مجاناً اونلاين. دعم جميع تنسيقات الصور مع إمكانية ترتيب وتنسيق الصفحات.',
    keywords: 'images to PDF, PDF converter, تحويل الصور إلى PDF, صور PDF, محول PDF, دمج الصور, JPG to PDF, PNG to PDF, convert images to PDF online, مجاني'
  },
  'pdf-to-images': {
    title: 'PDF to Images Converter تحويل PDF إلى صور - استخراج صفحات PDF مجاناً | أدوات كفاءة',
    description: 'تحويل صفحات PDF إلى صور منفصلة بجودة عالية مجاناً اونلاين. دعم تنسيقات PNG, JPG, WEBP مع إمكانية اختيار الصفحات.',
    keywords: 'PDF to images, PDF to PNG, PDF to JPG, تحويل PDF إلى صور, تحويل PDF, استخراج صفحات PDF, convert PDF to images online, free PDF converter'
  },
  'word-to-pdf': {
    title: 'Word to PDF Converter تحويل Word إلى PDF - محول مستندات Word مجاناً | أدوات كفاءة',
    description: 'تحويل مستندات Word إلى PDF مع الحفاظ على التنسيق والخطوط مجاناً اونلاين. أداة سريعة ومجانية لتحويل DOC و DOCX.',
    keywords: 'Word to PDF, DOCX to PDF, DOC to PDF, تحويل Word إلى PDF, تحويل Word, محول Word, convert Word to PDF online, free Word converter'
  },
  'powerpoint-to-pdf': {
    title: 'تحويل PowerPoint إلى PDF - محول العروض التقديمية | أدوات كفاءة',
    description: 'تحويل العروض التقديمية PowerPoint إلى PDF بجودة عالية. محافظة على التصميم والرسوم المتحركة.',
    keywords: 'PowerPoint إلى PDF, تحويل PPT, محول عروض تقديمية, PPT to PDF'
  },
  'excel-to-pdf': {
    title: 'تحويل Excel إلى PDF - محول جداول البيانات مجاناً | أدوات كفاءة',
    description: 'تحويل جداول البيانات Excel إلى PDF مع الحفاظ على التنسيق والجداول. دعم XLS و XLSX.',
    keywords: 'Excel إلى PDF, تحويل Excel, محول جداول البيانات, XLS to PDF'
  },
  'pdf-to-word': {
    title: 'تحويل PDF إلى Word - محول PDF للتحرير مجاناً | أدوات كفاءة',
    description: 'تحويل ملفات PDF إلى مستندات Word قابلة للتحرير مع الحفاظ على التنسيق والنصوص والصور.',
    keywords: 'PDF إلى Word, تحويل PDF, محول PDF قابل للتحرير, PDF to DOC'
  },
  'pdf-splitter': {
    title: 'تقسيم PDF - فصل صفحات PDF بسهولة مجاناً | أدوات كفاءة',
    description: 'استخراج صفحات محددة من ملفات PDF وتقسيمها إلى ملفات منفصلة. أداة سريعة ومجانية.',
    keywords: 'تقسيم PDF, فصل صفحات PDF, استخراج صفحات, PDF splitter'
  },
  'pdf-compressor': {
    title: 'ضغط PDF - تقليل حجم ملفات PDF مجاناً | أدوات كفاءة',
    description: 'تقليل حجم ملفات PDF مع الحفاظ على الجودة. ضغط متقدم للملفات الكبيرة بسرعة عالية.',
    keywords: 'ضغط PDF, تقليل حجم PDF, PDF compressor, ضغط الملفات'
  },
  'image-compressor': {
    title: 'Image Compressor ضغط الصور - تقليل حجم الصور مع الحفاظ على الجودة مجاناً | أدوات كفاءة',
    description: 'ضغط الصور وتقليل حجمها مع الحفاظ على الجودة مجاناً اونلاين. دعم JPG, PNG, WEBP مع إعدادات متقدمة.',
    keywords: 'image compressor, compress images, ضغط الصور, تقليل حجم الصور, JPG compressor, PNG compressor, optimize images online, reduce image size, مجاني'
  },
  'background-remover': {
    title: 'AI Background Remover إزالة خلفية الصور بالذكاء الاصطناعي مجاناً | أدوات كفاءة',
    description: 'إزالة خلفية الصور تلقائياً باستخدام الذكاء الاصطناعي مجاناً اونلاين. نتائج احترافية بدقة عالية وبدون برامج.',
    keywords: 'background remover, remove background, AI background remover, إزالة خلفية الصور, الذكاء الاصطناعي, تفريغ الصور, remove bg, transparent background, مجاني'
  },
  'qr-generator': {
    title: 'QR Code Generator منشئ أكواد QR - إنشاء QR Code مجاناً اونلاين | أدوات كفاءة',
    description: 'إنشاء أكواد QR للنصوص والروابط ومعلومات الاتصال مجاناً اونلاين. أداة سهلة ومجانية مع خيارات تخصيص متقدمة.',
    keywords: 'QR code generator, QR generator, منشئ QR, إنشاء أكواد QR, باركود QR, create QR code online, free QR generator, QR code maker'
  },
  'qr-reader': {
    title: 'QR Code Reader قارئ أكواد QR - فك تشفير QR Code مجاناً | أدوات كفاءة',
    description: 'قراءة وفك تشفير أكواد QR من الصور بسرعة ودقة عالية مجاناً اونلاين. دعم جميع أنواع أكواد QR والباركود.',
    keywords: 'QR code reader, QR scanner, قارئ QR, فك تشفير QR, قراءة أكواد QR, scan QR code online, QR decoder, free QR reader'
  },
  'password-generator': {
    title: 'Password Generator مولد كلمات المرور القوية - إنشاء باسوورد آمن مجاناً | أدوات كفاءة',
    description: 'إنشاء كلمات مرور قوية وآمنة بخيارات متقدمة مجاناً اونلاين. تحكم كامل في الطول والأحرف لضمان الأمان.',
    keywords: 'password generator, strong password generator, مولد كلمات المرور, كلمات مرور قوية, باسوورد آمن, generate password online, secure password, random password'
  },
  'unit-converter': {
    title: 'Unit Converter محول الوحدات الشامل - تحويل بين جميع وحدات القياس مجاناً | أدوات كفاءة',
    description: 'تحويل بين وحدات القياس المختلفة مجاناً اونلاين: الطول، الوزن، الحرارة، المساحة، الحجم، والمزيد.',
    keywords: 'unit converter, measurement converter, محول الوحدات, تحويل وحدات القياس, length converter, weight converter, temperature converter, convert units online'
  },
  'color-generator': {
    title: 'مولد الألوان - إنشاء لوحات ألوان متناسقة | أدوات كفاءة',
    description: 'إنشاء لوحات ألوان متناسقة للتصاميم مع خيارات متقدمة للتدرجات والتناسق اللوني.',
    keywords: 'مولد الألوان, color generator, لوحة الألوان, ألوان متناسقة'
  },
  'currency-converter': {
    title: 'Currency Converter محول العملات - تحويل العملات بأسعار محدثة مجاناً | أدوات كفاءة',
    description: 'تحويل العملات بأسعار الصرف المحدثة لحظياً مجاناً اونلاين. دعم جميع العملات العالمية مع رسوم بيانية.',
    keywords: 'currency converter, exchange rates, محول العملات, تحويل العملات, أسعار الصرف, USD to EUR, currency exchange, live rates, money converter'
  },
  'age-calculator': {
    title: 'Age Calculator حاسبة العمر الشاملة - حساب العمر بدقة مع إحصائيات مجاناً | أدوات كفاءة',
    description: 'حساب العمر بدقة مع إحصائيات تفصيلية مجاناً اونلاين: السنوات، الشهور، الأيام، الساعات، والثواني.',
    keywords: 'age calculator, calculate age, حاسبة العمر, حساب العمر, عمر بالأيام, age in days, birth date calculator, how old am I, عمري كم'
  },
  'date-converter': {
    title: 'محول التاريخ - تحويل بين الميلادي والهجري | أدوات كفاءة',
    description: 'تحويل التواريخ بين التقويم الميلادي والهجري مع حسابات دقيقة وإحصائيات تفصيلية.',
    keywords: 'محول التاريخ, date converter, تحويل ميلادي هجري, التقويم الهجري'
  },
  'distance-calculator': {
    title: 'حاسبة المسافات - قياس المسافة بين المدن | أدوات كفاءة',
    description: 'قياس المسافة بين المدن والإحداثيات الجغرافية بدقة عالية مع معلومات الطريق.',
    keywords: 'حاسبة المسافات, distance calculator, قياس المسافة, مسافة بين المدن'
  },
  'color-picker': {
    title: 'منتقي الألوان - استخراج الألوان من الصور | أدوات كفاءة',
    description: 'استخراج وتحليل الألوان من الصور مع أكواد الألوان بتنسيقات مختلفة: HEX, RGB, HSL.',
    keywords: 'منتقي الألوان, color picker, استخراج الألوان, HEX color'
  },
  'word-counter': {
    title: 'Word Counter عداد الكلمات والأحرف - إحصائيات النصوص الشاملة مجاناً | أدوات كفاءة',
    description: 'إحصائيات تفصيلية للنصوص مجاناً اونلاين: عدد الكلمات، الأحرف، الفقرات، وأوقات القراءة مع تحليل متقدم.',
    keywords: 'word counter, character counter, عداد الكلمات, عدد الأحرف, إحصائيات النصوص, text statistics, count words online, reading time calculator'
  },
  'bmi-calculator': {
    title: 'BMI Calculator حاسبة مؤشر كتلة الجسم - حساب الوزن المثالي مجاناً | أدوات كفاءة',
    description: 'حساب مؤشر كتلة الجسم BMI والوزن المثالي مع توصيات صحية مفصلة وجداول مرجعية مجاناً اونلاين.',
    keywords: 'BMI calculator, body mass index, حاسبة BMI, مؤشر كتلة الجسم, الوزن المثالي, حاسبة الوزن, ideal weight calculator, health calculator'
  },
  'grade-calculator': {
    title: 'حاسبة الدرجات والمعدل - حساب المعدل التراكمي | أدوات كفاءة',
    description: 'حساب المعدل التراكمي والفصلي للطلاب مع دعم أنظمة التقييم المختلفة وإحصائيات تفصيلية.',
    keywords: 'حاسبة الدرجات, المعدل التراكمي, grade calculator, حساب المعدل'
  },
  'link-health-checker': {
    title: 'فاحص صحة الروابط - اختبار المواقع والروابط | أدوات كفاءة',
    description: 'فحص صحة المواقع والروابط وقياس سرعة الاستجابة مع معلومات تفصيلية عن حالة الخادم.',
    keywords: 'فاحص الروابط, link checker, اختبار المواقع, فحص URL'
  },
  'encoding-converter': {
    title: 'محول الترميز والتشفير - Base64, URL encoding | أدوات كفاءة',
    description: 'تحويل النصوص بين تنسيقات الترميز المختلفة: Base64، URL encoding، HTML encoding، والمزيد.',
    keywords: 'محول الترميز, encoding converter, Base64, URL encoding'
  },
  'advanced-url-shortener': {
    title: 'تقصير الروابط المتقدم - اختصار الروابط الطويلة | أدوات كفاءة',
    description: 'تقصير الروابط الطويلة مع ميزات متقدمة: إحصائيات، روابط مخصصة، وتتبع النقرات.',
    keywords: 'تقصير الروابط, URL shortener, اختصار الروابط, روابط قصيرة'
  },
  'font-generator': {
    title: 'مولد ومعاين الخطوط - تجربة الخطوط المختلفة | أدوات كفاءة',
    description: 'معاينة وتجربة الخطوط المختلفة مع تخصيص كامل للحجم واللون والنمط.',
    keywords: 'مولد الخطوط, font generator, معاين الخطوط, خطوط مختلفة'
  },
  'json-editor': {
    title: 'JSON Editor محرر JSON - تنسيق وتحرير ملفات JSON مجاناً اونلاين | أدوات كفاءة',
    description: 'تنسيق وتحليل وتحرير ملفات JSON مع التحقق من الصحة وإبراز الأخطاء مجاناً اونلاين.',
    keywords: 'JSON editor, JSON formatter, JSON validator, محرر JSON, تنسيق JSON, تحليل JSON, format JSON online, validate JSON, JSON viewer'
  },
  'speed-test': {
    title: 'Internet Speed Test قياس سرعة الإنترنت - اختبار سرعة النت مجاناً | أدوات كفاءة',
    description: 'اختبار شامل لسرعة الإنترنت مع قياس سرعة التحميل والرفع والاستجابة (ping) مجاناً اونلاين.',
    keywords: 'internet speed test, speed test, speedtest, قياس سرعة الإنترنت, اختبار سرعة النت, bandwidth test, connection speed, download speed, upload speed'
  },
  'ilovepdf-api': {
    title: 'معالج PDF الاحترافي - أدوات PDF متقدمة | أدوات كفاءة',
    description: 'منصة شاملة لمعالجة PDF والصور باستخدام تقنيات احترافية متقدمة وميزات شاملة.',
    keywords: 'معالج PDF, PDF tools, أدوات PDF احترافية, iLovePDF'
  }
};

export const defaultMetadata: ToolMetadata = {
  title: 'أدوات كفاءة Free Online Tools - مجموعة شاملة من الأدوات المجانية للإنتاجية',
  description: 'مجموعة شاملة من الأدوات المجانية للإنتاجية اونلاين: PDF tools, تحويل PDF، ضغط الصور، إزالة الخلفيات، QR codes، حاسبات متنوعة والمزيد. جميع الأدوات مجانية 100%.',
  keywords: 'free online tools, PDF tools, أدوات مجانية, أدوات الإنتاجية, تحويل الملفات, ضغط الصور, QR code generator, background remover, online converter, مجاني, اونلاين'
};
