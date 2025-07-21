import { useState, useRef, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Camera, 
  Upload, 
  QrCode as QrCodeIcon, 
  Copy, 
  Check, 
  X, 
  Scan, 
  FileImage, 
  Link,
  Mail,
  Phone,
  MapPin,
  Wifi,
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  Globe,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  ExternalLink,
  LucideIcon
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface QRResult {
  text: string;
  format: string;
  timestamp: Date;
  type: 'url' | 'email' | 'phone' | 'wifi' | 'vcard' | 'location' | 'sms' | 'text';
  metadata?: {
    title?: string;
    description?: string;
    icon?: LucideIcon;
  };
}

const QRReader = () => {
  const [results, setResults] = useState<QRResult[]>([]);
  const [currentResult, setCurrentResult] = useState<QRResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const zxingReader = useRef<BrowserMultiFormatReader>(new BrowserMultiFormatReader());
  
  const { toast } = useToast();

  // Detect QR code type and extract metadata
  const analyzeQRContent = (text: string): QRResult['type'] => {
    if (text.startsWith('http://') || text.startsWith('https://')) return 'url';
    if (text.startsWith('mailto:')) return 'email';
    if (text.startsWith('tel:') || /^\+?[\d\s\-()]+$/.test(text)) return 'phone';
    if (text.startsWith('SMSTO:') || text.startsWith('sms:')) return 'sms';
    if (text.startsWith('WIFI:')) return 'wifi';
    if (text.startsWith('BEGIN:VCARD')) return 'vcard';
    if (text.startsWith('geo:') || /^-?\d+\.\d+,-?\d+\.\d+/.test(text)) return 'location';
    return 'text';
  };

  const getQRMetadata = (text: string, type: QRResult['type']) => {
    const metadata: QRResult['metadata'] = {};
    
    switch (type) {
      case 'url':
        metadata.title = 'رابط موقع';
        metadata.description = 'انقر للفتح في نافذة جديدة';
        metadata.icon = Globe;
        break;
      case 'email':
        metadata.title = 'بريد إلكتروني';
        metadata.description = text.replace('mailto:', '');
        metadata.icon = Mail;
        break;
      case 'phone':
        metadata.title = 'رقم هاتف';
        metadata.description = text.replace('tel:', '');
        metadata.icon = Phone;
        break;
      case 'wifi':
        metadata.title = 'شبكة WiFi';
        metadata.description = 'معلومات اتصال الشبكة';
        metadata.icon = Wifi;
        break;
      case 'vcard':
        metadata.title = 'بطاقة تعريف';
        metadata.description = 'معلومات شخصية أو تجارية';
        metadata.icon = User;
        break;
      case 'location':
        metadata.title = 'موقع جغرافي';
        metadata.description = 'إحداثيات GPS';
        metadata.icon = MapPin;
        break;
      case 'sms':
        metadata.title = 'رسالة نصية';
        metadata.description = 'رسالة SMS';
        metadata.icon = MessageSquare;
        break;
      default:
        metadata.title = 'نص عادي';
        metadata.description = 'محتوى نصي';
        metadata.icon = QrCodeIcon;
    }
    
    return metadata;
  };

  const createQRResult = (text: string, format: string = 'QR_CODE'): QRResult => {
    const type = analyzeQRContent(text);
    const metadata = getQRMetadata(text, type);
    
    return {
      text,
      format,
      timestamp: new Date(),
      type,
      metadata
    };
  };

  // File upload handler using ZXing library
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Create image element to decode from
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        try {
          const result = await zxingReader.current.decodeFromImageElement(img);
          if (result) {
            const qrResult = createQRResult(result.getText(), result.getBarcodeFormat().toString());
            setCurrentResult(qrResult);
            setResults(prev => [qrResult, ...prev.slice(0, 9)]); // Keep last 10 results
            
            toast({
              title: "تم قراءة الكود بنجاح! 🎉",
              description: `تم استخراج ${qrResult.metadata?.title}`,
            });
          }
        } catch (error) {
          toast({
            title: "لم يتم العثور على كود QR",
            description: "تأكد من وضوح الصورة ووجود كود QR صالح",
            variant: "destructive",
          });
        } finally {
          setProcessing(false);
        }
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      setProcessing(false);
      toast({
        title: "خطأ في قراءة الملف",
        description: "فشل في تحميل الصورة",
        variant: "destructive",
      });
    }
  };

  // Check camera permissions
  const checkCameraPermission = useCallback(async () => {
    try {
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        
        permissionStatus.addEventListener('change', () => {
          setCameraPermission(permissionStatus.state as 'granted' | 'denied' | 'prompt');
        });
      }
    } catch (error) {
      setCameraPermission('prompt');
    }
  }, []);

  useEffect(() => {
    checkCameraPermission();
  }, [checkCameraPermission]);

  // Start camera scanner
  const startCameraScanner = async () => {
    if (!scannerElementRef.current) return;

    try {
      setProcessing(true);
      const html5QrCode = new Html5Qrcode("qr-scanner-element");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
          const qrResult = createQRResult(decodedText, decodedResult.result?.format?.formatName || 'QR_CODE');
          setCurrentResult(qrResult);
          setResults(prev => [qrResult, ...prev.slice(0, 9)]);
          
          toast({
            title: "تم قراءة الكود بنجاح! 🎉",
            description: `تم استخراج ${qrResult.metadata?.title}`,
          });
          
          // Auto stop after successful scan
          stopCameraScanner();
        },
        (errorMessage) => {
          // Handle scan failure silently - this fires frequently during scanning
        }
      );

      setCameraActive(true);
      setCameraPermission('granted');
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
      setCameraPermission('denied');
      toast({
        title: "خطأ في الكاميرا",
        description: "فشل في الوصول للكاميرا. تأكد من منح الإذن.",
        variant: "destructive",
      });
    }
  };

  // Stop camera scanner
  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        setCameraActive(false);
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error("Error stopping camera:", error);
        setCameraActive(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Copy to clipboard
  const copyToClipboard = (text: string, index?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "تم النسخ 📋",
        description: "تم نسخ النص إلى الحافظة",
      });
      
      if (typeof index === 'number') {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    });
  };

  // Handle QR result action
  const handleResultAction = (result: QRResult) => {
    switch (result.type) {
      case 'url':
        window.open(result.text, '_blank');
        break;
      case 'email':
        window.location.href = result.text;
        break;
      case 'phone':
        window.location.href = result.text;
        break;
      case 'sms':
        window.location.href = result.text;
        break;
      default:
        copyToClipboard(result.text);
    }
  };

  // Clear all results
  const clearResults = () => {
    setResults([]);
    setCurrentResult(null);
    toast({
      title: "تم مسح النتائج",
      description: "تم حذف جميع النتائج المحفوظة",
    });
  };

  // Format QR content for display
  const formatQRContent = (result: QRResult) => {
    if (result.type === 'wifi') {
      const parts = result.text.split(';');
      const ssid = parts.find(p => p.startsWith('S:'))?.replace('S:', '');
      const security = parts.find(p => p.startsWith('T:'))?.replace('T:', '');
      const password = parts.find(p => p.startsWith('P:'))?.replace('P:', '');
      return `الشبكة: ${ssid || 'غير محدد'}\nنوع الحماية: ${security || 'غير محدد'}${password ? `\nكلمة المرور: ${password}` : ''}`;
    }
    
    if (result.type === 'vcard') {
      const lines = result.text.split('\n');
      const name = lines.find(l => l.startsWith('FN:'))?.replace('FN:', '');
      const org = lines.find(l => l.startsWith('ORG:'))?.replace('ORG:', '');
      const tel = lines.find(l => l.startsWith('TEL:'))?.replace('TEL:', '');
      const email = lines.find(l => l.startsWith('EMAIL:'))?.replace('EMAIL:', '');
      
      return [name, org, tel, email].filter(Boolean).join('\n');
    }
    
    return result.text;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            قارئ أكواد QR
          </CardTitle>
          <CardDescription className="text-lg">
            قراءة واستخراج المحتوى من أكواد QR باستخدام الكاميرا أو رفع الصور
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'camera' | 'file')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                الكاميرا
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                رفع صورة
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="space-y-4">
              <div className="text-center space-y-4">
                {!cameraActive ? (
                  <div className="space-y-4">
                    <div className="p-8 border-2 border-dashed rounded-lg">
                      <Camera className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">استخدم الكاميرا لقراءة أكواد QR</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        وجّه الكاميرا نحو كود QR للقراءة التلقائية
                      </p>
                      {cameraPermission === 'denied' && (
                        <Alert className="mb-4">
                          <X className="h-4 w-4" />
                          <AlertDescription>
                            تم رفض إذن الكاميرا. يرجى السماح بالوصول للكاميرا في إعدادات المتصفح.
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        onClick={startCameraScanner}
                        disabled={processing || cameraPermission === 'denied'}
                        size="lg"
                      >
                        {processing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            جاري التحضير...
                          </>
                        ) : (
                          <>
                            <Scan className="mr-2 h-4 w-4" />
                            بدء المسح
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative mx-auto max-w-md">
                      <div 
                        id="qr-scanner-element" 
                        ref={scannerElementRef}
                        className="rounded-lg overflow-hidden border-2"
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-foreground rounded-tl-lg"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-foreground rounded-tr-lg"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-foreground rounded-bl-lg"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-foreground rounded-br-lg"></div>
                      </div>
                    </div>
                    <Button 
                      onClick={stopCameraScanner}
                      variant="destructive"
                      size="lg"
                    >
                      <X className="mr-2 h-4 w-4" />
                      إيقاف المسح
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="p-8 border-2 border-dashed rounded-lg">
                  <FileImage className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">ارفع صورة تحتوي على كود QR</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    يدعم صيغ JPG, PNG, GIF, و WebP
                  </p>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="max-w-xs mx-auto cursor-pointer"
                    disabled={processing}
                  />
                  {processing && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm">جاري قراءة الصورة...</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Result */}
      {currentResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentResult.metadata?.icon && (
                  <currentResult.metadata.icon className="h-6 w-6" />
                )}
                <div>
                  <CardTitle className="text-lg">
                    {currentResult.metadata?.title}
                  </CardTitle>
                  <CardDescription>
                    {currentResult.metadata?.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">
                {currentResult.format}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={formatQRContent(currentResult)}
                readOnly
                className="min-h-20"
                dir="auto"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  onClick={() => copyToClipboard(currentResult.text)}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {(currentResult.type === 'url' || currentResult.type === 'email' || currentResult.type === 'phone') && (
                  <Button
                    onClick={() => handleResultAction(currentResult)}
                    size="sm"
                    variant="outline" 
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>تم المسح في: {currentResult.timestamp.toLocaleString('ar-SA')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results History */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <QrCodeIcon className="h-5 w-5" />
                  سجل النتائج ({results.length})
                </CardTitle>
                <CardDescription>آخر النتائج المقروءة</CardDescription>
              </div>
              <Button onClick={clearResults} variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                مسح الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={`${result.timestamp.getTime()}-${index}`}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                {result.metadata?.icon && (
                  <result.metadata.icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{result.metadata?.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.format}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate" dir="auto">
                    {result.type === 'wifi' || result.type === 'vcard' 
                      ? formatQRContent(result).split('\n')[0]
                      : result.text
                    }
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleString('ar-SA')}
                  </span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    onClick={() => copyToClipboard(result.text, index)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setCurrentResult(result)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  {(result.type === 'url' || result.type === 'email' || result.type === 'phone') && (
                    <Button
                      onClick={() => handleResultAction(result)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRReader;