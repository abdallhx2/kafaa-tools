/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Copy, ExternalLink, BarChart3, Calendar, Eye, Trash2, Download, Search, Link, TrendingUp, AlertCircle } from 'lucide-react';

interface ShortenedURL {
  id: string;
  originalUrl: string;
  shortUrl: string;
  customAlias?: string;
  clicks: number;
  createdAt: Date;
  lastClicked?: Date;
}

// Custom Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: string, title: string, description: string, variant?: string}>>([]);

  const toast = (toastData: {title: string, description: string, variant?: string}) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toastData, id }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return { toast, toasts };
};

// Custom UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-blue-100 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-4">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 mt-2">{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "default", 
  size = "default",
  disabled = false
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  className?: string,
  variant?: string,
  size?: string,
  disabled?: boolean
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    default: "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg",
    outline: "border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600",
    ghost: "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    default: "px-6 py-3"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  value, 
  onChange, 
  placeholder = "", 
  type = "text", 
  className = "",
  dir = "rtl",
  disabled = false
}: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, 
  placeholder?: string,
  type?: string,
  className?: string,
  dir?: string,
  disabled?: boolean
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    dir={dir}
    disabled={disabled}
    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${disabled ? 'bg-gray-100' : ''} ${className}`}
  />
);

const Badge = ({ 
  children, 
  variant = "default", 
  className = "" 
}: { 
  children: React.ReactNode, 
  variant?: string,
  className?: string
}) => {
  const variants = {
    default: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-700",
    outline: "border border-gray-300 text-gray-600"
  };
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </span>
  );
};

// Toast Component
const Toast = ({ toast, onClose }: {toast: any, onClose: () => void}) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 min-w-[320px] transform transition-all duration-300 ${
    toast.variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
  }`}>
    <div className="flex items-start gap-3">
      {toast.variant === 'destructive' ? (
        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      ) : (
        <div className="h-5 w-5 mt-0.5 flex-shrink-0 rounded-full bg-white/20 flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full"></div>
        </div>
      )}
      <div className="flex-1">
        <div className="font-semibold">{toast.title}</div>
        <div className="text-sm opacity-90 mt-1">{toast.description}</div>
      </div>
      <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
    </div>
  </div>
);

const AdvancedURLShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast, toasts } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('shortenedUrls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          lastClicked: url.lastClicked ? new Date(url.lastClicked) : undefined
        }));
        setShortenedUrls(parsed);
      } catch (error) {
        console.error('Error loading saved URLs:', error);
      }
    }
  }, []);

  // Save to localStorage whenever shortenedUrls changes
  useEffect(() => {
    if (shortenedUrls.length > 0) {
      localStorage.setItem('shortenedUrls', JSON.stringify(shortenedUrls));
    }
  }, [shortenedUrls]);

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // TinyURL integration
  const shortenUrl = async () => {
    if (!originalUrl.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الرابط المراد تقصيره",
        variant: "destructive"
      });
      return;
    }

    let urlToProcess = originalUrl.trim();
    
    // Add https:// if no protocol is specified
    if (!urlToProcess.startsWith('http://') && !urlToProcess.startsWith('https://')) {
      urlToProcess = 'https://' + urlToProcess;
    }

    if (!isValidUrl(urlToProcess)) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط صحيح (مثال: https://example.com)",
        variant: "destructive"
      });
      return;
    }

    // Check if URL already exists
    const existingUrl = shortenedUrls.find(url => url.originalUrl === urlToProcess);
    if (existingUrl) {
      toast({
        title: "تحذير",
        description: "هذا الرابط موجود بالفعل في قائمتك",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      let shortUrl = '';
      
      // Use TinyURL API
      if (customAlias.trim()) {
        // TinyURL with custom alias
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToProcess)}&alias=${customAlias}`);
        const result = await response.text();
        
        if (result.includes('Error') || result.includes('Invalid') || result.includes('already taken')) {
          toast({
            title: "خطأ",
            description: "الاسم المخصص غير متاح أو مُستخدم بالفعل",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        shortUrl = result.trim();
      } else {
        // TinyURL without custom alias
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlToProcess)}`);
        const result = await response.text();
        
        if (!result.startsWith('https://tinyurl.com/')) {
          throw new Error('TinyURL API failed');
        }
        shortUrl = result.trim();
      }

      const newUrl: ShortenedURL = {
        id: Date.now().toString(),
        originalUrl: urlToProcess,
        shortUrl,
        customAlias: customAlias.trim() || undefined,
        clicks: 0,
        createdAt: new Date()
      };

      setShortenedUrls(prev => [newUrl, ...prev]);
      setOriginalUrl('');
      setCustomAlias('');

      toast({
        title: "تم التقصير بنجاح! 🎉",
        description: `الرابط المختصر: ${shortUrl}`
      });

    } catch (error) {
      console.error('Error shortening URL:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "تأكد من اتصالك بالإنترنت وحاول مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "تم النسخ! 📋",
        description: "تم نسخ الرابط إلى الحافظة"
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "تم النسخ! 📋",
        description: "تم نسخ الرابط إلى الحافظة"
      });
    }
  };

  const simulateClick = (id: string) => {
    setShortenedUrls(prev => 
      prev.map(url => 
        url.id === id 
          ? { ...url, clicks: url.clicks + 1, lastClicked: new Date() }
          : url
      )
    );
  };

  const openOriginal = (url: ShortenedURL) => {
    simulateClick(url.id);
    window.open(url.originalUrl, '_blank');
  };

  const deleteUrl = (id: string) => {
    setShortenedUrls(prev => prev.filter(url => url.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف الرابط من قائمتك"
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(shortenedUrls, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tinyurl-exports-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "تم التصدير! 📁",
      description: "تم تصدير بياناتك بنجاح"
    });
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredUrls = shortenedUrls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (url.customAlias && url.customAlias.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen" dir="rtl">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t, index) => (
          <Toast 
            key={t.id} 
            toast={t} 
            onClose={() => {}} 
          />
        ))}
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
            <Link className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-blue-600">
            مُقصر الروابط 
          </h1>
        </div>
        <p className="text-gray-700 text-lg">
          قم بتقصير الروابط باستخدام وأستخدام أسماء مخصصة
        </p>
     
      </div>

      {/* URL Shortener Form */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>تقصير رابط جديد</CardTitle>
          <CardDescription>
            أدخل الرابط واختر اسماً مخصصاً   (اختياري)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Link className="h-4 w-4 text-blue-500" />
              الرابط الأصلي
            </label>
            <Input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              dir="ltr"
              disabled={isLoading}
              className="focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">اسم مخصص (اختياري)</label>
            <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <span className="bg-blue-50 text-blue-700 px-4 py-3 text-sm font-medium border-l">
                tinyurl.com/
              </span>
              <input
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                placeholder="my-custom-name"
                dir="ltr"
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-0 focus:ring-0 focus:outline-none"
              />
            </div>
          </div>
          
          <Button 
            onClick={shortenUrl}
            disabled={isLoading}
            className="w-full bg-blue-500 hover:from-blue-600 hover:to-indigo-700 text-white py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                جاري التقصير  ...
              </>
            ) : (
              <>
                <Link className="h-5 w-5" />
                تقصير الرابط
              </>
            )}
          </Button>
        </CardContent>
      </Card>


      {/* Shortened URLs List */}
      {filteredUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              الروابط المختصرة ({filteredUrls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUrls.map((url) => (
                <div key={url.id} className="p-6 border border-blue-100 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-200 bg-gradient-to-r from-white to-blue-50">
                  {/* URLs */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-blue-500 text-white">TinyURL</Badge>
                      <code className="flex-1 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm font-mono text-blue-800" dir="ltr">
                        {url.shortUrl}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(url.shortUrl)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOriginal(url)}
                        className="border-green-300 text-green-600 hover:bg-green-500 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteUrl(url.id)}
                        className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-gray-300">أصلي</Badge>
                      <span className="text-sm text-gray-600 truncate flex-1 bg-gray-50 px-4 py-2 rounded-lg" dir="ltr" title={url.originalUrl}>
                        {url.originalUrl}
                      </span>
                    </div>
                  </div>

                  {/* Statistics and Info */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600 bg-white/50 p-3 rounded-lg">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{url.clicks} نقرة</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{formatDate(url.createdAt)}</span>
                      </div>
                    </div>
                    
                    {url.lastClicked && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        آخر نقرة: {formatDate(url.lastClicked)}
                      </div>
                    )}
                  </div>

                  {/* Custom alias badge */}
                  {url.customAlias && (
                    <div className="mt-3">
                      <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
                        🎯 اسم مخصص: {url.customAlias}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    
      
    </div>
  );
};

export default AdvancedURLShortener;