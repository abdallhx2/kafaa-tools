/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Route } from 'lucide-react';
import { toast } from '@/hooks/use-toast';



const DistanceCalculator = () => {
  const [city1, setCity1] = useState('');
  const [city2, setCity2] = useState('');
  const [lat1, setLat1] = useState('');
  const [lon1, setLon1] = useState('');
  const [lat2, setLat2] = useState('');
  const [lon2, setLon2] = useState('');
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<'cities' | 'coordinates'>('cities');

  // قاعدة بيانات بسيطة للمدن العربية والعالمية
  const cities: { [key: string]: { lat: number; lon: number; country: string } } = {
    'الرياض': { lat: 24.7136, lon: 46.6753, country: 'السعودية' },
    'جدة': { lat: 21.4858, lon: 39.1925, country: 'السعودية' },
    'مكة': { lat: 21.4225, lon: 39.8262, country: 'السعودية' },
    'المدينة': { lat: 24.5247, lon: 39.5692, country: 'السعودية' },
    'الدمام': { lat: 26.4207, lon: 50.0888, country: 'السعودية' },
    'القاهرة': { lat: 30.0444, lon: 31.2357, country: 'مصر' },
    'الإسكندرية': { lat: 31.2001, lon: 29.9187, country: 'مصر' },
    'دبي': { lat: 25.2048, lon: 55.2708, country: 'الإمارات' },
    'أبوظبي': { lat: 24.2533, lon: 54.3684, country: 'الإمارات' },
    'الكويت': { lat: 29.3117, lon: 47.4818, country: 'الكويت' },
    'الدوحة': { lat: 25.2854, lon: 51.5310, country: 'قطر' },
    'المنامة': { lat: 26.0667, lon: 50.5577, country: 'البحرين' },
    'مسقط': { lat: 23.5880, lon: 58.3829, country: 'عمان' },
    'بيروت': { lat: 33.8869, lon: 35.5131, country: 'لبنان' },
    'دمشق': { lat: 33.5138, lon: 36.2765, country: 'سوريا' },
    'عمان': { lat: 31.9454, lon: 35.9284, country: 'الأردن' },
    'بغداد': { lat: 33.3152, lon: 44.3661, country: 'العراق' },
    'تونس': { lat: 36.8065, lon: 10.1815, country: 'تونس' },
    'الجزائر': { lat: 36.7538, lon: 3.0588, country: 'الجزائر' },
    'الرباط': { lat: 34.0209, lon: -6.8416, country: 'المغرب' },
    'الدار البيضاء': { lat: 33.5731, lon: -7.5898, country: 'المغرب' },
    'الخرطوم': { lat: 15.5007, lon: 32.5599, country: 'السودان' },
    'لندن': { lat: 51.5074, lon: -0.1278, country: 'بريطانيا' },
    'باريس': { lat: 48.8566, lon: 2.3522, country: 'فرنسا' },
    'نيويورك': { lat: 40.7128, lon: -74.0060, country: 'أمريكا' },
    'طوكيو': { lat: 35.6762, lon: 139.6503, country: 'اليابان' },
    'إسطنبول': { lat: 41.0082, lon: 28.9784, country: 'تركيا' }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCalculate = () => {
    let coordinates1: { lat: number; lon: number; name: string } | null = null;
    let coordinates2: { lat: number; lon: number; name: string } | null = null;

    if (mode === 'cities') {
      if (!city1 || !city2) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال اسم المدينتين",
          variant: "destructive"
        });
        return;
      }

      const city1Data = cities[city1];
      const city2Data = cities[city2];

      if (!city1Data || !city2Data) {
        toast({
          title: "مدينة غير موجودة",
          description: "إحدى المدن غير موجودة في قاعدة البيانات",
          variant: "destructive"
        });
        return;
      }

      coordinates1 = { lat: city1Data.lat, lon: city1Data.lon, name: city1 };
      coordinates2 = { lat: city2Data.lat, lon: city2Data.lon, name: city2 };
    } else {
      if (!lat1 || !lon1 || !lat2 || !lon2) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال جميع الإحداثيات",
          variant: "destructive"
        });
        return;
      }

      const lat1Num = parseFloat(lat1);
      const lon1Num = parseFloat(lon1);
      const lat2Num = parseFloat(lat2);
      const lon2Num = parseFloat(lon2);

      if (isNaN(lat1Num) || isNaN(lon1Num) || isNaN(lat2Num) || isNaN(lon2Num)) {
        toast({
          title: "خطأ",
          description: "الإحداثيات يجب أن تكون أرقام صحيحة",
          variant: "destructive"
        });
        return;
      }

      coordinates1 = { lat: lat1Num, lon: lon1Num, name: `${lat1}, ${lon1}` };
      coordinates2 = { lat: lat2Num, lon: lon2Num, name: `${lat2}, ${lon2}` };
    }

    const distance = calculateDistance(coordinates1.lat, coordinates1.lon, coordinates2.lat, coordinates2.lon);
    const distanceMiles = distance * 0.621371;
    const flightTime = distance / 800; // متوسط سرعة الطائرة
    const drivingTime = distance / 80; // متوسط سرعة القيادة

    setResult({
      from: coordinates1.name,
      to: coordinates2.name,
      distanceKm: distance.toFixed(2),
      distanceMiles: distanceMiles.toFixed(2),
      flightTime: flightTime.toFixed(1),
      drivingTime: drivingTime.toFixed(1),
      coordinates1,
      coordinates2
    });

    toast({
      title: "تم الحساب بنجاح",
      description: `المسافة: ${distance.toFixed(2)} كيلومتر`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">حاسبة المسافات</CardTitle>
          <CardDescription>
            قياس المسافة بين المدن أو الإحداثيات الجغرافية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={mode === 'cities' ? 'default' : 'ghost'}
              onClick={() => setMode('cities')}
              className="flex-1"
            >
              المدن
            </Button>
            <Button
              variant={mode === 'coordinates' ? 'default' : 'ghost'}
              onClick={() => setMode('coordinates')}
              className="flex-1"
            >
              الإحداثيات
            </Button>
          </div>

          {mode === 'cities' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city1">المدينة الأولى</Label>
                <Input
                  id="city1"
                  value={city1}
                  onChange={(e) => setCity1(e.target.value)}
                  placeholder="مثال: الرياض"
                  className="transition-smooth"
                />
                <div className="text-xs text-muted-foreground">
                  المدن المتاحة: الرياض، جدة، مكة، القاهرة، دبي، لندن، باريس...
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city2">المدينة الثانية</Label>
                <Input
                  id="city2"
                  value={city2}
                  onChange={(e) => setCity2(e.target.value)}
                  placeholder="مثال: القاهرة"
                  className="transition-smooth"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat1">خط العرض الأول</Label>
                  <Input
                    id="lat1"
                    type="number"
                    step="any"
                    value={lat1}
                    onChange={(e) => setLat1(e.target.value)}
                    placeholder="24.7136"
                    className="transition-smooth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lon1">خط الطول الأول</Label>
                  <Input
                    id="lon1"
                    type="number"
                    step="any"
                    value={lon1}
                    onChange={(e) => setLon1(e.target.value)}
                    placeholder="46.6753"
                    className="transition-smooth"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat2">خط العرض الثاني</Label>
                  <Input
                    id="lat2"
                    type="number"
                    step="any"
                    value={lat2}
                    onChange={(e) => setLat2(e.target.value)}
                    placeholder="30.0444"
                    className="transition-smooth"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lon2">خط الطول الثاني</Label>
                  <Input
                    id="lon2"
                    type="number"
                    step="any"
                    value={lon2}
                    onChange={(e) => setLon2(e.target.value)}
                    placeholder="31.2357"
                    className="transition-smooth"
                  />
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleCalculate} className="w-full">
            <Route className="h-4 w-4 mr-2" />
            حساب المسافة
          </Button>

          {result && (
            <div className="mt-8 space-y-4">
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-lg font-semibold mb-2">
                    من: {result.from} → إلى: {result.to}
                  </div>
                  <div className="text-3xl font-bold text-primary mb-4">
                    {result.distanceKm} كيلومتر
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {result.distanceMiles} ميل
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-subtle border-secondary/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">وقت الطيران التقريبي</div>
                    <div className="text-2xl font-bold text-secondary">{result.flightTime} ساعة</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-subtle border-secondary/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-muted-foreground mb-1">وقت القيادة التقريبي</div>
                    <div className="text-2xl font-bold text-secondary">{result.drivingTime} ساعة</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="text-sm font-medium mb-2">الإحداثيات:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground">النقطة الأولى: </span>
                      {result.coordinates1.lat.toFixed(4)}, {result.coordinates1.lon.toFixed(4)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">النقطة الثانية: </span>
                      {result.coordinates2.lat.toFixed(4)}, {result.coordinates2.lon.toFixed(4)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DistanceCalculator;