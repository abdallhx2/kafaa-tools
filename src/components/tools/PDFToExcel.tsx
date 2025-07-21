import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ilovePDFManager } from '@/utils/ilovepdf-api';

const PDFToExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
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

  const convertToExcel = async () => {
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
      const result = await ilovePDFManager.processWorkflow(
        'pdftoexcel',
        [file],
        {},
        (stage, percent) => {
          setProgress({ stage, percent });
        }
      );

      setResultBlob(result);
      
      toast({
        title: "تم التحويل بنجاح!",
        description: "تم تحويل PDF إلى Excel بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحويل",
        description: "فشل في تحويل ملف PDF إلى Excel",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '.xlsx');
      ilovePDFManager.downloadBlob(resultBlob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <FileSpreadsheet className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">PDF إلى Excel</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">تحويل جداول PDF إلى ملف Excel قابل للتحرير</CardDescription>
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
                  سيتم استخراج الجداول وتحويلها إلى Excel
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
              onClick={convertToExcel} 
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
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  تحويل إلى Excel
                </>
              )}
            </Button>
            
            {resultBlob && (
              <Button onClick={downloadResult} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                تحميل Excel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToExcel;