import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Type, Download, Copy, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FontStyle {
  name: string;
  fontFamily: string;
  category: string;
  variants: string[];
}

const FontGenerator = () => {
  const [previewText, setPreviewText] = useState('اكتب نصك هنا لمعاينة الخط');
  const [selectedFont, setSelectedFont] = useState('');
  const [fontSize, setFontSize] = useState([24]);
  const [fontWeight, setFontWeight] = useState('400');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [lineHeight, setLineHeight] = useState([1.5]);
  const [letterSpacing, setLetterSpacing] = useState([0]);
  
  const { toast } = useToast();

  const googleFonts: FontStyle[] = [
    { name: 'Noto Sans Arabic', fontFamily: 'Noto Sans Arabic', category: 'عربي', variants: ['400', '500', '600', '700'] },
    { name: 'Cairo', fontFamily: 'Cairo', category: 'عربي', variants: ['300', '400', '500', '600', '700', '800', '900'] },
    { name: 'Amiri', fontFamily: 'Amiri', category: 'عربي', variants: ['400', '700'] },
    { name: 'Tajawal', fontFamily: 'Tajawal', category: 'عربي', variants: ['200', '300', '400', '500', '700', '800', '900'] },
    { name: 'Almarai', fontFamily: 'Almarai', category: 'عربي', variants: ['300', '400', '700', '800'] },
    { name: 'Roboto', fontFamily: 'Roboto', category: 'إنجليزي', variants: ['100', '300', '400', '500', '700', '900'] },
    { name: 'Open Sans', fontFamily: 'Open Sans', category: 'إنجليزي', variants: ['300', '400', '500', '600', '700', '800'] },
    { name: 'Poppins', fontFamily: 'Poppins', category: 'إنجليزي', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
    { name: 'Montserrat', fontFamily: 'Montserrat', category: 'إنجليزي', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
    { name: 'Lato', fontFamily: 'Lato', category: 'إنجليزي', variants: ['100', '300', '400', '700', '900'] }
  ];

  const currentFont = googleFonts.find(font => font.fontFamily === selectedFont);

  const loadGoogleFont = (fontFamily: string) => {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
    link.rel = 'stylesheet';
    
    // Remove existing font link if any
    const existingLink = document.querySelector(`link[href*="${fontFamily.replace(/\s+/g, '+')}"]`);
    if (existingLink) {
      existingLink.remove();
    }
    
    document.head.appendChild(link);
  };

  const handleFontChange = (fontFamily: string) => {
    setSelectedFont(fontFamily);
    loadGoogleFont(fontFamily);
  };

  const getPreviewStyle = () => ({
    fontFamily: selectedFont || 'inherit',
    fontSize: `${fontSize[0]}px`,
    fontWeight: fontWeight,
    color: textColor,
    backgroundColor: backgroundColor,
    lineHeight: lineHeight[0],
    letterSpacing: `${letterSpacing[0]}px`,
    padding: '20px',
    borderRadius: '8px',
    minHeight: '120px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  });

  const copyCSS = () => {
    const cssText = `
font-family: '${selectedFont}';
font-size: ${fontSize[0]}px;
font-weight: ${fontWeight};
color: ${textColor};
background-color: ${backgroundColor};
line-height: ${lineHeight[0]};
letter-spacing: ${letterSpacing[0]}px;
    `.trim();
    
    navigator.clipboard.writeText(cssText);
    toast({
      title: "تم النسخ",
      description: "تم نسخ كود CSS إلى الحافظة"
    });
  };

  const downloadPreview = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${fontSize[0]}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text
    const lines = previewText.split('\n');
    const lineHeightPx = fontSize[0] * lineHeight[0];
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeightPx) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + (index * lineHeightPx));
    });

    // Download
    const link = document.createElement('a');
    link.download = `font-preview-${selectedFont?.replace(/\s+/g, '-') || 'preview'}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "تم التحميل",
      description: "تم تحميل معاينة الخط كصورة"
    });
  };

  const categories = [...new Set(googleFonts.map(font => font.category))];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text">مولد ومعاين الخطوط</h1>
        <p className="text-muted-foreground text-lg">
          اختبر وتخصص الخطوط مع معاينة مباشرة وتصدير كصورة أو CSS
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Font Selection */}
          <Card className="glass shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                اختيار الخط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">عائلة الخط</label>
                <Select value={selectedFont} onValueChange={handleFontChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر خطاً" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {googleFonts
                          .filter(font => font.category === category)
                          .map(font => (
                            <SelectItem key={font.fontFamily} value={font.fontFamily}>
                              <span style={{ fontFamily: font.fontFamily }}>
                                {font.name}
                              </span>
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentFont && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">سُمك الخط</label>
                  <Select value={fontWeight} onValueChange={setFontWeight}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentFont.variants.map(weight => (
                        <SelectItem key={weight} value={weight}>
                          {weight === '100' ? 'رفيع جداً' :
                           weight === '200' ? 'رفيع' :
                           weight === '300' ? 'خفيف' :
                           weight === '400' ? 'عادي' :
                           weight === '500' ? 'متوسط' :
                           weight === '600' ? 'شبه عريض' :
                           weight === '700' ? 'عريض' :
                           weight === '800' ? 'عريض جداً' :
                           weight === '900' ? 'أعرض' : weight}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Typography Settings */}
          <Card className="glass shadow-soft">
            <CardHeader>
              <CardTitle>إعدادات النص</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">حجم الخط: {fontSize[0]}px</label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={72}
                  min={8}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ارتفاع السطر: {lineHeight[0]}</label>
                <Slider
                  value={lineHeight}
                  onValueChange={setLineHeight}
                  max={3}
                  min={1}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تباعد الأحرف: {letterSpacing[0]}px</label>
                <Slider
                  value={letterSpacing}
                  onValueChange={setLetterSpacing}
                  max={10}
                  min={-2}
                  step={0.5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="glass shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                الألوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">لون النص</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">لون الخلفية</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-8 border rounded cursor-pointer"
                  />
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Input */}
          <Card className="glass shadow-soft">
            <CardHeader>
              <CardTitle>نص المعاينة</CardTitle>
              <CardDescription>
                أدخل النص الذي تريد معاينته بالخط المختار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                className="w-full h-24 p-3 border rounded-lg resize-none text-right"
                placeholder="اكتب النص هنا..."
              />
            </CardContent>
          </Card>

          {/* Preview Display */}
          <Card className="glass shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>المعاينة</CardTitle>
                {selectedFont && (
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{selectedFont}</Badge>
                    <Badge variant="outline">{fontSize[0]}px</Badge>
                    <Badge variant="outline">{fontWeight}</Badge>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyCSS}>
                  <Copy className="h-4 w-4 ml-2" />
                  نسخ CSS
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPreview}>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                style={getPreviewStyle()}
                className="whitespace-pre-wrap"
              >
                {previewText}
              </div>
            </CardContent>
          </Card>

          {/* Font Information */}
          {currentFont && (
            <Card className="glass shadow-soft">
              <CardHeader>
                <CardTitle>معلومات الخط</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">اسم الخط:</p>
                    <p className="text-muted-foreground">{currentFont.name}</p>
                  </div>
                  <div>
                    <p className="font-medium">الفئة:</p>
                    <p className="text-muted-foreground">{currentFont.category}</p>
                  </div>
                  <div>
                    <p className="font-medium">الأوزان المتاحة:</p>
                    <p className="text-muted-foreground">{currentFont.variants.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium">مصدر الخط:</p>
                    <p className="text-muted-foreground">Google Fonts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontGenerator;