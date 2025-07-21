/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Globe, Loader2, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ilovePDFManager } from '@/utils/ilovepdf-api';

const HTMLToPDF = () => {
  const [inputMethod, setInputMethod] = useState<'file' | 'url' | 'code'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [pageSize, setPageSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type === 'text/html' || selectedFile.name.endsWith('.html'))) {
      setFile(selectedFile);
      setResultBlob(null);
      setProgress({ stage: '', percent: 0 });
    } else {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف HTML صحيح",
        variant: "destructive",
      });
    }
  };

  const convertToPDF = async () => {
    let contentToConvert: string | File | null = null;

    if (inputMethod === 'file') {
      if (!file) {
        toast({
          title: "لا يوجد ملف",
          description: "يرجى اختيار ملف HTML أولاً",
          variant: "destructive",
        });
        return;
      }
      contentToConvert = file;
    } else if (inputMethod === 'url') {
      if (!url.trim()) {
        toast({
          title: "رابط مطلوب",
          description: "يرجى إدخال رابط الصفحة",
          variant: "destructive",
        });
        return;
      }
      contentToConvert = url.trim();
    } else if (inputMethod === 'code') {
      if (!htmlCode.trim()) {
        toast({
          title: "كود HTML مطلوب",
          description: "يرجى إدخال كود HTML",
          variant: "destructive",
        });
        return;
      }
      contentToConvert = htmlCode.trim();
    }

    setProcessing(true);
    setProgress({ stage: 'جاري البدء...', percent: 0 });

    try {
      const settings: any = {
        page_size: pageSize,
        orientation: orientation
      };

      let files: File[] = [];
      
      if (inputMethod === 'file' && file) {
        files = [file];
      } else if (inputMethod === 'url') {
        settings.url = contentToConvert;
      } else if (inputMethod === 'code') {
        // Create a temporary HTML file from the code
        const htmlBlob = new Blob([contentToConvert as string], { type: 'text/html' });
        const htmlFile = new File([htmlBlob], 'content.html', { type: 'text/html' });
        files = [htmlFile];
      }

      const result = await ilovePDFManager.processWorkflow(
        'htmltopdf',
        files,
        settings,
        (stage, percent) => {
          setProgress({ stage, percent });
        }
      );

      setResultBlob(result);
      
      toast({
        title: "تم التحويل بنجاح!",
        description: "تم تحويل HTML إلى PDF بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحويل",
        description: "فشل في تحويل HTML إلى PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob) {
      let filename = 'document.pdf';
      if (inputMethod === 'file' && file) {
        filename = file.name.replace(/\.(html|htm)$/, '.pdf');
      } else if (inputMethod === 'url') {
        filename = 'webpage.pdf';
      }
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
          <CardTitle className="text-3xl gradient-text mb-2">HTML إلى PDF</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">تحويل صفحات الويب وملفات HTML إلى PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as typeof inputMethod)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file">ملف HTML</TabsTrigger>
              <TabsTrigger value="url">رابط الويب</TabsTrigger>
              <TabsTrigger value="code">كود HTML</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اختر ملف HTML:</label>
                <Input
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Upload className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">ملف HTML جاهز للتحويل</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الصفحة:</label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground">
                  أدخل رابط الصفحة المراد تحويلها إلى PDF
                </p>
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">كود HTML:</label>
                <Textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<!DOCTYPE html>
<html>
<head>
    <title>My Document</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is my content.</p>
</body>
</html>"
                  className="min-h-[200px] text-left font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  أدخل كود HTML المراد تحويله إلى PDF
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">حجم الصفحة:</label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="A5">A5</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">اتجاه الصفحة:</label>
              <Select value={orientation} onValueChange={setOrientation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">عمودي</SelectItem>
                  <SelectItem value="landscape">أفقي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
              onClick={convertToPDF} 
              disabled={
                processing || 
                (inputMethod === 'file' && !file) ||
                (inputMethod === 'url' && !url.trim()) ||
                (inputMethod === 'code' && !htmlCode.trim())
              }
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress.stage}
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  تحويل إلى PDF
                </>
              )}
            </Button>
            
            {resultBlob && (
              <Button onClick={downloadResult} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                تحميل PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HTMLToPDF;