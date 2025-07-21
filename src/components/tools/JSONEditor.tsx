import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Check, 
  X, 
  Copy, 
  Download, 
  Upload, 
  RotateCcw,
  Minimize2,
  Maximize2,
  FileCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type IndentSize = 2 | 4;

const JSONEditor = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [isMinified, setIsMinified] = useState(false);
  const { toast } = useToast();

  const validateAndFormat = () => {
    if (!jsonInput.trim()) {
      setIsValid(null);
      setError('');
      setFormattedJson('');
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      setIsValid(true);
      setError('');
      
      if (isMinified) {
        setFormattedJson(JSON.stringify(parsed));
      } else {
        setFormattedJson(JSON.stringify(parsed, null, indentSize));
      }
      
      toast({
        title: "JSON صحيح",
        description: "تم تنسيق JSON بنجاح"
      });
    } catch (err) {
      setIsValid(false);
      setError(err instanceof Error ? err.message : 'خطأ في تحليل JSON');
      setFormattedJson('');
      
      toast({
        title: "خطأ في JSON",
        description: "يرجى التحقق من صحة تنسيق JSON",
        variant: "destructive"
      });
    }
  };

  const minifyJson = () => {
    setIsMinified(true);
    if (jsonInput.trim()) {
      try {
        const parsed = JSON.parse(jsonInput);
        setFormattedJson(JSON.stringify(parsed));
        setIsValid(true);
        setError('');
      } catch (err) {
        setIsValid(false);
        setError(err instanceof Error ? err.message : 'خطأ في تحليل JSON');
      }
    }
  };

  const beautifyJson = () => {
    setIsMinified(false);
    if (jsonInput.trim()) {
      try {
        const parsed = JSON.parse(jsonInput);
        setFormattedJson(JSON.stringify(parsed, null, indentSize));
        setIsValid(true);
        setError('');
      } catch (err) {
        setIsValid(false);
        setError(err instanceof Error ? err.message : 'خطأ في تحليل JSON');
      }
    }
  };

  const copyToClipboard = () => {
    const textToCopy = formattedJson || jsonInput;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "تم النسخ",
      description: "تم نسخ JSON إلى الحافظة"
    });
  };

  const downloadJson = () => {
    const textToDownload = formattedJson || jsonInput;
    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم التحميل",
      description: "تم تحميل ملف JSON"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    }
  };

  const clearAll = () => {
    setJsonInput('');
    setFormattedJson('');
    setIsValid(null);
    setError('');
  };

  const loadExample = () => {
    const exampleJson = {
      name: "محمد أحمد",
      age: 30,
      city: "الرياض",
      skills: ["JavaScript", "React", "Node.js"],
      contact: {
        email: "mohammed@example.com",
        phone: "+966501234567"
      },
      projects: [
        {
          name: "متجر إلكتروني",
          status: "مكتمل",
          technologies: ["React", "Express", "MongoDB"]
        },
        {
          name: "تطبيق جوال",
          status: "قيد التطوير",
          technologies: ["React Native", "Firebase"]
        }
      ],
      isActive: true,
      lastLogin: "2024-01-15T10:30:00Z"
    };
    
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  };

  const getJsonStats = () => {
    if (!formattedJson && !jsonInput) return null;
    
    const text = formattedJson || jsonInput;
    const lines = text.split('\n').length;
    const chars = text.length;
    const size = new Blob([text]).size;
    
    try {
      const parsed = JSON.parse(jsonInput);
      const keys = JSON.stringify(parsed).match(/"/g)?.length || 0;
      return { lines, chars, size, keys: Math.floor(keys / 2) };
    } catch {
      return { lines, chars, size, keys: 0 };
    }
  };

  const stats = getJsonStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold gradient-text">محرر ومنسق JSON</h1>
        <p className="text-muted-foreground text-lg">
          تحليل وتنسيق وتجميل ملفات JSON مع التحقق من الصحة
        </p>
      </div>

      {/* Controls */}
      <Card className="glass shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            أدوات التحكم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">حجم المسافة البادئة:</label>
              <Select value={indentSize.toString()} onValueChange={(value) => setIndentSize(Number(value) as IndentSize)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 مسافات</SelectItem>
                  <SelectItem value="4">4 مسافات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={validateAndFormat} variant="default">
                <Check className="ml-2 h-4 w-4" />
                تنسيق
              </Button>
              
              <Button onClick={beautifyJson} variant="outline">
                <Maximize2 className="ml-2 h-4 w-4" />
                تجميل
              </Button>
              
              <Button onClick={minifyJson} variant="outline">
                <Minimize2 className="ml-2 h-4 w-4" />
                ضغط
              </Button>
              
              <Button onClick={loadExample} variant="outline">
                <FileText className="ml-2 h-4 w-4" />
                مثال
              </Button>
              
              <Button onClick={clearAll} variant="outline">
                <RotateCcw className="ml-2 h-4 w-4" />
                مسح
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" disabled={!formattedJson && !jsonInput}>
                <Copy className="ml-2 h-4 w-4" />
                نسخ
              </Button>
              
              <Button onClick={downloadJson} variant="outline" disabled={!formattedJson && !jsonInput}>
                <Download className="ml-2 h-4 w-4" />
                تحميل
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Upload className="ml-2 h-4 w-4" />
                    رفع ملف
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="glass shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>JSON المدخل</span>
              <div className="flex items-center gap-2">
                {isValid === true && <Badge variant="default" className="bg-green-500"><Check className="w-3 h-3 ml-1" />صحيح</Badge>}
                {isValid === false && <Badge variant="destructive"><X className="w-3 h-3 ml-1" />خطأ</Badge>}
              </div>
            </CardTitle>
            <CardDescription>
              أدخل أو الصق JSON هنا للتحليل والتنسيق
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="أدخل JSON هنا..."
              className="min-h-80 font-mono text-sm text-left"
              dir="ltr"
            />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">خطأ:</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="glass shadow-soft">
          <CardHeader>
            <CardTitle>JSON المنسق</CardTitle>
            <CardDescription>
              النتيجة بعد التنسيق والتحقق من الصحة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formattedJson}
              readOnly
              placeholder="ستظهر النتيجة هنا..."
              className="min-h-80 font-mono text-sm bg-muted/50 text-left"
              dir="ltr"
            />
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {stats && (
        <Card className="glass shadow-soft">
          <CardHeader>
            <CardTitle>إحصائيات JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">{stats.lines}</p>
                <p className="text-sm text-muted-foreground">عدد الأسطر</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-500">{stats.chars.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">عدد الأحرف</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-500">{stats.keys}</p>
                <p className="text-sm text-muted-foreground">عدد المفاتيح</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-purple-500">
                  {(stats.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-sm text-muted-foreground">حجم الملف</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* JSON Validation Rules */}
      <Card className="glass shadow-soft">
        <CardHeader>
          <CardTitle>قواعد JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">القواعد الأساسية:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• يجب أن تكون الأسماء بين علامتي اقتباس مزدوجتين</li>
                <li>• القيم يمكن أن تكون: سلسلة نصية، رقم، كائن، مصفوفة، true، false، null</li>
                <li>• الفصل بين العناصر بفاصلة</li>
                <li>• لا فاصلة بعد العنصر الأخير</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">نصائح مفيدة:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• استخدم مزدوجة الاقتباس للنصوص</li>
                <li>• تجنب التعليقات في JSON</li>
                <li>• تأكد من توازن الأقواس والأقواس المربعة</li>
                <li>• استخدم التنسيق لسهولة القراءة</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JSONEditor;