import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Zap, Download, Upload, Activity, Wifi, Globe, Server, Clock, Signal, Info, History, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface SpeedResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  timestamp: number;
  serverId?: string;
  serverLocation?: string;
  ispInfo?: string;
  publicIP?: string;
}

interface SpeedHistory {
  id: string;
  timestamp: number;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  location: string;
}

interface NetworkInfo {
  ip: string;
  isp: string;
  location: string;
  country: string;
}

interface TestProgress {
  stage: 'idle' | 'preparing' | 'ping' | 'download' | 'upload' | 'complete';
  progress: number;
  currentSpeed: number;
  maxSpeed: number;
}

interface ChartDataPoint {
  time: number;
  speed: number;
  type: 'download' | 'upload';
}

const testServers = [
  { id: 'cloudflare', name: 'Cloudflare', url: 'https://speed.cloudflare.com', location: 'Global CDN' },
  { id: 'fastly', name: 'Fastly', url: 'https://httpbin.org', location: 'Global CDN' },
  { id: 'google', name: 'Google', url: 'https://www.google.com', location: 'Global' }
];

const SpeedTest = () => {
  const [isTestingDownload, setIsTestingDownload] = useState(false);
  const [isTestingUpload, setIsTestingUpload] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [testProgress, setTestProgress] = useState<TestProgress>({
    stage: 'idle',
    progress: 0,
    currentSpeed: 0,
    maxSpeed: 0
  });
  const [results, setResults] = useState<SpeedResult | null>(null);
  const [history, setHistory] = useState<SpeedHistory[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [selectedServer, setSelectedServer] = useState(testServers[0]);
  const [speedChart, setSpeedChart] = useState<ChartDataPoint[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Get network information
  useEffect(() => {
    const getNetworkInfo = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setNetworkInfo({
          ip: data.ip,
          isp: data.org,
          location: `${data.city}, ${data.region}`,
          country: data.country_name
        });
      } catch (error) {
        console.error('Failed to get network info:', error);
      }
    };
    getNetworkInfo();
  }, []);

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) {
      return `${(speed / 1000).toFixed(2)} جيجابت/ثانية`;
    }
    return `${speed.toFixed(2)} ميجابت/ثانية`;
  };

  const getSpeedRating = (speed: number) => {
    if (speed >= 100) return { label: 'ممتاز', color: 'bg-green-500', score: 95 };
    if (speed >= 50) return { label: 'جيد جداً', color: 'bg-blue-500', score: 80 };
    if (speed >= 25) return { label: 'جيد', color: 'bg-yellow-500', score: 65 };
    if (speed >= 10) return { label: 'متوسط', color: 'bg-orange-500', score: 45 };
    return { label: 'ضعيف', color: 'bg-red-500', score: 20 };
  };

  const testPing = async (): Promise<{ ping: number; jitter: number }> => {
    const pingResults: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      try {
        await fetch(`${selectedServer.url}/status/200`, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
        const endTime = Date.now();
        pingResults.push(endTime - startTime);
      } catch {
        const endTime = Date.now();
        pingResults.push(endTime - startTime);
      }
      
      setTestProgress(prev => ({
        ...prev,
        progress: ((i + 1) / 10) * 100
      }));
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const avgPing = pingResults.reduce((a, b) => a + b, 0) / pingResults.length;
    const jitter = Math.sqrt(
      pingResults.reduce((sum, ping) => sum + Math.pow(ping - avgPing, 2), 0) / pingResults.length
    );

    return { ping: avgPing, jitter };
  };

  const testDownloadSpeed = async (): Promise<number> => {
    const testSizes = [1, 2, 5, 10, 20]; // MB - Progressive loading
    const baseUrl = 'https://httpbin.org/bytes/';
    let maxSpeed = 0;
    const chartData: ChartDataPoint[] = [];
    
    setTestProgress(prev => ({ ...prev, stage: 'download', progress: 0, currentSpeed: 0, maxSpeed: 0 }));

    for (let i = 0; i < testSizes.length; i++) {
      const size = testSizes[i] * 1024 * 1024; // Convert to bytes
      const startTime = Date.now();
      let totalBytes = 0;

      try {
        const response = await fetch(`${baseUrl}${size}`, {
          signal: abortControllerRef.current?.signal
        });
        
        if (response.body) {
          const reader = response.body.getReader();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            totalBytes += value.length;
            const currentTime = Date.now();
            const duration = (currentTime - startTime) / 1000;
            const currentSpeed = (totalBytes * 8) / (duration * 1024 * 1024); // Mbps
            
            if (currentSpeed > maxSpeed) {
              maxSpeed = currentSpeed;
            }

            setTestProgress(prev => ({
              ...prev,
              progress: ((i + 1) / testSizes.length) * 100,
              currentSpeed,
              maxSpeed
            }));

            // Add to chart data
            chartData.push({
              time: duration,
              speed: currentSpeed,
              type: 'download'
            });
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSpeedChart(prev => [...prev, ...chartData]);
    return maxSpeed;
  };

  const testUploadSpeed = async (): Promise<number> => {
    const testSizes = [0.5, 1, 2, 5]; // MB - Smaller sizes for upload
    const testUrl = 'https://httpbin.org/post';
    let maxSpeed = 0;
    const chartData: ChartDataPoint[] = [];
    
    setTestProgress(prev => ({ ...prev, stage: 'upload', progress: 0, currentSpeed: 0, maxSpeed: 0 }));

    for (let i = 0; i < testSizes.length; i++) {
      const size = testSizes[i] * 1024 * 1024;
      const data = new Uint8Array(size).fill(0);
      const startTime = Date.now();
      
      try {
        await fetch(testUrl, {
          method: 'POST',
          body: data,
          signal: abortControllerRef.current?.signal
        });
        
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        const currentSpeed = (size * 8) / (duration * 1024 * 1024); // Mbps
        
        if (currentSpeed > maxSpeed) {
          maxSpeed = currentSpeed;
        }

        setTestProgress(prev => ({
          ...prev,
          progress: ((i + 1) / testSizes.length) * 100,
          currentSpeed,
          maxSpeed
        }));

        chartData.push({
          time: duration,
          speed: currentSpeed,
          type: 'upload'
        });

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSpeedChart(prev => [...prev, ...chartData]);
    return maxSpeed;
  };

  const runSpeedTest = async () => {
    abortControllerRef.current = new AbortController();
    setResults(null);
    setSpeedChart([]);
    setTestProgress({ stage: 'preparing', progress: 0, currentSpeed: 0, maxSpeed: 0 });

    try {
      // Preparing phase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test Ping
      setIsTestingPing(true);
      setTestProgress(prev => ({ ...prev, stage: 'ping' }));
      const { ping, jitter } = await testPing();
      setIsTestingPing(false);

      // Test Download Speed
      setIsTestingDownload(true);
      const downloadSpeed = await testDownloadSpeed();
      setIsTestingDownload(false);

      // Test Upload Speed
      setIsTestingUpload(true);
      const uploadSpeed = await testUploadSpeed();
      setIsTestingUpload(false);

      const result: SpeedResult = {
        downloadSpeed,
        uploadSpeed,
        ping,
        jitter,
        timestamp: Date.now(),
        serverId: selectedServer.id,
        serverLocation: selectedServer.location,
        ispInfo: networkInfo?.isp,
        publicIP: networkInfo?.ip
      };

      setResults(result);
      setTestProgress(prev => ({ ...prev, stage: 'complete', progress: 100 }));
      
      // Add to history
      const historyEntry: SpeedHistory = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        downloadSpeed,
        uploadSpeed,
        ping,
        location: networkInfo?.location || 'Unknown'
      };
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      
      toast({
        title: "تم الانتهاء من اختبار السرعة",
        description: `سرعة التحميل: ${formatSpeed(downloadSpeed)}`
      });

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast({
          title: "تم إلغاء الاختبار",
          description: "تم إيقاف اختبار السرعة"
        });
      } else {
        toast({
          title: "خطأ في الاختبار",
          description: "حدث خطأ أثناء قياس سرعة الإنترنت",
          variant: "destructive"
        });
      }
    } finally {
      setIsTestingDownload(false);
      setIsTestingUpload(false);
      setIsTestingPing(false);
    }
  };

  const stopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const isTestRunning = isTestingDownload || isTestingUpload || isTestingPing;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold gradient-text"
        >
          قياس سرعة الإنترنت الاحترافي
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          اختبار شامل ودقيق لسرعة الإنترنت مع تحليل مفصل للأداء
        </p>
      </div>

      {/* Network Info Card */}
      {networkInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass shadow-soft">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <Globe className="h-5 w-5 mx-auto text-blue-500" />
                  <p className="text-sm text-muted-foreground">عنوان IP</p>
                  <p className="font-medium">{networkInfo.ip}</p>
                </div>
                <div className="space-y-1">
                  <Server className="h-5 w-5 mx-auto text-green-500" />
                  <p className="text-sm text-muted-foreground">مزود الخدمة</p>
                  <p className="font-medium">{networkInfo.isp}</p>
                </div>
                <div className="space-y-1">
                  <Signal className="h-5 w-5 mx-auto text-purple-500" />
                  <p className="text-sm text-muted-foreground">الموقع</p>
                  <p className="font-medium">{networkInfo.location}</p>
                </div>
                <div className="space-y-1">
                  <Activity className="h-5 w-5 mx-auto text-orange-500" />
                  <p className="text-sm text-muted-foreground">الخادم</p>
                  <p className="font-medium">{selectedServer.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            اختبار السرعة
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            السجل
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            معلومات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <Card className="glass shadow-soft">
            <CardHeader className="text-center">
              <motion.div 
                className="w-24 h-24 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow"
                animate={{ 
                  scale: isTestRunning ? [1, 1.1, 1] : 1,
                  rotate: isTestRunning ? 360 : 0
                }}
                transition={{ 
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" }
                }}
              >
                <Zap className="h-12 w-12 text-primary-foreground" />
              </motion.div>
              <CardTitle className="text-2xl">اختبار شامل لسرعة الإنترنت</CardTitle>
              <CardDescription>
                قياس دقيق ومفصل لأداء الاتصال بالإنترنت
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Test Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={runSpeedTest}
                  disabled={isTestRunning}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium px-8 py-3"
                  size="lg"
                >
                  <Activity className="ml-2 h-5 w-5" />
                  {isTestRunning ? 'جاري الاختبار...' : 'بدء اختبار السرعة'}
                </Button>
                
                {isTestRunning && (
                  <Button
                    onClick={stopTest}
                    variant="outline"
                    size="lg"
                  >
                    إيقاف الاختبار
                  </Button>
                )}
              </div>

              {/* Real-time Progress */}
              <AnimatePresence>
                {isTestRunning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    {/* Current Stage */}
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">
                        {testProgress.stage === 'preparing' && 'جاري التحضير...'}
                        {testProgress.stage === 'ping' && 'قياس زمن الاستجابة'}
                        {testProgress.stage === 'download' && 'اختبار سرعة التحميل'}
                        {testProgress.stage === 'upload' && 'اختبار سرعة الرفع'}
                      </h3>
                      <Progress value={testProgress.progress} className="h-3" />
                    </div>

                    {/* Live Speed Display */}
                    {(testProgress.stage === 'download' || testProgress.stage === 'upload') && (
                      <div className="text-center space-y-2">
                        <div className="text-4xl font-bold text-blue-500">
                          {formatSpeed(testProgress.currentSpeed)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          أقصى سرعة: {formatSpeed(testProgress.maxSpeed)}
                        </div>
                      </div>
                    )}

                    {/* Real-time Chart */}
                    {speedChart.length > 0 && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={speedChart}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                              type="monotone" 
                              dataKey="speed" 
                              stroke="#8884d8" 
                              fill="#8884d8" 
                              fillOpacity={0.6}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Display */}
              <AnimatePresence>
                {results && testProgress.stage === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Main Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Card className="text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardContent className="p-6">
                            <Download className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                            <p className="text-sm text-blue-600 mb-1">سرعة التحميل</p>
                            <p className="text-2xl font-bold text-blue-800">
                              {formatSpeed(results.downloadSpeed)}
                            </p>
                            <Badge 
                              className={`mt-2 ${getSpeedRating(results.downloadSpeed).color} text-white`}
                            >
                              {getSpeedRating(results.downloadSpeed).label}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardContent className="p-6">
                            <Upload className="h-8 w-8 mx-auto mb-3 text-green-600" />
                            <p className="text-sm text-green-600 mb-1">سرعة الرفع</p>
                            <p className="text-2xl font-bold text-green-800">
                              {formatSpeed(results.uploadSpeed)}
                            </p>
                            <Badge 
                              className={`mt-2 ${getSpeedRating(results.uploadSpeed).color} text-white`}
                            >
                              {getSpeedRating(results.uploadSpeed).label}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                          <CardContent className="p-6">
                            <Wifi className="h-8 w-8 mx-auto mb-3 text-orange-600" />
                            <p className="text-sm text-orange-600 mb-1">زمن الاستجابة</p>
                            <p className="text-2xl font-bold text-orange-800">
                              {results.ping.toFixed(0)} ms
                            </p>
                            <Badge 
                              variant={results.ping < 50 ? "default" : results.ping < 100 ? "secondary" : "destructive"}
                              className="mt-2"
                            >
                              {results.ping < 50 ? 'ممتاز' : results.ping < 100 ? 'جيد' : 'ضعيف'}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card className="text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                          <CardContent className="p-6">
                            <Activity className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                            <p className="text-sm text-purple-600 mb-1">التذبذب</p>
                            <p className="text-2xl font-bold text-purple-800">
                              {results.jitter.toFixed(0)} ms
                            </p>
                            <Badge 
                              variant={results.jitter < 10 ? "default" : results.jitter < 30 ? "secondary" : "destructive"}
                              className="mt-2"
                            >
                              {results.jitter < 10 ? 'ممتاز' : results.jitter < 30 ? 'جيد' : 'ضعيف'}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Detailed Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="h-5 w-5" />
                          تفاصيل الاختبار
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">الخادم المستخدم:</span>
                              <span>{results.serverLocation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">مزود الخدمة:</span>
                              <span>{results.ispInfo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">عنوان IP:</span>
                              <span>{results.publicIP}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">وقت الاختبار:</span>
                              <span>{new Date(results.timestamp).toLocaleString('ar-EG')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">النسبة الإجمالية:</span>
                              <span className="font-semibold">
                                {Math.round((getSpeedRating(results.downloadSpeed).score + getSpeedRating(results.uploadSpeed).score) / 2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {results && (
                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    💡 نصائح لتحسين سرعة الإنترنت:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <span>• أغلق التطبيقات غير المستخدمة</span>
                    <span>• استخدم اتصال سلكي للحصول على أفضل أداء</span>
                    <span>• تأكد من موقع جهاز التوجيه</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                سجل اختبارات السرعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(test.timestamp).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="text-sm text-muted-foreground">{test.location}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex gap-4">
                          <span className="text-sm">
                            <Download className="h-3 w-3 inline mr-1" />
                            {formatSpeed(test.downloadSpeed)}
                          </span>
                          <span className="text-sm">
                            <Upload className="h-3 w-3 inline mr-1" />
                            {formatSpeed(test.uploadSpeed)}
                          </span>
                          <span className="text-sm">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {test.ping.toFixed(0)}ms
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد اختبارات محفوظة بعد</p>
                  <p className="text-sm">قم بإجراء أول اختبار سرعة لبدء السجل</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  كيف يعمل الاختبار؟
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">اختبار سرعة التحميل:</h4>
                  <p className="text-muted-foreground">
                    يتم تحميل ملفات بأحجام مختلفة من خوادم متعددة لقياس أقصى سرعة تحميل ممكنة
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">اختبار سرعة الرفع:</h4>
                  <p className="text-muted-foreground">
                    يتم رفع بيانات وهمية إلى الخادم لقياس سرعة الرفع الفعلية للاتصال
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">زمن الاستجابة والتذبذب:</h4>
                  <p className="text-muted-foreground">
                    يتم إرسال طلبات متعددة للخادم لقياس متوسط زمن الاستجابة ومعدل التذبذب
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  نصائح للحصول على نتائج دقيقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    أغلق جميع التطبيقات التي تستخدم الإنترنت
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    استخدم اتصال سلكي بدلاً من الواي فاي إذا أمكن
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    تأكد من عدم وجود تحديثات نظام قيد التشغيل
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    قم بإجراء الاختبار في أوقات مختلفة للحصول على متوسط دقيق
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    تأكد من قرب جهازك من جهاز التوجيه (الراوتر)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpeedTest;