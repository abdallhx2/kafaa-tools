/* eslint-disable prefer-const */
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, RefreshCw, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ColorGenerator = () => {
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const { toast } = useToast();

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

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

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c/2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const generateComplementaryPalette = () => {
    const [h, s, l] = hexToHsl(baseColor);
    const colors = [
      baseColor,
      hslToHex((h + 180) % 360, s, l), // مكمل
      hslToHex((h + 30) % 360, s, l),  // تناظر
      hslToHex((h - 30 + 360) % 360, s, l), // تناظر
      hslToHex(h, Math.max(s - 20, 0), Math.min(l + 20, 100)), // أفتح
    ];
    return colors;
  };

  const generateAnalogousPalette = () => {
    const [h, s, l] = hexToHsl(baseColor);
    const colors = [
      hslToHex((h - 60 + 360) % 360, s, l),
      hslToHex((h - 30 + 360) % 360, s, l),
      baseColor,
      hslToHex((h + 30) % 360, s, l),
      hslToHex((h + 60) % 360, s, l),
    ];
    return colors;
  };

  const generateMonochromaticPalette = () => {
    const [h, s, l] = hexToHsl(baseColor);
    const colors = [
      hslToHex(h, s, Math.max(l - 40, 0)),
      hslToHex(h, s, Math.max(l - 20, 0)),
      baseColor,
      hslToHex(h, s, Math.min(l + 20, 100)),
      hslToHex(h, s, Math.min(l + 40, 100)),
    ];
    return colors;
  };

  const generateRandomPalette = () => {
    const colors = [];
    for (let i = 0; i < 5; i++) {
      colors.push(generateRandomColor());
    }
    return colors;
  };

  const generatePalette = (type: string) => {
    let colors: string[] = [];
    
    switch (type) {
      case 'complementary':
        colors = generateComplementaryPalette();
        break;
      case 'analogous':
        colors = generateAnalogousPalette();
        break;
      case 'monochromatic':
        colors = generateMonochromaticPalette();
        break;
      case 'random':
        colors = generateRandomPalette();
        break;
    }
    
    setColorPalette(colors);
    toast({
      title: "تم إنشاء لوحة الألوان!",
      description: "لوحة ألوان جديدة جاهزة للاستخدام",
    });
  };

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      toast({
        title: "تم نسخ اللون",
        description: `تم نسخ ${color} إلى الحافظة`,
      });
    } catch (error) {
      toast({
        title: "فشل في النسخ",
        description: "لم يتم نسخ اللون",
        variant: "destructive",
      });
    }
  };

  const copyPalette = async () => {
    if (colorPalette.length > 0) {
      try {
        await navigator.clipboard.writeText(colorPalette.join(', '));
        toast({
          title: "تم نسخ اللوحة",
          description: "تم نسخ جميع الألوان إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "فشل في النسخ",
          description: "لم يتم نسخ اللوحة",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Palette className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">مولد الألوان</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">إنشاء لوحات ألوان متناسقة ومتناغمة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">اللون الأساسي:</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button 
                onClick={() => generatePalette('complementary')} 
                variant="outline" 
                size="sm"
              >
                مكملة
              </Button>
              <Button 
                onClick={() => generatePalette('analogous')} 
                variant="outline" 
                size="sm"
              >
                متجاورة
              </Button>
              <Button 
                onClick={() => generatePalette('monochromatic')} 
                variant="outline" 
                size="sm"
              >
                أحادية
              </Button>
              <Button 
                onClick={() => generatePalette('random')} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                عشوائية
              </Button>
            </div>
          </div>

          {colorPalette.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">لوحة الألوان:</h4>
                <Button onClick={copyPalette} variant="outline" size="sm">
                  <Copy className="mr-1 h-3 w-3" />
                  نسخ الكل
                </Button>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg border-2 border-border cursor-pointer hover:scale-105 transition-transform group relative"
                    style={{ backgroundColor: color }}
                    onClick={() => copyColor(color)}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Copy className="text-white opacity-0 group-hover:opacity-100 h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-5 gap-2 text-xs text-center">
                {colorPalette.map((color, index) => (
                  <div key={index} className="font-mono">
                    {color.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>أنواع اللوحات:</strong></p>
            <p>• <strong>مكملة:</strong> ألوان متقابلة على عجلة الألوان</p>
            <p>• <strong>متجاورة:</strong> ألوان متجاورة على عجلة الألوان</p>
            <p>• <strong>أحادية:</strong> درجات مختلفة من نفس اللون</p>
            <p>• <strong>عشوائية:</strong> ألوان عشوائية متنوعة</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorGenerator;