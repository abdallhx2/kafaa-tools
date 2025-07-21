import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

const ImageCompressor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState([70]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setOriginalPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setCompressedImage(null);
      setCompressedPreview(null);
    }
  };

  const compressImage = async () => {
    if (!selectedImage) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: compressionLevel[0] / 100,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressed = await imageCompression(selectedImage, options);
      setCompressedImage(compressed);
      
      const reader = new FileReader();
      reader.onload = (e) => setCompressedPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);

      const reductionPercent = Math.round(((selectedImage.size - compressed.size) / selectedImage.size) * 100);
      
      toast({
        title: "تم ضغط الصورة بنجاح!",
        description: `تم تقليل الحجم بنسبة ${reductionPercent}%`,
      });
    } catch (error) {
      toast({
        title: "خطأ في الضغط",
        description: "فشل في ضغط الصورة",
        variant: "destructive",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressed = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(compressedImage);
      link.download = `compressed_${selectedImage?.name || 'image.jpg'}`;
      link.click();
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setCompressedImage(null);
    setOriginalPreview(null);
    setCompressedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <ImageIcon className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">ضغط الصور</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">تقليل حجم الصور مع الحفاظ على الجودة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-smooth"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">اختر صورة للضغط</p>
          </div>

          {selectedImage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">مستوى الضغط: {compressionLevel[0]}%</label>
                <Slider
                  value={compressionLevel}
                  onValueChange={setCompressionLevel}
                  max={95}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={compressImage} disabled={isCompressing} className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {isCompressing ? "جاري الضغط..." : "ضغط الصورة"}
                </Button>
                {compressedImage && (
                  <Button onClick={downloadCompressed} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    تحميل
                  </Button>
                )}
                <Button onClick={clearAll} variant="outline">
                  <Trash2 className="mr-2 h-4 w-4" />
                  مسح
                </Button>
              </div>
            </div>
          )}

          {selectedImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">الصورة الأصلية</h4>
                <div className="bg-muted rounded-lg p-2">
                  {originalPreview && (
                    <img src={originalPreview} alt="Original" className="w-full h-32 object-cover rounded" />
                  )}
                  <p className="text-xs text-center mt-1">{formatFileSize(selectedImage.size)}</p>
                </div>
              </div>
              
              {compressedImage && (
                <div className="space-y-2">
                  <h4 className="font-medium">الصورة المضغوطة</h4>
                  <div className="bg-muted rounded-lg p-2">
                    {compressedPreview && (
                      <img src={compressedPreview} alt="Compressed" className="w-full h-32 object-cover rounded" />
                    )}
                    <p className="text-xs text-center mt-1">{formatFileSize(compressedImage.size)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCompressor;