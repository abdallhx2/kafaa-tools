import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileImage, Copy, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface OCRResult {
  text: string;
  confidence: number;
}

interface OCRToolProps {
  onBack?: () => void;
}

const OCRTool = ({ onBack }: OCRToolProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setOcrResult(null);
      } else {
        toast({
          title: "خطأ في نوع الملف",
          description: "يرجى اختيار ملف صورة صحيح",
          variant: "destructive",
        });
      }
    }
  };

  const processImage = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgress(0);
    setOcrResult(null);

    try {
      const worker = await createWorker('ara+eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const result = await worker.recognize(selectedImage);
      
      setOcrResult({
        text: result.data.text,
        confidence: result.data.confidence
      });

      await worker.terminate();

      toast({
        title: "تم استخراج النص بنجاح!",
        description: `مستوى الثقة: ${Math.round(result.data.confidence)}%`,
      });

    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "خطأ في معالجة الصورة",
        description: "حدث خطأ أثناء استخراج النص من الصورة",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const copyToClipboard = async () => {
    if (ocrResult?.text) {
      try {
        await navigator.clipboard.writeText(ocrResult.text);
        toast({
          title: "تم نسخ النص",
          description: "تم نسخ النص إلى الحافظة بنجاح",
        });
      } catch (error) {
        toast({
          title: "فشل في النسخ",
          description: "لم يتم نسخ النص",
          variant: "destructive",
        });
      }
    }
  };

  const downloadText = () => {
    if (ocrResult?.text) {
      const element = document.createElement('a');
      const file = new Blob([ocrResult.text], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(file);
      element.download = 'extracted-text.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setOcrResult(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Upload Area */}
      <Card className="overflow-hidden bg-gradient-card shadow-soft border-0 animate-fade-in">
        <CardHeader className="text-center pb-4">
          <CardTitle className="gradient-text text-2xl">استخراج النصوص من الصور</CardTitle>
          <CardDescription className="text-muted-foreground">
            ارفع صورة تحتوي على نص وسنقوم باستخراجه لك باللغتين العربية والإنجليزية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-smooth hover:border-primary cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">اختر صورة لاستخراج النص منها</p>
                <p className="text-sm text-muted-foreground mt-1">
                  يدعم جميع أنواع الصور (JPG, PNG, WebP)
                </p>
              </div>
              <Button variant="outline" className="transition-smooth">
                <FileImage className="mr-2 h-4 w-4" />
                تصفح الملفات
              </Button>
            </div>
          </div>

          {selectedImage && (
            <div className="flex justify-center space-x-2 space-x-reverse">
              <Button 
                onClick={processImage} 
                disabled={isProcessing}
                className="bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                {isProcessing ? "جاري المعالجة..." : "استخراج النص"}
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showPreview ? "إخفاء المعاينة" : "إظهار المعاينة"}
              </Button>
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                مسح الكل
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري معالجة الصورة...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="transition-smooth" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Preview */}
        {imagePreview && showPreview && (
          <Card className="overflow-hidden bg-gradient-card shadow-soft border-0 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-lg">معاينة الصورة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-lg overflow-hidden bg-muted/30">
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* OCR Results */}
        {ocrResult && (
          <Card className="overflow-hidden bg-gradient-card shadow-soft border-0 animate-slide-up">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">النص المستخرج</CardTitle>
                <div className="flex space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadText}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                مستوى الثقة: {Math.round(ocrResult.confidence)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={ocrResult.text}
                onChange={(e) => setOcrResult({ ...ocrResult, text: e.target.value })}
                className="min-h-64 resize-none bg-muted/30 border-border transition-smooth focus:shadow-soft"
                placeholder="النص المستخرج سيظهر هنا..."
                dir="auto"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OCRTool;