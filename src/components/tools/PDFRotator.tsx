import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, RotateCw, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { clientPDFManager } from '@/utils/pdf-client';

const PDFRotator = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState('90');
  const [pageRange, setPageRange] = useState('all');
  const [customPages, setCustomPages] = useState('');
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

  const rotatePDF = async () => {
    if (!file) {
      toast({
        title: "لا يوجد ملف",
        description: "يرجى اختيار ملف PDF أولاً",
        variant: "destructive",
      });
      return;
    }

    if (pageRange === 'custom' && !customPages.trim()) {
      toast({
        title: "صفحات غير محددة",
        description: "يرجى تحديد أرقام الصفحات (مثال: 1,3,5-10)",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress({ stage: 'جاري البدء...', percent: 0 });

    try {
      // Parse custom pages if specified
      let pageIndices: number[] | undefined;
      if (pageRange === 'custom' && customPages.trim()) {
        pageIndices = [];
        const ranges = customPages.split(',');
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()) - 1);
            for (let i = start; i <= end; i++) {
              if (i >= 0) pageIndices.push(i);
            }
          } else {
            const pageNum = parseInt(range.trim()) - 1;
            if (pageNum >= 0) pageIndices.push(pageNum);
          }
        }
      }

      const result = await clientPDFManager.rotatePDF(
        file,
        parseInt(rotation),
        pageIndices,
        (stage, percent) => {
          setProgress({ stage, percent });
        }
      );

      setResultBlob(result);
      
      toast({
        title: "تم دوران PDF بنجاح!",
        description: `تم دوران الصفحات ${rotation} درجة`,
      });
    } catch (error) {
      toast({
        title: "خطأ في الدوران",
        description: "فشل في دوران صفحات PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '_rotated.pdf');
      clientPDFManager.downloadBlob(resultBlob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <RotateCw className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">دوران صفحات PDF</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">دوران صفحات PDF بزوايا مختلفة</CardDescription>
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
                  PDF جاهز للدوران
                </p>
              </div>
            </div>
          )}

          {file && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">زاوية الدوران:</label>
                  <Select value={rotation} onValueChange={setRotation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 درجة (يمين)</SelectItem>
                      <SelectItem value="180">180 درجة (انقلاب)</SelectItem>
                      <SelectItem value="270">270 درجة (يسار)</SelectItem>
                      <SelectItem value="-90">-90 درجة (يسار)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نطاق الصفحات:</label>
                  <Select value={pageRange} onValueChange={setPageRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الصفحات</SelectItem>
                      <SelectItem value="custom">صفحات محددة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {pageRange === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">أرقام الصفحات:</label>
                  <Input
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    placeholder="مثال: 1,3,5-10,15"
                    className="text-left"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل أرقام الصفحات مفصولة بفواصل، أو نطاقات مثل 5-10
                  </p>
                </div>
              )}
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
              onClick={rotatePDF} 
              disabled={!file || (pageRange === 'custom' && !customPages.trim()) || processing}
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress.stage}
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  دوران الصفحات
                </>
              )}
            </Button>
            
            {resultBlob && (
              <Button onClick={downloadResult} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                تحميل PDF المدور
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFRotator;