import { useState, useRef, useEffect, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Download, QrCode as QrCodeIcon, Upload, Palette, Smartphone, Globe, Wifi, CreditCard, Mail, Phone, MapPin, Calendar, User, MessageSquare, Eye, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const QRGenerator = () => {
  const [text, setText] = useState('مرحبا بك في أداة منشئ أكواد QR');
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const [previewQrCode, setPreviewQrCode] = useState<QRCodeStyling | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [currentQrType, setCurrentQrType] = useState('text');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [autoPreview, setAutoPreview] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // QR Content Types
  const qrTypes = [
    { value: 'text', label: 'نص عادي', icon: MessageSquare, placeholder: 'أدخل النص هنا...' },
    { value: 'url', label: 'رابط موقع', icon: Globe, placeholder: 'https://example.com' },
    { value: 'wifi', label: 'شبكة WiFi', icon: Wifi, placeholder: '' },
    { value: 'email', label: 'بريد إلكتروني', icon: Mail, placeholder: 'email@example.com' },
    { value: 'phone', label: 'رقم هاتف', icon: Phone, placeholder: '+966501234567' },
    { value: 'sms', label: 'رسالة نصية', icon: Smartphone, placeholder: '' },
    { value: 'vcard', label: 'بطاقة تعريف', icon: User, placeholder: '' },
    { value: 'event', label: 'حدث/موعد', icon: Calendar, placeholder: '' },
    { value: 'location', label: 'موقع جغرافي', icon: MapPin, placeholder: '' },
    { value: 'payment', label: 'دفع', icon: CreditCard, placeholder: '' }
  ];

  // Advanced QR Design Options
  const [qrOptions, setQrOptions] = useState({
    width: 400,
    height: 400,
    type: 'canvas' as 'canvas' | 'svg',
    margin: 10,
    qrOptions: {
      typeNumber: 0 as const,
      mode: 'Byte' as const,
      errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
      crossOrigin: 'anonymous' as const
    },
    dotsOptions: {
      color: '#1f2937',
      type: 'rounded' as 'square' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded' | 'dots'
    },
    backgroundOptions: {
      color: '#ffffff',
      gradient: null
    },
    cornersSquareOptions: {
      color: '#1f2937',
      type: 'extra-rounded' as 'square' | 'dot' | 'extra-rounded'
    },
    cornersDotOptions: {
      color: '#1f2937',
      type: 'dot' as 'square' | 'dot'
    }
  });

  // WiFi form state
  const [wifiData, setWifiData] = useState({
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false
  });

  // VCard form state
  const [vcardData, setVcardData] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    phone: '',
    email: '',
    website: '',
    address: ''
  });

  // SMS form state
  const [smsData, setSmsData] = useState({
    phone: '',
    message: ''
  });

  // Event form state
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  // Location form state
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    query: ''
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    type: 'bitcoin',
    address: '',
    amount: '',
    label: '',
    message: ''
  });

  const dotStyles = [
    { value: 'square', label: 'مربع' },
    { value: 'rounded', label: 'مستدير' },
    { value: 'classy', label: 'أنيق' },
    { value: 'classy-rounded', label: 'أنيق مستدير' },
    { value: 'extra-rounded', label: 'مستدير جداً' },
    { value: 'dots', label: 'نقاط' }
  ];

  const cornerStyles = [
    { value: 'square', label: 'مربع' },
    { value: 'extra-rounded', label: 'مستدير' },
    { value: 'dot', label: 'نقطة' }
  ];

  // Generate content based on type
  const generateContentByType = useCallback(() => {
    switch (currentQrType) {
      case 'wifi':
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden};`;
      case 'email':
        return `mailto:${text}`;
      case 'phone':
        return `tel:${text}`;
      case 'sms':
        return `SMSTO:${smsData.phone}:${smsData.message}`;
      case 'vcard':
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardData.firstName} ${vcardData.lastName}
ORG:${vcardData.organization}
TEL:${vcardData.phone}
EMAIL:${vcardData.email}
URL:${vcardData.website}
ADR:;;${vcardData.address};;;;
END:VCARD`;
      case 'event':
        return `BEGIN:VEVENT
SUMMARY:${eventData.title}
DESCRIPTION:${eventData.description}
LOCATION:${eventData.location}
DTSTART:${eventData.startDate.replace(/[-:]/g, '')}
DTEND:${eventData.endDate.replace(/[-:]/g, '')}
END:VEVENT`;
      case 'location':
        if (locationData.latitude && locationData.longitude) {
          return `geo:${locationData.latitude},${locationData.longitude}`;
        }
        return `geo:0,0?q=${encodeURIComponent(locationData.query)}`;
      case 'payment':
        if (paymentData.type === 'bitcoin') {
          return `bitcoin:${paymentData.address}?amount=${paymentData.amount}&label=${encodeURIComponent(paymentData.label)}&message=${encodeURIComponent(paymentData.message)}`;
        }
        return paymentData.address;
      default:
        return text;
    }
  }, [currentQrType, text, wifiData, smsData, vcardData, eventData, locationData, paymentData]);

  // Update preview in real-time
  const updatePreview = useCallback(async () => {
    if (!showPreview) return;
    
    const content = generateContentByType();
    if (!content.trim()) return;

    try {
      const previewQrCodeInstance = new QRCodeStyling({
        width: 200,
        height: 200,
        type: qrOptions.type,
        data: content,
        image: logoPreview || undefined,
        margin: qrOptions.margin,
        qrOptions: qrOptions.qrOptions,
        imageOptions: qrOptions.imageOptions,
        dotsOptions: qrOptions.dotsOptions,
        cornersSquareOptions: qrOptions.cornersSquareOptions,
        cornersDotOptions: qrOptions.cornersDotOptions,
      });

      setPreviewQrCode(previewQrCodeInstance);

      // Render preview
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
        previewQrCodeInstance.append(previewRef.current);
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  }, [showPreview, generateContentByType, qrOptions, logoPreview]);

  // Auto-update preview when options change
  useEffect(() => {
    if (autoPreview) {
      const debounceTimer = setTimeout(() => {
        updatePreview();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [updatePreview, autoPreview]);


  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: "يجب أن يكون حجم الصورة أقل من 2 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQR = async () => {
    const content = generateContentByType();
    
    if (!content.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال المحتوى المطلوب",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const qrCodeInstance = new QRCodeStyling({
        width: qrOptions.width,
        height: qrOptions.height,
        type: qrOptions.type,
        data: content,
        image: logoPreview || undefined,
        margin: qrOptions.margin,
        qrOptions: qrOptions.qrOptions,
        imageOptions: qrOptions.imageOptions,
        dotsOptions: qrOptions.dotsOptions,
        cornersSquareOptions: qrOptions.cornersSquareOptions,
        cornersDotOptions: qrOptions.cornersDotOptions,
      });

      setQrCode(qrCodeInstance);

      // Render to DOM
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
        qrCodeInstance.append(qrRef.current);
      }

      toast({
        title: "تم إنشاء الكود بنجاح!",
        description: "يمكنك الآن تحميل رمز QR المخصص",
      });
    } catch (error) {
      toast({
        title: "خطأ في الإنشاء",
        description: "فشل في إنشاء رمز QR",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = async (format: 'png' | 'svg' | 'jpeg' = 'png') => {
    if (!qrCode) return;

    try {
      const blob = await qrCode.download({
        name: `qrcode-${currentQrType}-${Date.now()}`,
        extension: format
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "فشل في تحميل رمز QR",
        variant: "destructive",
      });
    }
  };

  // Render content input based on QR type
  const renderContentInput = () => {
    const currentType = qrTypes.find(type => type.value === currentQrType);
    const Icon = currentType?.icon || MessageSquare;

    switch (currentQrType) {
      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary">شبكة WiFi</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم الشبكة (SSID) *</Label>
                <Input
                  value={wifiData.ssid}
                  onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
                  placeholder="اسم شبكة WiFi"
                />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input
                  type="password"
                  value={wifiData.password}
                  onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
                  placeholder="كلمة مرور الشبكة"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الحماية</Label>
                <Select value={wifiData.security} onValueChange={(value) => setWifiData({...wifiData, security: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">بدون كلمة مرور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-green-500" />
              <Badge variant="secondary">بطاقة تعريف</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الاسم الأول *</Label>
                <Input
                  value={vcardData.firstName}
                  onChange={(e) => setVcardData({...vcardData, firstName: e.target.value})}
                  placeholder="الاسم الأول"
                />
              </div>
              <div className="space-y-2">
                <Label>اسم العائلة</Label>
                <Input
                  value={vcardData.lastName}
                  onChange={(e) => setVcardData({...vcardData, lastName: e.target.value})}
                  placeholder="اسم العائلة"
                />
              </div>
              <div className="space-y-2">
                <Label>المؤسسة</Label>
                <Input
                  value={vcardData.organization}
                  onChange={(e) => setVcardData({...vcardData, organization: e.target.value})}
                  placeholder="اسم الشركة أو المؤسسة"
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={vcardData.phone}
                  onChange={(e) => setVcardData({...vcardData, phone: e.target.value})}
                  placeholder="+966501234567"
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={vcardData.email}
                  onChange={(e) => setVcardData({...vcardData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>الموقع الإلكتروني</Label>
                <Input
                  value={vcardData.website}
                  onChange={(e) => setVcardData({...vcardData, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>العنوان</Label>
                <Input
                  value={vcardData.address}
                  onChange={(e) => setVcardData({...vcardData, address: e.target.value})}
                  placeholder="العنوان الكامل"
                />
              </div>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-purple-500" />
              <Badge variant="secondary">رسالة نصية</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الهاتف *</Label>
                <Input
                  value={smsData.phone}
                  onChange={(e) => setSmsData({...smsData, phone: e.target.value})}
                  placeholder="+966501234567"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>نص الرسالة</Label>
                <Textarea
                  value={smsData.message}
                  onChange={(e) => setSmsData({...smsData, message: e.target.value})}
                  placeholder="اكتب نص الرسالة هنا..."
                  className="min-h-20"
                />
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-orange-500" />
              <Badge variant="secondary">حدث/موعد</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>عنوان الحدث *</Label>
                <Input
                  value={eventData.title}
                  onChange={(e) => setEventData({...eventData, title: e.target.value})}
                  placeholder="اسم الحدث أو الموعد"
                />
              </div>
              <div className="space-y-2">
                <Label>المكان</Label>
                <Input
                  value={eventData.location}
                  onChange={(e) => setEventData({...eventData, location: e.target.value})}
                  placeholder="مكان انعقاد الحدث"
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ البداية</Label>
                <Input
                  type="datetime-local"
                  value={eventData.startDate}
                  onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ النهاية</Label>
                <Input
                  type="datetime-local"
                  value={eventData.endDate}
                  onChange={(e) => setEventData({...eventData, endDate: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>وصف الحدث</Label>
                <Textarea
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  placeholder="وصف تفصيلي للحدث..."
                  className="min-h-20"
                />
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-red-500" />
              <Badge variant="secondary">موقع جغرافي</Badge>
            </div>
            <Tabs defaultValue="coordinates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="coordinates">إحداثيات</TabsTrigger>
                <TabsTrigger value="search">بحث</TabsTrigger>
              </TabsList>
              <TabsContent value="coordinates" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>خط العرض (Latitude) *</Label>
                    <Input
                      value={locationData.latitude}
                      onChange={(e) => setLocationData({...locationData, latitude: e.target.value})}
                      placeholder="24.7136"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>خط الطول (Longitude) *</Label>
                    <Input
                      value={locationData.longitude}
                      onChange={(e) => setLocationData({...locationData, longitude: e.target.value})}
                      placeholder="46.6753"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="search" className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المكان أو العنوان *</Label>
                  <Input
                    value={locationData.query}
                    onChange={(e) => setLocationData({...locationData, query: e.target.value})}
                    placeholder="الرياض، المملكة العربية السعودية"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-green-600" />
              <Badge variant="secondary">دفع</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الدفع</Label>
                <Select value={paymentData.type} onValueChange={(value) => setPaymentData({...paymentData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>عنوان المحفظة/الحساب *</Label>
                <Input
                  value={paymentData.address}
                  onChange={(e) => setPaymentData({...paymentData, address: e.target.value})}
                  placeholder="عنوان المحفظة أو معرف الحساب"
                />
              </div>
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  placeholder="0.001"
                />
              </div>
              <div className="space-y-2">
                <Label>تسمية</Label>
                <Input
                  value={paymentData.label}
                  onChange={(e) => setPaymentData({...paymentData, label: e.target.value})}
                  placeholder="وصف الدفعة"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>رسالة</Label>
                <Input
                  value={paymentData.message}
                  onChange={(e) => setPaymentData({...paymentData, message: e.target.value})}
                  placeholder="رسالة إضافية"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="h-5 w-5 text-blue-500" />
              <Badge variant="secondary">{currentType?.label}</Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">المحتوى *</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={currentType?.placeholder || "أدخل المحتوى هنا..."}
                className="min-h-24"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center border">
            <QrCodeIcon className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl mb-2 text-blue-600">منشئ أكواد QR </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">إنشاء وتخصيص أكواد QR احترافية مع معاينة مباشرة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview and Controls Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      المعاينة
                    </Label>
                 
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-dashed border-border/20 min-h-[240px] flex items-center justify-center">
                      {showPreview ? (
                        <div ref={previewRef} className="flex justify-center items-center" />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <QrCodeIcon className="h-18 w-18 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">المعاينة متوقفة</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <QrCodeIcon className="h-4 w-4" />
                    المحتوى
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    القوالب
                  </TabsTrigger>
                  <TabsTrigger value="design" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    التصميم
                  </TabsTrigger>
                  <TabsTrigger value="logo" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    اللوجو
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                  {/* QR Type Selector */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">نوع المحتوى:</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {qrTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <Button
                            key={type.value}
                            variant={currentQrType === type.value ? "default" : "outline"}
                            className="h-auto p-4 flex flex-col gap-2"
                            onClick={() => setCurrentQrType(type.value)}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-xs text-center">{type.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Content Input */}
                  <div className="bg-muted/20 rounded-lg p-6 border border-border/10">
                    {renderContentInput()}
                  </div>
                </TabsContent>

                <TabsContent value="design" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Colors */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">الألوان</Label>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm">لون النقاط:</Label>
                          <Input
                            type="color"
                            value={qrOptions.dotsOptions.color}
                            onChange={(e) => setQrOptions({
                              ...qrOptions,
                              dotsOptions: {...qrOptions.dotsOptions, color: e.target.value}
                            })}
                            className="h-12 w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">لون الخلفية:</Label>
                          <Input
                            type="color"
                            value={qrOptions.backgroundOptions.color}
                            onChange={(e) => setQrOptions({
                              ...qrOptions,
                              backgroundOptions: {...qrOptions.backgroundOptions, color: e.target.value}
                            })}
                            className="h-12 w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dots Style */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">شكل النقاط</Label>
                      <Select
                        value={qrOptions.dotsOptions.type}
                        onValueChange={(value: 'square' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded' | 'dots') => setQrOptions({
                          ...qrOptions,
                          dotsOptions: {...qrOptions.dotsOptions, type: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dotStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Corner Style */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">شكل الزوايا</Label>
                      <Select
                        value={qrOptions.cornersSquareOptions.type}
                        onValueChange={(value: 'square' | 'extra-rounded' | 'dot') => setQrOptions({
                          ...qrOptions,
                          cornersSquareOptions: {...qrOptions.cornersSquareOptions, type: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cornerStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Size */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">الحجم</Label>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm">العرض: {qrOptions.width}px</Label>
                          <Input
                            type="range"
                            min="200"
                            max="800"
                            value={qrOptions.width}
                            onChange={(e) => setQrOptions({
                              ...qrOptions,
                              width: parseInt(e.target.value),
                              height: parseInt(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">الهامش: {qrOptions.margin}px</Label>
                          <Input
                            type="range"
                            min="0"
                            max="50"
                            value={qrOptions.margin}
                            onChange={(e) => setQrOptions({
                              ...qrOptions,
                              margin: parseInt(e.target.value)
                            })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Error Correction */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">مستوى تصحيح الخطأ</Label>
                      <Select
                        value={qrOptions.qrOptions.errorCorrectionLevel}
                        onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setQrOptions({
                          ...qrOptions,
                          qrOptions: {...qrOptions.qrOptions, errorCorrectionLevel: value}
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">منخفض (7%)</SelectItem>
                          <SelectItem value="M">متوسط (15%)</SelectItem>
                          <SelectItem value="Q">عالي (25%)</SelectItem>
                          <SelectItem value="H">عالي جداً (30%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">إضافة لوجو</Label>
                    <div className="border-2 border-dashed border-border/30 rounded-lg p-8 text-center space-y-4">
                      {logoPreview ? (
                        <div className="space-y-4">
                          <img src={logoPreview} alt="Logo preview" className="w-24 h-24 mx-auto rounded-lg border" />
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              تغيير الصورة
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview(null);
                              }}
                            >
                              إزالة
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              رفع صورة
                            </Button>
                            <p className="text-sm text-muted-foreground mt-2">
                              PNG, JPG, SVG (حد أقصى 2MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {logoPreview && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm">حجم اللوجو: {Math.round(qrOptions.imageOptions.imageSize * 100)}%</Label>
                          <Input
                            type="range"
                            min="0.1"
                            max="0.6"
                            step="0.05"
                            value={qrOptions.imageOptions.imageSize}
                            onChange={(e) => setQrOptions({
                              ...qrOptions,
                              imageOptions: {...qrOptions.imageOptions, imageSize: parseFloat(e.target.value)}
                            })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={generateQR} 
              disabled={isGenerating}
              className="font-medium px-8 py-3"
            >
              <QrCodeIcon className="mr-2 h-5 w-5" />
              {isGenerating ? 'جاري الإنشاء...' : 'إنشاء QR Code نهائي'}
            </Button>
            {qrCode && (
              <div className="flex gap-2">
                <Button onClick={() => downloadQR('png')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  PNG
                </Button>
                <Button onClick={() => downloadQR('svg')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  SVG
                </Button>
                <Button onClick={() => downloadQR('jpeg')} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  JPEG
                </Button>
              </div>
            )}
          </div>

          {/* Final QR Code Display */}
          {qrCode && (
            <div className="flex justify-center">
              <Card className="p-6 bg-white border-2 border-primary/20 shadow-glow">
                <div className="text-center space-y-4">
                  <Badge variant="secondary" className="mb-2">QR Code النهائي</Badge>
                  <div ref={qrRef} className="flex justify-center items-center" />
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRGenerator;