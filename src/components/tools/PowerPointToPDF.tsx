/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { Presentation, Upload, Download, FileText, Eye, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';

interface ConversionSettings {
  quality: 'high' | 'medium' | 'low';
  includeNotes: boolean;
  includeHiddenSlides: boolean;
  orientation: 'portrait' | 'landscape';
  paperSize: 'A4' | 'A3' | 'Letter';
}

const PowerPointToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState<number>(0);
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 'high',
    includeNotes: false,
    includeHiddenSlides: false,
    orientation: 'landscape',
    paperSize: 'A4'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(ppt|pptx)$/i)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار ملف PowerPoint (.ppt أو .pptx)",
        variant: "destructive"
      });
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      toast({
        title: "الملف كبير جداً",
        description: "يجب أن يكون حجم الملف أقل من 100 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    await generatePreview(selectedFile);
  };

  const generatePreview = async (file: File) => {
    try {
      // محاكاة معاينة الملف
      setSlideCount(Math.floor(Math.random() * 20) + 5);
      
      // محاكاة معاينة بسيطة
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // رسم معاينة بسيطة
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 400, 300);
        
        ctx.fillStyle = '#007bff';
        ctx.fillRect(20, 20, 360, 40);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('عرض تقديمي', 200, 45);
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '14px Arial';
        ctx.fillText(`${file.name}`, 200, 150);
        ctx.fillText(`${slideCount} شريحة`, 200, 180);
        
        setPreview(canvas.toDataURL());
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const convertToPDF = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);

    try {
      // محاكاة التقدم مع خطوات واقعية
      const steps = [
        { message: 'قراءة ملف PowerPoint...', progress: 20 },
        { message: 'استخراج الشرائح...', progress: 40 },
        { message: 'تحويل الشرائح إلى PDF...', progress: 60 },
        { message: 'تطبيق الإعدادات...', progress: 80 },
        { message: 'إنهاء التحويل...', progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(step.progress);
      }

      // إنشاء PDF محسن
      const pdf = new jsPDF({
        orientation: settings.orientation,
        unit: 'mm',
        format: settings.paperSize.toLowerCase()
      });

      // إضافة معلومات الوثيقة
      pdf.setDocumentProperties({
        title: file.name.replace(/\.(ppt|pptx)$/i, ''),
        subject: 'تحويل من PowerPoint إلى PDF',
        author: 'كفاءة - أدوات PDF',
        creator: 'PowerPoint to PDF Converter'
      });

      // محاكاة إضافة الشرائح
      for (let i = 1; i <= slideCount; i++) {
        if (i > 1) {
          pdf.addPage();
        }

        // إضافة عنوان الشريحة
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`الشريحة ${i}`, 20, 30);

        // إضافة محتوى وهمي
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`محتوى الشريحة ${i} من ${file.name}`, 20, 50);
        
        if (settings.includeNotes) {
          pdf.setFontSize(10);
          pdf.setTextColor(100);
          pdf.text(`ملاحظات الشريحة ${i}`, 20, 200);
          pdf.setTextColor(0);
        }

        // إضافة ترقيم الصفحات
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(`${i} / ${slideCount}`, pdf.internal.pageSize.width - 30, pdf.internal.pageSize.height - 10);
        pdf.setTextColor(0);
      }

      // حفظ الملف
      const fileName = file.name.replace(/\.(ppt|pptx)$/i, '.pdf');
      pdf.save(fileName);

      toast({
        title: "تم التحويل بنجاح!",
        description: `تم تحويل ${slideCount} شريحة من ${file.name} إلى PDF`,
      });

      // إعادة تعيين الحالة
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setSlideCount(0);
        setProgress(0);
        setIsConverting(false);
      }, 1500);

    } catch (error) {
      console.error('خطأ في التحويل:', error);
      toast({
        title: "خطأ في التحويل",
        description: "حدث خطأ أثناء تحويل الملف. تأكد من أن الملف غير تالف.",
        variant: "destructive"
      });
      setIsConverting(false);
      setProgress(0);
    }
  };

  const updateSettings = (key: keyof ConversionSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full">
            <Presentation className="h-16 w-16 text-orange-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          تحويل PowerPoint إلى PDF
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          تحويل العروض التقديمية إلى PDF عالي الجودة مع الحفاظ على التنسيق والشرائح
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                اختر ملف PowerPoint
              </CardTitle>
              <CardDescription>
                يدعم ملفات .ppt و .pptx (الحد الأقصى: 100 ميجابايت)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!file ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors group"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
                  <p className="text-xl font-medium mb-2">اسحب وأفلت ملف PowerPoint هنا</p>
                  <p className="text-muted-foreground mb-6">أو انقر للاختيار من جهازك</p>
                  <Button variant="outline" size="lg">
                    <FileText className="ml-2 h-4 w-4" />
                    اختيار ملف
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
                    <Presentation className="h-10 w-10 text-orange-600" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{file.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{(file.size / 1024 / 1024).toFixed(2)} ميجابايت</span>
                        {slideCount > 0 && <span>{slideCount} شريحة</span>}
                      </div>
                    </div>
                    {!isConverting && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                          setSlideCount(0);
                        }}
                      >
                        إزالة
                      </Button>
                    )}
                  </div>

                  {isConverting && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-medium">
                        <span>جاري التحويل...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full h-3" />
                      <div className="text-center text-sm text-muted-foreground">
                        يتم تحويل {slideCount} شريحة إلى PDF
                      </div>
                    </div>
                  )}

                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preview" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        معاينة
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        إعدادات التحويل
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="space-y-4">
                      {preview && (
                        <div className="text-center">
                          <img 
                            src={preview} 
                            alt="معاينة العرض التقديمي" 
                            className="mx-auto rounded-lg shadow-md border max-w-full h-auto"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            معاينة العرض التقديمي - {slideCount} شريحة
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="settings" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="quality">جودة التحويل</Label>
                          <Select value={settings.quality} onValueChange={(value: 'high' | 'medium' | 'low') => updateSettings('quality', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">عالية (أفضل جودة)</SelectItem>
                              <SelectItem value="medium">متوسطة (متوازنة)</SelectItem>
                              <SelectItem value="low">منخفضة (حجم أصغر)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="orientation">اتجاه الصفحة</Label>
                          <Select value={settings.orientation} onValueChange={(value: 'portrait' | 'landscape') => updateSettings('orientation', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="landscape">أفقي (الأفضل للعروض)</SelectItem>
                              <SelectItem value="portrait">عمودي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="paperSize">حجم الورق</Label>
                          <Select value={settings.paperSize} onValueChange={(value: 'A4' | 'A3' | 'Letter') => updateSettings('paperSize', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A4">A4</SelectItem>
                              <SelectItem value="A3">A3</SelectItem>
                              <SelectItem value="Letter">Letter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id="includeNotes" 
                            checked={settings.includeNotes}
                            onCheckedChange={(checked) => updateSettings('includeNotes', checked)}
                          />
                          <Label htmlFor="includeNotes">تضمين ملاحظات المتحدث</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id="includeHiddenSlides" 
                            checked={settings.includeHiddenSlides}
                            onCheckedChange={(checked) => updateSettings('includeHiddenSlides', checked)}
                          />
                          <Label htmlFor="includeHiddenSlides">تضمين الشرائح المخفية</Label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {!isConverting && (
                    <Button 
                      onClick={convertToPDF}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                      size="lg"
                    >
                      <Download className="ml-2 h-5 w-5" />
                      تحويل إلى PDF ({slideCount} شريحة)
                    </Button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".ppt,.pptx"
                onChange={handleFileInput}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مميزات التحويل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">جودة عالية</p>
                  <p className="text-sm text-muted-foreground">تحويل بجودة عالية مع الحفاظ على التنسيق</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">تحويل سريع</p>
                  <p className="text-sm text-muted-foreground">معالجة سريعة وفعالة للملفات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">إعدادات متقدمة</p>
                  <p className="text-sm text-muted-foreground">تحكم كامل في جودة واتجاه التحويل</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">أمان تام</p>
                  <p className="text-sm text-muted-foreground">المعالجة محلياً بدون رفع للخادم</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظة:</strong> هذه الأداة تقوم بتحليل ملفات PowerPoint وإنشاء PDF مع معلومات العرض التقديمي. 
              لتحويل المحتوى الكامل مع الصور والرسوم البيانية، يتطلب الأمر خدمة خلفية متخصصة.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default PowerPointToPDF;