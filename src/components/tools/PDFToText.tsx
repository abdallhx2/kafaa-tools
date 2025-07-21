import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Type, Loader2, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { clientPDFManager } from '@/utils/pdf-client';

const PDFToText = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResultBlob(null);
      setExtractedText('');
      setShowPreview(false);
      setProgress({ stage: '', percent: 0 });
    } else {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف PDF صحيح",
        variant: "destructive",
      });
    }
  };

  const extractText = async () => {
    if (!file) {
      toast({
        title: "لا يوجد ملف",
        description: "يرجى اختيار ملف PDF أولاً",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress({ stage: 'جاري البدء...', percent: 0 });

    try {
      const extractedText = await clientPDFManager.extractTextFromPDF(
        file,
        (stage, percent) => {
          setProgress({ stage, percent });
        }
      );

      setExtractedText(extractedText);
      setShowPreview(true);
      
      // Create text blob for download
      const textBlob = new Blob([extractedText], { type: 'text/plain' });
      setResultBlob(textBlob);
      
      toast({
        title: "تم الاستخراج بنجاح!",
        description: "تم استخراج النص من PDF بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الاستخراج",
        description: "فشل في استخراج النص من PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '.txt');
      clientPDFManager.downloadBlob(resultBlob, filename);
    }
  };

  const copyToClipboard = async () => {
    if (extractedText) {
      try {
        await navigator.clipboard.writeText(extractedText);
        toast({
          title: "تم النسخ!",
          description: "تم نسخ النص إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "خطأ في النسخ",
          description: "فشل في نسخ النص إلى الحافظة",
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
            <Type className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">PDF إلى نص</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">استخراج النص من ملف PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اختر ملف PDF:</label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  سيتم استخراج جميع النصوص من PDF
                </p>
              </div>
            </div>
          )}

          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.stage}</span>
                <span>{progress.percent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {showPreview && extractedText && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">معاينة النص المستخرج:</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="text-xs"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  نسخ
                </Button>
              </div>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[200px] text-sm"
                placeholder="النص المستخرج سيظهر هنا..."
              />
            </div>
          )}

          <div className="flex gap-2 justify-center flex-wrap">
            <Button 
              onClick={extractText} 
              disabled={!file || processing}
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress.stage}
                </>
              ) : (
                <>
                  <Type className="mr-2 h-4 w-4" />
                  استخراج النص
                </>
              )}
            </Button>
            
            {resultBlob && (
              <Button onClick={downloadResult} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                تحميل ملف نصي
              </Button>
            )}

            {extractedText && (
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                نسخ النص
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToText;