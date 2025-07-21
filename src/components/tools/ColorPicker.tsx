/* eslint-disable prefer-const */
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Palette, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ColorPickerProps {
  onBack: () => void;
}

interface ExtractedColor {
  hex: string;
  rgb: string;
  hsl: string;
  count: number;
}

const ColorPicker = ({ onBack }: ColorPickerProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<ExtractedColor | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير",
        description: "يرجى اختيار صورة أصغر من 10 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      extractColors(result);
    };
    reader.readAsDataURL(file);
  };

  const extractColors = (imageSrc: string) => {
    setIsProcessing(true);
    const img = new Image();
    
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (!canvas || !ctx) return;

      // تغيير حجم الصورة لتحسين الأداء
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // استخراج الألوان
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        
        // تجاهل الألوان الشفافة
        if (a < 128) continue;
        
        // تقريب الألوان لتقليل التنوع
        const roundedR = Math.round(r / 10) * 10;
        const roundedG = Math.round(g / 10) * 10;
        const roundedB = Math.round(b / 10) * 10;
        
        const key = `${roundedR},${roundedG},${roundedB}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
      
      // ترتيب الألوان حسب التكرار
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20) // أخذ أكثر 20 لون
        .map(([color, count]) => {
          const [r, g, b] = color.split(',').map(Number);
          return {
            hex: rgbToHex(r, g, b),
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: rgbToHsl(r, g, b),
            count
          };
        });
      
      setExtractedColors(sortedColors);
      setIsProcessing(false);
      
      toast({
        title: "تم استخراج الألوان",
        description: `تم العثور على ${sortedColors.length} لون`
      });
    };
    
    img.src = imageSrc;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const copyToClipboard = (color: ExtractedColor, format: 'hex' | 'rgb' | 'hsl') => {
    const value = color[format];
    navigator.clipboard.writeText(value);
    toast({
      title: "تم النسخ",
      description: `تم نسخ ${value} للحافظة`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        onClick={onBack}
        variant="ghost" 
        className="mb-6 hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        العودة للأدوات
      </Button>

      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Palette className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">منتقي الألوان</CardTitle>
          <CardDescription>
            استخراج وتحليل الألوان من الصور
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!image ? (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">اختر صورة لاستخراج الألوان</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG, GIF حتى 10MB</p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                  اختيار الصورة
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <img 
                  src={image} 
                  alt="الصورة المحملة" 
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-medium"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  تغيير الصورة
                </Button>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>جاري استخراج الألوان...</p>
            </div>
          )}

          {extractedColors.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">الألوان المستخرجة</h3>
              
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                {extractedColors.map((color, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => setSelectedColor(color)}
                  >
                    <div
                      className="w-full h-16 rounded-lg shadow-soft border border-border/50 hover:scale-105 transition-smooth"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-xs text-center mt-1 font-mono">
                      {color.hex.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>

              {selectedColor && (
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div
                        className="w-24 h-24 rounded-lg shadow-medium border border-border/50"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      <div className="flex-1 space-y-3">
                        <h4 className="text-lg font-semibold">معلومات اللون</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">HEX</div>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                                {selectedColor.hex.toUpperCase()}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedColor, 'hex')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">RGB</div>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                                {selectedColor.rgb}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedColor, 'rgb')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">HSL</div>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm bg-muted px-2 py-1 rounded flex-1">
                                {selectedColor.hsl}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(selectedColor, 'hsl')}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          تكرار اللون: {selectedColor.count} بكسل
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorPicker;