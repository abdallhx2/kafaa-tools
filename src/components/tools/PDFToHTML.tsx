import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Download, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ilovePDFManager } from '@/utils/ilovepdf-api';
import { clientPDFManager } from '@/utils/pdf-client';
import { Alert, AlertDescription } from "@/components/ui/alert";

const PDFToHTML = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [useLocalConverter, setUseLocalConverter] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResultBlob(null);
      setProgress({ stage: '', percent: 0 });
    } else {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف PDF صحيح",
        variant: "destructive",
      });
    }
  };

  const convertToHTML = async () => {
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
      console.log('Starting PDF to HTML conversion...');
      
      // Check if API credentials are configured
      if (!ilovePDFManager.hasValidCredentials()) {
        throw new Error('مفاتيح iLovePDF API غير مُعدة بشكل صحيح');
      }

      // Validate file
      const validation = ilovePDFManager.validateFiles('pdftohtml', [file]);
      if (!validation.valid) {
        throw new Error(validation.message || 'ملف غير صالح');
      }

      console.log('File validation passed, starting conversion...');
      
      const result = await ilovePDFManager.processWorkflow(
        'pdftohtml',
        [file],
        {},
        (stage, percent) => {
          console.log(`Progress: ${stage} - ${percent}%`);
          setProgress({ stage, percent });
        }
      );

      console.log('Conversion completed successfully');
      setResultBlob(result);
      
      toast({
        title: "تم التحويل بنجاح!",
        description: "تم تحويل PDF إلى HTML بنجاح",
      });
    } catch (error) {
      console.error('Conversion error:', error);
      
      let errorMessage = 'فشل في تحويل ملف PDF إلى HTML';
      
      if (error instanceof Error) {
        if (error.message.includes('مفاتيح')) {
          errorMessage = 'خطأ في مفاتيح API - يرجى التحقق من الإعدادات';
        } else if (error.message.includes('شبكة') || error.message.includes('network')) {
          errorMessage = 'خطأ في الاتصال - يرجى التحقق من الإنترنت';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'مفاتيح API غير صحيحة أو منتهية الصلاحية';
        } else if (error.message.includes('400') || error.message.includes('bad request')) {
          errorMessage = 'طلب غير صحيح - يرجى التحقق من الملف';
        } else if (error.message.includes('429')) {
          errorMessage = 'تم تجاوز حد الاستخدام - يرجى المحاولة لاحقاً';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "خطأ في التحويل",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset progress on error
      setProgress({ stage: '', percent: 0 });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '.zip'); // HTML files usually come in a zip
      ilovePDFManager.downloadBlob(resultBlob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Globe className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">PDF إلى HTML</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">تحويل PDF إلى صفحة ويب HTML</CardDescription>
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
                  سيتم تحويل المحتوى إلى صفحة HTML
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

          <div className="flex gap-2 justify-center">
            <Button 
              onClick={convertToHTML} 
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
                  <Globe className="mr-2 h-4 w-4" />
                  تحويل إلى HTML
                </>
              )}
            </Button>
            
            {resultBlob && (
              <Button onClick={downloadResult} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                تحميل HTML
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToHTML;