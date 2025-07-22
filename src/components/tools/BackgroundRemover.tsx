import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, Download, Scissors, Trash2, Image as ImageIcon, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<Blob | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  // Quality settings
  const [qualitySettings, setQualitySettings] = useState({
    resolution: '50MP', // 'preview', 'full', '50MP'
    format: 'png', // 'auto', 'png', 'webp', 'jpg'
    objectType: 'auto', // 'auto', 'person', 'product', 'car', 'animal'
    enableCrop: false,
    cropMargin: '0%'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "ملف كبير جداً",
          description: "يرجى اختيار صورة أصغر من 10 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setOriginalPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setProcessedImage(null);
      setProcessedPreview(null);
    }
  };

  const removeBackground = async () => {
    if (!selectedImage) return;

    const apiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    if (!apiKey || apiKey === 'your_remove_bg_api_key_here') {
      toast({
        title: "مطلوب مفتاح API",
        description: "يرجى إضافة مفتاح Remove.bg API في ملف .env",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(20);
      const formData = new FormData();
      formData.append('image_file', selectedImage);
      formData.append('size', qualitySettings.resolution);
      formData.append('format', qualitySettings.format);
      formData.append('type', qualitySettings.objectType);
      formData.append('channels', 'rgba');
      
      // Add cropping if enabled
      if (qualitySettings.enableCrop) {
        formData.append('crop', 'true');
        if (qualitySettings.cropMargin !== '0%') {
          formData.append('crop_margin', qualitySettings.cropMargin);
        }
      }

      setProgress(40);
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': apiKey,
        },
        body: formData,
      });

      setProgress(70);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.title || 'Remove.bg API error');
      }

      const blob = await response.blob();
      setProcessedImage(blob);
      setProcessedPreview(URL.createObjectURL(blob));
      setProgress(100);
      
      toast({
        title: "تم بنجاح! 🎉",
        description: "تم إزالة الخلفية من الصورة",
      });
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "خطأ في المعالجة",
        description: error instanceof Error ? error.message : "فشل في إزالة الخلفية",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadProcessed = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(processedImage);
      link.download = `no_bg_${selectedImage?.name || 'image.png'}`;
      link.click();
      
      toast({
        title: "تم التحميل! 📁",
        description: "تم تحميل الصورة بدون خلفية",
      });
    }
  };

  const clearAll = () => {
    setSelectedImage(null);
    setOriginalPreview(null);
    setProcessedImage(null);
    setProcessedPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    toast({
      title: "تم المسح",
      description: "تم مسح جميع الصور",
    });
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
            <Scissors className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">إزالة خلفية الصور</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            إزالة الخلفية من الصور باستخدام تقنية الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div
            className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 bg-gradient-subtle"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-1">اختر صورة لإزالة الخلفية</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, JPEG - أقل من 10 ميجابايت</p>
              </div>
            </div>
          </div>

          {/* Quality Settings */}
          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                إعدادات الجودة
              </CardTitle>
              <CardDescription>
                اختر الإعدادات للحصول على أفضل جودة لنوع الصورة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Resolution Setting */}
                <div className="space-y-2">
                  <Label htmlFor="resolution">دقة الصورة</Label>
                  <Select 
                    value={qualitySettings.resolution} 
                    onValueChange={(value) => setQualitySettings(prev => ({...prev, resolution: value}))}
                  >
                    <SelectTrigger id="resolution">
                      <SelectValue placeholder="اختر الدقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preview">معاينة (سريع)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Setting */}
                <div className="space-y-2">
                  <Label htmlFor="format">تنسيق الملف</Label>
                  <Select 
                    value={qualitySettings.format} 
                    onValueChange={(value) => setQualitySettings(prev => ({...prev, format: value}))}
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="اختر التنسيق" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">تلقائي</SelectItem>
                      <SelectItem value="png">PNG (شفافية)</SelectItem>
                      <SelectItem value="webp">WebP (متوازن)</SelectItem>
                      <SelectItem value="jpg">JPG (صغير)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Object Type Setting */}
                <div className="space-y-2">
                  <Label htmlFor="objectType">نوع الصورة</Label>
                  <Select 
                    value={qualitySettings.objectType} 
                    onValueChange={(value) => setQualitySettings(prev => ({...prev, objectType: value}))}
                  >
                    <SelectTrigger id="objectType">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">تلقائي</SelectItem>
                      <SelectItem value="person">أشخاص</SelectItem>
                      <SelectItem value="product">منتجات</SelectItem>
                      <SelectItem value="car">سيارات</SelectItem>
                      <SelectItem value="animal">حيوانات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cropping Options */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="enableCrop" 
                    checked={qualitySettings.enableCrop}
                    onCheckedChange={(checked) => setQualitySettings(prev => ({...prev, enableCrop: !!checked}))}
                  />
                  <Label htmlFor="enableCrop" className="text-sm font-medium">
                    قص المناطق الفارغة تلقائياً
                  </Label>
                </div>
                
                {qualitySettings.enableCrop && (
                  <div className="space-y-2 mr-6">
                    <Label htmlFor="cropMargin">هامش القص</Label>
                    <Select 
                      value={qualitySettings.cropMargin} 
                      onValueChange={(value) => setQualitySettings(prev => ({...prev, cropMargin: value}))}
                    >
                      <SelectTrigger id="cropMargin">
                        <SelectValue placeholder="اختر الهامش" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0%">بدون هامش</SelectItem>
                        <SelectItem value="5%">5% هامش</SelectItem>
                        <SelectItem value="10%">10% هامش</SelectItem>
                        <SelectItem value="20%">20% هامش</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {selectedImage && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                onClick={removeBackground} 
                disabled={isProcessing}
                className="btn-gradient px-8 py-3"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4 mr-2" />
                    إزالة الخلفية
                  </>
                )}
              </Button>
              
              {processedImage && (
                <Button onClick={downloadProcessed} variant="outline" size="lg" className="px-8 py-3">
                  <Download className="h-4 w-4 mr-2" />
                  تحميل النتيجة
                </Button>
              )}
              
              <Button onClick={clearAll} variant="destructive" size="lg" className="px-8 py-3">
                <Trash2 className="h-4 w-4 mr-2" />
                مسح الكل
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>جاري إزالة الخلفية...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Section */}
      {selectedImage && (
        <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
          <CardHeader>
            <CardTitle className="text-xl text-center gradient-text">معاينة الصور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    الصورة الأصلية
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(selectedImage.size)}
                  </span>
                </div>
                {originalPreview && (
                  <div className="border border-border rounded-lg overflow-hidden bg-card">
                    <img 
                      src={originalPreview} 
                      alt="Original" 
                      className="w-full h-64 object-contain bg-muted/50" 
                    />
                  </div>
                )}
              </div>
              
              {/* Processed Image */}
              {processedPreview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-green-500" />
                      بدون خلفية
                    </h4>
                    {processedImage && (
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(processedImage.size)}
                      </span>
                    )}
                  </div>
                  <div className="border border-border rounded-lg overflow-hidden bg-card relative">
                    {/* Transparency background pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] opacity-50"></div>
                    <img 
                      src={processedPreview} 
                      alt="Processed" 
                      className="w-full h-64 object-contain relative z-10" 
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BackgroundRemover;
