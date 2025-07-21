// Structured data (Schema.org) for better SEO
import { ToolMetadata } from './seo-metadata';

export const createStructuredData = (toolId: string, metadata: ToolMetadata) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": metadata.title.split(' | ')[0],
    "description": metadata.description,
    "url": `${baseUrl}/${toolId}`,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "أدوات كفاءة",
      "url": baseUrl
    },
    "featureList": getFeatureList(toolId),
    "screenshot": `${baseUrl}/screenshots/${toolId}.jpg`,
    "keywords": metadata.keywords
  };
};

const getFeatureList = (toolId: string): string[] => {
  const features: Record<string, string[]> = {
    'ocr': ['Text extraction from images', 'Multi-language support', 'High accuracy OCR'],
    'pdf-editor': ['Edit PDF documents', 'Add text and annotations', 'Digital signatures'],
    'background-remover': ['AI-powered background removal', 'Transparent background', 'High quality results'],
    'qr-generator': ['Generate QR codes', 'Customizable design', 'Multiple data types'],
    'password-generator': ['Strong password generation', 'Customizable criteria', 'Security focused'],
    'image-compressor': ['Reduce image size', 'Maintain quality', 'Multiple formats support'],
    'speed-test': ['Internet speed testing', 'Download/Upload measurement', 'Ping testing']
  };
  
  return features[toolId] || ['Free online tool', 'Easy to use', 'No registration required'];
};

// Common Arabic search terms for better local SEO
export const arabicSearchTerms = [
  'مجاني', 'اونلاين', 'بدون تسجيل', 'سريع', 'آمن', 'عربي',
  'تحويل', 'تعديل', 'تحرير', 'ضغط', 'إنشاء', 'قراءة',
  'أداة', 'برنامج', 'موقع', 'خدمة', 'تطبيق'
];

// Trending English keywords for international SEO
export const trendingKeywords = [
  'free', 'online', 'no signup', 'fast', 'secure', 'instant',
  'converter', 'editor', 'generator', 'compressor', 'tool',
  'web app', 'browser based', '2024', '2025'
];
