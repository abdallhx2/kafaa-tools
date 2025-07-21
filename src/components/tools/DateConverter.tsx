/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


const DateConverter = () => {
  const [inputDate, setInputDate] = useState('');
  const [inputFormat, setInputFormat] = useState('gregorian');
  const [results, setResults] = useState<any>(null);

  const convertDate = () => {
    if (!inputDate) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال التاريخ",
        variant: "destructive"
      });
      return;
    }

    try {
      let date: Date;
      
      if (inputFormat === 'gregorian') {
        date = new Date(inputDate);
      } else if (inputFormat === 'hijri') {
        // تحويل تقريبي من الهجري للميلادي
        const [year, month, day] = inputDate.split('-').map(Number);
        const gregorianYear = Math.floor(year * 0.970229 + 621.5643);
        date = new Date(gregorianYear, month - 1, day);
      } else {
        // Unix timestamp
        date = new Date(parseInt(inputDate) * 1000);
      }

      if (isNaN(date.getTime())) {
        throw new Error('تاريخ غير صحيح');
      }

      // التحويلات المختلفة
      const gregorian = date.toLocaleDateString('en-CA');
      const arabicDate = date.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const englishDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // تحويل تقريبي للهجري
      const hijriYear = Math.floor((date.getFullYear() - 621.5643) / 0.970229);
      const hijriMonth = date.getMonth() + 1;
      const hijriDay = date.getDate();
      const hijri = `${hijriYear}-${hijriMonth.toString().padStart(2, '0')}-${hijriDay.toString().padStart(2, '0')}`;

      const unix = Math.floor(date.getTime() / 1000);
      const iso = date.toISOString();
      const utc = date.toUTCString();

      // معلومات إضافية
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.ceil(dayOfYear / 7);
      const quarter = Math.ceil((date.getMonth() + 1) / 3);

      setResults({
        gregorian,
        arabicDate,
        englishDate,
        hijri,
        unix,
        iso,
        utc,
        dayOfYear,
        weekNumber,
        quarter,
        isLeapYear: new Date(date.getFullYear(), 1, 29).getDate() === 29
      });

      toast({
        title: "تم التحويل بنجاح",
        description: "تم تحويل التاريخ لجميع التنسيقات"
      });

    } catch (error) {
      toast({
        title: "خطأ في التحويل",
        description: "تأكد من صحة التاريخ المدخل",
        variant: "destructive"
      });
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    if (inputFormat === 'gregorian') {
      setInputDate(now.toLocaleDateString('en-CA'));
    } else if (inputFormat === 'unix') {
      setInputDate(Math.floor(now.getTime() / 1000).toString());
    } else {
      // تحويل تقريبي للهجري
      const hijriYear = Math.floor((now.getFullYear() - 621.5643) / 0.970229);
      const hijriMonth = now.getMonth() + 1;
      const hijriDay = now.getDate();
      setInputDate(`${hijriYear}-${hijriMonth.toString().padStart(2, '0')}-${hijriDay.toString().padStart(2, '0')}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">محول التاريخ الشامل</CardTitle>
          <CardDescription>
            تحويل التواريخ بين التقويم الميلادي والهجري وتنسيقات مختلفة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inputFormat">نوع التاريخ المدخل</Label>
              <Select value={inputFormat} onValueChange={setInputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gregorian">ميلادي (YYYY-MM-DD)</SelectItem>
                  <SelectItem value="hijri">هجري (YYYY-MM-DD)</SelectItem>
                  <SelectItem value="unix">Unix Timestamp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inputDate">التاريخ</Label>
              <Input
                id="inputDate"
                type={inputFormat === 'unix' ? 'number' : inputFormat === 'gregorian' ? 'date' : 'text'}
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                placeholder={inputFormat === 'hijri' ? 'YYYY-MM-DD' : ''}
                className="transition-smooth"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={getCurrentDate} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                التاريخ الحالي
              </Button>
            </div>
          </div>

          <Button onClick={convertDate} className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            تحويل التاريخ
          </Button>

          {results && (
            <div className="mt-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">التاريخ الميلادي</div>
                    <div className="font-mono text-lg">{results.gregorian}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">التاريخ الهجري (تقريبي)</div>
                    <div className="font-mono text-lg">{results.hijri}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">بالعربية</div>
                    <div className="text-sm">{results.arabicDate}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">بالإنجليزية</div>
                    <div className="text-sm">{results.englishDate}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">Unix Timestamp</div>
                    <div className="font-mono text-lg">{results.unix}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">ISO 8601</div>
                    <div className="font-mono text-sm">{results.iso}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-gradient-subtle border-secondary/30">
                <CardContent className="p-4">
                  <div className="text-sm font-semibold text-secondary mb-2">معلومات إضافية</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">يوم السنة: </span>
                      <span className="font-semibold">{results.dayOfYear}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الأسبوع: </span>
                      <span className="font-semibold">{results.weekNumber}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">الربع: </span>
                      <span className="font-semibold">Q{results.quarter}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">سنة كبيسة: </span>
                      <span className="font-semibold">{results.isLeapYear ? 'نعم' : 'لا'}</span>
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

export default DateConverter;