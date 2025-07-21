/* eslint-disable no-case-declarations */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type EncodingType = 'base64' | 'url' | 'html' | 'utf8' | 'hex' | 'binary';

const EncodingConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputType, setInputType] = useState<EncodingType>('utf8');
  const [outputType, setOutputType] = useState<EncodingType>('base64');
  const { toast } = useToast();

  const encodingOptions = [
    { value: 'utf8', label: 'نص عادي (UTF-8)' },
    { value: 'base64', label: 'Base64' },
    { value: 'url', label: 'URL Encoding' },
    { value: 'html', label: 'HTML Entities' },
    { value: 'hex', label: 'Hexadecimal' },
    { value: 'binary', label: 'Binary' }
  ];

  const convertText = (text: string, fromType: EncodingType, toType: EncodingType): string => {
    try {
      // First decode from source format
      let decodedText: string;
      
      switch (fromType) {
        case 'utf8':
          decodedText = text;
          break;
        case 'base64':
          decodedText = atob(text);
          break;
        case 'url':
          decodedText = decodeURIComponent(text);
          break;
        case 'html':
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'text/html');
          decodedText = doc.documentElement.textContent || '';
          break;
        case 'hex':
          decodedText = text.match(/.{1,2}/g)?.map(byte => 
            String.fromCharCode(parseInt(byte, 16))
          ).join('') || '';
          break;
        case 'binary':
          decodedText = text.match(/.{1,8}/g)?.map(byte => 
            String.fromCharCode(parseInt(byte, 2))
          ).join('') || '';
          break;
        default:
          decodedText = text;
      }

      // Then encode to target format
      switch (toType) {
        case 'utf8':
          return decodedText;
        case 'base64':
          return btoa(decodedText);
        case 'url':
          return encodeURIComponent(decodedText);
        case 'html':
          return decodedText.replace(/[&<>"']/g, (match) => {
            const htmlEntities: { [key: string]: string } = {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;'
            };
            return htmlEntities[match];
          });
        case 'hex':
          return decodedText.split('').map(char => 
            char.charCodeAt(0).toString(16).padStart(2, '0')
          ).join('');
        case 'binary':
          return decodedText.split('').map(char => 
            char.charCodeAt(0).toString(2).padStart(8, '0')
          ).join(' ');
        default:
          return decodedText;
      }
    } catch (error) {
      throw new Error('فشل في التحويل - تأكد من صحة التنسيق');
    }
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال النص المراد تحويله",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = convertText(inputText, inputType, outputType);
      setOutputText(result);
      
      toast({
        title: "تم التحويل",
        description: `تم التحويل من ${encodingOptions.find(o => o.value === inputType)?.label} إلى ${encodingOptions.find(o => o.value === outputType)?.label}`
      });
    } catch (error) {
      toast({
        title: "خطأ في التحويل",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "تم النسخ",
      description: "تم نسخ النص إلى الحافظة"
    });
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setInputType(outputType);
    setOutputType(inputType);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setInputType('utf8');
    setOutputType('base64');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text">محول الترميز والتشفير</h1>
        <p className="text-muted-foreground text-lg">
          تحويل النصوص بين تنسيقات الترميز المختلفة مثل Base64، URL encoding وغيرها
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="glass shadow-soft">
          <CardHeader>
            <CardTitle>النص المدخل</CardTitle>
            <CardDescription>اختر نوع الترميز وأدخل النص</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={inputType} onValueChange={(value: EncodingType) => setInputType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {encodingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="أدخل النص هنا..."
              className="min-h-32 text-right"
              dir={inputType === 'utf8' ? 'rtl' : 'ltr'}
            />
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="glass shadow-soft">
          <CardHeader>
            <CardTitle>النتيجة</CardTitle>
            <CardDescription>النص بعد التحويل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={outputType} onValueChange={(value: EncodingType) => setOutputType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {encodingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Textarea
              value={outputText}
              readOnly
              placeholder="ستظهر النتيجة هنا..."
              className="min-h-32 text-right bg-muted/50"
              dir={outputType === 'utf8' ? 'rtl' : 'ltr'}
            />
            
            {outputText && (
              <Button variant="outline" onClick={handleCopy} className="w-full">
                <Copy className="ml-2 h-4 w-4" />
                نسخ النتيجة
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleConvert} className="px-8">
          تحويل
        </Button>
        
        <Button variant="outline" onClick={handleSwap}>
          <RotateCcw className="ml-2 h-4 w-4" />
          عكس التحويل
        </Button>
        
        <Button variant="outline" onClick={handleReset}>
          إعادة تعيين
        </Button>
      </div>

      {/* Examples */}
      <Card className="glass shadow-soft">
        <CardHeader>
          <CardTitle>أمثلة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium">Base64:</p>
              <p className="text-muted-foreground" dir="ltr">SGVsbG8gV29ybGQ=</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">URL Encoding:</p>
              <p className="text-muted-foreground" dir="ltr">Hello%20World</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">HTML Entities:</p>
              <p className="text-muted-foreground" dir="ltr">&lt;div&gt;Hello&lt;/div&gt;</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Hexadecimal:</p>
              <p className="text-muted-foreground" dir="ltr">48656c6c6f20576f726c64</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncodingConverter;