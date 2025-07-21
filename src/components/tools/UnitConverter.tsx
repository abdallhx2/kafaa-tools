/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const UnitConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [outputValue, setOutputValue] = useState('');
  const [conversionType, setConversionType] = useState('px-rem');
  const [fromUnit, setFromUnit] = useState('px');
  const [toUnit, setToUnit] = useState('rem');
  const { toast } = useToast();

  const conversions = {
    'px-rem': {
      name: 'بكسل إلى REM',
      from: 'px',
      to: 'rem',
      convert: (value: number): string => (value / 16).toString(),
      reverse: (value: number): string => (value * 16).toString()
    },
    'hex-rgb': {
      name: 'HEX إلى RGB',
      from: 'hex',
      to: 'rgb',
      convert: (value: string): string => {
        const hex = value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
    },
    'rgb-hex': {
      name: 'RGB إلى HEX',
      from: 'rgb',
      to: 'hex',
      convert: (value: string): string => {
        const rgb = value.match(/\d+/g);
        if (!rgb || rgb.length < 3) return '';
        const hex = rgb.slice(0, 3).map(x => {
          const hex = parseInt(x).toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
        return `#${hex}`;
      }
    },
    'em-px': {
      name: 'EM إلى بكسل',
      from: 'em',
      to: 'px',
      convert: (value: number): string => (value * 16).toString(),
      reverse: (value: number): string => (value / 16).toString()
    }
  };

  const handleConvert = () => {
    if (!inputValue.trim()) return;

    try {
      const conversion = conversions[conversionType as keyof typeof conversions];
      let result = '';

      if (conversionType === 'hex-rgb') {
        if (!/^#?[0-9A-Fa-f]{6}$/.test(inputValue)) {
          throw new Error('صيغة HEX غير صحيحة');
        }
        result = (conversion as any).convert(inputValue);
      } else if (conversionType === 'rgb-hex') {
        if (!/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/.test(inputValue)) {
          throw new Error('صيغة RGB غير صحيحة');
        }
        result = (conversion as any).convert(inputValue);
      } else {
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
          throw new Error('يرجى إدخال رقم صحيح');
        }
        result = (conversion as any).convert(numValue);
      }

      setOutputValue(result);
      toast({
        title: "تم التحويل بنجاح!",
        description: `تم تحويل ${inputValue} إلى ${result}`,
      });
    } catch (error) {
      toast({
        title: "خطأ في التحويل",
        description: error instanceof Error ? error.message : "تحقق من صيغة الإدخال",
        variant: "destructive",
      });
    }
  };

  const copyResult = async () => {
    if (outputValue) {
      try {
        await navigator.clipboard.writeText(outputValue);
        toast({
          title: "تم النسخ",
          description: "تم نسخ النتيجة إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "فشل في النسخ",
          description: "لم يتم نسخ النتيجة",
          variant: "destructive",
        });
      }
    }
  };

  const swapUnits = () => {
    if (conversionType === 'px-rem') {
      setConversionType('em-px');
      setFromUnit('em');
      setToUnit('px');
    } else if (conversionType === 'em-px') {
      setConversionType('px-rem');
      setFromUnit('px');
      setToUnit('rem');
    } else if (conversionType === 'hex-rgb') {
      setConversionType('rgb-hex');
      setFromUnit('rgb');
      setToUnit('hex');
    } else if (conversionType === 'rgb-hex') {
      setConversionType('hex-rgb');
      setFromUnit('hex');
      setToUnit('rgb');
    }
    
    setInputValue(outputValue);
    setOutputValue('');
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <ArrowLeftRight className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">محول الوحدات</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">تحويل وحدات القياس المختلفة للمطورين</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">نوع التحويل:</label>
            <Select value={conversionType} onValueChange={setConversionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="px-rem">بكسل إلى REM</SelectItem>
                <SelectItem value="em-px">EM إلى بكسل</SelectItem>
                <SelectItem value="hex-rgb">HEX إلى RGB</SelectItem>
                <SelectItem value="rgb-hex">RGB إلى HEX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">من ({fromUnit}):</label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  conversionType === 'hex-rgb' ? '#ff0000' :
                  conversionType === 'rgb-hex' ? 'rgb(255, 0, 0)' :
                  '16'
                }
              />
            </div>

            <div className="flex justify-center">
              <Button onClick={swapUnits} variant="outline" size="sm">
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">إلى ({toUnit}):</label>
              <div className="flex gap-2">
                <Input
                  value={outputValue}
                  readOnly
                  placeholder="النتيجة"
                  className="bg-muted"
                />
                {outputValue && (
                  <Button onClick={copyResult} variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

            <Button onClick={handleConvert} className="w-full bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              تحويل
            </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>أمثلة:</strong></p>
            <p>• بكسل إلى REM: 16px = 1rem (افتراضياً)</p>
            <p>• HEX إلى RGB: #ff0000 = rgb(255, 0, 0)</p>
            <p>• RGB إلى HEX: rgb(255, 0, 0) = #ff0000</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConverter;