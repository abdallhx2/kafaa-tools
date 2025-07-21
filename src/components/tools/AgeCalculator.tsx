/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AgeCalculatorProps {
  onBack: () => void;
}

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateAge = () => {
    if (!birthDate) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال تاريخ الميلاد",
        variant: "destructive"
      });
      return;
    }

    const birth = new Date(birthDate);
    const target = targetDate ? new Date(targetDate) : new Date();
    
    if (birth > target) {
      toast({
        title: "خطأ",
        description: "تاريخ الميلاد لا يمكن أن يكون في المستقبل",
        variant: "destructive"
      });
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < target) {
      nextBirthday.setFullYear(target.getFullYear() + 1);
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      daysToNextBirthday,
      nextBirthday: nextBirthday.toLocaleDateString('ar-EG')
    });

    toast({
      title: "تم الحساب بنجاح",
      description: `العمر: ${years} سنة و ${months} شهر و ${days} يوم`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">حاسبة العمر الشاملة</CardTitle>
          <CardDescription>
            احسب عمرك بدقة مع إحصائيات تفصيلية وموعد عيد الميلاد القادم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate">تاريخ الميلاد *</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="transition-smooth"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">حساب العمر حتى تاريخ (اختياري)</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="transition-smooth"
              />
            </div>
          </div>

          <Button onClick={calculateAge} className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            حساب العمر
          </Button>

          {result && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-subtle border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{result.years}</div>
                  <div className="text-sm text-muted-foreground">سنة</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-subtle border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{result.months}</div>
                  <div className="text-sm text-muted-foreground">شهر</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-subtle border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{result.days}</div>
                  <div className="text-sm text-muted-foreground">يوم</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-subtle border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{result.totalDays.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الأيام</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-subtle border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{result.totalWeeks.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الأسابيع</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-subtle border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{result.totalMonths}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الشهور</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-secondary/30 md:col-span-2 lg:col-span-3">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-semibold text-secondary mb-2">عيد الميلاد القادم</div>
                  <div className="text-primary font-bold">{result.nextBirthday}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    بعد {result.daysToNextBirthday} يوم
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

export default AgeCalculator;