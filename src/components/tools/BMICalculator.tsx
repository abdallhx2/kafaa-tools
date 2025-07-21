import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Activity, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';



interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  idealWeight: { min: number; max: number };
  weightToLose?: number;
  weightToGain?: number;
  healthRisks: string[];
  recommendations: string[];
}

const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [unit, setUnit] = useState('metric'); // metric or imperial
  const [result, setResult] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    if (!weight || !height) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الوزن والطول",
        variant: "destructive"
      });
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال قيم صحيحة للوزن والطول",
        variant: "destructive"
      });
      return;
    }

    // تحويل للنظام المتري إذا لزم الأمر
    let weightKg = weightNum;
    let heightM = heightNum;

    if (unit === 'imperial') {
      weightKg = weightNum * 0.453592; // pounds to kg
      heightM = heightNum * 0.0254; // inches to meters
    } else {
      heightM = heightNum / 100; // cm to meters
    }

    const bmi = weightKg / (heightM * heightM);

    // تحديد الفئة
    let category = '';
    let categoryColor = '';
    let healthRisks: string[] = [];
    let recommendations: string[] = [];

    if (bmi < 18.5) {
      category = 'نقص في الوزن';
      categoryColor = 'text-blue-600';
      healthRisks = [
        'ضعف جهاز المناعة',
        'صعوبة في التئام الجروح',
        'هشاشة العظام',
        'فقر الدم المحتمل'
      ];
      recommendations = [
        'زيادة السعرات الحرارية الصحية',
        'ممارسة تمارين المقاومة',
        'استشارة طبيب تغذية',
        'فحص الأمراض المحتملة'
      ];
    } else if (bmi >= 18.5 && bmi < 25) {
      category = 'وزن طبيعي';
      categoryColor = 'text-green-600';
      healthRisks = ['مخاطر صحية منخفضة'];
      recommendations = [
        'الحفاظ على النمط الحالي',
        'ممارسة التمارين بانتظام',
        'نظام غذائي متوازن',
        'فحوصات دورية'
      ];
    } else if (bmi >= 25 && bmi < 30) {
      category = 'زيادة في الوزن';
      categoryColor = 'text-yellow-600';
      healthRisks = [
        'ارتفاع ضغط الدم',
        'زيادة خطر السكري',
        'أمراض القلب',
        'مشاكل في المفاصل'
      ];
      recommendations = [
        'نقص الوزن تدريجياً',
        'زيادة النشاط البدني',
        'تقليل السعرات الحرارية',
        'استشارة طبية'
      ];
    } else if (bmi >= 30 && bmi < 35) {
      category = 'سمنة من الدرجة الأولى';
      categoryColor = 'text-orange-600';
      healthRisks = [
        'مرض السكري النوع الثاني',
        'أمراض القلب والأوعية',
        'انقطاع التنفس أثناء النوم',
        'بعض أنواع السرطان'
      ];
      recommendations = [
        'برنامج إنقاص وزن طبي',
        'تمارين قلبية منتظمة',
        'نظام غذائي منخفض السعرات',
        'متابعة طبية دورية'
      ];
    } else if (bmi >= 35 && bmi < 40) {
      category = 'سمنة من الدرجة الثانية';
      categoryColor = 'text-red-600';
      healthRisks = [
        'مضاعفات السكري الشديدة',
        'أمراض القلب الخطيرة',
        'مشاكل التنفس',
        'التهاب المفاصل'
      ];
      recommendations = [
        'تدخل طبي عاجل',
        'برنامج إنقاص وزن مكثف',
        'العلاج النفسي',
        'مراقبة طبية مستمرة'
      ];
    } else {
      category = 'سمنة مفرطة (الدرجة الثالثة)';
      categoryColor = 'text-red-800';
      healthRisks = [
        'خطر الوفاة المرتفع',
        'فشل القلب',
        'مضاعفات التخدير',
        'صعوبة الحركة'
      ];
      recommendations = [
        'تدخل طبي فوري',
        'النظر في الجراحة',
        'برنامج علاج شامل',
        'دعم نفسي مكثف'
      ];
    }

    // حساب الوزن المثالي
    const idealWeightMin = 18.5 * (heightM * heightM);
    const idealWeightMax = 24.9 * (heightM * heightM);

    // حساب الوزن المطلوب فقدانه أو زيادته
    let weightToLose: number | undefined;
    let weightToGain: number | undefined;

    if (bmi > 25) {
      weightToLose = weightKg - idealWeightMax;
    } else if (bmi < 18.5) {
      weightToGain = idealWeightMin - weightKg;
    }

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      categoryColor,
      idealWeight: {
        min: Math.round(idealWeightMin * 10) / 10,
        max: Math.round(idealWeightMax * 10) / 10
      },
      weightToLose: weightToLose ? Math.round(weightToLose * 10) / 10 : undefined,
      weightToGain: weightToGain ? Math.round(weightToGain * 10) / 10 : undefined,
      healthRisks,
      recommendations
    });

    toast({
      title: "تم حساب مؤشر كتلة الجسم",
      description: `مؤشر كتلة الجسم: ${(Math.round(bmi * 10) / 10)} - ${category}`
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">حاسبة مؤشر كتلة الجسم</CardTitle>
          <CardDescription>
            احسب مؤشر كتلة الجسم والوزن المثالي مع توصيات صحية شاملة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="unit">نظام القياس</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">متري (كجم / سم)</SelectItem>
                    <SelectItem value="imperial">إمبراطوري (رطل / بوصة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">
                  الوزن {unit === 'metric' ? '(كجم)' : '(رطل)'}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={unit === 'metric' ? '70' : '154'}
                  className="transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">
                  الطول {unit === 'metric' ? '(سم)' : '(بوصة)'}
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder={unit === 'metric' ? '175' : '69'}
                  className="transition-smooth"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">العمر (اختياري)</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">الجنس (اختياري)</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الجنس" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button onClick={calculateBMI} className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  حساب مؤشر كتلة الجسم
                </Button>
              </div>
            </div>
          </div>

          {result && (
            <div className="mt-8 space-y-6">
              {/* النتيجة الرئيسية */}
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {result.bmi}
                  </div>
                  <div className={`text-xl font-semibold mb-4 ${result.categoryColor}`}>
                    {result.category}
                  </div>
                  <div className="text-muted-foreground">
                    مؤشر كتلة الجسم (BMI)
                  </div>
                </CardContent>
              </Card>

              {/* الوزن المثالي */}
              <Card className="bg-gradient-subtle border-secondary/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-secondary" />
                    <h3 className="text-lg font-semibold">الوزن المثالي</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {result.idealWeight.min} - {result.idealWeight.max}
                      </div>
                      <div className="text-sm text-muted-foreground">كيلوجرام</div>
                    </div>
                    {result.weightToLose && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          -{result.weightToLose}
                        </div>
                        <div className="text-sm text-muted-foreground">كجم للفقدان</div>
                      </div>
                    )}
                    {result.weightToGain && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          +{result.weightToGain}
                        </div>
                        <div className="text-sm text-muted-foreground">كجم للزيادة</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* المخاطر الصحية والتوصيات */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-card border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700">المخاطر الصحية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.healthRisks.map((risk, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">التوصيات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* مخطط BMI */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">مقياس مؤشر كتلة الجسم</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-blue-100 rounded">
                      <span className="text-sm">نقص في الوزن</span>
                      <span className="text-sm font-mono">أقل من 18.5</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-100 rounded">
                      <span className="text-sm">وزن طبيعي</span>
                      <span className="text-sm font-mono">18.5 - 24.9</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-100 rounded">
                      <span className="text-sm">زيادة في الوزن</span>
                      <span className="text-sm font-mono">25.0 - 29.9</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-100 rounded">
                      <span className="text-sm">سمنة درجة أولى</span>
                      <span className="text-sm font-mono">30.0 - 34.9</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-100 rounded">
                      <span className="text-sm">سمنة درجة ثانية</span>
                      <span className="text-sm font-mono">35.0 - 39.9</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-red-200 rounded">
                      <span className="text-sm">سمنة مفرطة</span>
                      <span className="text-sm font-mono">40.0 أو أكثر</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground bg-yellow-50 p-4 rounded-lg">
                <strong>تنبيه:</strong> هذه الحاسبة للأغراض التعليمية فقط ولا تغني عن الاستشارة الطبية المتخصصة.
                يرجى استشارة طبيب مختص للحصول على تقييم صحي شامل.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BMICalculator;