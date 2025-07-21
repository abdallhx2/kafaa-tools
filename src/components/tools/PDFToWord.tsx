/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { FileText, Upload, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';

// إعداد مسار worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار ملف PDF فقط",
        variant: "destructive"
      });
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "الملف كبير جداً",
        description: "يجب أن يكون حجم الملف أقل من 50 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
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

  const convertToWord = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      // قراءة ملف PDF واستخراج النص
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // استخراج النص من كل صفحة
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      clearInterval(progressInterval);
      setProgress(100);

      // إنشاء ملف Word (RTF format للدعم الأفضل)
      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${fullText.replace(/\n/g, '\\par ')}}`;

      // تنزيل الملف
      const blob = new Blob([rtfContent], { type: 'application/rtf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.rtf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "تم التحويل بنجاح",
        description: `تم تحويل ${file.name} إلى Word`,
      });

      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setIsConverting(false);
      }, 1000);

    } catch (error) {
      console.error('خطأ في التحويل:', error);
      toast({
        title: "خطأ في التحويل",
        description: "حدث خطأ أثناء تحويل الملف",
        variant: "destructive"
      });
      setIsConverting(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <FileText className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">تحويل PDF إلى Word</h1>
        <p className="text-lg text-muted-foreground">
          تحويل ملفات PDF إلى مستندات Word قابلة للتحرير
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اختر ملف PDF</CardTitle>
          <CardDescription>
            يدعم ملفات PDF فقط (الحد الأقصى: 50 ميجابايت)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">اسحب وأفلت ملف PDF هنا</p>
              <p className="text-muted-foreground mb-4">أو انقر للاختيار من جهازك</p>
              <Button variant="outline">
                اختيار ملف
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
                  </p>
                </div>
                {!isConverting && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    إزالة
                  </Button>
                )}
              </div>

              {isConverting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>جاري التحويل...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {!isConverting && (
                <Button 
                  onClick={convertToWord}
                  className="w-full"
                  size="lg"
                >
                  <Download className="ml-2 h-4 w-4" />
                  تحويل إلى Word
                </Button>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>ملاحظة:</strong> التحويل يستخرج النص من PDF ويحوله إلى تنسيق RTF. 
          قد لا يحافظ على التنسيق المعقد والصور.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PDFToWord;