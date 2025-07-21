import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FileText, Download, Droplets, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { clientPDFManager } from '@/utils/pdf-client';

const PDFWatermark = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [position, setPosition] = useState('center');
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([24]);
  const [color, setColor] = useState('#000000');
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

  const addWatermark = async () => {
    if (!file) {
      toast({
        title: "لا يوجد ملف",
        description: "يرجى اختيار ملف PDF أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!watermarkText.trim()) {
      toast({
        title: "نص مطلوب",
        description: "يرجى إدخال نص العلامة المائية",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress({ stage: 'جاري البدء...', percent: 0 });

    try {
      const options = {
        opacity: opacity[0] / 100,
        fontSize: fontSize[0],
        color: color,
        position: position
      };

      const result = await clientPDFManager.addWatermark(
        file,
        watermarkText.trim(),
        options,
        (stage, percent) => {
          setProgress({ stage, percent });
        }
      );

      setResultBlob(result);
      
      toast({
        title: "تم إضافة العلامة المائية!",
        description: "تم إضافة العلامة المائية إلى PDF بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في إضافة العلامة المائية",
        description: "فشل في إضافة العلامة المائية إلى PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '_watermarked.pdf');
      clientPDFManager.downloadBlob(resultBlob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Droplets className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">إضافة علامة مائية</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">إضافة علامة مائية نصية إلى ملف PDF</CardDescription>
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
                  PDF جاهز لإضافة العلامة المائية
                </p>
              </div>
            </div>
          )}

          {file && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="watermarkText">نص العلامة المائية:</Label>
                <Input
                  id="watermarkText"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="أدخل نص العلامة المائية"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>موضع العلامة المائية:</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">الوسط</SelectItem>
                      <SelectItem value="top-left">أعلى اليسار</SelectItem>
                      <SelectItem value="top-center">أعلى الوسط</SelectItem>
                      <SelectItem value="top-right">أعلى اليمين</SelectItem>
                      <SelectItem value="middle-left">وسط اليسار</SelectItem>
                      <SelectItem value="middle-right">وسط اليمين</SelectItem>
                      <SelectItem value="bottom-left">أسفل اليسار</SelectItem>
                      <SelectItem value="bottom-center">أسفل الوسط</SelectItem>
                      <SelectItem value="bottom-right">أسفل اليمين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">لون النص:</Label>
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الشفافية: {opacity[0]}%</Label>
                  <Slider
                    value={opacity}
                    onValueChange={setOpacity}
                    max={100}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>حجم الخط: {fontSize[0]}px</Label>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    max={72}
                    min={8}
                    step={2}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm text-muted-foreground">معاينة النص:</Label>
                <div 
                  className="text-center p-4 font-medium"
                  style={{ 
                    color: color, 
                    opacity: opacity[0] / 100,
                    fontSize: `${Math.min(fontSize[0], 24)}px`
                  }}
                >
                  {watermarkText || 'معاينة العلامة المائية'}
                </div>
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
              onClick={addWatermark} 
              disabled={!file || !watermarkText.trim() || processing}
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress.stage}
                </>
              ) : (
                <>
                  <Droplets className="mr-2 h-4 w-4" />
                  إضافة علامة مائية
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

export default PDFWatermark;