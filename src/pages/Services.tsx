import { useState } from 'react';

// Import layout components
import Layout from '@/components/layout/Layout';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/layout/HomePage';

// Import icons
import { 
  FileText, 
  FileImage, 
  Scan, 
  ImageIcon, 
  Eraser, 
  QrCode, 
  Key, 
  Palette, 
  DollarSign, 
  Scissors, 
  Camera,
  Ruler,
  Shuffle,
  Calendar,
  Clock,
  MapPin,
  Activity,
  GraduationCap,
  Link,
  Shield,
  Shrink,
  Type,
  FileCode,
  Gauge,

} from 'lucide-react';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  popular?: boolean;
}

const Services = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const allTools: ToolCard[] = [
    // أدوات المستندات والملفات
    { id: 'ocr', title: 'قارئ النصوص من الصور', description: 'استخراج النصوص من الصور والمستندات بدقة عالية', icon: Scan, category: 'documents', popular: true },
    
    // أدوات التحويل إلى PDF
    // { id: 'word-to-pdf', title: 'Word إلى PDF', description: 'تحويل مستندات Word إلى PDF مع الحفاظ على التنسيق', icon: FileText, category: 'documents' },
    // { id: 'powerpoint-to-pdf', title: 'PowerPoint إلى PDF', description: 'تحويل العروض التقديمية إلى PDF', icon: Presentation, category: 'documents' },
    // { id: 'excel-to-pdf', title: 'Excel إلى PDF', description: 'تحويل جداول البيانات إلى PDF', icon: FileSpreadsheet, category: 'documents' },
    // { id: 'pdf-converter', title: 'محول الصور إلى PDF', description: 'تحويل الصور إلى PDF', icon: FileImage, category: 'documents' },
    // { id: 'html-to-pdf', title: 'HTML إلى PDF', description: 'تحويل صفحات الويب وملفات HTML إلى PDF', icon: Globe, category: 'documents' },
    
    // // أدوات التحويل من PDF
    // { id: 'pdf-to-word', title: 'PDF إلى Word', description: 'تحويل PDF إلى مستند Word قابل للتحرير', icon: FileText, category: 'documents', popular: true },
    // { id: 'pdf-to-excel', title: 'PDF إلى Excel', description: 'تحويل جداول PDF إلى ملف Excel', icon: FileSpreadsheet, category: 'documents' },
    // { id: 'pdf-to-powerpoint', title: 'PDF إلى PowerPoint', description: 'تحويل PDF إلى عرض تقديمي', icon: Presentation, category: 'documents' },
    // { id: 'pdf-to-png', title: 'PDF إلى PNG', description: 'تحويل صفحات PDF إلى صور PNG', icon: Image, category: 'documents' },
    // { id: 'pdf-to-html', title: 'PDF إلى HTML', description: 'تحويل PDF إلى صفحة ويب HTML', icon: Globe, category: 'documents' },
    // { id: 'pdf-to-text', title: 'PDF إلى نص', description: 'استخراج النص من ملف PDF', icon: Type, category: 'documents' },
    
    // أدوات معالجة PDF
    // { id: 'pdf-splitter', title: 'تقسيم PDF', description: 'استخراج صفحات محددة من ملفات PDF', icon: Scissors, category: 'documents' },
    // { id: 'pdf-compressor', title: 'ضغط PDF', description: 'تقليل حجم ملف PDF مع الحفاظ على الجودة', icon: Minimize2, category: 'documents' },
    // { id: 'pdf-merger', title: 'دمج PDF', description: 'دمج عدة ملفات PDF في ملف واحد', icon: Link, category: 'documents', popular: true },
    // { id: 'pdf-rotator', title: 'دوران صفحات PDF', description: 'دوران صفحات PDF بزوايا مختلفة', icon: RotateCw, category: 'documents' },
    // { id: 'pdf-protector', title: 'حماية PDF', description: 'إضافة كلمة مرور وصلاحيات أمان لملف PDF', icon: Lock, category: 'documents' },
    // { id: 'pdf-unlocker', title: 'فك قفل PDF', description: 'إزالة كلمة المرور من ملف PDF محمي', icon: Unlock, category: 'documents' },
    // { id: 'pdf-watermark', title: 'إضافة علامة مائية', description: 'إضافة علامة مائية نصية إلى ملف PDF', icon: Droplets, category: 'documents' },

    // أدوات الصور والتصميم
    { id: 'image-compressor', title: 'ضغط الصور', description: 'تقليل حجم الصور مع الحفاظ على الجودة', icon: ImageIcon, category: 'images' },
    { id: 'background-remover', title: 'إزالة خلفية الصور', description: 'إزالة الخلفية من الصور تلقائياً بالذكاء الاصطناعي', icon: Eraser, category: 'images', popular: true },
    { id: 'color-picker', title: 'منتقي الألوان', description: 'استخراج وتحليل الألوان من الصور', icon: Palette, category: 'images' },
    { id: 'color-generator', title: 'مولد الألوان', description: 'إنشاء لوحات ألوان متناسقة للتصاميم', icon: Shuffle, category: 'images' },

    // الحاسبات والأدوات الرياضية
    { id: 'age-calculator', title: 'حاسبة العمر الشاملة', description: 'حساب العمر بدقة مع إحصائيات تفصيلية', icon: Calendar, category: 'calculators' },
    { id: 'date-converter', title: 'محول التاريخ الشامل', description: 'تحويل التواريخ بين التقويم الميلادي والهجري', icon: Clock, category: 'calculators' },
    { id: 'distance-calculator', title: 'حاسبة المسافات', description: 'قياس المسافة بين المدن والإحداثيات', icon: MapPin, category: 'calculators' },
    { id: 'bmi-calculator', title: 'حاسبة مؤشر كتلة الجسم', description: 'حساب BMI والوزن المثالي مع توصيات صحية', icon: Activity, category: 'calculators' },
    { id: 'grade-calculator', title: 'حاسبة الدرجات والمعدل', description: 'حساب المعدل التراكمي والفصلي للطلاب', icon: GraduationCap, category: 'calculators' },

    // الأدوات العامة والمساعدة
    { id: 'qr-generator', title: 'منشئ أكواد QR', description: 'تحويل النصوص والروابط إلى أكواد QR', icon: QrCode, category: 'utilities', popular: true },
    { id: 'qr-reader', title: 'قارئ أكواد QR', description: 'قراءة وفك تشفير أكواد QR من الصور', icon: Camera, category: 'utilities', popular: true  },
    { id: 'password-generator', title: 'مولد كلمات المرور', description: 'إنشاء كلمات مرور قوية وآمنة', icon: Key, category: 'utilities' },
    { id: 'unit-converter', title: 'محول الوحدات', description: 'تحويل بين وحدات القياس المختلفة', icon: Ruler, category: 'utilities' },
    { id: 'currency-converter', title: 'محول العملات', description: 'تحويل العملات بأسعار الصرف المحدثة', icon: DollarSign, category: 'utilities' },
    { id: 'word-counter', title: 'عداد الكلمات والأحرف', description: 'إحصائيات تفصيلية للنصوص مع أوقات القراءة', icon: FileText, category: 'utilities' },
    { id: 'link-health-checker', title: 'فاحص صحة الروابط', description: 'التحقق من حالة المواقع والروابط وقياس سرعة الاستجابة', icon: Link, category: 'utilities', popular: true  },
    { id: 'encoding-converter', title: 'محول الترميز والتشفير', description: 'تحويل النصوص بين Base64، URL encoding وتنسيقات أخرى', icon: Shield, category: 'utilities' },
    { id: 'advanced-url-shortener', title: 'تقصير الروابط', description: 'تقصير الروابط وضمان عملها', icon: Shrink, category: 'utilities', popular: true },
    { id: 'font-generator', title: 'مولد ومعاين الخطوط', description: 'معاينة وتجربة الخطوط المختلفة مع تخصيص كامل', icon: Type, category: 'utilities' },
    { id: 'json-editor', title: 'محرر ومنسق JSON', description: 'تنسيق وتحليل وتحرير ملفات JSON مع التحقق من الصحة', icon: FileCode, category: 'utilities' },
    { id: 'speed-test', title: 'قياس سرعة الإنترنت', description: 'اختبار شامل لسرعة الإنترنت مع قياس التحميل والرفع والاستجابة', icon: Gauge, category: 'utilities', popular: true },
  ];

  const categories = {
    documents: { title: 'أدوات المستندات والملفات', color: 'bg-blue-500' },
    images: { title: 'أدوات الصور والتصميم', color: 'bg-purple-500' },
    calculators: { title: 'الحاسبات والأدوات الرياضية', color: 'bg-green-500' },
    utilities: { title: 'الأدوات العامة والمساعدة', color: 'bg-orange-500' }
  };

  // Filter tools based on search query
  const filteredTools = allTools.filter(tool => 
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get featured tools (popular tools)
  const featuredTools = allTools.filter(tool => tool.popular);

  return (
    <Layout>
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        featuredTools={featuredTools}
      />
      <HomePage 
        searchQuery={searchQuery}
        filteredTools={filteredTools}
        allTools={allTools}
        categories={categories}
      />
      <Footer />
    </Layout>
  );
};

export default Services;
