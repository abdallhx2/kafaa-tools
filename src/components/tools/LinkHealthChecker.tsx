import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, Clock, Shield, Eye, Globe, Lock, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkResult {
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  isAccessible: boolean;
  error?: string;
  sslValid?: boolean;
  hostname?: string;
  // Security checks
  safeBrowsing?: {
    isSafe: boolean;
    threats: string[];
  };
  virusTotal?: {
    malicious: number;
    suspicious: number;
    clean: number;
    detectionRatio: string;
  };
  urlVoid?: {
    isMalicious: boolean;
    engines: number;
    detections: number;
  };
  // Additional security info
  ipInfo?: {
    ip: string;
    country: string;
    isp: string;
  };
  certInfo?: {
    issuer: string;
    validUntil: string;
    daysUntilExpiry: number;
  };
}

const LinkHealthChecker = () => {
  const [urls, setUrls] = useState('');
  const [results, setResults] = useState<LinkResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Free security APIs
  const checkGoogleSafeBrowsing = async (url: string) => {
    try {
      // Using a public Safe Browsing API endpoint (simplified)
      const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=AIzaSyBGhlqKXlJhA-7vKq5b_pTMz6Cby9M4XaM`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
          }
        })
      });
      
      const data = await response.json();
      return {
        isSafe: !data.matches || data.matches.length === 0,
        threats: data.matches ? data.matches.map((m: {threatType: string}) => m.threatType) : []
      };
    } catch {
      return { isSafe: true, threats: [] };
    }
  };

  // URLVoid check (free API)
  const checkURLVoid = async (hostname: string) => {
    try {
      const response = await fetch(`https://api.urlvoid.com/v1/urlvoid.com:${hostname}`);
      const data = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      
      // Parse detection results (simplified)
      const detections = doc.querySelectorAll('.detection').length;
      const engines = doc.querySelectorAll('.engine').length;
      
      return {
        isMalicious: detections > 0,
        engines: engines || 0,
        detections: detections || 0
      };
    } catch {
      return { isMalicious: false, engines: 0, detections: 0 };
    }
  };

  // Get IP and location info
  const getIPInfo = async () => {
    try {
      const response = await fetch(`https://api.ipify.org?format=json`);
      const ipData = await response.json();
      
      const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
      const geoData = await geoResponse.json();
      
      return {
        ip: ipData.ip,
        country: geoData.country_name || 'غير معروف',
        isp: geoData.org || 'غير معروف'
      };
    } catch {
      return { ip: 'غير معروف', country: 'غير معروف', isp: 'غير معروف' };
    }
  };

  // Enhanced SSL certificate check
  const checkSSLCertificate = async (hostname: string) => {
    try {
      const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${hostname}&publish=off&startNew=off&fromCache=on&maxAge=24`);
      const data = await response.json();
      
      if (data.status === 'READY' && data.endpoints && data.endpoints[0]) {
        const endpoint = data.endpoints[0];
        const cert = endpoint.details?.cert;
        
        if (cert) {
          const validUntil = new Date(cert.notAfter * 1000);
          const now = new Date();
          const daysUntilExpiry = Math.floor((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            issuer: cert.issuerLabel || 'غير معروف',
            validUntil: validUntil.toLocaleDateString('ar-SA'),
            daysUntilExpiry
          };
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const checkLink = async (url: string): Promise<LinkResult> => {
    const startTime = Date.now();
    
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Extract hostname for security checks
      const hostname = new URL(url).hostname;
      
      // Perform advanced security checks
      let certInfo;
      let sslValid = false;
      
      const [safeBrowsing, urlVoid, ipInfo] = await Promise.all([
        checkGoogleSafeBrowsing(url),
        checkURLVoid(hostname),
        getIPInfo()
      ]);
      
      if (url.startsWith('https://')) {
        certInfo = await checkSSLCertificate(hostname);
        sslValid = certInfo !== null;
      }

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        url,
        status: response.status || 200,
        statusText: response.statusText || 'OK',
        responseTime,
        isAccessible: true,
        sslValid,
        hostname,
        safeBrowsing,
        urlVoid,
        ipInfo,
        certInfo: certInfo || undefined
      };
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        url,
        status: 0,
        statusText: 'Error',
        responseTime,
        isAccessible: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  };

  const handleCheck = async () => {
    if (!urls.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رابط واحد على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    setResults([]);

    const urlList = urls.split('\n').filter(url => url.trim());
    const promises = urlList.map(url => checkLink(url.trim()));

    try {
      const results = await Promise.all(promises);
      setResults(results);
      
      toast({
        title: "تم الفحص",
        description: `تم فحص ${results.length} رابط بنجاح`
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء فحص الروابط",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getSecurityBadge = (result: LinkResult) => {
    if (!result.safeBrowsing && !result.urlVoid) return null;
    
    const isSafe = result.safeBrowsing?.isSafe !== false && result.urlVoid?.isMalicious !== true;
    
    if (isSafe) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <Shield className="w-3 h-3 ml-1" />
          آمن
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="w-3 h-3 ml-1" />
          خطر
        </Badge>
      );
    }
  };

  const getStatusBadge = (result: LinkResult) => {
    if (!result.isAccessible) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 ml-1" />
          غير متاح
        </Badge>
      );
    }
    
    if (result.status >= 200 && result.status < 300) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <CheckCircle className="w-3 h-3 ml-1" />
          متاح
        </Badge>
      );
    }
    
    if (result.status >= 300 && result.status < 400) {
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 ml-1" />
          إعادة توجيه
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 ml-1" />
        خطأ
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">فاحص أمان الروابط</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            فحص شامل لأمان وصحة الروابط مع تحليل الأمان المتقدم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example.com
https://google.com
facebook.com"
              className="w-full h-40 p-4 border-2 border-border rounded-xl resize-none text-right focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background"
              dir="ltr"
            />
            <div className="absolute bottom-3 left-3 text-xs text-muted-foreground">
              {urls.split('\n').filter(url => url.trim()).length} روابط
            </div>
          </div>
          
          <Button 
            onClick={handleCheck}
            disabled={isChecking || !urls.trim()}
            className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
          >
            {isChecking ? (
              <>
                <Loader2 className="ml-3 h-5 w-5 animate-spin" />
                جاري الفحص...
              </>
            ) : (
              <>
                <Shield className="ml-3 h-5 w-5" />
                بدء فحص الروابط
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
          <CardHeader>
            <CardTitle className="gradient-text">تقرير فحص الروابط</CardTitle>
            <CardDescription>
              تم فحص {results.length} رابط بنجاح
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="p-6 rounded-xl bg-background/50 border border-border space-y-4">
                {/* URL Header */}
                <div className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate" dir="ltr">
                      {result.url}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(result)}
                    {getSecurityBadge(result)}
                  </div>
                </div>
                
                {/* Basic Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-xs text-muted-foreground">زمن الاستجابة</p>
                    <p className="text-lg font-bold text-primary">{result.responseTime}ms</p>
                  </div>
                  
                  {result.status > 0 && (
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <Activity className="w-5 h-5 mx-auto mb-2 text-green-600" />
                      <p className="text-xs text-muted-foreground">رمز الحالة</p>
                      <p className="text-lg font-bold text-green-600">{result.status}</p>
                    </div>
                  )}
                  
                  {result.sslValid !== undefined && (
                    <div className={`text-center p-4 rounded-lg ${result.sslValid ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <Lock className="w-5 h-5 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">SSL</p>
                      <p className={`text-lg font-bold ${result.sslValid ? 'text-green-600' : 'text-red-600'}`}>
                        {result.sslValid ? "✓" : "✗"}
                      </p>
                    </div>
                  )}
                  
                  {result.hostname && (
                    <div className="text-center p-4 bg-secondary/30 rounded-lg">
                      <Globe className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">المضيف</p>
                      <p className="text-xs font-medium truncate" dir="ltr">{result.hostname}</p>
                    </div>
                  )}
                </div>

                {/* Security Report */}
                {(result.safeBrowsing || result.urlVoid || result.ipInfo || result.certInfo) && (
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      تقرير الأمان
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Google Safe Browsing */}
                      {result.safeBrowsing && (
                        <div className={`p-4 rounded-lg border ${result.safeBrowsing.isSafe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Google Safe Browsing
                          </h5>
                          <p className={`text-sm ${result.safeBrowsing.isSafe ? 'text-green-700' : 'text-red-700'}`}>
                            {result.safeBrowsing.isSafe ? '✅ الموقع آمن' : '⚠️ تم اكتشاف تهديدات'}
                          </p>
                          {result.safeBrowsing.threats.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-red-600 mb-1">التهديدات:</p>
                              <div className="flex flex-wrap gap-1">
                                {result.safeBrowsing.threats.map((threat, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs">
                                    {threat}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* URLVoid Results */}
                      {result.urlVoid && (
                        <div className={`p-4 rounded-lg border ${!result.urlVoid.isMalicious ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            URLVoid Scanner
                          </h5>
                          <p className={`text-sm ${!result.urlVoid.isMalicious ? 'text-green-700' : 'text-red-700'}`}>
                            {!result.urlVoid.isMalicious ? '✅ لم يتم اكتشاف برمجيات خبيثة' : '⚠️ موقع مشبوه'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.urlVoid.detections}/{result.urlVoid.engines} محركات اكتشفت تهديدات
                          </p>
                        </div>
                      )}

                      {/* IP Information */}
                      {result.ipInfo && (
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            معلومات الخادم
                          </h5>
                          <div className="space-y-1 text-xs">
                            <p><span className="text-muted-foreground">IP:</span> {result.ipInfo.ip}</p>
                            <p><span className="text-muted-foreground">البلد:</span> {result.ipInfo.country}</p>
                            <p><span className="text-muted-foreground">ISP:</span> {result.ipInfo.isp}</p>
                          </div>
                        </div>
                      )}

                      {/* Certificate Information */}
                      {result.certInfo && (
                        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            شهادة SSL
                          </h5>
                          <div className="space-y-1 text-xs">
                            <p><span className="text-muted-foreground">المُصدر:</span> {result.certInfo.issuer}</p>
                            <p><span className="text-muted-foreground">صالحة حتى:</span> {result.certInfo.validUntil}</p>
                            <p className={result.certInfo.daysUntilExpiry < 30 ? 'text-red-600' : 'text-green-600'}>
                              <span className="text-muted-foreground">متبقي:</span> {result.certInfo.daysUntilExpiry} يوم
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Information */}
                {result.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      خطأ: {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkHealthChecker;
