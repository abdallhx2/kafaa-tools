import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Scissors, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SplitPage {
  pageNumber: number;
  preview: string;
  selected: boolean;
}

const PDFSplitter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<SplitPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customRanges, setCustomRanges] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      await loadPDFPages(file);
    } else {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف PDF صحيح",
        variant: "destructive"
      });
    }
  };

  const loadPDFPages = async (file: File) => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const totalPages = pdf.numPages;
      const loadedPages: SplitPage[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + (i / totalPages) * 80);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const preview = canvas.toDataURL();
          
          loadedPages.push({
            pageNumber: i,
            preview,
            selected: false
          });
        }
      }

      setPages(loadedPages);
      setProgress(100);
      
      toast({
        title: "تم تحميل الملف",
        description: `تم تحميل ${totalPages} صفحة بنجاح`
      });
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "خطأ في التحميل",
        description: "فشل في تحميل ملف PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const togglePageSelection = (pageIndex: number) => {
    setPages(prev => prev.map((page, index) => 
      index === pageIndex 
        ? { ...page, selected: !page.selected }
        : page
    ));
  };

  const selectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: true })));
  };

  const deselectAllPages = () => {
    setPages(prev => prev.map(page => ({ ...page, selected: false })));
  };

  const parseRanges = (rangeString: string): number[] => {
    const pageNumbers: number[] = [];
    const ranges = rangeString.split(',').map(r => r.trim());
    
    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= pages.length) {
              pageNumbers.push(i);
            }
          }
        }
      } else {
        const pageNum = parseInt(range);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages.length) {
          pageNumbers.push(pageNum);
        }
      }
    }
    
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };

  const splitByRange = () => {
    if (!customRanges.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال نطاق الصفحات",
        variant: "destructive"
      });
      return;
    }
    
    const pageNumbers = parseRanges(customRanges);
    if (pageNumbers.length === 0) {
      toast({
        title: "خطأ",
        description: "نطاق الصفحات غير صحيح",
        variant: "destructive"
      });
      return;
    }
    
    setPages(prev => prev.map(page => ({
      ...page,
      selected: pageNumbers.includes(page.pageNumber)
    })));
  };

  const extractSelectedPages = async () => {
    const selectedPages = pages.filter(page => page.selected);
    
    if (selectedPages.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صفحة واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < selectedPages.length; i++) {
        setProgress((i / selectedPages.length) * 100);
        
        const pageIndex = selectedPages[i].pageNumber - 1;
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `split_${selectedFile.name}`;
      link.click();

      setProgress(100);
      
      toast({
        title: "تم الاستخراج",
        description: `تم استخراج ${selectedPages.length} صفحة بنجاح`
      });

    } catch (error) {
      console.error('Error splitting PDF:', error);
      toast({
        title: "خطأ في الاستخراج",
        description: "فشل في استخراج الصفحات",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const selectedCount = pages.filter(page => page.selected).length;

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Scissors className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl text-foreground mb-2">تقسيم ملفات PDF</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            اختر الصفحات المطلوبة واستخرجها كملف PDF منفصل
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-smooth"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">اختر ملف PDF للتقسيم</p>
            <p className="text-xs text-muted-foreground mt-1">PDF files only</p>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">الملف المحدد: {selectedFile.name}</h3>
                <Badge variant="outline">{pages.length} صفحة</Badge>
              </div>
              
              {/* Range Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نطاق الصفحات (مثال: 1-5, 8, 10-12)</label>
                  <Input
                    value={customRanges}
                    onChange={(e) => setCustomRanges(e.target.value)}
                    placeholder="1-3, 5, 7-9"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={splitByRange} variant="outline" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    اختيار النطاق
                  </Button>
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex gap-2 justify-center">
                <Button onClick={selectAllPages} variant="outline" size="sm">
                  تحديد الكل
                </Button>
                <Button onClick={deselectAllPages} variant="outline" size="sm">
                  إلغاء التحديد
                </Button>
                <Button 
                  onClick={extractSelectedPages} 
                  disabled={selectedCount === 0 || isProcessing}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  استخراج ({selectedCount})
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري المعالجة...</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Pages Grid */}
          {pages.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">اختر الصفحات المطلوبة:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {pages.map((page, index) => (
                  <div
                    key={page.pageNumber}
                    className={`relative border-2 rounded-lg cursor-pointer transition-smooth ${
                      page.selected 
                        ? 'border-primary shadow-glow' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => togglePageSelection(index)}
                  >
                    <img
                      src={page.preview}
                      alt={`صفحة ${page.pageNumber}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="absolute top-1 right-1">
                      <Badge variant={page.selected ? "default" : "secondary"} className="text-xs">
                        {page.pageNumber}
                      </Badge>
                    </div>
                    {page.selected && (
                      <div className="absolute inset-0 bg-primary/20 rounded-md flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFSplitter;